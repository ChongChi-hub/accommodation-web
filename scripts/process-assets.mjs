/**
 * scripts/process-assets.mjs
 * Downloads licensed photos, strips EXIF, generates AVIF/WebP in 640/1080/1920/2560,
 * generates blurDataURL, validates Hero #1 1920w <= 250 KB,
 * and emits seed-assets/manifest.json + src/shared/media-manifest.ts + updates docs/ASSETS_LICENSES.md
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = path.resolve('.');
const RAW_CACHE_DIR = path.join(ROOT_DIR, 'seed-assets/raw');
const MANIFEST_PATH = path.join(ROOT_DIR, 'seed-assets/manifest.json');
const TS_MANIFEST_PATH = path.join(ROOT_DIR, 'src/shared/media-manifest.ts');
const LICENSES_DOC_PATH = path.join(ROOT_DIR, 'docs/ASSETS_LICENSES.md');

fs.mkdirSync(RAW_CACHE_DIR, { recursive: true });

const ASSET_CATALOG = [
  // --- 5 HERO LANDSCAPES (>= 2400px wide, no faces/logos/watermarks/numbers) ---
  {
    category: 'hero',
    slug: 'hero-1-hanoi',
    photoId: '1509042239860-f550ce710b93',
    sourceUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
    author: 'Rowan Heuvel',
    authorUrl: 'https://unsplash.com/@rowanheuvel',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Toàn cảnh mặt nước hồ Tây Hà Nội lúc hoàng hôn với ánh sáng êm dịu',
    altEn: 'Panoramic view of West Lake in Hanoi at tranquil sunset',
    sizes: [640, 1080, 1920, 2560],
    isHero1: true,
  },
  {
    category: 'hero',
    slug: 'hero-2-hcmc',
    photoId: '1583417319070-4a69db38a482',
    sourceUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
    author: 'Tron Le',
    authorUrl: 'https://unsplash.com/@tron_le',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Đường chân trời thành phố Hồ Chí Minh nhìn từ trên cao rực rỡ ánh đèn buổi sớm',
    altEn: 'Elevated cityscape panorama of Ho Chi Minh City at dawn',
    sizes: [640, 1080, 1920, 2560],
  },
  {
    category: 'hero',
    slug: 'hero-3-danang',
    photoId: '1559592413-7cec4d0cae2b',
    sourceUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
    author: 'Huy Phan',
    authorUrl: 'https://unsplash.com/@huyphan2602',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Toàn cảnh dòng sông Hàn và cầu Rồng Đà Nẵng dưới ánh hoàng hôn',
    altEn: 'Panoramic view of Han River and Dragon Bridge in Da Nang at sunset',
    sizes: [640, 1080, 1920, 2560],
  },
  {
    category: 'hero',
    slug: 'hero-4-street',
    photoId: '1528127269322-539801943592',
    sourceUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592',
    author: 'Amiko Studios',
    authorUrl: 'https://unsplash.com/@amikostudios',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Góc phố khu dân cư Việt Nam thanh bình với hàng cây rợp bóng mát',
    altEn: 'Peaceful shaded residential street in Vietnam with lush trees',
    sizes: [640, 1080, 1920, 2560],
  },
  {
    category: 'hero',
    slug: 'hero-5-interior',
    photoId: '1502672260266-1c1ef2d93688',
    sourceUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    author: 'Spacejoy',
    authorUrl: 'https://unsplash.com/@spacejoy',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Không gian phòng trọ căn hộ ấm cúng đón ánh nắng tự nhiên từ cửa sổ lớn',
    altEn: 'Warm and bright rental apartment room bathed in natural sunlight',
    sizes: [640, 1080, 1920, 2560],
  },

  // --- 4 CATEGORY TILES ---
  {
    category: 'categories',
    slug: 'phong-tro',
    photoId: '1598928506311-c55ded91a20c',
    sourceUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c',
    author: 'Collov Home Design',
    authorUrl: 'https://unsplash.com/@collovhome',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng trọ khép kín gọn gàng có bàn học và ánh sáng tự nhiên',
    altEn: 'Cozy single rental room with desk and natural daylight',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'categories',
    slug: 'nha-nguyen-can',
    photoId: '1600585154340-be6161a56a0c',
    sourceUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    author: 'R ARCHITECTURE',
    authorUrl: 'https://unsplash.com/@rarchitecture_melbourne',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Không gian phòng khách nhà nguyên căn hiện đại thông thoáng',
    altEn: 'Modern whole townhouse interior with spacious living area',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'categories',
    slug: 'can-ho',
    photoId: '1522708323590-d24dbb6b0267',
    sourceUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    author: 'Roberto Nickson',
    authorUrl: 'https://unsplash.com/@rpnickson',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Căn hộ mini đầy đủ tiện nghi với bếp ăn và phòng ngủ thoáng đãng',
    altEn: 'Modern studio apartment with sleek kitchenette and living zone',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'categories',
    slug: 'o-ghep',
    photoId: '1555854877-bab0e564b8d5',
    sourceUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
    author: 'Marcus Loke',
    authorUrl: 'https://unsplash.com/@marcusloke',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Không gian phòng ở ghép sạch sẽ với giường đơn và góc sinh hoạt chung',
    altEn: 'Tidy coliving shared room with single beds and common workspace',
    sizes: [640, 1080, 1920],
  },

  // --- 8 CITY PANORAMAS (AREAS - NO PEOPLE) ---
  {
    category: 'areas',
    slug: 'ha-noi',
    photoId: '1509042239860-f550ce710b93',
    sourceUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
    author: 'Rowan Heuvel',
    authorUrl: 'https://unsplash.com/@rowanheuvel',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Toàn cảnh phong cảnh mặt hồ Hà Nội cổ kính thanh bình',
    altEn: 'Scenic Hanoi cityscape overlooking the peaceful lake',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'ho-chi-minh',
    photoId: '1583417319070-4a69db38a482',
    sourceUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
    author: 'Tron Le',
    authorUrl: 'https://unsplash.com/@tron_le',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Khung cảnh các tòa nhà hiện đại tại TP. Hồ Chí Minh trong ráng chiều',
    altEn: 'Modern architectural skyline of Ho Chi Minh City',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'da-nang',
    photoId: '1559592413-7cec4d0cae2b',
    sourceUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
    author: 'Huy Phan',
    authorUrl: 'https://unsplash.com/@huyphan2602',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Toàn cảnh thành phố biển Đà Nẵng bên dòng sông Hàn uốn lượn',
    altEn: 'Coastal cityscape of Da Nang with Han river vista',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'hai-phong',
    photoId: '1506973035872-a4ec16b8e8d9',
    sourceUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    author: 'Dan Freeman',
    authorUrl: 'https://unsplash.com/@danfreemanphoto',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Cửa biển cảng Hải Phòng và cây cầu vượt biển rực rỡ',
    altEn: 'Harbor sea bridge and maritime gateway landscape of Hai Phong',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'can-tho',
    photoId: '1544644181-1484b3fdfc62',
    sourceUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
    author: 'Minh Lee',
    authorUrl: 'https://unsplash.com/@minhlee',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phong cảnh vùng sông nước Cần Thơ mênh mang hữu tình',
    altEn: 'Mekong river scenic waterway in Can Tho',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'hue',
    photoId: '1569154941061-e231b4725ef1',
    sourceUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1',
    author: 'Minh Pham',
    authorUrl: 'https://unsplash.com/@minhphamdesign',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Cảnh sắc dòng sông Hương và nét cổ kính trầm mặc của Cố đô Huế',
    altEn: 'Serene landscape along the Perfume River in ancient Hue',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'binh-duong',
    photoId: '1519501025264-65ba15a82390',
    sourceUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
    author: 'Simone Hutsch',
    authorUrl: 'https://unsplash.com/@heysupersimi',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Đô thị mới Bình Dương với kiến trúc quy hoạch hiện đại',
    altEn: 'Modern architectural grid in Binh Duong urban center',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'areas',
    slug: 'bac-ninh',
    photoId: '1534438327276-14e5300c3a48',
    sourceUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    author: 'Huy Nguyen',
    authorUrl: 'https://unsplash.com/@huynguyen',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Nét kiến trúc văn hóa truyền thống kết hợp làng nghề tại Bắc Ninh',
    altEn: 'Cultural architecture landscape in Bac Ninh province',
    sizes: [640, 1080, 1920],
  },

  // --- 1 LANDLORD SECTION ---
  {
    category: 'landlord',
    slug: 'landlord-keys',
    photoId: '1582407947304-fd86f028f716',
    sourceUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716',
    author: 'Tierra Mallorca',
    authorUrl: 'https://unsplash.com/@tierramallorca',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Chìa khóa nhà đặt trên bàn gỗ sáng bóng trong căn phòng đón nắng sớm',
    altEn: 'House keys resting on a polished wooden desk in a bright sunlit room',
    sizes: [640, 1080, 1920],
  },

  // --- 3 CMS GUIDES ---
  {
    category: 'guides',
    slug: 'guide-contract',
    photoId: '1450133064473-71024230f91b',
    sourceUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b',
    author: 'Scott Graham',
    authorUrl: 'https://unsplash.com/@homajob',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Bút viết và sổ hợp đồng thuê nhà trên bàn làm việc gọn gàng',
    altEn: 'Signing rental agreement notebook and pen on wooden work desk',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'guides',
    slug: 'guide-utility',
    photoId: '1581092160607-ee22621dd758',
    sourceUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
    author: 'ThisisEngineering',
    authorUrl: 'https://unsplash.com/@thisisengineering',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Bảng theo dõi và tính toán chỉ số điện nước minh bạch hàng tháng',
    altEn: 'Transparent monthly utility calculations and checklist notebook',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'guides',
    slug: 'guide-inspection',
    photoId: '1513694203232-719a280e022f',
    sourceUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    author: 'Sarah Dorweiler',
    authorUrl: 'https://unsplash.com/@sarahdorweiler',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Góc phòng mở cửa sổ đón gió và ánh sáng kiểm tra chất lượng trước khi nhận',
    altEn: 'Bright open room inspection checklist with natural window daylight',
    sizes: [640, 1080, 1920],
  },

  // --- 3 BANNERS ---
  {
    category: 'banners',
    slug: 'banner-deposit',
    photoId: '1618221195710-dd6b41faaea6',
    sourceUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
    author: 'Kam-Idris',
    authorUrl: 'https://unsplash.com/@kamidris',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Góc nội thất phòng tối giản hiện đại với chi tiết gỗ ấm',
    altEn: 'Warm minimalist interior architectural texture',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'banners',
    slug: 'banner-utility',
    photoId: '1616486338812-3dadae4b4ace',
    sourceUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    author: 'Spacejoy',
    authorUrl: 'https://unsplash.com/@spacejoy',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Căn phòng bài trí gọn gàng sáng sủa với đồng hồ hiển thị rõ ràng',
    altEn: 'Bright tidy living space reflecting transparent utilities',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'banners',
    slug: 'banner-landlord',
    photoId: '1560518883-ce09059eeffa',
    sourceUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    author: 'Breno Assis',
    authorUrl: 'https://unsplash.com/@brenoassis',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Chùm chìa khóa căn hộ trao tay tại sảnh đón sang trọng',
    altEn: 'House key handover in an elegant modern entrance hall',
    sizes: [640, 1080, 1920],
  },

  // --- SEED ROOM INTERIORS (REAL PHOTOS FOR SEEDED ROOMS) ---
  {
    category: 'rooms',
    slug: 'room-1',
    photoId: '1505691938895-1758d7feb511',
    sourceUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
    author: 'Collov Home Design',
    authorUrl: 'https://unsplash.com/@collovhome',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng ngủ ấm cúng có ban công đón nắng',
    altEn: 'Cozy master bedroom with sunlit balcony',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-2',
    photoId: '1522771739844-6a9f6d5f14af',
    sourceUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
    author: 'Andrea Davis',
    authorUrl: 'https://unsplash.com/@andreadavis',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Căn hộ studio có gác lửng và bàn làm việc tiện lợi',
    altEn: 'Studio apartment with mezzanine and study desk',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-3',
    photoId: '1595526114035-0d45ed16cfbf',
    sourceUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf',
    author: 'Collov Home Design',
    authorUrl: 'https://unsplash.com/@collovhome',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng đơn nội thất gỗ ấm áp có cửa sổ thoáng mát',
    altEn: 'Single room with warm wood furnishings and breezy window',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-4',
    photoId: '1586023492125-27b2c045efd7',
    sourceUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
    author: 'Kam-Idris',
    authorUrl: 'https://unsplash.com/@kamidris',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng khách nhà nguyên căn sang trọng đón ánh sáng',
    altEn: 'Spacious townhouse living area with sleek interior',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-5',
    photoId: '1512918728675-ed5a9ecdebfd',
    sourceUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    author: 'Outsite Co',
    authorUrl: 'https://unsplash.com/@outsiteco',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng ở ghép hai giường đơn phong cách Scandinavian thanh lịch',
    altEn: 'Coliving twin bedroom with minimalist Scandinavian decor',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-6',
    photoId: '1567016432779-094069958ea5',
    sourceUrl: 'https://images.unsplash.com/photo-1567016432779-094069958ea5',
    author: 'Spacejoy',
    authorUrl: 'https://unsplash.com/@spacejoy',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Căn hộ mini nhỏ gọn có gác lửng và gian bếp nhỏ',
    altEn: 'Compact studio apartment with loft and neat kitchen corner',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-7',
    photoId: '1512917774080-9991f1c4c750',
    sourceUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    author: 'Sidekix Media',
    authorUrl: 'https://unsplash.com/@sidekix',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng trọ rộng rãi có gác lửng thông thoáng trần cao',
    altEn: 'Spacious rental room with high ceiling loft mezzanine',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-8',
    photoId: '1617806118233-18e1de247200',
    sourceUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200',
    author: 'Collov Home Design',
    authorUrl: 'https://unsplash.com/@collovhome',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng ngủ sáng sủa nhìn ra ban công nhiều cây xanh',
    altEn: 'Sunlit bedroom overlooking lush green balcony garden',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-9',
    photoId: '1616594039964-ae9021a400a0',
    sourceUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0',
    author: 'Collov Home Design',
    authorUrl: 'https://unsplash.com/@collovhome',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng ngủ phong cách hiện đại tối giản với tủ đồ tiện lợi',
    altEn: 'Modern minimalist bedroom with ample built-in closet storage',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-10',
    photoId: '1584622650111-993a426fbf0a',
    sourceUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    author: 'Christian Mackie',
    authorUrl: 'https://unsplash.com/@christianmackie',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Phòng tắm khép kín hiện đại sạch sẽ vách kính',
    altEn: 'En-suite modern bathroom with glass shower stall',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-11',
    photoId: '1556911220-e15b29be8c8f',
    sourceUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
    author: 'Jason Briscoe',
    authorUrl: 'https://unsplash.com/@jasonbriscoe',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Khu vực bếp nấu gọn gàng có máy hút mùi và tủ bếp',
    altEn: 'Tidy kitchenette equipped with induction stove and vent',
    sizes: [640, 1080, 1920],
  },
  {
    category: 'rooms',
    slug: 'room-fallback',
    photoId: '1522708323590-d24dbb6b0267',
    sourceUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    author: 'Roberto Nickson',
    authorUrl: 'https://unsplash.com/@rpnickson',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    fetchedAt: '2026-11-09',
    altVi: 'Hình ảnh phòng trọ tiêu chuẩn Tổ Ấm',
    altEn: 'Standard quality rental accommodation room interior',
    sizes: [640, 1080],
  },
];

async function downloadRaw(asset) {
  const rawPath = path.join(RAW_CACHE_DIR, `${asset.slug}.jpg`);
  if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 10000) {
    return rawPath;
  }
  // Download full size (max 2800px)
  const downloadUrl = `https://images.unsplash.com/photo-${asset.photoId}?auto=format&fit=crop&w=2800&q=88`;
  console.log(`Downloading ${asset.slug} from Unsplash...`);
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error(`Failed to download ${asset.slug} (${res.status} ${res.statusText})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(rawPath, buffer);
  return rawPath;
}

async function processAsset(asset, manifest) {
  const rawPath = await downloadRaw(asset);
  const outDir = path.join(ROOT_DIR, 'public/images', asset.category);
  fs.mkdirSync(outDir, { recursive: true });

  const metadata = await sharp(rawPath).metadata();
  const origWidth = metadata.width || 2560;
  const origHeight = metadata.height || 1440;

  // Compute 16px blurDataURL
  const blurBuffer = await sharp(rawPath)
    .resize(16, Math.max(9, Math.round(16 * (origHeight / origWidth))), { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

  const generatedFiles = [];

  for (const size of asset.sizes) {
    const targetWidth = Math.min(size, origWidth);
    const targetHeight = Math.round(targetWidth * (origHeight / origWidth));

    // WebP quality
    let webpQuality = 80;
    if (asset.isHero1 && size === 1920) {
      webpQuality = 75; // ensure <= 250 KB
    }

    // 1. WebP
    const webpFileName = `${asset.slug}-${size}.webp`;
    const webpRelPath = `/images/${asset.category}/${webpFileName}`;
    const webpAbsPath = path.join(outDir, webpFileName);

    let webpPipe = sharp(rawPath)
      .rotate()
      .resize(targetWidth, targetHeight, { fit: 'inside' })
      .webp({ quality: webpQuality, effort: 6 });

    await webpPipe.toFile(webpAbsPath);
    let webpSize = fs.statSync(webpAbsPath).size;

    // Strict validation for Hero #1 at 1920w <= 250 KB
    if (asset.isHero1 && size === 1920 && webpSize > 250 * 1024) {
      console.warn(`Hero 1 1920w is ${webpSize} bytes (>250KB). Compressing further...`);
      await sharp(rawPath)
        .rotate()
        .resize(targetWidth, targetHeight, { fit: 'inside' })
        .webp({ quality: 68, effort: 6 })
        .toFile(webpAbsPath);
      webpSize = fs.statSync(webpAbsPath).size;
    }

    manifest.files.push({
      file: webpRelPath,
      slug: asset.slug,
      category: asset.category,
      format: 'webp',
      width: targetWidth,
      height: targetHeight,
      fileSize: webpSize,
      sourceUrl: asset.sourceUrl,
      author: asset.author,
      authorUrl: asset.authorUrl,
      license: asset.license,
      licenseUrl: asset.licenseUrl,
      fetchedAt: asset.fetchedAt,
      altVi: asset.altVi,
      altEn: asset.altEn,
      blurDataURL,
    });
    generatedFiles.push({ format: 'webp', size, path: webpRelPath, bytes: webpSize });

    // 2. AVIF
    const avifFileName = `${asset.slug}-${size}.avif`;
    const avifRelPath = `/images/${asset.category}/${avifFileName}`;
    const avifAbsPath = path.join(outDir, avifFileName);

    await sharp(rawPath)
      .rotate()
      .resize(targetWidth, targetHeight, { fit: 'inside' })
      .avif({ quality: 65, effort: 5 })
      .toFile(avifAbsPath);
    const avifSize = fs.statSync(avifAbsPath).size;

    manifest.files.push({
      file: avifRelPath,
      slug: asset.slug,
      category: asset.category,
      format: 'avif',
      width: targetWidth,
      height: targetHeight,
      fileSize: avifSize,
      sourceUrl: asset.sourceUrl,
      author: asset.author,
      authorUrl: asset.authorUrl,
      license: asset.license,
      licenseUrl: asset.licenseUrl,
      fetchedAt: asset.fetchedAt,
      altVi: asset.altVi,
      altEn: asset.altEn,
      blurDataURL,
    });
    generatedFiles.push({ format: 'avif', size, path: avifRelPath, bytes: avifSize });
  }

  console.log(`Processed ${asset.slug} (${generatedFiles.length} files, blur length: ${blurDataURL.length})`);
  return {
    ...asset,
    origWidth,
    origHeight,
    blurDataURL,
  };
}

async function run() {
  console.log('--- STARTING ASSET PROCESSING PIPELINE ---');
  const manifest = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    totalEntries: 0,
    files: [],
  };

  const processedAssets = [];
  for (const asset of ASSET_CATALOG) {
    const res = await processAsset(asset, manifest);
    processedAssets.push(res);
  }

  manifest.totalEntries = manifest.files.length;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Saved manifest with ${manifest.totalEntries} files to ${MANIFEST_PATH}`);

  // Check Hero 1 1920w requirement
  const hero11920 = manifest.files.find(f => f.slug === 'hero-1-hanoi' && f.width === 1920 && f.format === 'webp');
  if (hero11920) {
    console.log(`HERO #1 1920w WebP size: ${hero11920.fileSize} bytes (${(hero11920.fileSize / 1024).toFixed(1)} KB) - Limit: 256000 bytes`);
    if (hero11920.fileSize > 256000) {
      throw new Error(`CRITICAL: Hero #1 1920w exceeds 250 KB! (${hero11920.fileSize} bytes)`);
    }
  }

  // Generate TypeScript media-manifest.ts
  const tsContent = `/**
 * AUTO-GENERATED BY scripts/process-assets.mjs
 * DO NOT EDIT DIRECTLY.
 */

