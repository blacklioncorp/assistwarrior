import json

def fix_name_save(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    existing_names = [n['name'] for n in wf['nodes']]
    connections = wf.get('connections', {})
    
    # ===== 1. Add "Extraer nombre del mensaje" Code node =====
    if 'Extraer nombre del mensaje' not in existing_names:
        extract_node = {
            "parameters": {
                "jsCode": (
                    "// Universal name extractor - runs for ALL intents before routing\n"
                    "const mensaje = $('Extraer datos del mensaje').first().json.message || '';\n"
                    "const nombreActual = $('Buscar paciente').first().json.full_name || 'Desconocido';\n"
                    "const patientId = $('Buscar paciente').first().json.id;\n"
                    "const esDesconocido = nombreActual === 'Desconocido' || !nombreActual;\n\n"
                    "let extractedName = null;\n\n"
                    "if (esDesconocido) {\n"
                    "  // Pattern: 'soy X', 'me llamo X', 'mi nombre es X'\n"
                    "  const matchExplicit = mensaje.match(\n"
                    "    /(?:soy|me llamo|mi nombre es)\\s+([A-Za-záéíóúÁÉÍÓÚñÑüÜ][A-Za-záéíóúÁÉÍÓÚñÑüÜ\\s]{1,40}?)(?:\\s*[,.]|\\s+quiero|\\s+quisiera|\\s+deseo|\\s+y\\s|$)/i\n"
                    "  );\n"
                    "  if (matchExplicit) {\n"
                    "    extractedName = matchExplicit[1].trim();\n"
                    "  }\n"
                    "}\n\n"
                    "// Pass through the intent classification data + name info\n"
                    "return [{\n"
                    "  json: {\n"
                    "    ...$input.item.json,\n"
                    "    patientNameToSave: extractedName || nombreActual,\n"
                    "    nameWasExtracted: !!extractedName,\n"
                    "    patientId: patientId\n"
                    "  }\n"
                    "}];"
                )
            },
            "id": "extract-name-universal",
            "name": "Extraer nombre del mensaje",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [10176, 8224]
        }
        wf['nodes'].append(extract_node)
        print("  ✅ Added: 'Extraer nombre del mensaje' Code node")

    # ===== 2. Add "Guardar nombre (universal)" Supabase node =====
    if 'Guardar nombre (universal)' not in existing_names:
        save_name_node = {
            "parameters": {
                "operation": "update",
                "tableId": "patients",
                "filters": {
                    "conditions": [
                        {
                            "keyName": "id",
                            "condition": "eq",
                            "keyValue": "={{ $json.patientId }}"
                        }
                    ]
                },
                "fieldsUi": {
                    "fieldValues": [
                        {
                            "fieldId": "full_name",
                            "fieldValue": "={{ $json.patientNameToSave }}"
                        }
                    ]
                }
            },
            "id": "save-name-universal",
            "name": "Guardar nombre (universal)",
            "type": "n8n-nodes-base.supabase",
            "typeVersion": 1,
            "position": [10272, 8224],
            "alwaysOutputData": True,
            "credentials": {
                "supabaseApi": {
                    "id": "vt0eORxtV4fEZYSn",
                    "name": "Supabase account"
                }
            }
        }
        wf['nodes'].append(save_name_node)
        print("  ✅ Added: 'Guardar nombre (universal)' Supabase node")

    # ===== 3. Rewire connections =====
    # Old: Parsear JSON de OpenAI -> Enrutar por intención
    # New: Parsear JSON de OpenAI -> Extraer nombre del mensaje -> Guardar nombre (universal) -> Enrutar por intención

    # Fix "Parsear JSON de OpenAI" output to go to "Extraer nombre del mensaje"
    if 'Parsear JSON de OpenAI' in connections:
        connections['Parsear JSON de OpenAI']['main'][0] = [
            {"node": "Extraer nombre del mensaje", "type": "main", "index": 0}
        ]
        print("  ✅ Rewired: Parsear JSON de OpenAI -> Extraer nombre del mensaje")

    # Add "Extraer nombre del mensaje" -> "Guardar nombre (universal)"
    connections['Extraer nombre del mensaje'] = {
        "main": [[
            {"node": "Guardar nombre (universal)", "type": "main", "index": 0}
        ]]
    }
    print("  ✅ Wired: Extraer nombre del mensaje -> Guardar nombre (universal)")

    # Add "Guardar nombre (universal)" -> "Enrutar por intención"
    connections['Guardar nombre (universal)'] = {
        "main": [[
            {"node": "Enrutar por intención", "type": "main", "index": 0}
        ]]
    }
    print("  ✅ Wired: Guardar nombre (universal) -> Enrutar por intención")

    # ===== 4. Fix "Enrutar por intención" - update its input reference =====
    # The switch node already reads $json.intent which will still be in the data (we spread it)
    # No change needed to the switch node itself

    # ===== 5. Fix "Responder Pregunta" - don't greet if name was extracted =====
    for node in wf['nodes']:
        if node['name'] == 'Responder Pregunta':
            node['parameters']['responses']['values'][1]['content'] = (
                "==Eres el asistente virtual del {{ $('Buscar profesional').first().json.full_name }} "
                "({{ $('Buscar profesional').first().json.specialty }}) del consultorio {{ $('Buscar profesional').first().json.clinic_name }}.\n\n"
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas.\n\n"
                "El nombre del paciente es: \"{{ $('Buscar paciente').first().json.full_name }}\".\n\n"
                "HORARIOS DE ATENCIÓN:\n"
                "{{ JSON.stringify($('Buscar profesional').first().json.business_config?.working_hours || $('Buscar profesional').first().json.working_hours) }}\n\n"
                "REGLAS ESTRICTAS:\n"
                "1. Si el nombre es 'Desconocido' o vacío, NO uses nombre.\n"
                "2. Si el paciente pregunta por horarios, responde con los días y horas disponibles de forma clara.\n"
                "3. Si el paciente quiere agendar, pídele la fecha y hora específica.\n"
                "4. NUNCA repitas el saludo ni la presentación si ya se hizo.\n"
                "5. NUNCA preguntes el nombre (eso ya lo maneja otro nodo).\n"
                "6. Si el mensaje es solo un nombre (ej: 'soy Pedro'), responde preguntando para qué fecha quiere la cita.\n"
                "7. Sé conciso: máximo 2 oraciones."
            )
            print("  ✅ Fixed: Responder Pregunta prompt (no name requests)")

        # ===== 6. Fix Clasificar intencion - classify name-only messages as 'schedule' =====
        if node['name'] == 'Clasificar intencion':
            old_prompt = node['parameters']['responses']['values'][1]['content']
            # Add rule to classify name-giving as schedule
            if 'REGLA ESPECIAL' not in old_prompt:
                extra_rule = (
                    "\n\nREGLA ESPECIAL: Si el paciente dice su nombre (ej: 'soy X', 'me llamo X') "
                    "sin otra intención clara, clasifica como 'schedule' con date=null y time=null. "
                    "Esto es porque está respondiendo a la pregunta de su nombre para poder agendar."
                )
                node['parameters']['responses']['values'][1]['content'] = old_prompt + extra_rule
                print("  ✅ Fixed: Clasificar intencion - name-only messages -> schedule")

    wf['connections'] = connections

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Name-save fix applied to {filepath}")

fix_name_save('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
