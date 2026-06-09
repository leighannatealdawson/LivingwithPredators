import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, '../src/survey/schema.generated.ts');
let text = fs.readFileSync(filePath, 'utf8');
const lines = text.split(/\r?\n/);
const commentIdLine = lines.findIndex((l) => l.trim() === 'id: "comments"');
if (commentIdLine === -1) {
  throw new Error('comments id not found');
}
const insertAt = commentIdLine - 1;
const insertLines = [
  '  {',
  '    id: "job",',
  '    kind: "single",',
  '    prompt: "Which of the following best describes the industry you currently work in?",',
  '    required: false,',
  '    choices: [{"value":"agri","label":"Agriculture, Forestry & Fishing"},{"value":"manuf","label":"Manufacturing"},{"value":"constr","label":"Construction"},{"value":"retail","label":"Wholesale & Retail Trade"},{"value":"transp","label":"Transportation & Storage"},{"value":"info","label":"Information & Communication"},{"value":"finance","label":"Finance & Insurance"},{"value":"prof","label":"Professional, Scientific & Technical"},{"value":"educ","label":"Education"},{"value":"health","label":"Health & Social Work"},{"value":"public","label":"Public Administration"},{"value":"arts","label":"Arts, Entertainment & Recreation"},{"value":"accom","label":"Accommodation & Food Service"},{"value":"other","label":"Other"},{"value":"pnts","label":"Prefer not to say"}],',
  '    layout: "horizontal",',
  '  },',
  '  {',
  '    id: "hobbies",',
  '    kind: "multi",',
  '    prompt: "Which of the following areas do you have an interest in, either as a hobby, personal activity, or professional involvement? ",',
  '    hint: "(Select all that apply)",',
  '    required: false,',
  '    choices: [{"value":"comm","label":"Community or group activities"},{"value":"soc","label":"Socialising with friends or family"},{"value":"arts","label":"Arts, culture or events"},{"value":"relax","label":"Relaxing or quiet time"},{"value":"sport","label":"Exercise or sport"},{"value":"outdoor","label":"Outdoor recreation"},{"value":"country","label":"Countryside pursuits"},{"value":"creative","label":"Creative hobbies"},{"value":"digital","label":"Digital entertainment"},{"value":"eatout","label":"Eating out"},{"value":"other","label":"Other"}],',
  '  },',
];
lines.splice(insertAt, 0, ...insertLines);
const insertIdLine = lines.findIndex((l) => l.trim() === '"eircode",');
if (insertIdLine === -1) {
  throw new Error('eircode id line not found');
}
lines.splice(insertIdLine + 1, 0, '  "job",', '  "hobbies",');
fs.writeFileSync(filePath, lines.join('\n'));
console.log('patched');
