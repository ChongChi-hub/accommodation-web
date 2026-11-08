import fs from 'fs';
import { execSync } from 'child_process';

// Get room IDs from database
const roomListRaw = execSync('docker exec -i cozynest_mysql mysql -uroot -prootpassword123 cozynest_listing -N -e "SELECT id FROM rooms ORDER BY id;"', { encoding: 'utf8' });
const roomIds = roomListRaw.trim().split(/\s+/).map(x => parseInt(x, 10)).filter(x => !isNaN(x));

let sql = `
USE cozynest_listing;

-- 1. Update Provinces image_url
UPDATE provinces SET image_url = '/uploads/locations/ha-noi.webp' WHERE code = 'HN';
UPDATE provinces SET image_url = '/uploads/locations/ho-chi-minh.webp' WHERE code = 'HCM';
UPDATE provinces SET image_url = '/uploads/locations/da-nang.webp' WHERE code = 'DNG';
UPDATE provinces SET image_url = '/uploads/locations/hai-phong.webp' WHERE code = 'HP';
UPDATE provinces SET image_url = '/uploads/locations/can-tho.webp' WHERE code = 'CT';
UPDATE provinces SET image_url = '/uploads/locations/fallback.webp' WHERE code NOT IN ('HN', 'HCM', 'DNG', 'HP', 'CT') OR image_url IS NULL;

-- 2. Update Banners
UPDATE banners SET image_url = '/uploads/banners/banner_1.webp' WHERE id = 1;
UPDATE banners SET image_url = '/uploads/banners/banner_2.webp' WHERE id = 2;
UPDATE banners SET image_url = '/uploads/banners/banner_3.webp' WHERE id = 3;

-- 3. Update Landlord Snapshots
UPDATE landlord_snapshots SET avatar_url = '/uploads/avatars/landlord1.jpg' WHERE landlord_id = 1;
UPDATE landlord_snapshots SET avatar_url = '/uploads/avatars/landlord2.jpg' WHERE landlord_id = 2;

-- 4. Rebuild room_images cleanly
DELETE FROM room_images;
`;

const imageRows = [];
for (const rid of roomIds) {
  imageRows.push(`(${rid}, '/uploads/rooms/r${rid}_1.webp', 'rooms/${rid}/img_1.webp', 'rooms/${rid}/img_1_thumb.webp', 'rooms/${rid}/img_1_medium.webp', 'rooms/${rid}/img_1_large.webp', 'img1.webp', 'image/webp', 185000, 1600, 1200, 1, 0, 'Không gian tổng quan phòng', 'u-landlord-01', 1, 0)`);
  imageRows.push(`(${rid}, '/uploads/rooms/r${rid}_2.webp', 'rooms/${rid}/img_2.webp', 'rooms/${rid}/img_2_thumb.webp', 'rooms/${rid}/img_2_medium.webp', 'rooms/${rid}/img_2_large.webp', 'img2.webp', 'image/webp', 175000, 1600, 1200, 0, 1, 'Góc phòng ngủ ấm cúng', 'u-landlord-01', 0, 1)`);
  imageRows.push(`(${rid}, '/uploads/rooms/r${rid}_3.webp', 'rooms/${rid}/img_3.webp', 'rooms/${rid}/img_3_thumb.webp', 'rooms/${rid}/img_3_medium.webp', 'rooms/${rid}/img_3_large.webp', 'img3.webp', 'image/webp', 165000, 1600, 1200, 0, 2, 'Khu vực bếp và ban công thoáng mát', 'u-landlord-01', 0, 2)`);
  imageRows.push(`(${rid}, '/uploads/rooms/r${rid}_4.webp', 'rooms/${rid}/img_4.webp', 'rooms/${rid}/img_4_thumb.webp', 'rooms/${rid}/img_4_medium.webp', 'rooms/${rid}/img_4_large.webp', 'img4.webp', 'image/webp', 155000, 1600, 1200, 0, 3, 'Phòng vệ sinh sạch sẽ tiện nghi', 'u-landlord-01', 0, 3)`);
}

sql += `
INSERT INTO room_images 
(room_id, image_url, storage_key, thumb_key, medium_key, large_key, original_filename, content_type, size_bytes, width, height, is_cover, sort_order, alt_text, uploaded_by, is_primary, display_order)
VALUES
${imageRows.join(',\n')};
`;

// 5. Reconcile Reviews
sql += `
DELETE FROM reviews;
`;

const sampleComments = [
  'Phòng rất sạch sẽ, đúng như mô tả và hình ảnh. Chủ nhà hỗ trợ nhiệt tình!',
  'Không gian thoáng mát, giờ giấc tự do an ninh tốt, điện nước rõ ràng minh bạch.',
  'Vị trí trung tâm thuận tiện đi lại, phòng mới sạch đẹp, wifi ổn định.',
  'Chủ trọ thân thiện, có vấn đề bảo trì báo là hỗ trợ ngay trong ngày.',
  'Phòng ốc bài trí hợp lý, cách âm tốt, rất hài lòng khi ở đây.'
];
const tenants = [
  { id: 1, name: 'Nguyễn Văn Thuê', avatar: '/uploads/avatars/tenant1.jpg' },
  { id: 2, name: 'Lê Hoàng Minh', avatar: '/uploads/avatars/tenant2.jpg' },
  { id: 3, name: 'Vũ Phương Thảo', avatar: '/uploads/avatars/tenant3.jpg' },
  { id: 4, name: 'Đặng Quốc Hưng', avatar: '/uploads/avatars/tenant4.jpg' },
  { id: 5, name: 'Bùi Thị Thanh Hà', avatar: '/uploads/avatars/tenant5.jpg' },
  { id: 6, name: 'Đỗ Minh Tuấn', avatar: '/uploads/avatars/tenant6.jpg' },
];

const reviewRows = [];
for (let i = 0; i < roomIds.length; i++) {
  const rid = roomIds[i];
  if (i % 4 === 3) continue; // leave roughly 25% of rooms with 0 reviews

  const count = (rid % 4) + 1; // 1 to 4 reviews
  for (let j = 0; j < count; j++) {
    const rating = Math.min(5, Math.max(4, 4 + ((rid + j) % 2))); // 4 or 5
    const t = tenants[(rid + j) % tenants.length];
    const comment = sampleComments[(rid + j) % sampleComments.length];
    reviewRows.push(`(${rid}, ${t.id}, '${t.name}', '${t.avatar}', ${rating}, 1, '${comment}', NULL, NOW())`);
  }
}

sql += `
INSERT INTO reviews 
(room_id, tenant_id, tenant_name, tenant_avatar, rating, is_verified_tenant, comment, landlord_reply, created_at)
VALUES
${reviewRows.join(',\n')};

-- Synchronize rooms.rating_avg and rooms.review_count from reviews
UPDATE rooms r
LEFT JOIN (
  SELECT room_id, COUNT(*) as cnt, ROUND(AVG(rating), 1) as avg_rating
  FROM reviews
  GROUP BY room_id
) rev ON r.id = rev.room_id
SET 
  r.review_count = COALESCE(rev.cnt, 0),
  r.rating_avg = COALESCE(rev.avg_rating, 0.0);
`;

const sqlPath = 'd:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/scripts/apply_ui_fix_1.sql';
fs.writeFileSync(sqlPath, sql, 'utf8');
console.log('Generated apply_ui_fix_1.sql successfully.');

execSync(`docker exec -i cozynest_mysql mysql -uroot -prootpassword123 --default-character-set=utf8mb4 < "${sqlPath}"`);
console.log('Executed SQL successfully in MySQL!');
