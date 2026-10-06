#!/usr/bin/env node
// Build script: renders content/*.json into the marked regions of the HTML pages.
// Run manually via `npm run build:content`; runs automatically on Vercel (vercel-build).
// Safe to run repeatedly — output is deterministic and markers are preserved.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const PAGES = ['index.html', 'about.html', 'team.html', 'gallery.html', 'donate.html', 'contact.html'];
const SITE = 'https://www.waltscharityef.com';

// ---------- helpers ----------
const readJson = p => JSON.parse(fs.readFileSync(path.join(CONTENT, p), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const abs = p => SITE + '/' + String(p || '').replace(/^\//, '');

function formatMonthYear(iso) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const m = /^(\d{4})-(\d{2})/.exec(String(iso || ''));
  if (!m) return String(iso || '');
  return months[Number(m[2]) - 1] + ' ' + m[1];
}

// "9:38" -> "PT9M38S"; "1:02:03" -> "PT1H2M3S"; "47" -> "PT47S"
function isoDuration(d) {
  const parts = String(d || '').split(':').map(Number);
  if (parts.some(isNaN) || !parts.length) return '';
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) { h = parts[0]; m = parts[1]; s = parts[2]; }
  else if (parts.length === 2) { m = parts[0]; s = parts[1]; }
  else { s = parts[0]; }
  let out = 'PT';
  if (h) out += h + 'H';
  if (m) out += m + 'M';
  if (s || (!h && !m)) out += s + 'S';
  return out;
}

function delayAttr(ms) { return ms ? ' data-delay="' + ms + '"' : ''; }

// ---------- media (uploaded images are optimized into assets/img/uploads/opt) ----------
let optIndex = new Map(); // original path -> { full, thumb }

function buildOptIndex() {
  const dir = path.join(ROOT, 'assets', 'img', 'uploads');
  const optDir = path.join(dir, 'opt');
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(name)) continue;
    const src = 'assets/img/uploads/' + name;
    const base = name.replace(/\.[^.]+$/, '');
    const fullOpt = 'assets/img/uploads/opt/' + base + '-1600.webp';
    const thumbOpt = 'assets/img/uploads/opt/' + base + '-640.webp';
    optIndex.set(src, {
      full: fs.existsSync(path.join(ROOT, fullOpt)) ? fullOpt : src,
      thumb: fs.existsSync(path.join(ROOT, thumbOpt)) ? thumbOpt : (fs.existsSync(path.join(ROOT, fullOpt)) ? fullOpt : src)
    });
    void optDir;
  }
}

