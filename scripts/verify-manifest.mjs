/**
 * scripts/verify-manifest.mjs
 * Validates that:
 * 1. seed-assets/manifest.json exists and is valid JSON.
 * 2. Every raster image in public/images/** has an exact matching entry in manifest.json.
 * 3. Every entry in manifest.json contains required metadata:
 *    (file, sourceUrl, author, license, licenseUrl, fetchedAt, altVi, altEn, blurDataURL).
 * 4. Hero #1 at 1920px WebP is <= 250 KB (256,000 bytes).
 * Fails with exit code 1 if any check fails.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('.');
const MANIFEST_PATH = path.join(ROOT_DIR, 'seed-assets/manifest.json');
const IMAGES_DIR = path.join(ROOT_DIR, 'public/images');

function fail(msg) {
  console.error(`\x1b[31m[VERIFY-MANIFEST FAIL]\x1b[0m ${msg}`);
  process.exit(1);
}

function success(msg) {
  console.log(`\x1b[32m[VERIFY-MANIFEST PASS]\x1b[0m ${msg}`);
}

if (!fs.existsSync(MANIFEST_PATH)) {
  fail(`Manifest file not found: ${MANIFEST_PATH}`);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
} catch (err) {
  fail(`Failed to parse ${MANIFEST_PATH}: ${err.message}`);
}

if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
  fail(`Manifest contains 0 file entries.`);
}

const manifestMap = new Map();
for (const entry of manifest.files) {
  const normPath = entry.file.replace(/\\/g, '/');
  manifestMap.set(normPath, entry);

  // Validate required metadata
  const required = ['file', 'sourceUrl', 'author', 'license', 'licenseUrl', 'fetchedAt', 'altVi', 'altEn', 'blurDataURL'];
  for (const field of required) {
    if (!entry[field] || String(entry[field]).trim() === '') {
      fail(`Entry ${normPath} missing required field '${field}'`);
    }
  }
}

// Find all image files in public/images
function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full, fileList);
    } else if (/\.(webp|avif|jpg|jpeg|png)$/i.test(entry.name)) {
      fileList.push(full);
    }
  }
  return fileList;
}

const diskFiles = scanDir(IMAGES_DIR);
console.log(`Scanning public/images: found ${diskFiles.length} raster image files.`);

for (const diskFile of diskFiles) {
  const rel = '/' + path.relative(path.join(ROOT_DIR, 'public'), diskFile).replace(/\\/g, '/');
  if (!manifestMap.has(rel)) {
    fail(`Image on disk has NO entry in seed-assets/manifest.json: ${rel}`);
  }
}

// Check Hero #1 1920w <= 250 KB
const hero11920 = manifest.files.find(f => f.slug === 'hero-1-hanoi' && f.width === 1920 && f.format === 'webp');
if (!hero11920) {
  fail(`Missing Hero #1 1920w WebP entry in manifest!`);
}

const hero1Disk = path.join(ROOT_DIR, 'public', hero11920.file.replace(/^\//, ''));
if (!fs.existsSync(hero1Disk)) {
  fail(`Hero #1 file missing on disk: ${hero1Disk}`);
}
const hero1Size = fs.statSync(hero1Disk).size;
console.log(`Hero #1 (hero-1-hanoi-1920.webp) size: ${hero1Size} bytes (${(hero1Size / 1024).toFixed(1)} KB)`);

const MAX_HERO1_BYTES = 250 * 1024; // 256,000 bytes
if (hero1Size > MAX_HERO1_BYTES) {
  fail(`Hero #1 size (${hero1Size} bytes) exceeds budget of ${MAX_HERO1_BYTES} bytes!`);
}

success(`All ${diskFiles.length} image files match manifest.json with full licenses & metadata.`);
success(`Hero #1 size (${(hero1Size / 1024).toFixed(1)} KB) is within 250 KB budget.`);

