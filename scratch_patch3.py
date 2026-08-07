import json
import sys

def modify_workflow(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    # 1. Update "Agendar cita vía API (Confirmado)" to continue on fail
    api_conf_node = next(n for n in wf['nodes'] if n['name'] == 'Agendar cita vía API (Confirmado)')
    if 'settings' not in api_conf_node:
        api_conf_node['settings'] = {}
    api_conf_node['settings']['continueOnFail'] = True
    
    # 2. Create IF node for 409 error on confirmation
    if_node = {
        "parameters": {
            "conditions": {
                "string": [
                    {
                        "value1": "={{ $json.error.response.status }}",
                        "value2": "409"
                    }
                ]
            }
        },
        "id": "node-error-409-conf",
        "name": "¿Error 409 (Confirmado)?",
        "type": "n8n-nodes-base.if",
        "typeVersion": 1,
        "position": [
            11320,
            8880
        ]
    }
    wf['nodes'].append(if_node)
    
    # 3. Create HTTP Request node for occupied schedule
    aviso_node = {
        "parameters": {
            "method": "POST",
            "url": "={{ 'https://graph.facebook.com/v17.0/' + $('Execute Workflow Trigger').first().json.businessPhoneId + '/messages' }}",
            "authentication": "genericCredentialType",
            "genericAuthType": "httpHeaderAuth",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ messaging_product: 'whatsapp', to: $('Execute Workflow Trigger').first().json.phone, type: 'text', text: { body: 'Lo siento, ese horario acaba de ser ocupado mientras confirmábamos. ¿Para qué otra fecha u hora te gustaría agendar?' } }) }}",
            "options": {}
        },
        "id": "node-aviso-409-conf",
        "name": "Aviso horario ocupado (Confirmado)",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4,
        "position": [
            11520,
            8780
        ],
        "credentials": {
            "httpHeaderAuth": "WhatsApp Header Auth"
        }
    }
    wf['nodes'].append(aviso_node)
    
    # 4. Update Connections
    connections = wf['connections']
    
    # Agendar cita vía API (Confirmado) -> ¿Error 409 (Confirmado)?
    connections['Agendar cita vía API (Confirmado)'] = {
        "main": [
            [
                {
                    "node": "¿Error 409 (Confirmado)?",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    
    # ¿Error 409 (Confirmado)? -> Aviso (True) / Limpiar propuesta de cita (False)
    connections['¿Error 409 (Confirmado)?'] = {
        "main": [
            [
                {
                    "node": "Aviso horario ocupado (Confirmado)",
                    "type": "main",
                    "index": 0
                }
            ],
            [
                {
                    "node": "Limpiar propuesta de cita",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)

modify_workflow('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
print("Successfully modified confirmation branch for 409 errors!")
