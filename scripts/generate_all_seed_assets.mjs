import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const WEB_ROOT = 'd:/RIKKEI/THUC_TAP/PROJECT/accommodation-web';
const ROOMS_DIR = path.join(WEB_ROOT, 'public/uploads/rooms');
const LOCATIONS_DIR = path.join(WEB_ROOT, 'public/uploads/locations');
const BANNERS_DIR = path.join(WEB_ROOT, 'public/uploads/banners');
const AVATARS_DIR = path.join(WEB_ROOT, 'public/uploads/avatars');
const LEGACY_ROOMS_DIR = path.join(WEB_ROOT, 'public/rooms');

[ROOMS_DIR, LOCATIONS_DIR, BANNERS_DIR, AVATARS_DIR, LEGACY_ROOMS_DIR].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Color palettes conforming to brand guidelines (Teal, Amber, Cream, Warm Stone, Emerald)
// ZERO purple / violet allowed!
const ROOM_THEMES = [
  {
    name: 'Teal Sanctuary',
    wall: '#f0fdfa',
    accentWall: '#ccfbf1',
    floor: '#e7e5e4',
    furniture: '#0d9488',
    furnitureDark: '#115e59',
    warmAccent: '#f59e0b',
    neutralDark: '#292524',
    white: '#ffffff',
  },
  {
    name: 'Amber Glow',
    wall: '#fffbeb',
    accentWall: '#fef3c7',
    floor: '#f5f5f4',
    furniture: '#d97706',
    furnitureDark: '#b45309',
    warmAccent: '#0d9488',
    neutralDark: '#1c1917',
    white: '#ffffff',
  },
  {
    name: 'Warm Stone Modern',
    wall: '#fafaf9',
    accentWall: '#f5f5f4',
    floor: '#e7e5e4',
    furniture: '#44403c',
    furnitureDark: '#292524',
    warmAccent: '#d97706',
    neutralDark: '#1c1917',
    white: '#ffffff',
  },
  {
    name: 'Nordic Sage',
    wall: '#f0fdf4',
    accentWall: '#dcfce7',
    floor: '#f5f5f4',
    furniture: '#059669',
    furnitureDark: '#065f46',
    warmAccent: '#f59e0b',
    neutralDark: '#292524',
    white: '#ffffff',
  },
];

