import fs from 'node:fs';
import path from 'node:path';

const sqlDirs = [
  'D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/listing-service/src/main/resources/db/migration',
  'D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/identity-service/src/main/resources/db/migration',
  'D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/booking-service/src/main/resources/db/migration',
  'D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/billing-service/src/main/resources/db/migration',
];

let hasErrors = false;
console.log('--- CI Check: Seed and Migration Text Integrity ---');

for (const dir of sqlDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));
  for (const f of files) {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for replacement character U+FFFD
    if (content.includes('\uFFFD')) {
      console.error(`[ERROR] File contains U+FFFD replacement character: ${f}`);
      hasErrors = true;
    }

    // Check for corrupt ??? or ?? in text content (excluding SQL comments and query operators)
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Ignore comments
      if (line.trim().startsWith('--')) return;
      // Search for literal ?? in text strings
      const match = line.match(/'[^']*\?\?[^']*'/);
      if (match) {
        console.error(`[ERROR] File ${f}:${idx + 1} contains broken double question marks in string literal: ${match[0]}`);
        hasErrors = true;
      }
    });
  }
}

if (hasErrors) {
  console.error('❌ Check failed: Corrupt characters found in seed/migration files!');
  process.exit(1);
} else {
  console.log('✅ Check passed: 100% valid UTF-8, zero U+FFFD, zero broken ?? in string literals.');
}