function img(p, size) {
  if (!p) return '';
  const hit = optIndex.get(String(p).replace(/^\//, ''));
  if (hit) return size === 'thumb' ? hit.thumb : hit.full;
  return String(p).replace(/^\//, '');
}

const photoByFull = {};
function indexGalleryPhotos(gallery) {
  for (const p of gallery.photos || []) photoByFull[p.full] = p;
}

// ---------- shared markup fragments ----------
const SVG = {
  mail: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  phone: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  whatsapp: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 1 1 12 20z"/></svg>',
  facebook: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2 0-3 1.5-3 3v2H8v3h3v7h3v-7h3l.5-3H14V9z"/></svg>',
  instagram: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  play: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>'
};

function youtubeBox(id, poster, title, aspectClass) {
  return '' +
    '          <div class="relative ' + aspectClass + '" data-youtube="' + escAttr(id) + '">\n' +
    '            <img src="' + escAttr(img(poster, 'full')) + '" alt="" class="absolute inset-0 h-full w-full object-cover">\n' +
    '            <button type="button" data-youtube-play aria-label="Play video: ' + escAttr(title) + '" class="absolute inset-0 grid place-items-center bg-ink-900/30 hover:bg-ink-900/10 transition-colors">\n' +
    '              <span class="grid place-items-center h-16 w-16 rounded-full bg-cream-50 text-forest-800 shadow-card">' + SVG.play + '</span>\n' +
    '            </button>\n' +
    '          </div>';
}

function videoElement(v) {
  return '          <video src="' + escAttr(v.src) + '" poster="' + escAttr(img(v.poster, 'full')) + '" controls preload="none" playsinline class="w-full aspect-video object-cover"></video>';
}

function lightboxImg(photo, cls) {
  const thumb = photo.thumb || photo.full;
  return '      <img data-lightbox data-full="' + escAttr(img(photo.full, 'full')) + '" data-caption="' + escAttr(photo.caption) + '" src="' + escAttr(img(thumb, 'thumb')) + '" alt="' + escAttr(photo.alt) + '" loading="lazy" class="' + cls + '">';
}

// ---------- region builders ----------
const builders = {

  'compliance-bar': d => {
    const c = d.settings.compliance;
    return '    <p class="hidden sm:block tracking-wide">' + esc(c.utilityBarFull) + '</p>\n' +
      '    <p class="sm:hidden tracking-wide">' + esc(c.utilityBarShort) + '</p>';
  },

  hero: d => {
    const h = d.hero;
    const slides = h.slides.map((sl, i) =>
      '    <img src="' + escAttr(img(sl.image, 'full')) + '" alt="" class="hero-slide' + (i === 0 ? ' is-active' : '') + '">').join('\n');
    return '  <div data-hero-slideshow class="absolute inset-0" aria-hidden="true">\n' +
      slides + '\n' +
      '  </div>\n' +
      '  <div class="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/20"></div>\n' +
      '  <div class="relative container-x min-h-[80vh] sm:min-h-[88vh] flex flex-col justify-end pb-12 sm:pb-16">\n' +
      '    <div class="max-w-5xl reveal">\n' +
      '      <p class="eyebrow text-amber-300">' + esc(h.eyebrow) + '</p>\n' +
      '      <h1 class="mt-6 font-display font-600 text-cream-50 tracking-[-0.02em] leading-[0.95] text-[clamp(3rem,9vw,7.5rem)]">\n' +
      '        ' + esc(h.titleLine1) + '<br>' + esc(h.titleLine2) + '<span class="text-amber-300">.</span>\n' +
      '      </h1>\n' +
      '      <p class="mt-8 max-w-2xl text-lg sm:text-2xl text-cream-100/85 leading-relaxed">\n' +
      '        ' + esc(h.subtitle) + '\n' +
      '      </p>\n' +
      '      <div class="mt-10 flex flex-wrap gap-3">\n' +
      '        <a href="' + escAttr(h.primaryCta.href) + '" class="btn btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5">' + esc(h.primaryCta.label) + '</a>\n' +
      '        <a href="' + escAttr(h.secondaryCta.href) + '" class="btn btn-ghost text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 text-cream-50 border-cream-50/30 hover:bg-cream-50/10">' + esc(h.secondaryCta.label) + '</a>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>';
  },

  'videos-grid': d => {
    const items = d.videos.items;
    const figures = items.map((v, i) => {
      const media = v.youtubeId
        ? youtubeBox(v.youtubeId, v.poster, v.title, 'aspect-video')
        : videoElement(v);
      const badge = (!v.youtubeId && v.duration)
        ? '\n          <span class="absolute top-3 left-3 rounded-full bg-ink-900/70 text-cream-50 text-xs font-semibold px-3 py-1">' + esc(v.duration) + '</span>'
        : '';
      return '      <figure class="reveal rounded-3xl overflow-hidden bg-forest-800/60 ring-1 ring-cream-50/10"' + delayAttr(i * 100) + '>\n' +
        '        <div class="relative">\n' +
        media + badge + '\n' +
        '        </div>\n' +
        '        <figcaption class="p-6">\n' +
        '          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">' + esc(v.eyebrow) + '</p>\n' +
        '          <p class="mt-2 text-sm text-cream-100/70 leading-relaxed">' + esc(v.description) + '</p>\n' +
        '        </figcaption>\n' +
        '      </figure>';
    });
    return '    <div class="reveal mt-12 grid md:grid-cols-2 gap-6">\n' + figures.join('\n') + '\n    </div>';
  },

  'home-stats': d => {
    const stats = d.settings.stats;
    const items = stats.map(s =>
      '        <div><p class="font-display text-3xl font-600 text-forest-700">' + esc(s.value) + '</p><p class="text-sm text-ink-900/60">' + esc(s.label) + '</p></div>');
    return '      <div class="mt-8 flex flex-wrap gap-x-10 gap-y-4">\n' +
      items.join('\n        <div class="h-12 w-px bg-ink-900/10 self-end"></div>\n') + '\n' +
      '      </div>';
  },

  'home-programmes': d => {
    const items = d.programmes.items;
    const cards = items.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      return '      <!-- Card ' + (i + 1) + ' -->\n' +
        '      <article class="reveal group rounded-3xl bg-forest-800/60 ring-1 ring-cream-50/10 overflow-hidden hover:shadow-card transition-shadow"' + delayAttr(i * 80) + '>\n' +
        '        <div class="overflow-hidden h-44"><img src="' + escAttr(img(p.cardImage, 'full')) + '" alt="' + escAttr(p.cardImageAlt) + '" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"></div>\n' +
        '        <div class="p-6">\n' +
        '          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">' + num + '</p>\n' +
        '          <h3 class="mt-3 font-display text-xl font-600 text-cream-50">' + esc(p.title) + '</h3>\n' +
        '          <p class="mt-2 text-sm text-cream-100/70 leading-relaxed">' + esc(p.summary) + '</p>\n' +
        '        </div>\n' +
        '      </article>';
    });
    return '    <div class="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">\n' + cards.join('\n') + '\n    </div>';
  },

  'home-gallery': d => {
    const photos = (d.gallery.homePreview || [])
      .map(full => photoByFull[full])
      .filter(Boolean);
    const cls = 'aspect-[4/3] w-full object-cover rounded-2xl ring-1 ring-ink-900/5 cursor-zoom-in hover:opacity-95 transition-opacity reveal';
    return '    <div class="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">\n' +
      photos.map(p => lightboxImg(p, cls)).join('\n') + '\n' +
      '    </div>';
  },

  quote: d =>
    '      <blockquote class="mt-6 font-display text-2xl sm:text-3xl lg:text-4xl font-500 leading-snug text-ink-900 text-balance">\n' +
    '        ' + esc(d.settings.visionQuote) + '\n' +
    '      </blockquote>\n' +
    '      <figcaption class="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Our Vision</figcaption>',

  firstlady: d => {
    const g = d.gallery;
    const s = g.firstLadySection || {};
    const cls = 'aspect-[3/2] w-full object-cover rounded-2xl ring-1 ring-ink-900/5 cursor-zoom-in hover:opacity-95 transition-opacity reveal';
    return '    <div class="max-w-2xl reveal">\n' +
      '      <p class="eyebrow">Recognition</p>\n' +
      '      <h2 class="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-600 text-balance">' + esc(s.heading) + '</h2>\n' +
      '      <p class="mt-5 text-lg text-ink-900/70 text-pretty">' + esc(s.description) + '</p>\n' +
      '      <a href="' + escAttr(s.postLink) + '" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 text-forest-700 font-semibold link-underline">' + esc(s.postLinkLabel) + '</a>\n' +
      '    </div>\n' +
      '    <div class="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">\n' +
      (g.firstLady || []).map(p => {
        const thumb = p.thumb || p.full;
        return '      <img data-lightbox data-full="' + escAttr(img(p.full, 'full')) + '" data-caption="' + escAttr(p.caption) + '" src="' + escAttr(img(thumb, 'thumb')) + '" alt="' + escAttr(p.alt) + '" loading="lazy" class="' + cls + '">';
      }).join('\n') + '\n' +
      '    </div>';
  },

  founder: d => {
    const f = d.founder;
    const v = f.video || {};
    const media = v.youtubeId
      ? youtubeBox(v.youtubeId, v.poster, v.title, 'aspect-[9/16]')
      : '          <video src="' + escAttr(v.src) + '" poster="' + escAttr(img(v.poster, 'full')) + '" controls preload="none" playsinline class="rounded-4xl shadow-card ring-1 ring-ink-900/5 w-full aspect-[9/16] object-cover bg-ink-900"></video>';
    return '    <p class="eyebrow justify-center text-center reveal">Founder &amp; Grand Patron</p>\n' +
      '    <div class="mt-8 md:mt-10 grid gap-8 md:gap-10 md:grid-cols-2 items-start max-w-4xl mx-auto">\n' +
      '      <figure class="reveal text-center">\n' +
      '        <img src="' + escAttr(img(f.photo, 'full')) + '" alt="' + escAttr(f.photoAlt) + '" class="rounded-4xl shadow-card ring-1 ring-ink-900/5 w-full object-cover" loading="lazy">\n' +
      '        <figcaption class="mt-4 text-center text-sm text-ink-900/60 max-w-md mx-auto">\n' +
      '          ' + esc(f.photoCaption) + '\n' +
      '        </figcaption>\n' +
      '      </figure>\n' +
      '      <figure class="reveal text-center">\n' +
      media + '\n' +
      '        <figcaption class="mt-4 text-center text-sm text-ink-900/60 max-w-md mx-auto">\n' +
      '          ' + esc(v.caption) + '\n' +
      '        </figcaption>\n' +
      '      </figure>\n' +
      '    </div>';
  },

  timeline: d => {
    const items = d.timeline.items;
    return items.map((t, i) => {
      const dot = t.accent === 'forest'
        ? '<span class="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-forest-600 ring-4 ring-forest-100"></span>'
        : '<span class="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-amber-400 ring-4 ring-amber-100"></span>';
      const link = t.link && t.link.href
        ? ' <a href="' + escAttr(t.link.href) + '" class="text-forest-700 font-semibold link-underline">' + esc(t.link.label) + '</a>'
        : '';
      return '        <li class="reveal relative pl-8"' + delayAttr(i * 80) + '>\n' +
        '          ' + dot + '\n' +
        '          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">' + esc(t.dateLabel) + '</p>\n' +
        '          <h3 class="mt-2 font-display text-xl font-600">' + esc(t.title) + '</h3>\n' +
        '          <p class="mt-2 text-ink-900/70 leading-relaxed">' + esc(t.description) + link + '</p>\n' +
        '        </li>';
    }).join('\n');
  },

  'about-programmes': d => {
    const items = d.programmes.items;
    const cards = items.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      return '      <article class="reveal card p-7 sm:p-9 grid md:grid-cols-12 gap-8 items-start"' + delayAttr(i * 80) + '>\n' +
        '        <div class="md:col-span-2 font-display text-5xl font-600 text-amber-400">' + num + '</div>\n' +
        '        <div class="md:col-span-7">\n' +
        '          <h3 class="font-display text-2xl font-600">' + esc(p.title) + '</h3>\n' +
        '          <p class="mt-3 text-lg text-ink-900/75 leading-relaxed text-pretty">' + esc(p.detail) + '</p>\n' +
        '        </div>\n' +
        '        <div class="md:col-span-3"><img src="' + escAttr(img(p.thumbImage, 'thumb')) + '" alt="' + escAttr(p.thumbImageAlt) + '" class="rounded-2xl h-32 w-full object-cover ring-1 ring-ink-900/5"></div>\n' +
        '      </article>';
    });
    return '    <div class="mt-14 space-y-5">\n' + cards.join('\n') + '\n    </div>';
  },

  'team-members': d => {
    const members = d.team.members;
    const cards = members.map((m, i) => {
      const span = m.size === 'wide' ? 'lg:col-span-4' : 'lg:col-span-3';
      return '\n      <!-- ' + esc(m.role) + ' -->\n' +
        '      <article class="reveal card overflow-hidden group ' + span + '"' + delayAttr(i * 100) + '>\n' +
        '        <div class="relative overflow-hidden aspect-[4/5] bg-forest-100">\n' +
        '          <img src="' + escAttr(img(m.photo, 'full')) + '" alt="' + escAttr(m.photoAlt) + '" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]">\n' +
        '          <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900/40 to-transparent"></div>\n' +
        '        </div>\n' +
        '        <div class="p-7">\n' +
        '          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">' + esc(m.role) + '</p>\n' +
        '          <h3 class="mt-3 font-display text-2xl font-600">' + esc(m.name) + '</h3>\n' +
        '          <p class="mt-3 text-sm text-ink-900/70 leading-relaxed">' + esc(m.bio) + '</p>\n' +
        '        </div>\n' +
        '      </article>';
    });
    return cards.join('');
  },

  'team-patron': d => {
    const p = d.team.patron;
    return '      <div class="grid sm:grid-cols-2 h-full">\n' +
      '        <div class="relative overflow-hidden aspect-[4/5] sm:aspect-auto bg-forest-100">\n' +
      '          <img src="' + escAttr(img(p.photo, 'full')) + '" alt="' + escAttr(p.photoAlt) + '" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]">\n' +
      '          <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900/40 to-transparent"></div>\n' +
      '        </div>\n' +
      '        <div class="p-7 sm:p-10 flex flex-col justify-center">\n' +
      '          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">' + esc(p.role) + '</p>\n' +
      '          <h3 class="mt-3 font-display text-2xl sm:text-3xl font-600">' + esc(p.name) + '</h3>\n' +
      '          <p class="mt-3 text-sm sm:text-base text-ink-900/70 leading-relaxed">' + esc(p.bio) + '</p>\n' +
      '        </div>\n' +
      '      </div>';
  },

  'impact-log': d => {
    const outreaches = d.outreaches.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const cls = 'aspect-[4/3] w-full object-cover rounded-2xl ring-1 ring-ink-900/5 cursor-zoom-in hover:opacity-95 transition-opacity reveal';
    return outreaches.map(o => {
      const eyebrow = [formatMonthYear(o.date), o.location].filter(Boolean).join(' · ');
      const imgs = (o.images || []).map(im =>
        '          <img data-lightbox data-full="' + escAttr(img(im.full, 'full')) + '" data-caption="' + escAttr(im.caption) + '" src="' + escAttr(img(im.thumb || im.full, 'thumb')) + '" alt="' + escAttr(im.alt) + '" loading="lazy" class="' + cls + '">').join('\n');
      return '      <article class="reveal card p-7 sm:p-9">\n' +
        '        <p class="eyebrow">' + esc(eyebrow) + '</p>\n' +
        '        <h3 class="mt-3 font-display text-2xl font-600">' + esc(o.title) + '</h3>\n' +
        '        <p class="mt-3 text-ink-900/75 leading-relaxed text-pretty max-w-3xl">' + esc(o.delivered) + '</p>\n' +
        (imgs ? '        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">\n' + imgs + '\n        </div>\n' : '') +
        '      </article>';
    }).join('\n');
  },

  'gallery-masonry': d => {
    const cls = 'mb-4 w-full rounded-2xl ring-1 ring-ink-900/5 cursor-zoom-in hover:opacity-95 transition-opacity reveal';
    return '    <div class="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">\n' +
      (d.gallery.photos || []).map(p => lightboxImg(p, cls)).join('\n') + '\n' +
      '    </div>';
  },

  'donate-form': d => {
    const don = d.settings.donation;
    const tierAmount = v => Number(v && typeof v === 'object' ? v.amount : v);
    const tiers = (don.tiers || []).map(v =>
      '          <button type="button" data-amount="' + tierAmount(v) + '" class="rounded-2xl border-2 border-ink-900/10 bg-white text-ink-900 py-5 font-display text-lg sm:text-xl font-600 transition-all">\u20A6' + tierAmount(v).toLocaleString('en-NG') + '</button>').join('\n');
    return '    <div class="lg:col-span-7" data-donate data-default-amount="' + Number(don.defaultAmount) + '">\n' +
      '      <div class="card p-7 sm:p-10 reveal">\n' +
      '        <p class="eyebrow">Step 1 · Choose an amount to fund</p>\n' +
      '        <h2 class="mt-4 font-display text-3xl font-600">Fund a programme</h2>\n' +
      '\n' +
      '        <!-- recurring toggle -->\n' +
      '        <div class="mt-7 inline-flex p-1 rounded-full bg-forest-50 ring-1 ring-ink-900/5 text-sm font-semibold">\n' +
      '          <button type="button" data-recur="one-time" class="px-5 py-2 rounded-full bg-amber-400 text-ink-900 transition-colors">One-time</button>\n' +
      '          <button type="button" data-recur="monthly" class="px-5 py-2 rounded-full bg-white text-ink-800 transition-colors">Monthly</button>\n' +
      '        </div>\n' +
      '\n' +
      '        <!-- amount grid -->\n' +
      '        <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">\n' +
      tiers + '\n' +
      '        </div>\n' +
      '\n' +
      '        <label class="mt-5 block text-sm font-medium text-ink-900/70">Custom amount (\u20A6)</label>\n' +
      '        <input type="number" data-custom min="0" step="500" placeholder="Enter amount" class="mt-2 w-full rounded-2xl border-2 border-ink-900/10 bg-white px-4 py-3 text-lg font-display font-600 text-ink-900 focus:border-forest-600 outline-none transition-colors">\n' +
      '\n' +
      '        <!-- summary -->\n' +
      '        <div class="mt-7 rounded-2xl bg-forest-50 p-5 flex items-center justify-between">\n' +
      '          <div>\n' +
      '            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">This funds</p>\n' +
      '            <p class="mt-1 font-display text-3xl font-600 text-forest-800"><span data-amount-display>\u20A625,000</span> <span class="text-base font-500 text-forest-600" data-recur-label>one-time</span></p>\n' +
      '          </div>\n' +
      '          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="text-forest-600"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg>\n' +
      '        </div>\n' +
      '\n' +
      '        <p class="mt-6 text-sm text-ink-900/55">No payment gateway is connected yet. After selecting an amount, continue via bank transfer or contact us directly — details below.</p>\n' +
      '        <div class="mt-5 flex flex-wrap gap-3">\n' +
      '          <a href="#bank-details" class="btn btn-primary">Continue to bank transfer</a>\n' +
      '          <a href="#contact-donate" class="btn btn-ghost">Arrange via WhatsApp</a>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </div>';
  },

  'donate-funds': d => {
    const items = d.programmes.items.map(p =>
      '          <li class="flex gap-3"><span class="mt-0.5 h-2 w-2 rounded-full bg-amber-400 shrink-0"></span><span><strong class="font-600">' + esc(p.title) + '</strong> — ' + esc(p.donateBlurb) + '</span></li>');
    return '        <ul class="mt-5 space-y-4 text-sm">\n' + items.join('\n') + '\n        </ul>';
  },

  'bank-accounts': d => {
    const bank = d.settings.bank;
    const card = (acc, comment) =>
      '        <!-- ' + comment + ' -->\n' +
      '        <div class="rounded-3xl bg-white p-7 sm:p-8">\n' +
      '          <img src="' + escAttr(img(acc.logo, 'full')) + '" alt="' + escAttr(acc.logoAlt) + '" class="' + escAttr(acc.logoClass) + '">\n' +
      '          <p class="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">' + esc(acc.label) + '</p>\n' +
      '          <p class="mt-2 font-display text-3xl sm:text-4xl font-600 text-ink-900 tracking-wide">' + esc(acc.accountNumber) + '</p>\n' +
      '          <dl class="mt-5 space-y-2 text-sm text-ink-900/65">\n' +
      '            <div class="flex justify-between gap-4"><dt>Bank</dt><dd class="font-semibold text-ink-900">' + esc(acc.bank) + '</dd></div>\n' +
      '            <div class="flex justify-between gap-4"><dt>Account name</dt><dd class="font-semibold text-ink-900">' + esc(acc.accountName) + '</dd></div>\n' +
      '          </dl>\n' +
      '        </div>';
    return '      <div class="grid sm:grid-cols-2 gap-6">\n' +
      card(bank.domiciliary, 'Domiciliary account') + '\n' +
      card(bank.naira, 'Naira account') + '\n' +
      '      </div>\n' +
      '      <div class="mt-8 pt-8 border-t border-cream-50/10 flex flex-wrap gap-3">\n' +
      '        <a href="#contact-donate" class="btn btn-primary">Send proof of payment</a>\n' +
      '        <a href="contact.html" class="btn btn-ghost text-cream-50 border-cream-50/30 hover:bg-cream-50/10">Contact us</a>\n' +
      '      </div>';
  },

  'contact-topics': d =>
    (d.settings.contact.topics || []).map(t => '            <option>' + esc(t) + '</option>').join('\n'),

  'contact-channels': d => {
    const c = d.settings.contact;
    const s = d.settings.social;
    const card = (href, svg, title, note, value, delay, external) =>
      '      <a href="' + escAttr(href) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + ' class="reveal card p-7 flex items-center gap-5 hover:shadow-card transition-shadow"' + delayAttr(delay) + '>\n' +
      '        <span class="grid place-items-center h-14 w-14 rounded-2xl bg-forest-100 text-forest-700 shrink-0">' + svg + '</span>\n' +
      '        <span class="flex-1"><span class="block font-display text-xl font-600">' + esc(title) + '</span><span class="text-sm text-ink-900/60">' + esc(note) + '</span></span>\n' +
      '        <span class="text-amber-700 font-semibold">' + esc(value) + ' →</span>\n' +
      '      </a>';
    return card('mailto:' + c.email, SVG.mail, 'Email', 'Official channel for proposals, due diligence and partnership documents.', c.email, 0, false) + '\n' +
      card(c.phoneHref, SVG.phone, 'Phone', 'Speak with the team about programmes, support and partnerships.', c.phoneDisplay, 60, false) + '\n' +
      card(c.whatsappHref, SVG.whatsapp, 'WhatsApp', 'Direct, fastest way to reach us for donations and engagement.', c.whatsappDisplay, 120, false) + '\n' +
      card(s.facebook, SVG.facebook, 'Facebook', 'Follow our community outreach and latest updates.', 'Visit page', 180, true) + '\n' +
      card(s.instagram, SVG.instagram, 'Instagram', 'Follow @waltscharityemp.foundation for photos and updates from the field.', 'Follow us', 240, true) + '\n' +
      '      <div class="reveal card p-7" data-delay="160">\n' +
      '        <p class="eyebrow">Operating region</p>\n' +
      '        <h3 class="mt-3 font-display text-xl font-600">' + esc(c.region) + '</h3>\n' +
      '        <p class="mt-2 text-sm text-ink-900/65">' + esc(c.regionNote) + '</p>\n' +
      '      </div>';
  },

  'footer-tagline': d =>
    '      <p class="mt-5 text-sm leading-relaxed text-cream-100/65 max-w-xs">' + esc(d.settings.org.tagline) + '</p>',

  'footer-compliance': d => {
    const c = d.settings.compliance;
    return '        <li>' + esc(c.cacLabel) + ' — ' + esc(c.cacNumber) + ' · ' + esc(c.cacDate) + '</li>\n' +
      '        <li>SCUML Registration — ' + esc(c.scumlNumber) + '</li>\n' +
      '        <li>Ministry of Women Affairs, Children &amp; Social Welfare, Osun State</li>';
  },

  'footer-social': d => {
    const s = d.settings.social;
    const c = d.settings.contact;
    const a = (href, label) =>
      '        <a href="' + escAttr(href) + '" class="btn btn-ghost text-cream-50 border-cream-50/20 hover:bg-cream-50/10 px-4 py-2">' + esc(label) + '</a>';
    return a(s.facebook, 'Facebook') + '\n' + a(s.instagram, 'Instagram') + '\n' + a(c.whatsappHref, 'WhatsApp');
  },

  'footer-board': d =>
    '      <p>' + esc(d.settings.compliance.boardNote) + '</p>',

  // ---------- JSON-LD ----------
  'jsonld-index': d => {
    const c = d.settings.contact;
    const s = d.settings.social;
    const org = {
      '@type': 'NGO',
      '@id': SITE + '/#organization',
      name: d.settings.org.name,
      alternateName: 'WCEF',
      url: SITE + '/',
      logo: { '@type': 'ImageObject', url: abs('assets/img/icon-512.png'), width: 512, height: 512 },
      image: abs('assets/img/og-image.jpg'),
      description: 'A registered Nigerian non-profit restoring dignity, safety and opportunity to women, children, widows and orphans in rural communities.',
      email: c.email,
      telephone: String(c.phoneHref || '').replace(/^tel:/, ''),
      foundingDate: d.settings.org.foundingYear,
      identifier: 'CAC RC 7007514',
      address: { '@type': 'PostalAddress', addressRegion: 'Osun State', addressCountry: 'NG' },
      areaServed: { '@type': 'Country', name: 'Nigeria' },
      sameAs: [s.facebook, s.instagram],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'enquiries',
        email: c.email,
        telephone: String(c.phoneHref || '').replace(/^tel:/, ''),
        availableLanguage: 'en'
      },
      potentialAction: { '@type': 'DonateAction', name: 'Support a Programme', target: SITE + '/donate' }
    };
    const website = {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE + '/',
      name: d.settings.org.name,
      inLanguage: 'en',
      publisher: { '@id': SITE + '/#organization' }
    };
    const webpage = {
      '@type': 'WebPage',
      '@id': SITE + '/#webpage',
      url: SITE + '/',
      name: 'Walts Charity & Empowerment Foundation — Restoring Dignity in Rural Nigeria',
      isPartOf: { '@id': SITE + '/#website' },
      about: { '@id': SITE + '/#organization' },
      inLanguage: 'en'
    };
    const videos = d.videos.items.map(videoNode);
    return ldScript({ '@context': 'https://schema.org', '@graph': [org, website, webpage].concat(videos) });
  },

  'jsonld-about': d => {
    const v = d.founder.video || {};
    const video = {
      '@type': 'VideoObject',
      name: v.title,
      description: v.description,
      thumbnailUrl: abs(img(v.thumbnail || v.poster, 'full')),
      uploadDate: v.uploadDate,
      duration: isoDuration(v.duration),
      contentUrl: abs(v.src),
      publisher: { '@id': SITE + '/#organization' }
    };
    const page = {
      '@type': 'AboutPage',
      '@id': SITE + '/about#webpage',
      url: SITE + '/about',
      name: 'About — Walts Charity & Empowerment Foundation',
      description: 'History, mission, vision, programmes and governance of Walts Charity and Empowerment Foundation — a registered Nigerian non-profit serving rural communities.',
      inLanguage: 'en',
      isPartOf: { '@id': SITE + '/#website' },
      about: { '@id': SITE + '/#organization' }
    };
    const crumbs = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: SITE + '/about' }
      ]
    };
    return ldScript({ '@context': 'https://schema.org', '@graph': [page, crumbs, video] });
  },

  'jsonld-team': d => {
    const items = d.team.members.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'Person', name: m.name, jobTitle: m.role, worksFor: { '@id': SITE + '/#organization' } }
    }));
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      item: { '@type': 'Person', name: d.team.patron.name, jobTitle: d.team.patron.role }
    });
    const page = {
      '@type': 'CollectionPage',
      '@id': SITE + '/team#webpage',
      url: SITE + '/team',
      name: 'Our Team — Walts Charity & Empowerment Foundation',
      description: 'The team behind Walts Charity and Empowerment Foundation — founder, president, patron, legal, finance and administration guiding the mission.',
      inLanguage: 'en',
      isPartOf: { '@id': SITE + '/#website' },
      about: { '@id': SITE + '/#organization' },
      mainEntity: { '@type': 'ItemList', itemListElement: items }
    };
    const crumbs = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Our Team', item: SITE + '/team' }
      ]
    };
    return ldScript({ '@context': 'https://schema.org', '@graph': [page, crumbs] });
  }
};

