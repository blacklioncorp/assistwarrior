import json

def fix_address(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
        
    modified = False
    
    for node in wf['nodes']:
        if node['name'] in ['Confirmación al paciente (Confirmado)', 'Respuesta confirmación cita']:
            if 'jsonBody' in node['parameters']:
                body = node['parameters']['jsonBody']
                if "const address = $('Buscar profesional').first().json.business_config?.clinic_address || '';" in body:
                    body = body.replace(
                        "const address = $('Buscar profesional').first().json.business_config?.clinic_address || '';",
                        "const prof = $('Buscar profesional').first().json; const btConfig = typeof prof.business_types === 'string' ? JSON.parse(prof.business_types).config : (prof.business_types?.config || {}); const address = btConfig.clinic_address || prof.business_config?.clinic_address || 'nuestro consultorio';"
                    )
                    node['parameters']['jsonBody'] = body
                    modified = True
                
                # Check for other variations
                elif "clinic_address" in body and "btConfig" not in body:
                    # Generic fallback if the exact string match fails but it has clinic_address
                    pass

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"Fixed address in {filepath}")

fix_address('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