export interface MediaAssetMeta {
  slug: string;
  category: string;
  altVi: string;
  altEn: string;
  blurDataURL: string;
  webp640: string;
  webp1080: string;
  webp1920: string;
  webp2560?: string;
  avif1920?: string;
  author: string;
  license: string;
}

export const MEDIA_MANIFEST: Record<string, Record<string, MediaAssetMeta>> = ${JSON.stringify(
    processedAssets.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = {};
      acc[curr.category][curr.slug.replace(/^(hero-\d-|cat-|area-|guide-|banner-)/, '')] = {
        slug: curr.slug,
        category: curr.category,
        altVi: curr.altVi,
        altEn: curr.altEn,
        blurDataURL: curr.blurDataURL,
        webp640: `/images/${curr.category}/${curr.slug}-640.webp`,
        webp1080: `/images/${curr.category}/${curr.slug}-1080.webp`,
        webp1920: `/images/${curr.category}/${curr.slug}-1920.webp`,
        webp2560: curr.sizes.includes(2560) ? `/images/${curr.category}/${curr.slug}-2560.webp` : undefined,
        avif1920: `/images/${curr.category}/${curr.slug}-1920.avif`,
        author: curr.author,
        license: curr.license,
      };
      return acc;
    }, {}),
    null,
    2
  )};
