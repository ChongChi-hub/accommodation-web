import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const buildManifestPath = path.resolve('.next/build-manifest.json');
if (!fs.existsSync(buildManifestPath)) {
  console.error('build-manifest.json not found');
  process.exit(1);
}

const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
const homeFiles = new Set([
  ...(buildManifest.pages?.['/'] || []),
  ...(buildManifest.pages?.['/[locale]'] || []),
  ...(buildManifest.rootMainFiles || []),
]);

// Also check app build manifest
const appManifestPath = path.resolve('.next/app-build-manifest.json');
let appFiles = [];
if (fs.existsSync(appManifestPath)) {
  const appManifest = JSON.parse(fs.readFileSync(appManifestPath, 'utf8'));
  for (const [key, files] of Object.entries(appManifest.pages || {})) {
    if (key.includes('[locale]') && !key.includes('dashboard') && !key.includes('rooms/')) {
      files.forEach((f) => homeFiles.add(f));
    }
  }
}

let totalRaw = 0;
let totalGzip = 0;

for (const rel of homeFiles) {
  const fullPath = path.resolve('.next', rel);
  if (fs.existsSync(fullPath)) {
    const buf = fs.readFileSync(fullPath);
    totalRaw += buf.length;
    totalGzip += zlib.gzipSync(buf).length;
  }
}

console.log(`Home Route Bundle:`);
console.log(`Raw JS: ${(totalRaw / 1024).toFixed(2)} KB`);
console.log(`Gzip JS: ${(totalGzip / 1024).toFixed(2)} KB`);

