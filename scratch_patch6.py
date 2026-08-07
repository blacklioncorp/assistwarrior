import json

def fix_errors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
        
    for node in wf['nodes']:
        if node['name'] in ['Agendar cita vía API', 'Agendar cita vía API (Confirmado)', 'Save Appointment (API)']:
            # Remove the bad options injection we did before
            if 'options' in node['parameters'] and 'ignoreResponseCode' in node['parameters']['options']:
                del node['parameters']['options']['ignoreResponseCode']
            
            # This is the modern n8n way (v1.0+) to continue on fail
            node['onError'] = 'continueRegularOutput'
            
            # Remove legacy settings if present
            if 'settings' in node and 'continueOnFail' in node['settings']:
                del node['settings']['continueOnFail']
                
        # Fix the IF node conditions to catch the error from continueRegularOutput
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

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)

fix_errors('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
fix_errors('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/senzio-workflow-abogados.json')
print("Fixed!")
