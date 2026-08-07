import json

def fix_routing_v2(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    connections = wf.get('connections', {})
    
    # ===== REVERT: ¿Existe paciente? back to original logic (just checks id) =====
    # Original: if patient has an id in Supabase → TRUE → Clasificar intencion
    # New (now): same - but Desconocido patients ALSO go to Clasificar
    for node in wf['nodes']:
        if node['name'] == '¿Existe paciente?':
            node['parameters']['conditions'] = {
                "string": [
                    {
                        "value1": "={{ $json.id }}",
                        "operation": "isNotEmpty"
                    }
                ]
            }
            print("  ✅ Reverted: ¿Existe paciente? back to id-only check")
    
    # ===== REVERT: Remove ¿Ya está registrado? from the false branch =====
    # ¿Existe paciente? [false] → Registrar paciente nuevo → Presentación
    # (as it was before the last bad fix)
    if '¿Existe paciente?' in connections:
        conn = connections['¿Existe paciente?']
        if len(conn['main']) > 1:
            conn['main'][1] = [
                {"node": "Registrar paciente nuevo", "type": "main", "index": 0}
            ]
            print("  ✅ Reverted: ¿Existe paciente? [false] → Registrar paciente nuevo")
    
    # ===== KEY FIX: "Responder Pregunta" must greet Desconocido patients =====
    # When a Desconocido patient says "Hola buenos días":
    # - They ARE in the DB (so ¿Existe paciente? = true → Clasificar intencion)
    # - "Hola buenos días" classified as "other" → Responder Pregunta
    # - Responder Pregunta must detect they are Desconocido and greet + ask name
    for node in wf['nodes']:
        if node['name'] == 'Responder Pregunta':
            node['parameters']['responses']['values'][1]['content'] = (
                "==Eres el asistente virtual del {{ $('Buscar profesional').first().json.full_name }} "
                "({{ $('Buscar profesional').first().json.specialty }}) del consultorio {{ $('Buscar profesional').first().json.clinic_name }}.\n\n"
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas.\n\n"
                "El nombre del paciente en la base de datos es: \"{{ $('Buscar paciente').first().json.full_name }}\".\n\n"
                "HORARIOS DE ATENCIÓN:\n"
                "{{ JSON.stringify($('Buscar profesional').first().json.business_config?.working_hours || $('Buscar profesional').first().json.working_hours) }}\n\n"
                "REGLAS ESTRICTAS:\n"
                "1. Si el nombre es 'Desconocido' o vacío, el paciente es NUEVO para ti. "
                "Salúdalo de forma cálida respondiendo a su saludo (buenos días/tardes/noches), "
                "preséntate con el nombre del consultorio y pídele su nombre y en qué puedes ayudarle. "
                "NO menciones horarios ni servicios.\n"
                "2. Si el nombre es conocido, NO te presentes de nuevo. Responde directo a lo que pregunta.\n"
                "3. Si el paciente pregunta por horarios disponibles, respóndele con los días y horas de atención.\n"
                "4. Si el paciente quiere agendar, pídele la fecha y hora específica.\n"
                "5. NUNCA preguntes el nombre (eso lo maneja el sistema automáticamente).\n"
                "6. Sé conciso: máximo 2-3 oraciones."
            )
            print("  ✅ Fixed: Responder Pregunta greets Desconocido patients properly")
        
        # ===== Also fix "Presentación del consultorio" for truly new patients =====
        if node['name'] == 'Presentación del consultorio':
            node['parameters']['responses']['values'][1]['content'] = (
                "=Eres el asistente virtual del Dr. {{ $('Buscar profesional').item.json.full_name }} "
                "({{ $('Buscar profesional').item.json.specialty }}) del consultorio {{ $('Buscar profesional').item.json.clinic_name }}.\n\n"
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas.\n\n"
                "El paciente acaba de escribirnos por PRIMERA VEZ. Su mensaje fue: \"{{ $('Extraer datos del mensaje').item.json.message }}\".\n\n"
                "INSTRUCCIONES:\n"
                "1. Responde al saludo del paciente (buenos días/tardes/noches según corresponda).\n"
                "2. Preséntate con el nombre del consultorio y la especialidad del doctor.\n"
                "3. Pregunta el nombre del paciente y en qué le puedes ayudar.\n\n"
                "NO menciones horarios ni servicios todavía. Sé breve: máximo 3 oraciones."
            )
            print("  ✅ Fixed: Presentación del consultorio prompt")
    
    wf['connections'] = connections
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Routing v2 fix applied to {filepath}")

fix_routing_v2('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
