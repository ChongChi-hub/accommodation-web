const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfs07oaet',
  api_key: process.env.CLOUDINARY_API_KEY || '632318816957616',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cqe9TWG7Qag1rOW8mdXPyf6lZ1g',
  secure: true
});

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const MAPPING_FILE = path.resolve(__dirname, 'cloudinary-mapping.json');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function uploadFile(filePath, index, total) {
  const relPath = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
  const webPath = '/' + relPath;
  const parsed = path.parse(relPath);
  const folder = 'cozynest/' + (parsed.dir ? parsed.dir : '');
  const publicId = parsed.name;

  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto'
    });
    console.log(`[${index + 1}/${total}] Uploaded ${webPath} -> ${res.secure_url}`);
    return { webPath, cloudinaryUrl: res.secure_url, publicId: res.public_id };
  } catch (err) {
    console.error(`[${index + 1}/${total}] FAILED ${webPath}:`, err.message);
    return { webPath, error: err.message };
  }
}

async function run() {
  const uploadsDir = path.join(PUBLIC_DIR, 'uploads');
  const roomsDir = path.join(PUBLIC_DIR, 'rooms');
  
  const files = [
    ...getAllFiles(uploadsDir),
    ...getAllFiles(roomsDir)
  ];

  console.log(`Found ${files.length} images to upload to Cloudinary...`);

  const results = {};
  const concurrency = 8;
  
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const promises = batch.map((file, batchIdx) => uploadFile(file, i + batchIdx, files.length));
    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r.cloudinaryUrl) {
        results[r.webPath] = r.cloudinaryUrl;
      }
    }
  }

  fs.writeFileSync(MAPPING_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Done! Uploaded ${Object.keys(results).length} images. Mapping saved to ${MAPPING_FILE}`);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

