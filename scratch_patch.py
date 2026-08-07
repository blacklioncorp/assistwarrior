import json
import sys

def modify_workflow(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    # 1. Modify "Save Appointment (API)"
    api_node = next(n for n in wf['nodes'] if n['name'] == 'Save Appointment (API)')
    if 'settings' not in api_node:
        api_node['settings'] = {}
    api_node['settings']['continueOnFail'] = True
    
    # 2. Add Error 409 If Node
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
        "id": "node-error-409",
        "name": "¿Error 409 API?",
        "type": "n8n-nodes-base.if",
        "typeVersion": 1,
        "position": [
            2550,
            260
        ]
    }
    wf['nodes'].append(if_node)
    
    # 3. Add HTTP Request Node for busy schedule
    aviso_node = {
        "parameters": {
            "method": "POST",
            "url": "={{ 'https://graph.facebook.com/v17.0/' + $('Extract Arguments').first().json.professional.whatsapp_phone_number_id + '/messages' }}",
            "authentication": "genericCredentialType",
            "genericAuthType": "httpHeaderAuth",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ messaging_product: 'whatsapp', to: $('Extract Arguments').first().json.incoming.phone, type: 'text', text: { body: 'Lo siento, ese horario acaba de ser ocupado. ¿Para qué otra fecha u hora te gustaría agendar?' } }) }}",
            "options": {}
        },
        "id": "node-aviso-409",
        "name": "Aviso horario ocupado",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4,
        "position": [
            2750,
            160
        ],
        "credentials": {
            "httpHeaderAuth": "WhatsApp Header Auth"
        }
    }
    wf['nodes'].append(aviso_node)
    
    # 4. Modify Build Confirmation Message node
    build_node = next(n for n in wf['nodes'] if n['name'] == 'Build Confirmation Message')
    js_code = """// Construir mensaje de confirmación personalizado
const args = $('Extract Arguments').first().json;
const date = new Date(args.date_time);
const fecha = date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const hora = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const modalityNormalized = (args.modality || '').toLowerCase().trim();
const modalidadTexto = {
  presencial: 'de forma presencial en el despacho',
  videollamada: 'por videollamada',
  telefono: 'por llamada telefónica',
  llamada: 'por llamada telefónica'
};

// Generar enlace de Google Maps (si es presencial)
const address = args.professional.business_config?.clinic_address || '';
let mapsLink = '';
if (modalityNormalized === 'presencial' && address) {
  mapsLink = `\\n🗺️ Ver en mapa: https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

// Generar enlace de Google Calendar (asumiendo 60 min de duración para abogados)
const pad = (n) => n.toString().padStart(2, '0');
const h = date.getHours();
const m = date.getMinutes();
let m2 = m;
let h2 = h + 1; // 60 minutes duration
if (h2 >= 24) h2 = 23; // prevent overflow for simplicity

const start = pad(h) + pad(m) + '00';
const end = pad(h2) + pad(m2) + '00';
const dString = args.date_time.split('T')[0].replace(/-/g, '');
const dates = dString + 'T' + start + '/' + dString + 'T' + end;

const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consulta+Jurídica&dates=${dates}&location=${encodeURIComponent(address)}&details=${encodeURIComponent(args.custom_data || 'Consulta con abogado')}`;

const confirmacion = `✅ *Consulta jurídica agendada*\\n\\n📋 *Área:* ${args.legal_area}\\n📅 *Fecha:* ${fecha}\\n⏰ *Hora:* ${hora}\\n📍 *Modalidad:* ${modalidadTexto[modalityNormalized] || args.modality}${mapsLink}\\n\\n📅 Haz clic aquí para agregarlo a tu calendario:\\n${calendarUrl}\\n\\nEl abogado revisará tu caso y se pondrá en contacto contigo para confirmar. Si necesitas cancelar o reagendar, escríbenos con anticipación.\\n\\n_Esta información es orientativa. La evaluación definitiva de tu caso requiere la consulta formal con el abogado._`;

return [{ json: { confirmation_message: confirmacion, ...args } }];
"""
    build_node['parameters']['jsCode'] = js_code
    build_node['position'] = [2750, 360]
    
    # 5. Remove Google Calendar node
    wf['nodes'] = [n for n in wf['nodes'] if n['name'] != 'Google Calendar']
    
    # 6. Update Connections
    connections = wf['connections']
    
    # Has Booking Data? -> Save Appointment (API)
    connections['Has Booking Data?']['main'][0] = [
        {
            "node": "Save Appointment (API)",
            "type": "main",
            "index": 0
        }
    ]
    
    # Delete Google Calendar from connections
    if 'Google Calendar' in connections:
        del connections['Google Calendar']
        
    # Save Appointment (API) -> ¿Error 409 API?
    connections['Save Appointment (API)'] = {
        "main": [
            [
                {
                    "node": "¿Error 409 API?",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    
    # ¿Error 409 API? -> Aviso horario ocupado (True) / Build Confirmation Message (False)
    connections['¿Error 409 API?'] = {
        "main": [
            [
                {
                    "node": "Aviso horario ocupado",
                    "type": "main",
                    "index": 0
                }
            ],
            [
                {
                    "node": "Build Confirmation Message",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)

modify_workflow('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/senzio-workflow-abogados.json')
print("Successfully modified lawyers workflow!")
