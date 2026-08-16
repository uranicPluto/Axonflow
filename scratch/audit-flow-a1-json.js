import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../n8n/flow-a1-booking-intake.json');
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

console.log('=== WORKFLOW JSON AUDIT ===');
console.log('1. JSON Parse:', 'PASSED');
console.log('2. Search $env:', content.includes('$env') ? 'FAIL' : 'PASSED (0 matches)');
console.log('3. Search VITE_SUPABASE_URL:', content.includes('VITE_SUPABASE_URL') ? 'FAIL' : 'PASSED (0 matches)');
console.log('4. Search BOLNA_API_KEY:', content.includes('BOLNA_API_KEY') ? 'FAIL' : 'PASSED (0 matches)');
console.log('5. Search BOLNA_AGENT_ID:', content.includes('BOLNA_AGENT_ID') ? 'FAIL' : 'PASSED (0 matches)');

const node3 = data.nodes.find(n => n.id === 'node-3-upsert-lead');
const node4 = data.nodes.find(n => n.id === 'node-4-create-meeting');
const node5 = data.nodes.find(n => n.id === 'node-5-bolna-call');
const node6 = data.nodes.find(n => n.id === 'node-6-save-call-record');

console.log('6. Node 3 URL:', node3.parameters.url);
console.log('7. Node 4 URL:', node4.parameters.url);
console.log('8. Node 6 URL:', node6.parameters.url);
console.log('9. Node 3 body contains cal_event_id?:', node3.parameters.jsonBody.includes('cal_event_id') ? 'YES' : 'NO');
console.log('10. Node 3 credential:', JSON.stringify(node3.credentials));
console.log('11. Node 4 credential:', JSON.stringify(node4.credentials));
console.log('12. Node 5 credential:', JSON.stringify(node5.credentials));
console.log('13. Node 6 credential:', JSON.stringify(node6.credentials));
console.log('14. Total Nodes:', data.nodes.length);
