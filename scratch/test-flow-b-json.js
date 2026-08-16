import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../n8n/flow-b-experience-service-funnel.json');
console.log(`Auditing n8n Workflow JSON: ${filePath}`);

try {
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);

  console.log(`✓ Valid JSON file.`);
  console.log(`✓ Workflow Name: ${json.name}`);
  console.log(`✓ Total Nodes: ${json.nodes.length}`);
  console.log(`✓ Connections Count: ${Object.keys(json.connections).length}`);

  const nodeNames = json.nodes.map(n => n.name);
  console.log('\nNode List:');
  nodeNames.forEach((name, idx) => console.log(`  [Node ${idx + 1}] ${name}`));

  // Verify all connection targets exist
  Object.entries(json.connections).forEach(([sourceNode, connObj]) => {
    if (!nodeNames.includes(sourceNode)) {
      throw new Error(`Connection source node "${sourceNode}" not found in nodes list!`);
    }
    connObj.main.forEach((branch, branchIdx) => {
      branch.forEach(target => {
        if (!nodeNames.includes(target.node)) {
          throw new Error(`Connection target node "${target.node}" (from "${sourceNode}" branch ${branchIdx}) not found!`);
        }
      });
    });
  });

  console.log('\n✓ All node connections validated successfully. No broken links!');
} catch (err) {
  console.error('❌ Audit Failed:', err.message);
  process.exit(1);
}
