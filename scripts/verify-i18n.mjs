import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const viPath = path.join(rootDir, 'src/i18n/messages/vi.json');
const enPath = path.join(rootDir, 'src/i18n/messages/en.json');

const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const viKeys = new Set(getKeys(vi));
const enKeys = new Set(getKeys(en));

const missingInEn = [...viKeys].filter((k) => !enKeys.has(k));
const missingInVi = [...enKeys].filter((k) => !viKeys.has(k));

console.log(`VI total keys: ${viKeys.size}`);
console.log(`EN total keys: ${enKeys.size}`);

if (missingInEn.length > 0 || missingInVi.length > 0) {
  if (missingInEn.length > 0) {
    console.error(`Keys present in vi.json but missing in en.json: ${missingInEn.join(', ')}`);
  }
  if (missingInVi.length > 0) {
    console.error(`Keys present in en.json but missing in vi.json: ${missingInVi.join(', ')}`);
  }
  process.exit(1);
} else {
  console.log('100% parity between vi.json and en.json.');
}
