import fs from 'fs';
import path from 'path';

async function audit() {
  console.log('Running automated seed image asset audit via frontend (http://localhost:3000)...');
  
  // Collect all URLs to test from DB endpoints
  const testUrls = new Set();

  // 1. Fetch Rooms from FE
  try {
    const res = await fetch('http://localhost:3000/api/v1/rooms?size=50');
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      for (const r of json.data) {
        if (r.primaryImageUrl) testUrls.add(r.primaryImageUrl);
        if (Array.isArray(r.imageUrls)) {
          r.imageUrls.forEach(u => testUrls.add(u));
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch rooms:', e.message);
  }

  // 2. Fetch Banners
  try {
    const res = await fetch('http://localhost:3000/api/v1/cms/banners');
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      json.data.forEach(b => testUrls.add(b.imageUrl));
    }
  } catch (e) {
    console.error('Failed to fetch banners:', e.message);
  }

  // 3. Fetch Hot Areas (Locations)
  try {
    const res = await fetch('http://localhost:3000/api/v1/locations/hot-areas');
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      json.data.forEach(a => testUrls.add(a.imageUrl));
    }
  } catch (e) {
    console.error('Failed to fetch hot areas:', e.message);
  }

  // 4. Avatars
  const sampleAvatars = [
    '/uploads/avatars/tenant1.jpg',
    '/uploads/avatars/landlord1.jpg',
    '/uploads/avatars/admin1.jpg',
    '/uploads/avatars/mod1.jpg',
  ];
  sampleAvatars.forEach(a => testUrls.add(a));

  console.log(`Total unique image URLs to audit: ${testUrls.size}`);

  const results = [];
  let brokenCount = 0;

  for (const urlPath of testUrls) {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `http://localhost:3000${urlPath}`;
    try {
      const res = await fetch(fullUrl, { method: 'GET' });
      const status = res.status;
      const contentType = res.headers.get('content-type') || 'unknown';
      const buffer = await res.arrayBuffer();
      const sizeBytes = buffer.byteLength;

      if (status >= 400 || sizeBytes === 0) {
        brokenCount++;
      }

      results.push({
        url: urlPath,
        status,
        contentType,
        sizeBytes,
      });
    } catch (err) {
      brokenCount++;
      results.push({
        url: urlPath,
        status: 0,
        contentType: 'NETWORK_ERROR',
        sizeBytes: 0,
      });
    }
  }

  // Format Markdown Report
  let md = '# BÁO CÁO KIỂM KÊ TÀI NGUYÊN HÌNH ẢNH SEED (UI-FIX-1 ITEM 4)\n\n';
  md += `- **Thời điểm kiểm tra**: ${new Date().toISOString()}\n`;
  md += `- **Tổng số URL kiểm kê**: ${results.length}\n`;
  md += `- **Số ảnh hỏng (HTTP >= 400 hoặc 0 bytes)**: **${brokenCount}**\n`;
  md += `- **Kết luận**: **${brokenCount === 0 ? 'ĐẠT (100% tài nguyên tải thành công)' : 'CHƯA ĐẠT'}**\n\n`;
  md += '| URL | HTTP Status | Content-Type | Kích thước (bytes) |\n';
  md += '| :--- | :---: | :---: | :---: |\n';

  for (const r of results) {
    md += `| \`${r.url}\` | ${r.status} | ${r.contentType} | ${r.sizeBytes.toLocaleString()} |\n`;
  }

  const reportPath = 'd:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/audit/IMAGE_AUDIT_REPORT.md';
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, md, 'utf8');

  console.log(`Audit finished. Broken images: ${brokenCount}. Report saved to ${reportPath}`);
  if (brokenCount > 0) {
    process.exit(1);
  }
}

audit().catch((e) => {
  console.error(e);
  process.exit(1);
});