function getPerspectiveSvg(type, theme) {
  const w = 1600;
  const h = 1200;

  if (type === 1) {
    // 1. Overview / Living Area
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <!-- Background wall -->
      <rect width="${w}" height="${h}" fill="${theme.wall}"/>
      <!-- Accent wall panel -->
      <rect x="0" y="0" width="480" height="900" fill="${theme.accentWall}"/>
      <!-- Floor -->
      <polygon points="0,900 ${w},900 ${w},${h} 0,${h}" fill="${theme.floor}"/>
      <!-- Floor baseboard -->
      <rect x="0" y="885" width="${w}" height="15" fill="${theme.neutralDark}" opacity="0.15"/>
      <line x1="0" y1="900" x2="${w}" y2="900" stroke="${theme.neutralDark}" stroke-width="2" opacity="0.3"/>
      <!-- Floor planks -->
      <line x1="200" y1="900" x2="100" y2="${h}" stroke="${theme.neutralDark}" stroke-width="1.5" opacity="0.12"/>
      <line x1="600" y1="900" x2="500" y2="${h}" stroke="${theme.neutralDark}" stroke-width="1.5" opacity="0.12"/>
      <line x1="1000" y1="900" x2="900" y2="${h}" stroke="${theme.neutralDark}" stroke-width="1.5" opacity="0.12"/>
      <line x1="1400" y1="900" x2="1300" y2="${h}" stroke="${theme.neutralDark}" stroke-width="1.5" opacity="0.12"/>

      <!-- Window with daylight -->
      <rect x="620" y="160" width="460" height="520" rx="12" fill="#e0f2fe" stroke="${theme.white}" stroke-width="18"/>
      <line x1="850" y1="160" x2="850" y2="680" stroke="${theme.white}" stroke-width="12"/>
      <line x1="620" y1="420" x2="1080" y2="420" stroke="${theme.white}" stroke-width="12"/>
      <!-- Window sunlight rays -->
      <polygon points="620,160 1080,160 1320,900 480,900" fill="#ffffff" opacity="0.22"/>
      <!-- Curtains -->
      <rect x="580" y="140" width="55" height="580" rx="6" fill="${theme.warmAccent}" opacity="0.85"/>
      <rect x="1065" y="140" width="55" height="580" rx="6" fill="${theme.warmAccent}" opacity="0.85"/>

      <!-- Wall Artwork Frame -->
      <rect x="180" y="240" width="220" height="300" rx="8" fill="${theme.white}" stroke="${theme.neutralDark}" stroke-width="6"/>
      <rect x="200" y="260" width="180" height="260" fill="${theme.furnitureDark}" opacity="0.15"/>
      <circle cx="290" cy="360" r="50" fill="${theme.warmAccent}"/>
      <polygon points="230,480 350,480 290,390" fill="${theme.furniture}"/>

      <!-- Cozy Armchair -->
      <rect x="220" y="660" width="260" height="220" rx="36" fill="${theme.furniture}"/>
      <rect x="250" y="610" width="200" height="150" rx="28" fill="${theme.furnitureDark}"/>
      <rect x="240" y="730" width="220" height="110" rx="22" fill="${theme.furniture}"/>
      <!-- Armchair legs -->
      <line x1="260" y1="880" x2="240" y2="950" stroke="${theme.neutralDark}" stroke-width="10" stroke-linecap="round"/>
      <line x1="440" y1="880" x2="460" y2="950" stroke="${theme.neutralDark}" stroke-width="10" stroke-linecap="round"/>

      <!-- Coffee Table -->
      <ellipse cx="640" cy="940" rx="140" ry="40" fill="${theme.neutralDark}" opacity="0.15"/>
      <ellipse cx="640" cy="910" rx="130" ry="32" fill="${theme.furniture}"/>
      <ellipse cx="640" cy="902" rx="120" ry="26" fill="${theme.accentWall}"/>
      <line x1="560" y1="920" x2="540" y2="975" stroke="${theme.neutralDark}" stroke-width="8" stroke-linecap="round"/>
      <line x1="720" y1="920" x2="740" y2="975" stroke="${theme.neutralDark}" stroke-width="8" stroke-linecap="round"/>
      <!-- Ceramic mug on table -->
      <rect x="625" y="870" width="25" height="32" rx="4" fill="${theme.warmAccent}"/>

      <!-- Bookshelf & Plant -->
      <rect x="1220" y="380" width="260" height="540" rx="10" fill="${theme.furnitureDark}"/>
      <rect x="1235" y="400" width="230" height="15" fill="${theme.white}" opacity="0.3"/>
      <rect x="1235" y="540" width="230" height="15" fill="${theme.white}" opacity="0.3"/>
      <rect x="1235" y="680" width="230" height="15" fill="${theme.white}" opacity="0.3"/>
      <!-- Books on shelf -->
      <rect x="1255" y="445" width="24" height="95" rx="3" fill="${theme.warmAccent}"/>
      <rect x="1285" y="425" width="28" height="115" rx="3" fill="${theme.furniture}"/>
      <rect x="1320" y="455" width="22" height="85" rx="3" fill="${theme.white}"/>
      <!-- Potted plant -->
      <path d="M 1270 680 L 1285 640 L 1325 640 L 1340 680 Z" fill="${theme.warmAccent}"/>
      <circle cx="1295" cy="615" r="28" fill="#10b981"/>
      <circle cx="1320" cy="625" r="24" fill="#059669"/>
      <circle cx="1305" cy="595" r="22" fill="#34d399"/>

      <!-- Floor Rug -->
      <ellipse cx="800" cy="1040" rx="420" ry="110" fill="${theme.furniture}" opacity="0.18"/>
      <ellipse cx="800" cy="1040" rx="380" ry="95" fill="${theme.accentWall}" opacity="0.6"/>
    </svg>
    `;
  } else if (type === 2) {
    // 2. Bedroom / Sleeping Area
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <!-- Wall -->
      <rect width="${w}" height="${h}" fill="${theme.wall}"/>
      <rect x="250" y="100" width="1100" height="750" rx="16" fill="${theme.accentWall}"/>
      <!-- Floor -->
      <polygon points="0,850 ${w},850 ${w},${h} 0,${h}" fill="${theme.floor}"/>
      <rect x="0" y="835" width="${w}" height="15" fill="${theme.neutralDark}" opacity="0.15"/>
      <line x1="0" y1="850" x2="${w}" y2="850" stroke="${theme.neutralDark}" stroke-width="2" opacity="0.3"/>

      <!-- Wall Art Duo -->
      <rect x="520" y="160" width="220" height="260" rx="6" fill="${theme.white}" stroke="${theme.neutralDark}" stroke-width="5"/>
      <circle cx="630" cy="280" r="55" fill="${theme.furniture}"/>
      <rect x="860" y="160" width="220" height="260" rx="6" fill="${theme.white}" stroke="${theme.neutralDark}" stroke-width="5"/>
      <polygon points="900,370 1040,370 970,250" fill="${theme.warmAccent}"/>

      <!-- Cozy Bed Headboard -->
      <rect x="420" y="460" width="760" height="340" rx="20" fill="${theme.furnitureDark}"/>
      <!-- Two Pillows -->
      <rect x="480" y="550" width="280" height="140" rx="24" fill="${theme.white}" stroke="${theme.neutralDark}" stroke-width="2" opacity="0.95"/>
      <rect x="840" y="550" width="280" height="140" rx="24" fill="${theme.white}" stroke="${theme.neutralDark}" stroke-width="2" opacity="0.95"/>
      <!-- Duvet / Mattress -->
      <rect x="380" y="660" width="840" height="320" rx="32" fill="${theme.furniture}"/>
      <!-- Folded blanket throw -->
      <rect x="380" y="780" width="840" height="200" rx="24" fill="${theme.warmAccent}"/>
      <!-- Bed base / legs -->
      <rect x="390" y="970" width="820" height="40" rx="8" fill="${theme.neutralDark}"/>
      <line x1="440" y1="1010" x2="440" y2="1080" stroke="${theme.neutralDark}" stroke-width="14" stroke-linecap="round"/>
      <line x1="1160" y1="1010" x2="1160" y2="1080" stroke="${theme.neutralDark}" stroke-width="14" stroke-linecap="round"/>

      <!-- Nightstands -->
      <!-- Left Nightstand -->
      <rect x="180" y="680" width="160" height="220" rx="10" fill="${theme.furnitureDark}"/>
      <rect x="195" y="750" width="130" height="10" fill="${theme.white}" opacity="0.3"/>
      <!-- Left Lamp -->
      <line x1="260" y1="680" x2="260" y2="580" stroke="${theme.neutralDark}" stroke-width="8"/>
      <polygon points="215,580 305,580 280,500 240,500" fill="${theme.warmAccent}"/>
      <ellipse cx="260" cy="500" rx="20" ry="6" fill="#fef08a"/>

      <!-- Right Nightstand -->
      <rect x="1260" y="680" width="160" height="220" rx="10" fill="${theme.furnitureDark}"/>
      <rect x="1275" y="750" width="130" height="10" fill="${theme.white}" opacity="0.3"/>
      <!-- Right Lamp -->
      <line x1="1340" y1="680" x2="1340" y2="580" stroke="${theme.neutralDark}" stroke-width="8"/>
      <polygon points="1295,580 1385,580 1360,500 1320,500" fill="${theme.warmAccent}"/>
      <ellipse cx="1340" cy="500" rx="20" ry="6" fill="#fef08a"/>

      <!-- Round Rug under bed -->
      <ellipse cx="800" cy="1110" rx="550" ry="85" fill="${theme.neutralDark}" opacity="0.08"/>
    </svg>
    `;
  } else if (type === 3) {
    // 3. Kitchenette & Balcony
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <!-- Walls -->
      <rect width="${w}" height="${h}" fill="${theme.wall}"/>
      <polygon points="0,880 ${w},880 ${w},${h} 0,${h}" fill="${theme.floor}"/>
      <line x1="0" y1="880" x2="${w}" y2="880" stroke="${theme.neutralDark}" stroke-width="2" opacity="0.2"/>

      <!-- Balcony Sliding Door on Right -->
      <rect x="1050" y="120" width="450" height="760" rx="8" fill="#e0f2fe" stroke="${theme.white}" stroke-width="16"/>
      <line x1="1275" y1="120" x2="1275" y2="880" stroke="${theme.white}" stroke-width="12"/>
      <!-- Balcony Railing outside -->
      <line x1="1050" y1="640" x2="1500" y2="640" stroke="${theme.neutralDark}" stroke-width="6" opacity="0.4"/>
      <line x1="1120" y1="640" x2="1120" y2="880" stroke="${theme.neutralDark}" stroke-width="4" opacity="0.3"/>
      <line x1="1200" y1="640" x2="1200" y2="880" stroke="${theme.neutralDark}" stroke-width="4" opacity="0.3"/>
      <line x1="1350" y1="640" x2="1350" y2="880" stroke="${theme.neutralDark}" stroke-width="4" opacity="0.3"/>
      <line x1="1430" y1="640" x2="1430" y2="880" stroke="${theme.neutralDark}" stroke-width="4" opacity="0.3"/>
      <!-- Sunbeam from balcony -->
      <polygon points="1050,120 1500,120 1600,${h} 850,${h}" fill="#ffffff" opacity="0.18"/>

      <!-- Kitchen Upper Cabinets -->
      <rect x="120" y="160" width="760" height="240" rx="8" fill="${theme.furnitureDark}"/>
      <line x1="373" y1="160" x2="373" y2="400" stroke="${theme.wall}" stroke-width="4"/>
      <line x1="626" y1="160" x2="626" y2="400" stroke="${theme.wall}" stroke-width="4"/>

      <!-- Backsplash Tile Grid -->
      <rect x="120" y="400" width="760" height="200" fill="${theme.accentWall}"/>
      <line x1="120" y1="466" x2="880" y2="466" stroke="${theme.white}" stroke-width="3"/>
      <line x1="120" y1="533" x2="880" y2="533" stroke="${theme.white}" stroke-width="3"/>

      <!-- Lower Cabinets Countertop -->
      <rect x="100" y="590" width="800" height="30" rx="4" fill="${theme.white}" stroke="${theme.neutralDark}" stroke-width="3"/>
      <rect x="110" y="620" width="780" height="280" rx="6" fill="${theme.furniture}"/>
      <line x1="370" y1="620" x2="370" y2="900" stroke="${theme.furnitureDark}" stroke-width="4"/>
      <line x1="630" y1="620" x2="630" y2="900" stroke="${theme.furnitureDark}" stroke-width="4"/>

      <!-- Induction Cooktop -->
      <rect x="200" y="580" width="180" height="15" rx="2" fill="${theme.neutralDark}"/>
      <circle cx="250" cy="587" r="14" fill="#ef4444" opacity="0.7"/>
      <circle cx="330" cy="587" r="14" fill="#ef4444" opacity="0.7"/>

      <!-- Kitchen Sink & Chrome Faucet -->
      <rect x="470" y="585" width="160" height="8" rx="2" fill="#cbd5e1"/>
      <path d="M 550 585 L 550 510 Q 550 480 575 480 L 585 480 Q 595 480 595 495 L 595 510" fill="none" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>

      <!-- Modern Bar Stool / Dining Chair -->
      <ellipse cx="940" cy="980" rx="40" ry="12" fill="${theme.neutralDark}" opacity="0.15"/>
      <line x1="940" y1="910" x2="940" y2="990" stroke="${theme.neutralDark}" stroke-width="8"/>
      <ellipse cx="940" cy="905" rx="55" ry="16" fill="${theme.warmAccent}"/>
    </svg>
    `;
  } else {
    // 4. Bathroom / WC
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <!-- Wall Tiled Surface -->
      <rect width="${w}" height="${h}" fill="${theme.wall}"/>
      <!-- Tiled Wall Pattern -->
      <pattern id="tile" width="80" height="60" patternUnits="userSpaceOnUse">
        <rect width="80" height="60" fill="none" stroke="${theme.neutralDark}" stroke-width="0.8" opacity="0.12"/>
      </pattern>
      <rect width="${w}" height="900" fill="url(#tile)"/>

      <!-- Floor -->
      <polygon points="0,900 ${w},900 ${w},${h} 0,${h}" fill="${theme.floor}"/>
      <line x1="0" y1="900" x2="${w}" y2="900" stroke="${theme.neutralDark}" stroke-width="3" opacity="0.3"/>

      <!-- Glass Shower Partition -->
      <rect x="880" y="140" width="560" height="760" rx="4" fill="#e0f2fe" opacity="0.45" stroke="#94a3b8" stroke-width="6"/>
      <!-- Shower Head & Controls -->
      <line x1="1200" y1="140" x2="1200" y2="240" stroke="#94a3b8" stroke-width="8"/>
      <ellipse cx="1200" cy="245" rx="40" ry="12" fill="#64748b"/>
      <!-- Water droplet accents -->
      <line x1="1170" y1="260" x2="1165" y2="340" stroke="#38bdf8" stroke-width="2" opacity="0.4" stroke-dasharray="8 6"/>
      <line x1="1200" y1="260" x2="1200" y2="360" stroke="#38bdf8" stroke-width="2" opacity="0.4" stroke-dasharray="8 6"/>
      <line x1="1230" y1="260" x2="1235" y2="340" stroke="#38bdf8" stroke-width="2" opacity="0.4" stroke-dasharray="8 6"/>

      <!-- Round Mirror with Backlight -->
      <circle cx="480" cy="380" r="160" fill="#f8fafc" stroke="${theme.warmAccent}" stroke-width="12"/>
      <circle cx="480" cy="380" r="150" fill="#f1f5f9"/>
      <ellipse cx="440" cy="340" rx="90" ry="60" fill="#ffffff" opacity="0.35"/>

      <!-- Modern Floating Vanity Counter -->
      <rect x="220" y="600" width="520" height="150" rx="14" fill="${theme.furniture}"/>
      <rect x="235" y="660" width="490" height="8" rx="4" fill="${theme.furnitureDark}"/>

      <!-- Ceramic Washbasin Sink -->
      <rect x="360" y="560" width="240" height="55" rx="16" fill="${theme.white}" stroke="#cbd5e1" stroke-width="4"/>
      <!-- Faucet -->
      <path d="M 480 560 L 480 490 Q 480 470 495 470 L 505 470 Q 515 470 515 480 L 515 495" fill="none" stroke="#64748b" stroke-width="7" stroke-linecap="round"/>

      <!-- Towel Rack & Warm Towels -->
      <line x1="80" y1="360" x2="80" y2="700" stroke="#94a3b8" stroke-width="6"/>
      <rect x="45" y="440" width="70" height="140" rx="8" fill="${theme.warmAccent}"/>
      <rect x="55" y="450" width="60" height="120" rx="6" fill="${theme.wall}"/>
    </svg>
    `;
  }
}

