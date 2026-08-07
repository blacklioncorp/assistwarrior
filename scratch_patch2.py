import json
import sys

def modify_workflow(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    # 1. Update "Confirmación al paciente (Confirmado)"
    confirm_node = next(n for n in wf['nodes'] if n['name'] == 'Confirmación al paciente (Confirmado)')
    confirm_code = """={{ JSON.stringify({ messaging_product: 'whatsapp', to: $('Execute Workflow Trigger').first().json.phone, type: 'text', text: { body: (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; let [h, m] = pa.time.split(':').map(Number); let start = h.toString().padStart(2,'0') + m.toString().padStart(2,'0') + '00'; let m2 = m + 30; let h2 = h; if(m2 >= 60){ h2 += 1; m2 -= 60; } let end = h2.toString().padStart(2,'0') + m2.toString().padStart(2,'0') + '00'; let d = pa.date.replace(/-/g, ''); const dates = d + 'T' + start + '/' + d + 'T' + end; const address = $('Buscar profesional').first().json.business_config?.clinic_address || ''; const profName = $('Buscar profesional').first().json.full_name; const mapUrl = 'https://maps.google.com/?q=' + encodeURIComponent(address); const calUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cita+Médica&dates=' + dates + '&location=' + encodeURIComponent(address); return `Su cita ha sido agendada para el ${pa.date} a las ${pa.time}. ¡Te esperamos!\\n\\n✅ Tu cita está confirmada con el ${profName}.\\n📍 Te esperamos en: ${address}\\n🗺️ Ver en mapa: ${mapUrl}\\n📅 Haz clic aquí para agregarlo a tu calendario: \\n${calUrl}`; })() } }) }}"""
    confirm_node['parameters']['jsonBody'] = confirm_code

    # 2. Update "Agendar cita vía API (Confirmado)"
    api_node = next(n for n in wf['nodes'] if n['name'] == 'Agendar cita vía API (Confirmado)')
    api_code = """={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; return JSON.stringify({ professional_id: $('Buscar profesional').first().json.id, patient_phone: $('Execute Workflow Trigger').first().json.phone, patient_name: $('Buscar paciente').first().json.full_name, date: pa.date, time: pa.time, duration_minutes: 30, reason: pa.reason || 'Consulta médica', channel: 'whatsapp' }); })() }}"""
    api_node['parameters']['jsonBody'] = api_code

    # 3. Update "Crear evento GC (Confirmado)"
    gc_node = next((n for n in wf['nodes'] if n['name'] == 'Crear evento GC (Confirmado)'), None)
    if gc_node:
        start_code = """={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; return new Date(pa.date + 'T' + pa.time + ':00').toISOString(); })() }}"""
        end_code = """={{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; return new Date(new Date(pa.date + 'T' + pa.time + ':00').getTime() + 30 * 60000).toISOString(); })() }}"""
        summary_code = """=Cita {{ $('Buscar paciente').first().json.full_name }} - {{ (() => { const p = $('Buscar paciente').first().json.pending_appointment; const pa = typeof p === 'string' ? JSON.parse(p) : p; return pa.reason || 'Consulta médica'; })() }}"""
        
        gc_node['parameters']['start'] = start_code
        gc_node['parameters']['end'] = end_code
        gc_node['parameters']['additionalFields']['summary'] = summary_code

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)

modify_workflow('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
print("Successfully modified medical workflow syntax!")
