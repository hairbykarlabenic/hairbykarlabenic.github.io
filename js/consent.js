/* ==========================================================
   Hair by Karla Benić – privola za kolačiće (GDPR)
   ----------------------------------------------------------
   Kad budete imali ID-eve, upišite ih ovdje:
   - GA_ID:          Google Analytics 4, npr. "G-XXXXXXXXXX"
   - META_PIXEL_ID:  Meta (Facebook/Instagram) piksel, npr. "123456789012345"
   Ništa se od toga ne učitava dok posjetitelj ne da privolu.
   ========================================================== */
(function () {
  const GA_ID = '';
  const META_PIXEL_ID = '';

  const KEY = 'kb_consent';
  const VERSION = 1;
  const MAX_AGE_DAYS = 180;              // nakon 6 mjeseci ponovno pitamo

  /* ---------- Google Consent Mode v2: sve odbijeno dok se ne odluči ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });

  const read = () => {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!c || c.v !== VERSION) return null;
      if (Date.now() - c.t > MAX_AGE_DAYS * 864e5) return null;
      return c;
    } catch (e) { return null; }
  };
  const write = (analytics, marketing) => {
    const c = { v: VERSION, t: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  };

  /* ---------- učitavanje alata nakon privole ---------- */
  let gaLoaded = false, pixelLoaded = false;
  const loadScript = src => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };

  function apply(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    if (GA_ID && (c.analytics || c.marketing) && !gaLoaded) {
      gaLoaded = true;
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
      gtag('js', new Date());
      gtag('config', GA_ID, { anonymize_ip: true });
    }
    if (META_PIXEL_ID && c.marketing && !pixelLoaded) {
      pixelLoaded = true;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID); fbq('track', 'PageView');
    }
    if (c.marketing) loadMaps();
    document.dispatchEvent(new CustomEvent('kb:consent', { detail: c }));
  }

  /* ---------- Google karta: učitava se uz privolu ili na klik ---------- */
  function loadMaps() {
    document.querySelectorAll('iframe[data-consent-src]').forEach(f => {
      f.src = f.getAttribute('data-consent-src');
      f.removeAttribute('data-consent-src');
      const ph = f.parentElement.querySelector('.map__consent');
      if (ph) ph.remove();
    });
  }

  /* ---------- sučelje: traka + postavke ---------- */
  const html = `
<div class="cc" role="dialog" aria-live="polite" aria-label="Kolačići" hidden>
  <p class="cc__title">Kolačići</p>
  <p class="cc__text">Koristimo nužne kolačiće kako bi web ispravno radio. Uz vašu privolu koristimo i kolačiće za analitiku posjeta te za prikaz relevantnih oglasa. Više u <a href="politika-kolacica.html">Politici kolačića</a>.</p>
  <div class="cc__actions">
    <button type="button" class="cc__btn cc__btn--solid" data-cc="all">Prihvati sve</button>
    <button type="button" class="cc__btn" data-cc="none">Odbij</button>
    <button type="button" class="cc__link" data-cc="settings">Postavke</button>
  </div>
</div>
<div class="cc-modal" role="dialog" aria-modal="true" aria-label="Postavke kolačića" hidden>
  <div class="cc-modal__box">
    <button type="button" class="cc-modal__close" data-cc="close" aria-label="Zatvori">×</button>
    <p class="cc__title">Postavke kolačića</p>
    <p class="cc__text">Odaberite koje kolačiće dopuštate. Svoj izbor možete promijeniti bilo kada putem poveznice „Postavke kolačića” u podnožju stranice.</p>
    <div class="cc-opt">
      <div><strong>Nužni</strong><span>Potrebni za rad weba i pamćenje vašeg izbora. Uvijek uključeni.</span></div>
      <label class="cc-switch"><input type="checkbox" checked disabled><i></i></label>
    </div>
    <div class="cc-opt">
      <div><strong>Analitički</strong><span>Pomažu nam razumjeti koliko posjetitelja dolazi i koje stranice čitaju (Google Analytics).</span></div>
      <label class="cc-switch"><input type="checkbox" data-cc-cat="analytics"><i></i></label>
    </div>
    <div class="cc-opt">
      <div><strong>Marketinški</strong><span>Služe za prikaz relevantnih oglasa na Instagramu, Facebooku i Googleu te za prikaz Google karte.</span></div>
      <label class="cc-switch"><input type="checkbox" data-cc-cat="marketing"><i></i></label>
    </div>
    <div class="cc__actions">
      <button type="button" class="cc__btn cc__btn--solid" data-cc="save">Spremi odabir</button>
      <button type="button" class="cc__btn" data-cc="all">Prihvati sve</button>
    </div>
  </div>
</div>`;

  function init() {
    document.body.insertAdjacentHTML('beforeend', html);
    const bar = document.querySelector('.cc');
    const modal = document.querySelector('.cc-modal');
    const cb = cat => modal.querySelector(`[data-cc-cat="${cat}"]`);

    const show = el => { el.hidden = false; requestAnimationFrame(() => el.classList.add('is-open')); };
    const hide = el => { el.classList.remove('is-open'); setTimeout(() => { el.hidden = true; }, 400); };

    const decide = (a, m) => { apply(write(a, m)); hide(bar); hide(modal); };
    const openSettings = () => {
      const c = read() || { analytics: false, marketing: false };
      cb('analytics').checked = c.analytics; cb('marketing').checked = c.marketing;
      show(modal);
    };
    window.openCookieSettings = openSettings;

    document.addEventListener('click', e => {
      const t = e.target.closest('[data-cc], [data-cookie-settings], [data-map-load]');
      if (!t) return;
      if (t.hasAttribute('data-cookie-settings')) { e.preventDefault(); openSettings(); return; }
      if (t.hasAttribute('data-map-load')) { e.preventDefault(); loadMaps(); return; }
      const a = t.getAttribute('data-cc');
      if (a === 'all') decide(true, true);
      else if (a === 'none') decide(false, false);
      else if (a === 'save') decide(cb('analytics').checked, cb('marketing').checked);
      else if (a === 'settings') openSettings();
      else if (a === 'close') hide(modal);
    });
    modal.addEventListener('click', e => { if (e.target === modal) hide(modal); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) hide(modal); });

    const c = read();
    if (c) apply(c); else setTimeout(() => show(bar), 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