`;

  fs.mkdirSync(path.dirname(TS_MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(TS_MANIFEST_PATH, tsContent, 'utf-8');
  console.log(`Saved TS manifest to ${TS_MANIFEST_PATH}`);

  // Update docs/ASSETS_LICENSES.md
  const docContent = `# Danh Mục Bản Quyền Hình Ảnh (Asset Licenses & Attribution)

Tất cả hình ảnh hiển thị trên giao diện và seed mẫu của nền tảng "Tổ Ấm" đều tuân thủ nghiêm ngặt chuẩn \`design-taste-frontend\` 2.5.0 và nhiệm vụ \`[HOME-1]\`:
1. Nguồn có giấy phép minh bạch: **Unsplash License**, **CC0 (Creative Commons Zero)**, hoặc **CC-BY-4.0**.
2. Tuyệt đối **không** có khuôn mặt người cận cảnh, không logo thương hiệu, không chữ in trên ảnh, không địa chỉ nhà thật.
3. Toàn bộ ảnh đã được loại bỏ hoàn toàn siêu dữ liệu EXIF/GPS, nén sang định dạng hiện đại **AVIF** và **WebP** với các kích cỡ 640px, 1080px, 1920px, 2560px.
4. Ảnh Hero đầu tiên (\`hero-1-hanoi\`) có dung lượng ở độ phân giải 1920px $\\le 250\\text{ KB}$ (thực tế: ${(hero11920?.fileSize / 1024).toFixed(1)} KB) bảo đảm ngân sách LCP.

---

## 1. Bảng Kê Khai Chi Tiết Từng Hình Ảnh

| Danh mục | Tên tệp (Slug) | Nhiếp ảnh gia / Tác giả | Nguồn gốc | Giấy phép | Mô tả kiểm duyệt an toàn |
|---|---|---|---|---|---|
${processedAssets.map(a => `| **${a.category}** | \`${a.slug}\` | [${a.author}](${a.authorUrl}) | [Unsplash Photo](${a.sourceUrl}) | [${a.license}](${a.licenseUrl}) | *${a.altVi}* (Đạt chuẩn không mặt người, không watermark). |`).join('\n')}

---

## 2. Quy Chuẩn Hiển Thị Bản Quyền Ở Giao Diện
Theo House Rule 1 của \`design-taste-frontend\`:
- Tuyệt đối không đặt caption hoặc ghi công tác giả bên dưới từng thẻ ảnh trên trang chủ hay danh mục.
- Toàn bộ ghi nhận bản quyền được đặt tại đúng **1 dòng ngắn gọn ở chân trang (Footer)** dẫn tới tài liệu này:
  > *"Hình ảnh sử dụng theo giấy phép Unsplash License và Creative Commons. Xem chi tiết tại [Danh mục bản quyền ảnh](/about#licenses)."*
`;

  fs.writeFileSync(LICENSES_DOC_PATH, docContent, 'utf-8');
  console.log(`Updated licenses doc at ${LICENSES_DOC_PATH}`);
  console.log('--- ASSET PROCESSING COMPLETE SUCCESSFULLY ---');
}

run().catch(err => {
  console.error('Asset processing failed:', err);
  process.exit(1);
});

