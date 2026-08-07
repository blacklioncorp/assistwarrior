import json

def fix_google_calendar_order(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    connections = wf.get('connections', {})
    
    # We want to swap:
    # 1. ¿Hay bloqueo? [false] -> Crear evento GC -> Agendar cita vía API -> ¿Error 409 API?
    # TO: ¿Hay bloqueo? [false] -> Agendar cita vía API -> ¿Error 409 API?
    #     ¿Error 409 API? [false/index 1] -> Crear evento GC
    #     Crear evento GC -> Confirmación al paciente
    
    # Let's fix the first chain
    if '¿Hay bloqueo?' in connections:
        conn = connections['¿Hay bloqueo?']
        if len(conn['main']) > 1:
            # Change index 1 to point to 'Agendar cita vía API' instead of 'Crear evento GC'
            for item in conn['main'][1]:
                if item['node'] == 'Crear evento GC':
                    item['node'] = 'Agendar cita vía API'
                    print("  ✅ Rewired: ¿Hay bloqueo? [false] -> Agendar cita vía API")
    
    if '¿Error 409 API?' in connections:
        conn = connections['¿Error 409 API?']
        if len(conn['main']) > 1:
            # Change index 1 to point to 'Crear evento GC' instead of 'Confirmación al paciente'
            for item in conn['main'][1]:
                if item['node'] == 'Confirmación al paciente':
                    item['node'] = 'Crear evento GC'
                    print("  ✅ Rewired: ¿Error 409 API? [false] -> Crear evento GC")
    
    if 'Crear evento GC' in connections:
        # Change Crear evento GC to point to 'Confirmación al paciente'
        connections['Crear evento GC'] = {
            "main": [[
                {"node": "Confirmación al paciente", "type": "main", "index": 0}
            ]]
        }
        print("  ✅ Rewired: Crear evento GC -> Confirmación al paciente")

    # 2. ¿Tiene propuesta pendiente? [true] -> Crear evento GC (Confirmado) -> Agendar cita vía API (Confirmado) -> ¿Error 409 (Confirmado)?
    # TO: ¿Tiene propuesta pendiente? [true] -> Agendar cita vía API (Confirmado) -> ¿Error 409 (Confirmado)?
    #     ¿Error 409 (Confirmado)? [false/index 1] -> Crear evento GC (Confirmado)
    #     Crear evento GC (Confirmado) -> Limpiar propuesta de cita
    
    if '¿Tiene propuesta pendiente?' in connections:
        conn = connections['¿Tiene propuesta pendiente?']
        if len(conn['main']) > 0:
            for item in conn['main'][0]:
                if item['node'] == 'Crear evento GC (Confirmado)':
                    item['node'] = 'Agendar cita vía API (Confirmado)'
                    print("  ✅ Rewired: ¿Tiene propuesta pendiente? [true] -> Agendar cita vía API (Confirmado)")
                    
    if '¿Error 409 (Confirmado)?' in connections:
        conn = connections['¿Error 409 (Confirmado)?']
        if len(conn['main']) > 1:
            # Change index 1 to point to 'Crear evento GC (Confirmado)' instead of 'Limpiar propuesta de cita'
            for item in conn['main'][1]:
                if item['node'] == 'Limpiar propuesta de cita':
                    item['node'] = 'Crear evento GC (Confirmado)'
                    print("  ✅ Rewired: ¿Error 409 (Confirmado)? [false] -> Crear evento GC (Confirmado)")
                    
    if 'Crear evento GC (Confirmado)' in connections:
        # Change Crear evento GC (Confirmado) to point to 'Limpiar propuesta de cita'
        connections['Crear evento GC (Confirmado)'] = {
            "main": [[
                {"node": "Limpiar propuesta de cita", "type": "main", "index": 0}
            ]]
        }
        print("  ✅ Rewired: Crear evento GC (Confirmado) -> Limpiar propuesta de cita")

    wf['connections'] = connections
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Execution order fixed successfully in {filepath}")

fix_google_calendar_order('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
