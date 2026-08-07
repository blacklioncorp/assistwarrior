import json

def fix_new_patient_loop(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    existing_names = [n['name'] for n in wf['nodes']]
    
    # ===== ADD NODE: Registrar paciente nuevo en Supabase =====
    if 'Registrar paciente nuevo' not in existing_names:
        register_node = {
            "parameters": {
                "operation": "create",
                "tableId": "patients",
                "dataToSend": "defineBelow",
                "fieldsUi": {
                    "fieldValues": [
                        {
                            "fieldId": "phone_whatsapp",
                            "fieldValue": "={{ $('Extraer datos del mensaje').item.json.phone }}"
                        },
                        {
                            "fieldId": "full_name",
                            "fieldValue": "Desconocido"
                        },
                        {
                            "fieldId": "professional_id",
                            "fieldValue": "={{ $('Buscar profesional').item.json.id }}"
                        }
                    ]
                }
            },
            "id": "register-new-patient-node",
            "name": "Registrar paciente nuevo",
            "type": "n8n-nodes-base.supabase",
            "typeVersion": 1,
            "position": [9744, 8624],
            "credentials": {
                "supabaseApi": {
                    "id": "vt0eORxtV4fEZYSn",
                    "name": "Supabase account"
                }
            }
        }
        wf['nodes'].append(register_node)
        print("  ✅ Added: 'Registrar paciente nuevo' node")
    
    # ===== REWIRE CONNECTIONS =====
    connections = wf.get('connections', {})
    
    # Current flow for new patient:
    # ¿Existe paciente? [false/output 1] -> Presentación del consultorio -> Enviar respuesta (nuevo)
    # 
    # New flow:
    # ¿Existe paciente? [false/output 1] -> Registrar paciente nuevo -> Presentación del consultorio -> Enviar respuesta (nuevo)
    
    # Fix ¿Existe paciente? output[1] to go to "Registrar paciente nuevo" instead of "Presentación del consultorio"
    if '¿Existe paciente?' in connections:
        ep_conn = connections['¿Existe paciente?']
        if 'main' in ep_conn and len(ep_conn['main']) > 1:
            # output[1] (false branch) should now go to Registrar paciente nuevo
            ep_conn['main'][1] = [
                {
                    "node": "Registrar paciente nuevo",
                    "type": "main",
                    "index": 0
                }
            ]
            print("  ✅ Rewired: ¿Existe paciente? [false] -> Registrar paciente nuevo")
    
    # Add connection: Registrar paciente nuevo -> Presentación del consultorio
    connections['Registrar paciente nuevo'] = {
        "main": [
            [
                {
                    "node": "Presentación del consultorio",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    print("  ✅ Wired: Registrar paciente nuevo -> Presentación del consultorio")
    
    # ===== FIX the Presentación del consultorio prompt =====
    # Change it to NOT ask for name repeatedly - it should just present and offer to schedule
    # The name capture happens via Clasificar intencion -> Validar fecha/hora
    for node in wf['nodes']:
        if node['name'] == 'Presentación del consultorio':
            node['parameters']['responses']['values'][1]['content'] = (
                "=Eres el asistente virtual del Dr. {{ $('Buscar profesional').item.json.full_name }} "
                "({{ $('Buscar profesional').item.json.specialty }}) del consultorio {{ $('Buscar profesional').item.json.clinic_name }}.\n\n"
                "Hoy es {{ $now.setLocale('es').toFormat('cccc, yyyy-MM-dd') }} y son las {{ $now.setLocale('es').toFormat('HH:mm') }} horas.\n\n"
                "El paciente es NUEVO (primera vez que nos escribe).\n\n"
                "INSTRUCCIONES ESTRICTAS:\n"
                "1. Saluda de forma cálida con el saludo del paciente (buenos días/tardes/noches si aplica).\n"
                "2. Preséntate con el nombre del consultorio y la especialidad.\n"
                "3. Pregunta el nombre del paciente Y en qué puedes ayudarle (en UNA sola pregunta).\n"
                "4. NO enumeres servicios en detalle aún.\n"
                "5. Sé breve: máximo 3 oraciones.\n\n"
                "Responde siempre en español."
            )
            print("  ✅ Fixed: Presentación del consultorio prompt (concise)")
        
        # ===== FIX: Validar fecha/hora - ONLY ask for name if truly unknown AND it's a schedule intent =====
        # The problem is that after presentation, when patient writes their name + date,
        # the Clasificar intencion classifies it as 'schedule'. Then Validar fecha/hora
        # sees unknown name and asks for name AGAIN. We need to FIRST capture the name
        # from the message if patient included it.
        if node['name'] == 'Validar fecha/hora en parámetros':
            node['parameters']['jsCode'] = (
                "const params = $input.item.json.parameters;\n"
                "const nombrePaciente = $('Buscar paciente').first().json.full_name;\n"
                "const esDesconocido = !nombrePaciente || nombrePaciente === 'Desconocido';\n"
                "const mensaje = $('Extraer datos del mensaje').first().json.message;\n\n"
                "// Try to extract name from message if patient said 'Soy X' or 'Me llamo X'\n"
                "let nombreDelMensaje = null;\n"
                "const matchLlamo = mensaje.match(/(?:soy|me llamo|mi nombre es)\\s+([A-Za-záéíóúÁÉÍÓÚñÑüÜ]+)/i);\n"
                "if (matchLlamo) {\n"
                "  nombreDelMensaje = matchLlamo[1];\n"
                "}\n\n"
                "// If patient is unknown but gave their name in this message, use it\n"
                "if (esDesconocido && nombreDelMensaje) {\n"
                "  // Patient gave name, proceed with it even if name not yet saved\n"
                "  if (!params.date || !params.time) {\n"
                "    return [{ json: { \n"
                "      needMoreInfo: true, \n"
                "      message: `¡Hola ${nombreDelMensaje}! ¿Para qué fecha y hora prefieres tu cita? (ej: mañana a las 10 am)` \n"
                "    }}];\n"
                "  } else {\n"
                "    return [{ json: { \n"
                "      needMoreInfo: false, \n"
                "      date: params.date, \n"
                "      time: params.time, \n"
                "      reason: params.reason \n"
                "    }}];\n"
                "  }\n"
                "}\n\n"
                "// If patient is truly unknown (no name in message)\n"
                "if (esDesconocido) {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: true, \n"
                "    message: '¡Con gusto! ¿Me podrías decir tu nombre para poder atenderte mejor? 😊'\n"
                "  }}];\n"
                "}\n\n"
                "// Has name, check date/time\n"
                "if (!params.date || !params.time) {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: true, \n"
                "    message: `¡Con gusto ${nombrePaciente}! ¿Para qué fecha y hora prefieres tu cita? (ej: mañana a las 10 am)` \n"
                "  }}];\n"
                "} else {\n"
                "  return [{ json: { \n"
                "    needMoreInfo: false, \n"
                "    date: params.date, \n"
                "    time: params.time, \n"
                "    reason: params.reason \n"
                "  }}];\n"
                "}"
            )
            print("  ✅ Fixed: Validar fecha/hora en parámetros (smart name extraction)")
        
        # ===== FIX: ¿Actualizar nombre paciente? - also check message for inline name =====
        if node['name'] == '¿Actualizar nombre paciente?':
            node['parameters']['jsCode'] = (
                "const mensaje = $('Extraer datos del mensaje').item.json.message;\n"
                "const nombreActual = $('Buscar paciente').first().json.full_name;\n"
                "const patientId = $('Buscar paciente').first().json.id;\n\n"
                "// Try to extract name from common patterns\n"
                "let nuevoNombre = null;\n"
                "const matchLlamo = mensaje.match(/(?:soy|me llamo|mi nombre es)\\s+([A-Za-záéíóúÁÉÍÓÚñÑüÜ][A-Za-záéíóúÁÉÍÓÚñÑüÜ\\s]{0,30}?)(?:\\s*[,.]|\\s+quiero|\\s+quisiera|\\s+deseo|$)/i);\n"
                "if (matchLlamo) {\n"
                "  nuevoNombre = matchLlamo[1].trim();\n"
                "}\n\n"
                "// If no pattern match, check if message is purely a name (short, no dates/keywords)\n"
                "if (!nuevoNombre) {\n"
                "  const pareceNombre = mensaje &&\n"
                "    mensaje.length < 40 &&\n"
                "    !mensaje.match(/\\d/) &&\n"
                "    !mensaje.match(/mañana|hoy|lunes|martes|miércoles|jueves|viernes|sábado|domingo|cita|agendar|quiero|hola|si|no/i);\n"
                "  if (pareceNombre) nuevoNombre = mensaje.trim();\n"
                "}\n\n"
                "if ((nombreActual === 'Desconocido' || !nombreActual) && nuevoNombre && patientId) {\n"
                "  return [{ json: { shouldUpdate: true, newName: nuevoNombre, patientId } }];\n"
                "}\n"
                "return [{ json: { shouldUpdate: false, newName: nombreActual, patientId } }];"
            )
            print("  ✅ Fixed: ¿Actualizar nombre paciente? (better name extraction)")
    
    wf['connections'] = connections
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Done - loop fix applied to {filepath}")

fix_new_patient_loop('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
