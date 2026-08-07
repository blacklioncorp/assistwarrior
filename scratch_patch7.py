import json
import sys

def modify_medical(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    modified = False
    for node in wf['nodes']:
        if node['name'] == 'Responder Pregunta':
            # Add date to system prompt
            system_prompt = node['parameters']['responses']['values'][1]['content']
            if 'Hoy es' not in system_prompt:
                date_injection = "\n\nHoy es {{ $now.setLocale('es').toFormat('cccc, dd/MM/yyyy') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas. Usa esta fecha SIEMPRE como referencia temporal absoluta para saber qué día es hoy o mañana.\n"
                # Insert right after the first paragraph
                lines = system_prompt.split('\n')
                # Try to insert after the second line
                lines.insert(2, date_injection)
                node['parameters']['responses']['values'][1]['content'] = '\n'.join(lines)
                modified = True
                
        if node['name'] == 'Clasificar intencion':
            system_prompt = node['parameters']['responses']['values'][1]['content']
            system_prompt = system_prompt.replace(
                "Hoy es {{ $now.toFormat('yyyy-MM-dd') }} y son las {{ $now.toFormat('HH:mm') }} horas.",
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, dd/MM/yyyy') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas."
            )
            node['parameters']['responses']['values'][1]['content'] = system_prompt
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"Successfully modified {filepath}")

def modify_legal(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    modified = False
    for node in wf['nodes']:
        if node['name'] == 'Build Legal Prompt':
            js_code = node['parameters']['jsCode']
            
            if 'const currentDate =' not in js_code:
                # Inject date fetching
                date_code = "const currentDate = $now.setLocale('es').toFormat('cccc, dd/MM/yyyy HH:mm');\n"
                js_code = date_code + js_code
                
                # Inject into system prompt
                js_code = js_code.replace(
                    "Eres el asistente virtual",
                    "Hoy es ${currentDate}.\\n\\nEres el asistente virtual"
                )
                node['parameters']['jsCode'] = js_code
                modified = True
                
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"Successfully modified {filepath}")

modify_medical('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
modify_legal('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/senzio-workflow-abogados.json')
