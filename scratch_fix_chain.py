import json

def fix_data_chain(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    connections = wf.get('connections', {})
    existing_names = [n['name'] for n in wf['nodes']]
    
    # ===== APPROACH: Replace the Supabase update node with a Code node that:
    # 1. Tries to save the name via a side-effect (we'll keep the Supabase node but add a restore node after)
    # 2. Adds "Restaurar datos de intención" Code node AFTER the Supabase update
    #    to restore {intent, parameters} from "Parsear JSON de OpenAI"
    
    # The chain: Parsear JSON → Extraer nombre → Guardar nombre (Supabase) → [NEW] Restaurar datos → Enrutar
    
    if 'Restaurar datos de intención' not in existing_names:
        restore_node = {
            "parameters": {
                "jsCode": (
                    "// The Supabase update replaced our intent data. Restore it from the original source.\n"
                    "const intentData = $('Parsear JSON de OpenAI').first().json;\n"
                    "return [{ json: intentData }];"
                )
            },
            "id": "restore-intent-data",
            "name": "Restaurar datos de intención",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [10368, 8224]
        }
        wf['nodes'].append(restore_node)
        print("  ✅ Added: 'Restaurar datos de intención' Code node")
    
    # Rewire: Guardar nombre (universal) → Restaurar datos de intención → Enrutar por intención
    connections['Guardar nombre (universal)'] = {
        "main": [[
            {"node": "Restaurar datos de intención", "type": "main", "index": 0}
        ]]
    }
    print("  ✅ Rewired: Guardar nombre (universal) -> Restaurar datos de intención")
    
    connections['Restaurar datos de intención'] = {
        "main": [[
            {"node": "Enrutar por intención", "type": "main", "index": 0}
        ]]
    }
    print("  ✅ Wired: Restaurar datos de intención -> Enrutar por intención")
    
    # ===== ALSO: Fix the Presentacion path =====
    # When patient is new and first message comes in:
    # They get registered and presented with the clinic.
    # Their NEXT message goes to "Clasificar intencion" (they're now found in DB as Desconocido).
    # Now for the "Quiero agendar una cita" message:
    #   - Clasificar → schedule, date=null, time=null
    #   - Parsear → {intent: schedule, parameters: {date: null}}
    #   - Extraer nombre → no name in "quiero agendar una cita" → patientNameToSave = "Desconocido"
    #   - Guardar nombre → updates with "Desconocido" (no-op) ✅
    #   - Restaurar → {intent: schedule, parameters: {}} ✅ 
    #   - Enrutar → output 0 (schedule) → Validar fecha/hora
    #   - Validar → esDesconocido = true, no name in message → asks for name ✅
    #   - Patient says "me llamo Adrián" → schedule, date=null
    #   - Extraer nombre → extractedName = "Adrián" → patientNameToSave = "Adrián"
    #   - Guardar nombre → updates full_name = "Adrián" ✅
    #   - Restaurar → {intent: schedule, parameters: {}} ✅
    #   - Validar → esDesconocido? → checks DB... STILL "Desconocido" because Buscar paciente ran at start!
    
    # The issue: $('Buscar paciente').first().json.full_name is cached from the START of execution.
    # After we update Supabase, $('Buscar paciente') still returns the OLD "Desconocido" data!
    
    # Fix "Validar fecha/hora en parámetros" to also check the extracted name from the current message
    for node in wf['nodes']:
        if node['name'] == 'Validar fecha/hora en parámetros':
            node['parameters']['jsCode'] = (
                "const params = $input.item.json.parameters;\n"
                "const mensaje = $('Extraer datos del mensaje').first().json.message || '';\n\n"
                "// Get the stored name - check both Supabase cache AND what was just saved\n"
                "const nombreEnDB = $('Buscar paciente').first().json.full_name || 'Desconocido';\n\n"
                "// Try to extract name from this message (or detect if it was given before)\n"
                "let nombreDelMensaje = null;\n"
                "const matchExplicit = mensaje.match(\n"
                "  /(?:soy|me llamo|mi nombre es)\\s+([A-Za-záéíóúÁÉÍÓÚñÑüÜ][A-Za-záéíóúÁÉÍÓÚñÑüÜ\\s]{1,40}?)(?:\\s*[,.]|\\s+quiero|\\s+quisiera|\\s+deseo|\\s+y\\s|$)/i\n"
                ");\n"
                "if (matchExplicit) {\n"
                "  nombreDelMensaje = matchExplicit[1].trim();\n"
                "}\n\n"
                "// Determine effective name: prefer extracted from message, then from DB\n"
                "const nombreEfectivo = nombreDelMensaje || (nombreEnDB !== 'Desconocido' ? nombreEnDB : null);\n"
                "const esDesconocido = !nombreEfectivo;\n\n"
                "// If still unknown (no name anywhere), ask for name\n"
                "if (esDesconocido) {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: true, \n"
                "    message: '¡Con gusto! ¿Me podrías decir tu nombre para poder atenderte mejor? 😊'\n"
                "  }}];\n"
                "}\n\n"
                "// Has name - check if date/time provided\n"
                "if (!params.date || !params.time) {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: true, \n"
                "    message: `¡Con gusto ${nombreEfectivo}! ¿Para qué fecha y hora prefieres tu cita? (ej: mañana a las 10 am)` \n"
                "  }}];\n"
                "} else {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: false, \n"
                "    date: params.date, \n"
                "    time: params.time, \n"
                "    reason: params.reason \n"
                "  }}];\n"
                "}"
            )
            print("  ✅ Fixed: Validar fecha/hora (uses extracted name from message + DB)")
    
    wf['connections'] = connections
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Data chain fix applied to {filepath}")

fix_data_chain('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