// 2. City Skylines / Icons (Hanoi, HCMC, Danang, Haiphong, Cantho)
function getCitySvg(code) {
  const w = 800;
  const h = 600;
  if (code === 'HN') {
    // Hanoi: Khuê Văn Các & Turtle Tower on Hoan Kiem Lake
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="hnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f766e"/>
          <stop offset="60%" stop-color="#14b8a6"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#hnSky)"/>
      <circle cx="680" cy="130" r="45" fill="#fef08a" opacity="0.85"/>
      <!-- Calm Lake Water -->
      <rect x="0" y="420" width="${w}" height="180" fill="#042f2e"/>
      <line x1="0" y1="420" x2="${w}" y2="420" stroke="#fef3c7" stroke-width="2" opacity="0.6"/>

      <!-- Khuê Văn Các Architecture Silhouette -->
      <!-- Pillars -->
      <rect x="320" y="240" width="16" height="180" fill="#134e4a"/>
      <rect x="464" y="240" width="16" height="180" fill="#134e4a"/>
      <!-- Lower platform -->
      <rect x="290" y="320" width="220" height="18" fill="#d97706"/>
      <!-- Circular Sun Window -->
      <circle cx="400" cy="220" r="45" fill="#fef3c7" stroke="#b45309" stroke-width="10"/>
      <!-- Radiant spokes -->
      <line x1="360" y1="220" x2="440" y2="220" stroke="#b45309" stroke-width="5"/>
      <line x1="400" y1="180" x2="400" y2="260" stroke="#b45309" stroke-width="5"/>
      <!-- Traditional 2-Tier Curved Roof -->
      <path d="M 270 170 Q 400 135 530 170 L 515 150 Q 400 115 285 150 Z" fill="#b45309"/>
      <path d="M 230 240 Q 400 205 570 240 L 555 220 Q 400 185 245 220 Z" fill="#92400e"/>

      <!-- Turtle Tower Silhouette in distant left -->
      <rect x="120" y="340" width="70" height="80" rx="3" fill="#115e59"/>
      <path d="M 110 340 L 155 310 L 200 340 Z" fill="#b45309"/>

      <!-- Water Reflections -->
      <ellipse cx="400" cy="480" rx="140" ry="8" fill="#fef3c7" opacity="0.3"/>
      <ellipse cx="400" cy="510" rx="90" ry="5" fill="#fef08a" opacity="0.2"/>
    </svg>
    `;
  } else if (code === 'HCM') {
    // HCMC: Landmark 81 & Bitexco Lotus Tower along Saigon River
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="hcmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="65%" stop-color="#0f766e"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#hcmSky)"/>
      <!-- River -->
      <rect x="0" y="450" width="${w}" height="150" fill="#0f172a"/>

      <!-- Landmark 81 Silhouette (Stepped Spire) -->
      <polygon points="460,80 470,80 470,220 490,220 490,320 515,320 515,450 415,450 415,320 440,320 440,220 460,220" fill="#0f766e"/>
      <line x1="465" y1="40" x2="465" y2="80" stroke="#fef08a" stroke-width="4"/>

      <!-- Bitexco Helicopter Pad Tower -->
      <path d="M 260 450 L 285 210 Q 300 170 315 210 L 340 450 Z" fill="#134e4a"/>
      <!-- Helipad Cantilever -->
      <ellipse cx="330" cy="280" rx="35" ry="10" fill="#d97706"/>

      <!-- Surrounding Modern High-rises -->
      <rect x="140" y="310" width="75" height="140" rx="2" fill="#0f766e" opacity="0.7"/>
      <rect x="560" y="270" width="65" height="180" rx="2" fill="#0f766e" opacity="0.8"/>
      <rect x="660" y="330" width="80" height="120" rx="2" fill="#115e59" opacity="0.6"/>

      <!-- River reflections -->
      <ellipse cx="465" cy="500" rx="40" ry="6" fill="#f59e0b" opacity="0.4"/>
      <ellipse cx="320" cy="520" rx="50" ry="6" fill="#14b8a6" opacity="0.3"/>
    </svg>
    `;
  } else if (code === 'DNG') {
    // Da Nang: Dragon Bridge (Cầu Rồng) across Han River
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="dngSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#042f2e"/>
          <stop offset="60%" stop-color="#0d9488"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#dngSky)"/>
      <rect x="0" y="440" width="${w}" height="160" fill="#042f2e"/>

      <!-- Dragon Arch 1, 2, 3 -->
      <path d="M 60 440 Q 180 260 300 440" fill="none" stroke="#f59e0b" stroke-width="26" stroke-linecap="round"/>
      <path d="M 300 440 Q 420 220 540 440" fill="none" stroke="#d97706" stroke-width="26" stroke-linecap="round"/>
      <!-- Dragon Head Arch -->
      <path d="M 540 440 Q 640 280 720 340" fill="none" stroke="#f59e0b" stroke-width="26" stroke-linecap="round"/>
      <!-- Dragon Head Symbol -->
      <polygon points="710,310 770,335 730,375" fill="#f59e0b"/>
      <!-- Fire Breath Glow -->
      <circle cx="770" cy="335" r="14" fill="#ef4444"/>

      <!-- Bridge deck -->
      <rect x="40" y="430" width="720" height="16" rx="4" fill="#ffffff" opacity="0.9"/>
      <!-- Vertical stay cables -->
      <line x1="180" y1="350" x2="180" y2="430" stroke="#fef3c7" stroke-width="3" opacity="0.7"/>
      <line x1="420" y1="330" x2="420" y2="430" stroke="#fef3c7" stroke-width="3" opacity="0.7"/>
    </svg>
    `;
  } else if (code === 'HP') {
    // Hai Phong: Port Cranes & Maritime Gateway
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="hpSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="50%" stop-color="#0f766e"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#hpSky)"/>
      <rect x="0" y="440" width="${w}" height="160" fill="#042f2e"/>

      <!-- Port Gantry Cranes -->
      <!-- Crane 1 -->
      <line x1="180" y1="440" x2="240" y2="240" stroke="#d97706" stroke-width="10"/>
      <line x1="300" y1="440" x2="240" y2="240" stroke="#d97706" stroke-width="10"/>
      <line x1="150" y1="240" x2="380" y2="240" stroke="#d97706" stroke-width="12"/>
      <polygon points="210,240 240,160 270,240" fill="#b45309"/>

      <!-- Crane 2 -->
      <line x1="480" y1="440" x2="540" y2="260" stroke="#0d9488" stroke-width="10"/>
      <line x1="600" y1="440" x2="540" y2="260" stroke="#0d9488" stroke-width="10"/>
      <line x1="450" y1="260" x2="680" y2="260" stroke="#0d9488" stroke-width="12"/>
      <polygon points="510,260 540,190 570,260" fill="#115e59"/>

      <!-- Cargo Ship Silhouette -->
      <polygon points="200,440 240,390 620,390 660,440" fill="#1e293b"/>
    </svg>
    `;
  } else {
    // Can Tho & Default: Mekong River Cable Bridge & Floating Market Boat
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="ctSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d9488"/>
          <stop offset="60%" stop-color="#14b8a6"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#ctSky)"/>
      <rect x="0" y="440" width="${w}" height="160" fill="#042f2e"/>

      <!-- Can Tho Cable-stayed Pylon -->
      <polygon points="390,140 410,140 430,440 370,440" fill="#115e59"/>
      <!-- Fan Cables -->
      <line x1="400" y1="180" x2="160" y2="440" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
      <line x1="400" y1="220" x2="220" y2="440" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
      <line x1="400" y1="260" x2="290" y2="440" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
      <line x1="400" y1="180" x2="640" y2="440" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
      <line x1="400" y1="220" x2="580" y2="440" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
      <line x1="400" y1="260" x2="510" y2="440" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>

      <!-- Floating Market Boat in Foreground -->
      <polygon points="120,530 140,560 300,560 330,530" fill="#d97706"/>
      <!-- Bamboo pole with fruits banner -->
      <line x1="280" y1="530" x2="280" y2="460" stroke="#78350f" stroke-width="4"/>
      <circle cx="280" cy="465" r="8" fill="#f59e0b"/>
    </svg>
    `;
  }
}

// 3. Branded Banners (3 banners at 1200x500)
function getBannerSvg(id) {
  const w = 1200;
  const h = 500;
  if (id === 1) {
    // Safety & Deposit Protection
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#042f2e"/>
          <stop offset="50%" stop-color="#0f766e"/>
          <stop offset="100%" stop-color="#115e59"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg1)"/>
      <circle cx="950" cy="250" r="220" fill="#14b8a6" opacity="0.12"/>
      <circle cx="1080" cy="180" r="140" fill="#f59e0b" opacity="0.10"/>

      <!-- Shield with Lock & Checkmark Vector Graphic -->
      <path d="M 940 110 Q 1060 110 1060 170 Q 1060 320 940 390 Q 820 320 820 170 Q 820 110 940 110 Z" fill="#0d9488" stroke="#f59e0b" stroke-width="10"/>
      <!-- Lock inside shield -->
      <rect x="900" y="220" width="80" height="70" rx="14" fill="#ffffff"/>
      <path d="M 920 220 L 920 180 Q 940 150 960 180 L 960 220" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
      <circle cx="940" cy="250" r="8" fill="#0d9488"/>
    </svg>
    `;
  } else if (id === 2) {
    // Digital Contracts
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="60%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg2)"/>
      <circle cx="960" cy="250" r="210" fill="#fef3c7" opacity="0.12"/>

      <!-- Digital Tablet with Contract Document -->
      <rect x="800" y="90" width="300" height="320" rx="20" fill="#1c1917" stroke="#fef3c7" stroke-width="6"/>
      <rect x="825" y="115" width="250" height="270" rx="10" fill="#fffbeb"/>
      <!-- Text lines placeholder -->
      <line x1="850" y1="160" x2="980" y2="160" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
      <line x1="850" y1="200" x2="1050" y2="200" stroke="#a8a29e" stroke-width="5" stroke-linecap="round"/>
      <line x1="850" y1="230" x2="1030" y2="230" stroke="#a8a29e" stroke-width="5" stroke-linecap="round"/>
      <line x1="850" y1="260" x2="990" y2="260" stroke="#a8a29e" stroke-width="5" stroke-linecap="round"/>
      <!-- Digital Stamp Seal -->
      <circle cx="1010" cy="325" r="32" fill="none" stroke="#0d9488" stroke-width="6"/>
      <polygon points="1000,325 1010,335 1025,315" fill="none" stroke="#0d9488" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `;
  } else {
    // Utility Fees & Meter
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#134e4a"/>
          <stop offset="60%" stop-color="#0f766e"/>
          <stop offset="100%" stop-color="#1c1917"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg3)"/>
      <circle cx="950" cy="250" r="210" fill="#f59e0b" opacity="0.12"/>

      <!-- Digital Electricity Meter -->
      <rect x="800" y="110" width="300" height="280" rx="24" fill="#ffffff" stroke="#0d9488" stroke-width="8"/>
      <!-- Digital Display LCD -->
      <rect x="835" y="150" width="230" height="90" rx="10" fill="#042f2e"/>
      <text x="860" y="210" font-family="monospace" font-size="44" font-weight="bold" fill="#34d399">01482.5</text>
      <!-- Lightning bolt icon -->
      <polygon points="870,280 855,320 880,320 865,360 905,305 885,305" fill="#f59e0b"/>
      <!-- Water droplet icon -->
      <path d="M 1000 280 C 970 330 970 355 1000 355 C 1030 355 1030 330 1000 280 Z" fill="#38bdf8"/>
    </svg>
    `;
  }
}

