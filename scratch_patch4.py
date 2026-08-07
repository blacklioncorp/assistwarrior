import json
import sys

def modify_workflow(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    # 1. Update Clasificar intencion prompt
    clasificar_node = next(n for n in wf['nodes'] if n['name'] == 'Clasificar intencion')
    
    # Update the user message to use .first()
    clasificar_node['parameters']['responses']['values'][0]['content'] = "={{ $('Extraer datos del mensaje').first().json.message }}"
    
    # Update the system prompt
    system_prompt = """=Eres un clasificador de intenciones para un consultorio médico.

Hoy es {{ $now.toFormat('yyyy-MM-dd') }} y son las {{ $now.toFormat('HH:mm') }} horas. Usa SIEMPRE esta fecha para calcular referencias relativas.

CONTEXTO CRÍTICO DEL PACIENTE:
{{ (() => {
  const p = $('Buscar paciente').first().json.pending_appointment;
  if (p && p !== '') return "EL PACIENTE TIENE UNA PROPUESTA DE CITA PENDIENTE. Si el usuario responde con una afirmación (ej. 'si', 'ok', 'está bien', 'claro', 'confirmo'), DEBES clasificar la intención como 'confirm' obligatoriamente.";
  return "El paciente NO tiene propuestas pendientes.";
})() }}

Devuelve SOLO un JSON válido con esta estructura:
{
  "intent": "schedule" | "cancel" | "reschedule" | "confirm" | "question" | "other",
  "parameters": {
    "date": "YYYY-MM-DD o null",
    "time": "HH:MM o null",
    "reason": "texto o null"
  }
}

Examples de intent "confirm": "sí", "si", "confirmo", "de acuerdo", "va", "dale", "ok", "perfecto", "acepto", "bueno", "está bien".
No agregues texto fuera del JSON."""

    clasificar_node['parameters']['responses']['values'][1]['content'] = system_prompt
    
    # 2. Update ¿Tiene propuesta pendiente?
    pendiente_node = next(n for n in wf['nodes'] if n['name'] == '¿Tiene propuesta pendiente?')
    
    pendiente_node['parameters']['conditions'] = {
        "boolean": [
            {
                "value1": "={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; return !!p && p !== ''; })() }}",
                "value2": True
            }
        ]
    }
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)

modify_workflow('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
print("Successfully modified intent classification and condition!")
