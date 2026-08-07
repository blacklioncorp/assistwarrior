import json
import sys

def modify_workflow(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    modified = False
    
    # Process ¿Error 409 API?
    for node in wf['nodes']:
        if node['name'] in ['¿Error 409 API?', '¿Error 409 (Confirmado)?']:
            node['parameters']['conditions'] = {
                "string": [
                    {
                        "value1": "={{ JSON.stringify($json) }}",
                        "operation": "contains",
                        "value2": "Ya existe una cita"
                    }
                ]
            }
            modified = True
            
        if node['name'] in ['Agendar cita vía API', 'Agendar cita vía API (Confirmado)', 'Save Appointment (API)']:
            if 'options' not in node['parameters']:
                node['parameters']['options'] = {}
            node['parameters']['options']['ignoreResponseCode'] = True
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"Successfully modified {filepath}")

modify_workflow('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
modify_workflow('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/senzio-workflow-abogados.json')
