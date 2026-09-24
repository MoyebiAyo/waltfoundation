// Walts Foundation — site interactions (no dependencies)
(function () {
  'use strict';

  // ---------- Mobile nav toggle ----------
  function initNav() {
    var btn = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('overflow-hidden', open);
    });
    // close on link click (mobile)
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 1024) {
          panel.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('overflow-hidden');
        }
      });
    });
  }

  // ---------- Scroll reveal ----------
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var d = el.getAttribute('data-delay');
          if (d) el.style.transitionDelay = d + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  // ---------- Hero slideshow ----------
  function initHeroSlideshow() {
    var slides = document.querySelectorAll('[data-hero-slideshow] .hero-slide');
    if (slides.length < 2) return;
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove('is-active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('is-active');
    }, 5000);
  }

  // ---------- Impact log (gallery.html#impact) ----------
  function initImpact() {
    var root = document.getElementById('impact-log');
    if (!root || !window.IMPACT_OUTREACHES || !window.IMPACT_OUTREACHES.length) return;
    var html = '';
    window.IMPACT_OUTREACHES.forEach(function (o, i) {
      var imgs = (o.images || []).map(function (im) {
        return '<img data-lightbox data-full="' + im.full + '" data-caption="' + im.caption + '"' +
          ' src="' + im.thumb + '" alt="' + im.alt + '" loading="lazy"' +
          ' class="aspect-[4/3] w-full object-cover rounded-2xl ring-1 ring-ink-900/5 cursor-zoom-in hover:opacity-95 transition-opacity reveal">';
      }).join('');
      html +=
        '<article class="reveal card p-7 sm:p-9" data-delay="' + (i * 80) + '">' +
        '<p class="eyebrow">' + o.date + ' · ' + o.location + '</p>' +
        '<h3 class="mt-3 font-display text-2xl font-600">' + o.title + '</h3>' +
        '<p class="mt-3 text-ink-900/75 leading-relaxed text-pretty max-w-3xl">' + o.delivered + '</p>' +
        (imgs ? '<div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">' + imgs + '</div>' : '') +
        '</article>';
    });
    root.innerHTML = html;
  }

  // ---------- Lightbox ----------
  function initLightbox() {
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;

    var overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center bg-ink-900/90 backdrop-blur-sm';
    overlay.innerHTML =
      '<button type="button" data-lb-close class="absolute top-4 right-4 text-cream-50/90 hover:text-white p-3" aria-label="Close (Esc)">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button type="button" data-lb-prev class="absolute left-3 sm:left-6 text-cream-50/90 hover:text-white p-3" aria-label="Previous">' +
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button type="button" data-lb-next class="absolute right-3 sm:right-6 text-cream-50/90 hover:text-white p-3" aria-label="Next">' +
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<figure class="max-w-[92vw] max-h-[88vh] flex flex-col items-center" data-lb-figure>' +
      '<img alt="" data-lb-img class="max-h-[82vh] max-w-[92vw] rounded-xl shadow-card object-contain">' +
      '<figcaption data-lb-cap class="mt-3 text-cream-50/80 text-sm font-medium"></figcaption>' +
      '</figure>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector('[data-lb-img]');
    var cap = overlay.querySelector('[data-lb-cap]');
    var items = Array.prototype.slice.call(triggers).map(function (t) {
      return { full: t.getAttribute('data-full') || t.getAttribute('data-src') || t.src, cap: t.getAttribute('data-caption') || '' };
    });
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      img.src = items[idx].full;
      img.alt = items[idx].cap || 'Walts Foundation outreach photo';
      cap.textContent = items[idx].cap || '';
    }
    function open(i) {
      show(i);
      overlay.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      overlay.querySelector('[data-lb-close]').focus();
    }
    function close() {
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }

    triggers.forEach(function (t, i) {
      t.setAttribute('tabindex', '0');
      var openHandler = function () { open(i); };
      t.addEventListener('click', openHandler);
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.hasAttribute('data-lb-close')) close();
      if (e.target.closest('[data-lb-prev]')) show(idx - 1);
      if (e.target.closest('[data-lb-next]')) show(idx + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (overlay.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  // ---------- Donate UI ----------
  function initDonate() {
    var root = document.querySelector('[data-donate]');
    if (!root) return;
    var amountBtns = root.querySelectorAll('[data-amount]');
    var custom = root.querySelector('[data-custom]');
    var display = root.querySelector('[data-amount-display]');
    var recur = root.querySelectorAll('[data-recur]');
    var recurLabel = root.querySelector('[data-recur-label]');
    var freq = 'one-time';

    function fmt(v) { return '\u20A6' + Number(v || 0).toLocaleString('en-NG'); }
    function setAmount(v) {
      amountBtns.forEach(function (b) {
        var on = String(b.getAttribute('data-amount')) === String(v);
        b.classList.toggle('bg-forest-700', on);
        b.classList.toggle('text-cream-50', on);
        b.classList.toggle('border-forest-700', on);
        b.classList.toggle('bg-white', !on);
        b.classList.toggle('text-ink-900', !on);
      });
      if (custom) custom.value = v;
      if (display) display.textContent = fmt(v);
    }
    amountBtns.forEach(function (b) {
      b.addEventListener('click', function () { setAmount(b.getAttribute('data-amount')); });
    });
    if (custom) custom.addEventListener('input', function () { setAmount(custom.value.replace(/[^0-9]/g, '')); });

    recur.forEach(function (b) {
      b.addEventListener('click', function () {
        freq = b.getAttribute('data-recur');
        recur.forEach(function (x) {
          var on = x === b;
          x.classList.toggle('bg-amber-400', on);
          x.classList.toggle('text-ink-900', on);
          x.classList.toggle('bg-white', !on);
          x.classList.toggle('text-ink-800', !on);
        });
        if (recurLabel) recurLabel.textContent = (freq === 'monthly') ? 'per month' : 'one-time';
      });
    });

    setAmount(250000);
  }

  // ---------- Footer year + active nav ----------
  function initMisc() {
    document.querySelectorAll('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav] a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
        a.classList.add('text-forest-700');
      }
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    initImpact(); initHeroSlideshow(); initNav(); initReveal(); initLightbox(); initDonate(); initMisc();
  });
})();