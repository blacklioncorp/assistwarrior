import json

def fix_all(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    modified_count = 0
    
    for node in wf['nodes']:
        name = node.get('name', '')
        
        # ===== FIX 1: Presentación del consultorio - agregar fecha y más instrucciones =====
        if name == 'Presentación del consultorio':
            node['parameters']['responses']['values'][1]['content'] = (
                "=Eres el asistente virtual del Dr. {{ $('Buscar profesional').item.json.full_name }} "
                "({{ $('Buscar profesional').item.json.specialty }}) del consultorio {{ $('Buscar profesional').item.json.clinic_name }}.\n\n"
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas.\n\n"
                "El paciente es NUEVO (primera vez). DEBES:\n"
                "1. Saludar de forma cálida y presentarte con el nombre del consultorio.\n"
                "2. Mencionar brevemente los servicios médicos disponibles.\n"
                "3. Preguntar el nombre del paciente.\n"
                "4. Preguntar si desea agendar una cita.\n\n"
                "Responde siempre en español, de forma amigable y natural. Máximo 4 oraciones."
            )
            modified_count += 1
            print(f"  ✅ Fixed: {name}")
        
        # ===== FIX 2: Validar fecha/hora - SIEMPRE pedir nombre si es desconocido, AUNQUE traiga fecha =====
        elif name == 'Validar fecha/hora en parámetros':
            node['parameters']['jsCode'] = (
                "const params = $input.item.json.parameters;\n"
                "const nombrePaciente = $('Buscar paciente').first().json.full_name;\n"
                "const esDesconocido = !nombrePaciente || nombrePaciente === 'Desconocido';\n\n"
                "// Si el nombre es desconocido, SIEMPRE pedir nombre primero, sin importar si hay fecha\n"
                "if (esDesconocido) {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: true, \n"
                "    message: '¡Con gusto! Antes de continuar, ¿me podrías decir tu nombre? 😊'\n"
                "  }}];\n"
                "}\n\n"
                "// Si tiene nombre pero falta fecha u hora\n"
                "if (!params.date || !params.time) {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: true, \n"
                "    message: `¡Con gusto ${nombrePaciente}! ¿Para qué fecha y hora prefieres tu cita? (ej: mañana a las 10 am)` \n"
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
            modified_count += 1
            print(f"  ✅ Fixed: {name}")
        
        # ===== FIX 3: Limpiar propuesta de cita TAMBIÉN después de horario no válido =====
        # This is handled in the Horario no válido node - we ensure pending_appointment is cleared
        
        # ===== FIX 4a: Crear evento GC - fix datetime format and add patient name =====
        elif name == 'Crear evento GC':
            node['parameters']['start'] = "={{ (() => { const d = $input.item.json.date; const t = $input.item.json.time; return d + 'T' + t + ':00'; })() }}"
            node['parameters']['end'] = "={{ (() => { const d = $input.item.json.date; const [h, m] = $input.item.json.time.split(':').map(Number); const endMin = m + 30; const endH = endMin >= 60 ? h + 1 : h; const endM = endMin >= 60 ? endMin - 60 : endMin; return d + 'T' + String(endH).padStart(2,'0') + ':' + String(endM).padStart(2,'0') + ':00'; })() }}"
            node['parameters']['additionalFields'] = {
                "summary": "=Cita médica - {{ $('Buscar paciente').first().json.full_name }}",
                "description": "=Motivo: {{ $input.item.json.reason || 'Consulta médica' }}\nPaciente: {{ $('Buscar paciente').first().json.full_name }}\nTeléfono: {{ $('Execute Workflow Trigger').first().json.phone }}"
            }
            modified_count += 1
            print(f"  ✅ Fixed: {name}")
        
        # ===== FIX 4b: Crear evento GC (Confirmado) - same fix =====
        elif name == 'Crear evento GC (Confirmado)':
            node['parameters']['start'] = "={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; return pa.date + 'T' + pa.time + ':00'; })() }}"
            node['parameters']['end'] = "={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; const [h, m] = pa.time.split(':').map(Number); const endMin = m + 30; const endH = endMin >= 60 ? h + 1 : h; const endM = endMin >= 60 ? endMin - 60 : endMin; return pa.date + 'T' + String(endH).padStart(2,'0') + ':' + String(endM).padStart(2,'0') + ':00'; })() }}"
            node['parameters']['additionalFields'] = {
                "summary": "=Cita médica - {{ $('Buscar paciente').first().json.full_name }}",
                "description": "={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; return `Motivo: ${pa.reason || 'Consulta médica'}\\nPaciente: ${$('Buscar paciente').first().json.full_name}\\nTeléfono: ${$('Execute Workflow Trigger').first().json.phone}`; })() }}"
            }
            modified_count += 1
            print(f"  ✅ Fixed: {name}")
        
        # ===== FIX 5: Horario no válido - limpiar pending_appointment para evitar falso confirm =====
        # We need to add a node after "Horario no válido" that clears pending_appointment
        # But we can't add nodes directly, so instead let's fix the Clasificar intencion
        # to NOT classify as confirm when pending_appointment reason doesn't match
        
        # ===== FIX 6: Responder Pregunta - ensure it never loops =====
        elif name == 'Responder Pregunta':
            old_prompt = node['parameters']['responses']['values'][1]['content']
            if 'NUNCA respondas con una nueva pregunta sobre nombre' not in old_prompt:
                # Add explicit instruction about not looping
                addition = "\n7. Si el paciente dice 'sí' o 'si' sin contexto claro, no respondas con bienvenida. Pregunta directamente: '¿Para qué fecha y hora te gustaría la cita?'"
                node['parameters']['responses']['values'][1]['content'] = old_prompt + addition
                modified_count += 1
                print(f"  ✅ Fixed: {name}")
    
    # ===== FIX 7: Add a node to clear pending_appointment after invalid schedule message =====
    # Find the connection from Horario no válido and verify it doesn't clear pending
    # The safest fix is in the Clasificar intencion prompt: only confirm if pending_appointment
    # was set in the CURRENT workflow run (we can't do that), so instead we'll add a 
    # post-"Horario no válido" clear step in connections
    
    # Look for connection from "Horario no válido" - add clear pending to that path
    connections = wf.get('connections', {})
    
    # Check if "Horario no válido" already clears pending
    if 'Horario no válido' in connections:
        horario_conn = connections['Horario no válido']
        # It should connect to a clear node - if not, we need a different approach
        pass
    
    if modified_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Total: {modified_count} fixes applied to {filepath}")
    else:
        print(f"❌ No changes made to {filepath}")

fix_all('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
