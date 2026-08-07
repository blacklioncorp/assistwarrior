import json

def fix_routing(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    connections = wf.get('connections', {})
    existing_names = [n['name'] for n in wf['nodes']]
    
    # ===== FIX 1: Change "¿Existe paciente?" to check for KNOWN patient (real name) =====
    for node in wf['nodes']:
        if node['name'] == '¿Existe paciente?':
            # Old: checks if id exists
            # New: checks if id exists AND name is not Desconocido
            node['parameters']['conditions'] = {
                "string": [
                    {
                        "value1": "={{ $json.id && $json.full_name && $json.full_name !== 'Desconocido' ? 'known' : '' }}",
                        "operation": "isNotEmpty"
                    }
                ]
            }
            print("  ✅ Fixed: ¿Existe paciente? now checks for KNOWN patient (real name)")
    
    # ===== FIX 2: Add "¿Ya está registrado (Desconocido)?" IF node =====
    # In the false branch: patient is either NEW or DESCONOCIDO
    # If has id → already registered as Desconocido → skip registration
    # If no id → truly new → register first
    
    if '¿Ya está registrado?' not in existing_names:
        check_registered_node = {
            "parameters": {
                "conditions": {
                    "string": [
                        {
                            "value1": "={{ $json.id }}",
                            "operation": "isNotEmpty"
                        }
                    ]
                }
            },
            "id": "check-already-registered",
            "name": "¿Ya está registrado?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [9840, 8624]
        }
        wf['nodes'].append(check_registered_node)
        print("  ✅ Added: '¿Ya está registrado?' IF node")
    
    # ===== Rewire connections =====
    # Old false branch: ¿Existe paciente? [false] → Registrar paciente nuevo
    # New: ¿Existe paciente? [false] → ¿Ya está registrado?
    #                                    [true/already Desconocido] → Presentación del consultorio
    #                                    [false/truly new] → Registrar paciente nuevo → Presentación
    
    if '¿Existe paciente?' in connections:
        conn = connections['¿Existe paciente?']
        if len(conn['main']) > 1:
            conn['main'][1] = [
                {"node": "¿Ya está registrado?", "type": "main", "index": 0}
            ]
            print("  ✅ Rewired: ¿Existe paciente? [false] → ¿Ya está registrado?")
    
    # ¿Ya está registrado? [true] = exists as Desconocido → skip registration → Presentación
    # ¿Ya está registrado? [false] = truly new → Registrar paciente nuevo → Presentación
    connections['¿Ya está registrado?'] = {
        "main": [
            [
                # true branch: already registered (Desconocido) - go directly to Presentación
                {"node": "Presentación del consultorio", "type": "main", "index": 0}
            ],
            [
                # false branch: truly new - register first
                {"node": "Registrar paciente nuevo", "type": "main", "index": 0}
            ]
        ]
    }
    print("  ✅ Wired: ¿Ya está registrado? [true] → Presentación del consultorio")
    print("  ✅ Wired: ¿Ya está registrado? [false] → Registrar paciente nuevo")
    
    # ===== FIX 3: Fix "Presentación del consultorio" - ONLY greet, don't ask for schedule stuff =====
    for node in wf['nodes']:
        if node['name'] == 'Presentación del consultorio':
            node['parameters']['responses']['values'][1]['content'] = (
                "=Eres el asistente virtual del Dr. {{ $('Buscar profesional').item.json.full_name }} "
                "({{ $('Buscar profesional').item.json.specialty }}) del consultorio {{ $('Buscar profesional').item.json.clinic_name }}.\n\n"
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas.\n\n"
                "Es la PRIMERA VEZ que este paciente nos escribe. DEBES:\n"
                "1. Responder al saludo del paciente de forma cálida (buenos días/tardes/noches según corresponda).\n"
                "2. Presentarte: nombre del consultorio y especialidad del doctor.\n"
                "3. Preguntar el nombre del paciente y en qué le puedes ayudar.\n\n"
                "IMPORTANTE: NO menciones horarios ni servicios aún. Solo saluda, preséntate y pide el nombre.\n"
                "Responde siempre en español. Máximo 3 oraciones."
            )
            print("  ✅ Fixed: Presentación del consultorio prompt")
    
    wf['connections'] = connections
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Routing fix applied to {filepath}")

fix_routing('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
