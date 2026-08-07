import json

def fix_details(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    modified = False
    for node in wf['nodes']:
        if node['name'] == 'Responder Pregunta':
            prompt = node['parameters']['responses']['values'][1]['content']
            # Fix date format
            prompt = prompt.replace(
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, dd/MM/yyyy') }}",
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} (Formato estricto: AÑO-MES-DÍA)"
            )
            # Add strict instruction for greeting
            if "NUNCA saludes ni te presentes si el usuario dice palabras como 'sí', 'ok', o ya está en medio de una conversación." not in prompt:
                prompt += "\n6. NUNCA saludes ni te presentes si el usuario dice palabras de seguimiento como 'sí', 'ok', 'quiero una cita', o si claramente ya están a mitad de una conversación. Ve directo al grano."
            node['parameters']['responses']['values'][1]['content'] = prompt
            modified = True
            
        elif node['name'] == 'Clasificar intencion':
            prompt = node['parameters']['responses']['values'][1]['content']
            prompt = prompt.replace(
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, dd/MM/yyyy') }}",
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} (Formato estricto: AÑO-MES-DÍA)"
            )
            node['parameters']['responses']['values'][1]['content'] = prompt
            modified = True
            
        elif node['type'] == 'n8n-nodes-base.code':
            if 'parameters' in node and 'jsCode' in node['parameters']:
                js = node['parameters']['jsCode']
                if 'const pareceNombre =' in js:
                    # Improve name detection
                    js = js.replace(
                        "!mensaje.match(/mañana|lunes|martes|miercoles|jueves|viernes|sabado|domingo/i);",
                        "!mensaje.match(/mañana|lunes|martes|miercoles|jueves|viernes|sabado|domingo/i) && !mensaje.match(/quiero|necesito|cita|agendar|hola|bueno|dias|tardes|noches|informacion|horario/i);"
                    )
                    
                    # Fix parsing name from "me llamo X"
                    if "mensaje.trim()" in js and "me llamo" not in js:
                        js = js.replace(
                            "newName: mensaje.trim()",
                            "newName: mensaje.replace(/me llamo /i, '').replace(/mi nombre es /i, '').replace(/soy /i, '').trim()"
                        )
                    node['parameters']['jsCode'] = js
                    modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"Successfully fixed details in {filepath}")

fix_details('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
