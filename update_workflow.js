const fs = require('fs');

const data = JSON.parse(fs.readFileSync('n8n/senzio-workflow-abogados.json', 'utf8'));

// 1. Remove "Get Customer History" and "Get Conversation ID"
data.nodes = data.nodes.filter(n => n.name !== 'Get Customer History' && n.name !== 'Get Conversation ID');

// 2. Add "Save User Message"
data.nodes.push({
  "parameters": {
    "method": "POST",
    "url": "https://www.senz-io.com/api/n8n/chat",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"professional_id\": \"{{ $node[\"Execute Workflow Trigger\"].json.professional.id }}\",\n  \"patient_phone\": \"{{ $node[\"Execute Workflow Trigger\"].json.phone }}\",\n  \"patient_name\": \"{{ $node[\"Execute Workflow Trigger\"].json.pushName || '' }}\",\n  \"message\": \"{{ $node[\"Execute Workflow Trigger\"].json.message }}\",\n  \"sender\": \"user\"\n}",
    "options": {}
  },
  "id": "node-save-user-msg-law",
  "name": "Save User Message",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [1050, 320]
});

// 3. Add "Save Bot Message" (Normal Reply)
data.nodes.push({
  "parameters": {
    "method": "POST",
    "url": "https://www.senz-io.com/api/n8n/chat",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"professional_id\": \"{{ $node[\"Execute Workflow Trigger\"].json.professional.id }}\",\n  \"patient_phone\": \"{{ $node[\"Execute Workflow Trigger\"].json.phone }}\",\n  \"patient_name\": \"{{ $node[\"Execute Workflow Trigger\"].json.pushName || '' }}\",\n  \"message\": \"{{ $node[\"Extract Order Arguments\"].json.reply_text }}\",\n  \"sender\": \"assistant\"\n}",
    "options": {}
  },
  "id": "node-save-bot-msg-reply-law",
  "name": "Save Bot Message (Reply)",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [2350, 680]
});

// 4. Update "Get Conversation History"
const getHistNode = data.nodes.find(n => n.name === 'Get Conversation History');
getHistNode.position = [1250, 320];
getHistNode.parameters.filters.conditions[0].keyValue = "={{ $node[\"Save User Message\"].json.conversation_id }}";

// 5. Update connections
data.connections["Execute Workflow Trigger"].main[0] = [{ "node": "Save User Message", "type": "main", "index": 0 }];
data.connections["Save User Message"] = { "main": [[{ "node": "Get Conversation History", "type": "main", "index": 0 }]] };
delete data.connections["Get Customer History"];
delete data.connections["Get Conversation ID"];

// For the bot message (Reply) - check lawyer nodes
if (data.connections["Has Complete Order?"] && data.connections["Has Complete Order?"].main.length > 1) {
  const hasCompleteOrder = data.connections["Has Complete Order?"].main;
  // False branch goes to "Send WhatsApp Reply" in lawyers
  hasCompleteOrder[1] = [{ "node": "Save Bot Message (Reply)", "type": "main", "index": 0 }];
  data.connections["Save Bot Message (Reply)"] = { "main": [[{ "node": "Send WhatsApp Reply", "type": "main", "index": 0 }]] };
}

fs.writeFileSync('n8n/senzio-workflow-abogados.json', JSON.stringify(data, null, 2));
console.log("Updated senzio-workflow-abogados.json");