function videoNode(v) {
  const node = {
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: abs(img(v.poster, 'full')),
    uploadDate: v.uploadDate,
    duration: isoDuration(v.duration)
  };
  if (v.youtubeId) {
    node.embedUrl = 'https://www.youtube.com/embed/' + v.youtubeId;
  } else {
    node.contentUrl = abs(v.src);
  }
  node.publisher = { '@id': SITE + '/#organization' };
  return node;
}

function ldScript(obj) {
  return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</script>';
}

// ---------- main ----------
function loadOutreaches() {
  const dir = path.join(CONTENT, 'outreaches');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function optimizeUploads() {
  const dir = path.join(ROOT, 'assets', 'img', 'uploads');
  if (!fs.existsSync(dir)) return 0;
  let sharp;
  try { sharp = require('sharp'); } catch (e) { console.warn('sharp unavailable — skipping upload optimization'); return 0; }
  const optDir = path.join(dir, 'opt');
  fs.mkdirSync(optDir, { recursive: true });
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(name)) continue;
    const srcPath = path.join(dir, name);
    const base = name.replace(/\.[^.]+$/, '');
    const targets = [
      { file: path.join(optDir, base + '-1600.webp'), width: 1600 },
      { file: path.join(optDir, base + '-640.webp'), width: 640 }
    ];
    for (const t of targets) {
      if (fs.existsSync(t.file) && fs.statSync(t.file).mtimeMs >= fs.statSync(srcPath).mtimeMs) continue;
      sharp(srcPath).rotate().resize({ width: t.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(t.file);
      count++;
    }
  }
  return count;
}

function updateSitemap() {
  const file = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  const today = new Date().toISOString().slice(0, 10);
  let xml = fs.readFileSync(file, 'utf8');
  for (const loc of ['<loc>' + SITE + '/</loc>', SITE + '/about', SITE + '/team', SITE + '/gallery', SITE + '/contact', SITE + '/donate']) {
    xml = xml.replace(new RegExp('(<loc>' + loc.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + '</loc><lastmod>)[^<]*(</lastmod>)'), '$1' + today + '$2');
  }
  fs.writeFileSync(file, xml);
}

function main() {
  const data = {
    settings: readJson('settings.json'),
    hero: readJson('hero.json'),
    programmes: readJson('programmes.json'),
    videos: readJson('videos.json'),
    team: readJson('team.json'),
    gallery: readJson('gallery.json'),
    founder: readJson('founder.json'),
    timeline: readJson('timeline.json'),
    outreaches: loadOutreaches()
  };
  indexGalleryPhotos(data.gallery);

  const optimized = optimizeUploads();
  buildOptIndex();

  let regionCount = 0;
  for (const page of PAGES) {
    const file = path.join(ROOT, page);
    let html = fs.readFileSync(file, 'utf8');
    for (const [name, fn] of Object.entries(builders)) {
      const re = new RegExp('<!--content:' + name + '-->[\\s\\S]*?<!--/content:' + name + '-->', 'g');
      html = html.replace(re, (m) => {
        regionCount++;
        return '<!--content:' + name + '-->\n' + fn(data) + '\n<!--/content:' + name + '-->';
      });
    }
    fs.writeFileSync(file, html);
  }

  updateSitemap();
  console.log('build-content: rendered ' + regionCount + ' regions across ' + PAGES.length + ' pages, optimized ' + optimized + ' upload image(s)');
}

main();