// 4. Initial Avatars
function getAvatarSvg(initials, bg) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
    <circle cx="128" cy="128" r="128" fill="${bg}"/>
    <text x="128" y="158" font-family="sans-serif" font-size="96" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>
  </svg>
  `;
}

async function main() {
  console.log('1. Generating Room Illustration Assets (1600x1200 WebP)...');
  // For each room ID from 1 to 28, and 101 to 128
  const roomIds = [
    1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128
  ];

  let roomImgCount = 0;
  for (const rid of roomIds) {
    const themeIdx = rid % ROOM_THEMES.length;
    const theme = ROOM_THEMES[themeIdx];

    // Generate 3 to 4 perspectives for each room
    for (let p = 1; p <= 4; p++) {
      const svg = getPerspectiveSvg(p, theme);
      const outPath = path.join(ROOMS_DIR, `r${rid}_${p}.webp`);
      await sharp(Buffer.from(svg))
        .webp({ quality: 85 })
        .toFile(outPath);
      roomImgCount++;
    }
  }
  console.log(`Generated ${roomImgCount} room images at 1600x1200 WebP.`);

  // Also create legacy fallback room-1.jpg .. room-5.jpg
  console.log('Generating legacy room-1.jpg..room-5.jpg fallbacks...');
  for (let i = 1; i <= 5; i++) {
    const theme = ROOM_THEMES[(i - 1) % ROOM_THEMES.length];
    const svg = getPerspectiveSvg(((i - 1) % 4) + 1, theme);
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 85 })
      .toFile(path.join(LEGACY_ROOMS_DIR, `room-${i}.jpg`));
  }

  console.log('2. Generating City Skyline Illustrations (800x600 WebP)...');
  const cities = [
    { code: 'HN', name: 'ha-noi.webp' },
    { code: 'HCM', name: 'ho-chi-minh.webp' },
    { code: 'DNG', name: 'da-nang.webp' },
    { code: 'HP', name: 'hai-phong.webp' },
    { code: 'CT', name: 'can-tho.webp' },
    { code: 'FALLBACK', name: 'fallback.webp' }
  ];
  for (const c of cities) {
    const svg = getCitySvg(c.code);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(path.join(LOCATIONS_DIR, c.name));
  }
  console.log('City illustrations generated successfully.');

  console.log('3. Generating 3 Marketing Banners (1200x500 WebP)...');
  for (let b = 1; b <= 3; b++) {
    const svg = getBannerSvg(b);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(path.join(BANNERS_DIR, `banner_${b}.webp`));
  }
  console.log('Banners generated successfully.');

  console.log('4. Generating Initials Avatars (256x256 WebP)...');
  const avatars = [
    { name: 'tenant1.jpg', initials: 'NT', bg: '#0d9488' },
    { name: 'landlord1.jpg', initials: 'TC', bg: '#d97706' },
    { name: 'admin1.jpg', initials: 'AD', bg: '#042f2e' },
    { name: 'mod1.jpg', initials: 'MD', bg: '#4338ca' },
    { name: 'admin2.jpg', initials: 'TD', bg: '#0f766e' },
    { name: 'mod2.jpg', initials: 'DT', bg: '#334155' },
    { name: 'landlord2.jpg', initials: 'TM', bg: '#b45309' },
    { name: 'landlord3.jpg', initials: 'HT', bg: '#059669' },
    { name: 'landlord4.jpg', initials: 'PT', bg: '#78350f' },
    { name: 'landlord5.jpg', initials: 'NT', bg: '#0f766e' },
    { name: 'landlord6.jpg', initials: 'VD', bg: '#d97706' },
    { name: 'tenant2.jpg', initials: 'LM', bg: '#059669' },
    { name: 'tenant3.jpg', initials: 'VT', bg: '#b45309' },
    { name: 'tenant4.jpg', initials: 'DQ', bg: '#0f766e' },
    { name: 'tenant5.jpg', initials: 'BT', bg: '#78350f' },
    { name: 'tenant6.jpg', initials: 'DM', bg: '#334155' },
    { name: 'tenant7.jpg', initials: 'HL', bg: '#0284c7' },
    { name: 'tenant8.jpg', initials: 'NQ', bg: '#475569' }
  ];
  for (const a of avatars) {
    const svg = getAvatarSvg(a.initials, a.bg);
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 85 })
      .toFile(path.join(AVATARS_DIR, a.name));
  }
  console.log('Avatars generated successfully.');
}

main().catch(console.error);

