import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const WEB_ROOT = 'd:/RIKKEI/THUC_TAP/PROJECT/accommodation-web';
const ROOMS_DIR = path.join(WEB_ROOT, 'public/uploads/rooms');
const TEMP_MEDIA = path.join(WEB_ROOT, 'temp_media');

// Prepare structure: temp_media/rooms/{rid}/img_{idx}.webp
fs.mkdirSync(path.join(TEMP_MEDIA, 'rooms'), { recursive: true });

const files = fs.readdirSync(ROOMS_DIR);
for (const file of files) {
  const match = file.match(/^r(\d+)_(\d+)\.webp$/);
  if (match) {
    const rid = match[1];
    const idx = match[2];
    const roomFolder = path.join(TEMP_MEDIA, 'rooms', rid);
    fs.mkdirSync(roomFolder, { recursive: true });
    const srcPath = path.join(ROOMS_DIR, file);
    fs.copyFileSync(srcPath, path.join(roomFolder, `img_${idx}.webp`));
    fs.copyFileSync(srcPath, path.join(roomFolder, `img_${idx}_large.webp`));
    fs.copyFileSync(srcPath, path.join(roomFolder, `img_${idx}_medium.webp`));
    fs.copyFileSync(srcPath, path.join(roomFolder, `img_${idx}_thumb.webp`));
  }
}

console.log('Copying prepared media tree into cozynest_listing container...');
execSync(`docker cp "${TEMP_MEDIA}/rooms/." cozynest_listing:/app/storage/media/rooms/`);
console.log('Cleaning up temp directory...');
fs.rmSync(TEMP_MEDIA, { recursive: true, force: true });
console.log('Done syncing media into container.');

