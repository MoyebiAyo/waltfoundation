const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Sources are resolved against these roots in order.
const ROOTS = [
  'C:\\Users\\NEW USER\\Downloads\\Walt foundation',
  'C:\\Users\\NEW USER\\Downloads\\Walts Foundation'
];
const DEST = path.join(__dirname, '..', 'assets', 'img');

const presets = {
  hero: { w: 1920, q: 78 },
  wide: { w: 1400, q: 76 },
  grid: { w: 1100, q: 74 },
  team: { w: 900, q: 80 },
  cert: { w: 1000, q: 82 },
  logo: { w: 600, q: 90 }
};

function resolveSrc(rel) {
  for (const root of ROOTS) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

// Clean slug from a filename
function slug(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

const tasks = [
  { src: 'Logo.png', preset: 'logo', out: 'logo' },
  { src: 'Certificates\\CAC Certificate.png', preset: 'cert', out: 'cert-cac' },
  { src: 'Certificates\\Ministry of women affairs, Children and social welfare.png', preset: 'cert', out: 'cert-ministry' },
  { src: 'Certificates\\Special Control Unit Against Money Laundry.png', preset: 'cert', out: 'cert-scuml' },
  { src: 'Team\\Princess Bridget Tola Ogundipe Founder.png', preset: 'team', out: 'team-bridget' },
  { src: 'Team\\Architect Adewale Sunday Ogundipe - Co founder.png', preset: 'team', out: 'team-adewale' },
  { src: 'Team\\King Babatunde Adeyeye Enitan Oluwatunmise Ogunwusi - The Patron.png', preset: 'team', out: 'team-babatunde' },
  { src: 'Team\\Head of administration Ajanlekoko Tunbi.png', preset: 'team', out: 'team-tunbi' },
  { src: 'Image of Founder and Patron\\WhatsApp Image 2026-09-16 at 7.36.13 PM.jpeg', preset: 'team', out: 'founder-patron' }
];

// Full-res outreach images only (skip 160x160 thumbnails). Map to clean names.
const outreach = [
  '424879534_122153760530034251_8309989732583744797_n.jpg',
  '471590978_122198764130208734_4878036017901865113_n.jpg',
  '471646933_122198764064208734_7857740735192701974_n (1).jpg',
  '471675500_122198764040208734_5419021959936965295_n (1).jpg',
  '471686165_122198763998208734_7523311409149184141_n.jpg',
  '471817378_122198764370208734_256644287372426342_n.jpg',
  '471817553_122198764058208734_2200859675455293474_n.jpg',
  '471817826_122198763872208734_5364594382477546540_n (1).jpg',
  '471818393_122198763860208734_1526320719662671212_n.jpg',
  '471818451_122198763854208734_7309720298870599921_n.jpg',
  '471818459_122198763650208734_1602835257381452022_n (1).jpg',
  '471819672_122198764388208734_7171163948383770925_n.jpg',
  '471822033_122198763662208734_4802591839623319111_n (1).jpg',
  '471841253_122198763680208734_3266379071063099683_n (1).jpg',
  '471916433_122198763674208734_5315967437994809991_n.jpg',
  '471917810_122198764406208734_8695268858030358439_n.jpg'
];

outreach.forEach((f, i) => {
  const base = `outreach-${String(i + 1).padStart(2, '0')}`;
  tasks.push({ src: `Outreach Images\\${f}`, preset: 'wide', out: base });
  tasks.push({ src: `Outreach Images\\${f}`, preset: 'grid', out: `${base}-thumb` });
});

// New gallery drop (2026): founder-led community outreach photos.
const newGallery = [
  'WhatsApp Image 2026-07-31 at 5.46.22 PM.jpeg', // community visit with women and girls
  'WhatsApp Image 2026-07-31 at 5.46.48 PM.jpeg', // food-pack distribution
  'WhatsApp Image 2026-07-31 at 5.48.38 PM.jpeg', // schoolchildren engagement
  'WhatsApp Image 2026-07-31 at 5.50.40 PM.jpeg', // founder on site
  'WhatsApp Image 2026-07-31 at 5.50.58 PM.jpeg'  // group photo with children and volunteers
];

newGallery.forEach((f, i) => {
  const base = `outreach-${String(outreach.length + i + 1).padStart(2, '0')}`;
  tasks.push({ src: `Gallery\\${f}`, preset: 'wide', out: base });
  tasks.push({ src: `Gallery\\${f}`, preset: 'grid', out: `${base}-thumb` });
});

// Manifest covers every outreach image the site uses (01–21).
const gallery = tasks
  .filter(t => /^outreach-\d+$/.test(t.out))
  .map(t => t.out);

fs.mkdirSync(DEST, { recursive: true });

(async () => {
  for (const t of tasks) {
    const p = presets[t.preset];
    const abs = resolveSrc(t.src);
    if (!abs) { console.warn('MISSING', t.src); continue; }
    const outPath = path.join(DEST, `${t.out}.webp`);
    try {
      await sharp(abs)
        .rotate()
        .resize({ width: p.w, withoutEnlargement: true })
        .webp({ quality: p.q })
        .toFile(outPath);
      console.log('OK', t.out);
    } catch (e) { console.error('FAIL', t.out, e.message); }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'gallery.json'),
    JSON.stringify(gallery, null, 2));
  console.log('DONE, gallery images:', gallery.length);
})();
