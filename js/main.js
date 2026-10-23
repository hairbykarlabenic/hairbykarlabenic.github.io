/* Hair by Karla Benić — interakcije i animacije */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Google recenzije (preuzeto s Google Mapsa, listopad 2026.) ---------- */
  const REVIEWS = [
    { name: 'Ivana Simanović', text: 'Salon je predivno uređen, sve je jako čisto, uredno i ugodno… Karla mi je napravila frizuru još ljepšu nego što sam je sama zamislila! Definitivno sam pronašla svoju frizerku.' },
    { name: 'Katia Bobinac', text: 'Karla najbolje šiša moju kovrčavu kosu! Uz to, divna je osoba i baš je lijepo uredila svoj novi prostor.' },
    { name: 'Valentina Fuček', text: 'Iz crne kose došla sam do prekrasne sive boje, upravo one koju sam željela. Salon je prepun pozitivne energije, topline i dobrog osjećaja.' },
    { name: 'Maja Tokić Travica', text: 'Već 20 godina od Karle odlazim zadovoljna i sretna. Smirena, nasmijana i pozitivna… Jednostavno najbolja.' },
    { name: 'Jelena Vrban', text: 'Jako lijepo uređen salon i ugodna atmosfera. CocoChoco tretmanom sam se preporodila; pletenice rađene tako strpljivo i precizno. Svaka preporuka!' },
    { name: 'Tamara Kuzmić', text: 'Došla sam s kosom koja je bila u jako lošem stanju… Rezultat je nadmašio sva moja očekivanja – kosa mi izgleda predivno, zdravo i njegovanije nego ikad.' },
    { name: 'Mia Kostelac', text: 'Uvijek stručna i draga Karla u novom elegantnom prostoru! Za moju kovrčavu kosu nema druge adrese.' },
    { name: 'Sanja Brdarić', text: 'Uz željenu frizuru od Karle odlazim ispunjena mirom i toplinom.' },
    { name: 'Andreas Keilholz', text: 'Na godišnjem sam odmoru i hitno mi je trebalo šišanje. Brzo sam dobio termin, a usluga je bila profesionalna i ljubazna. Rado se vraćam!', note: 'prevedeno s njemačkog' },
    { name: 'Ema Šajatović', text: 'Preporuka za kovrčavice :)' },
  ];

  const track = $('[data-reviews]');
  if (track) {
    const card = r => `
      <article class="review">
        <div class="stars" aria-label="5 od 5 zvjezdica">★★★★★</div>
        <blockquote>${r.text}</blockquote>
        <footer><span>${r.name}</span><span>${r.note || 'Google'}</span></footer>
      </article>`;
    const html = REVIEWS.map(card).join('');
    track.innerHTML = html + html; // dupliciramo za beskonačnu petlju
    $$('.review', track).slice(REVIEWS.length).forEach(el => el.setAttribute('aria-hidden', 'true'));

    // povlačenje mišem / prstom
    const rail = track.parentElement;
    let down = false, startX = 0, offset = 0, base = 0;
    const getX = () => {
      const m = new DOMMatrix(getComputedStyle(track).transform);
      return m.m41;
    };
    rail.addEventListener('pointerdown', e => {
      down = true; startX = e.clientX; base = getX();
      track.style.animation = 'none';
      track.style.transform = `translateX(${base}px)`;
      track.classList.add('is-dragging');
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', e => {
      if (!down) return;
      offset = base + (e.clientX - startX);
      const half = track.scrollWidth / 2;
      if (offset > 0) offset -= half;
      if (offset < -half) offset += half;
      track.style.transform = `translateX(${offset}px)`;
    });
    const release = () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
      // nastavi animaciju s trenutne pozicije
      const half = track.scrollWidth / 2;
      const progress = Math.abs(getX()) / half;
      track.style.transform = '';
      track.style.animation = '';
      track.style.animationDelay = `-${progress * 70}s`;
    };
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('pointerleave', release);
  }

  /* ---------- razbijanje naslova u linije/riječi ---------- */
  $$('[data-split]').forEach(el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(p =>
      `<span class="split-line">${p.trim().split(/\s+/).map((w, i) =>
        `<span style="transition-delay:${i * 0.07}s">${w}&nbsp;</span>`).join('')}</span>`
    ).join('');
  });

  /* ---------- preloader ---------- */
  const start = () => {
    const loader = $('.loader');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    if (loader) loader.classList.add('is-done');
    $$('[data-hero]').forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), 500 + i * 180));
  };
  const seen = sessionStorage && (() => { try { return sessionStorage.getItem('kb-seen'); } catch { return null; } })();
  if (reduce || seen) {
    const l = $('.loader'); if (l) l.style.display = 'none';
    requestAnimationFrame(start);
  } else {
    window.addEventListener('load', () => setTimeout(start, 900));
    setTimeout(start, 3500); // sigurnosni timeout
    try { sessionStorage.setItem('kb-seen', '1'); } catch {}
  }

  /* ---------- reveal pri skrolanju ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal:not([data-hero]), .img-reveal, [data-split]:not([data-hero])').forEach(el => io.observe(el));

  /* ---------- brojači ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
      const dur = 1600, t0 = performance.now();
      const tick = t => {
        const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec).replace('.', ',');
        if (p < 1) requestAnimationFrame(tick);
      };
      reduce ? (el.textContent = to.toFixed(dec).replace('.', ',')) : requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- header: prozirni na vrhu, skriva se pri skrolanju dolje ---------- */
  const header = $('.header');
  let lastY = 0;
  const onScrollHeader = () => {
    const y = window.scrollY;
    const heroH = ($('.hero, .page-hero') || { offsetHeight: 0 }).offsetHeight;
    header.classList.toggle('is-solid', y > heroH - 90);
    header.classList.toggle('is-hidden', y > lastY && y > heroH && !document.body.classList.contains('menu-open'));
    lastY = y;
  };

  /* ---------- parallax ---------- */
  const pars = $$('.parallax');
  const onScrollParallax = () => {
    if (reduce) return;
    const vh = window.innerHeight;
    pars.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const speed = parseFloat(el.dataset.speed || 0.1);
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${center * -speed}px, 0)`;
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollHeader(); onScrollParallax(); ticking = false; });
  }, { passive: true });
  onScrollHeader(); onScrollParallax();

  /* ---------- mobilni izbornik ---------- */
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    $('.mobile-menu').setAttribute('aria-hidden', !open);
  });

  /* ---------- glatko skrolanje na sidra ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id === '#top' ? document.body : $(id);
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- prilagođeni kursor ---------- */
  if (fine && !reduce) {
    const cur = $('.cursor'), lab = $('.cursor__label');
    let x = -100, y = -100, cx = x, cy = y;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = `translate3d(${cx - 4}px, ${cy - 4}px, 0)`;
      lab.style.transform = `translate3d(${x + 18}px, ${y + 14}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.classList.add('is-hover');
        if (el.dataset.cursor) { lab.textContent = el.dataset.cursor; lab.classList.add('is-on'); }
      });
      el.addEventListener('mouseleave', () => { cur.classList.remove('is-hover'); lab.classList.remove('is-on'); });
    });

    // magnetni gumbi
    $$('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });

    // blagi 3D nagib kartica usluga
    $$('.card__img').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
        c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; });
      c.style.transition = 'transform .6s cubic-bezier(.22,.9,.25,1)';
    });
  }

  /* ---------- otvoreno / zatvoreno (Rijeka) ---------- */
  const openEl = $('[data-open-now]');
  if (openEl) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
    const mins = +parts.hour * 60 + +parts.minute;
    const open = parts.weekday !== 'Sun' && mins >= 8 * 60 && mins < 21 * 60;
    openEl.classList.toggle('is-closed', !open);
    openEl.querySelector('span').textContent = open ? 'Sada otvoreno' : 'Trenutno zatvoreno';
  }

  /* ---------- godina u podnožju ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
