import json

def fix_google_calendar_timezone(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    
    modified_count = 0
    for node in wf.get('nodes', []):
        if node.get('type') == 'n8n-nodes-base.googleCalendar':
            params = node.get('parameters', {})
            
            start_expr = params.get('start', '')
            if "':00'" in start_expr and "'-06:00'" not in start_expr:
                params['start'] = start_expr.replace("':00'", "':00-06:00'")
                modified_count += 1
            
            end_expr = params.get('end', '')
            if "':00'" in end_expr and "'-06:00'" not in end_expr:
                params['end'] = end_expr.replace("':00'", "':00-06:00'")
                modified_count += 1
                
    if modified_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"✅ Modified {modified_count} timezone expressions in Google Calendar nodes.")
    else:
        print("ℹ️ No Google Calendar nodes needed timezone modification.")

fix_google_calendar_timezone('/Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/assistwarrior-appointments-workflow.json')
