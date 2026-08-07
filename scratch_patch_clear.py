import json

def add_clear_node(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    # Check if "Limpiar propuesta (Horario Inválido)" already exists
    existing = [n['name'] for n in wf['nodes']]
    if 'Limpiar propuesta (Horario Inválido)' in existing:
        print("Node already exists")
        return
    
    # Add new Supabase node to clear pending_appointment after invalid schedule
    clear_node = {
        "parameters": {
            "operation": "update",
            "tableId": "patients",
            "filters": {
                "conditions": [
                    {
                        "keyName": "id",
                        "condition": "eq",
                        "keyValue": "={{ $('Buscar paciente').first().json.id }}"
                    }
                ]
            },
            "fieldsUi": {
                "fieldValues": [
                    {
                        "fieldId": "pending_appointment",
                        "fieldValue": ""
                    }
                ]
            }
        },
        "id": "clear-pending-invalid-schedule",
        "name": "Limpiar propuesta (Horario Inválido)",
        "type": "n8n-nodes-base.supabase",
        "typeVersion": 1,
        "position": [11592, 8192],
        "alwaysOutputData": True,
        "credentials": {
            "supabaseApi": {
                "id": "vt0eORxtV4fEZYSn",
                "name": "Supabase account"
            }
        }
    }
    
    wf['nodes'].append(clear_node)
    
    # Wire: "Horario no válido" -> "Limpiar propuesta (Horario Inválido)"
    connections = wf.get('connections', {})
    
    # "Horario no válido" currently goes nowhere (it's a terminal node)
    # Add connection from it to our new clear node
    if 'Horario no válido' not in connections:
        connections['Horario no válido'] = {"main": [[]]}
    
    horario_conn = connections['Horario no válido']
    if 'main' not in horario_conn:
        horario_conn['main'] = [[]]
    
    # Make sure output[0] exists and has our new node
    while len(horario_conn['main']) < 1:
        horario_conn['main'].append([])
    
    # Append if not already there
    new_link = {"node": "Limpiar propuesta (Horario Inválido)", "type": "main", "index": 0}
    if new_link not in horario_conn['main'][0]:
        horario_conn['main'][0].append(new_link)
    
    wf['connections'] = connections
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print("✅ Added clear-pending node after 'Horario no válido'")
    print("✅ Wired: Horario no válido -> Limpiar propuesta (Horario Inválido)")

add_clear_node('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
