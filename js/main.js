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

  /* ---------- kursor: ukosnica ---------- */
  if (fine && !reduce) {
    const cur = $('.cursor');
    cur.innerHTML = '<svg viewBox="0 0 263 33" width="74" height="9.3"><path fill="currentColor" fill-rule="evenodd" d="M16.9 29.7 C20.6 29.4 25.2 29.1 31.2 28.7 C33.9 28.5 37.0 28.3 38.1 28.2 C39.2 28.1 41.2 28.0 42.7 27.9 C44.1 27.9 47.1 27.7 49.4 27.5 C51.7 27.3 55.7 27.1 58.2 27.0 C60.8 26.9 65.0 26.7 67.5 26.5 C70.0 26.3 74.9 26.1 78.4 26.0 C81.9 25.9 85.9 25.8 87.3 25.7 C93.6 25.3 97.0 25.2 106.1 25.0 C111.4 24.9 119.5 24.7 124.0 24.6 C132.6 24.3 149.4 24.1 185.3 23.8 C215.9 23.6 250.6 23.2 252.0 23.1 C254.3 22.9 255.6 22.3 256.2 21.1 C256.6 20.3 256.6 19.9 256.1 19.1 C255.1 17.3 252.5 16.9 246.2 17.6 C244.5 17.8 242.4 18.0 241.5 18.1 C240.6 18.1 238.6 18.3 237.0 18.5 C235.4 18.7 232.6 18.9 230.8 19.0 C229.0 19.1 226.5 19.3 225.2 19.4 C221.4 19.8 220.9 19.8 216.2 20.0 C213.8 20.1 210.3 20.3 208.5 20.4 C206.7 20.6 203.0 20.7 200.2 20.8 C186.5 21.3 144.0 21.9 143.7 21.6 C143.5 21.4 143.8 21.2 144.5 21.1 C144.8 21.0 145.4 20.8 145.8 20.6 C146.2 20.4 146.9 20.1 147.3 19.9 C147.7 19.8 148.7 19.4 149.5 19.1 C154.1 17.1 157.3 16.6 160.7 17.3 C162.4 17.7 165.1 18.4 165.7 18.7 C166.0 18.8 167.1 19.0 168.1 19.3 C171.6 20.0 173.6 19.7 178.0 18.0 C182.6 16.2 183.0 16.1 185.6 16.1 L187.9 16.1 L190.2 16.9 C195.6 18.8 198.1 19.3 202.3 19.1 C206.0 18.9 211.9 17.8 216.2 16.4 C216.9 16.2 217.7 16.0 218.0 15.9 C218.3 15.8 218.8 15.7 219.2 15.5 C219.5 15.3 220.1 15.1 220.6 15.0 C221.1 14.9 221.8 14.7 222.0 14.6 C222.3 14.4 223.1 14.1 223.7 14.0 C224.3 13.8 225.5 13.5 226.4 13.2 C227.3 12.9 229.0 12.4 230.1 12.1 C233.5 11.1 235.4 10.5 236.1 10.3 C236.4 10.1 236.9 10.0 237.1 10.0 C237.3 10.0 237.9 9.8 238.5 9.5 C239.1 9.2 239.6 9.0 239.7 9.0 C240.0 9.0 241.7 7.9 242.3 7.3 C243.0 6.6 243.8 5.2 243.8 4.6 C243.8 4.0 243.1 2.8 242.6 2.3 C241.8 1.7 239.9 1.5 237.9 1.9 C236.8 2.1 234.5 3.2 234.2 3.5 C234.2 3.6 233.8 3.8 233.4 4.0 C233.1 4.2 232.3 4.6 231.8 4.9 C231.3 5.2 230.2 5.8 229.3 6.3 C228.5 6.7 227.3 7.4 226.7 7.8 C226.1 8.2 225.3 8.7 224.9 8.9 C224.5 9.0 224.1 9.3 224.0 9.4 C223.7 9.7 219.5 11.8 217.9 12.5 C217.2 12.8 216.1 13.3 215.6 13.5 C215.0 13.8 214.4 14.0 214.3 14.0 C214.2 14.0 213.7 14.2 213.3 14.4 C212.9 14.6 212.1 14.9 211.6 15.0 C211.1 15.1 210.3 15.3 209.8 15.5 C206.3 16.7 198.1 16.7 195.1 15.4 C194.6 15.2 194.1 15.0 193.9 15.0 C193.8 15.0 193.3 14.8 192.8 14.5 C192.3 14.2 191.7 14.0 191.6 14.0 C191.5 14.0 191.0 13.8 190.5 13.6 C190.0 13.3 188.9 13.0 187.9 12.9 C186.3 12.6 186.0 12.6 184.4 12.9 C183.4 13.0 182.4 13.3 182.1 13.4 C181.9 13.6 181.2 13.8 180.8 14.0 C180.3 14.1 179.7 14.3 179.5 14.5 C179.3 14.7 178.8 14.9 178.4 15.0 C178.0 15.1 177.6 15.3 177.4 15.4 C177.2 15.5 176.3 15.9 175.3 16.2 C172.8 17.0 170.4 17.0 167.9 16.2 C166.9 15.9 166.1 15.6 166.1 15.5 C166.0 15.4 165.6 15.2 165.2 15.1 C164.7 14.9 164.2 14.7 164.0 14.5 C162.8 13.6 159.1 12.5 157.2 12.5 C155.9 12.5 153.4 13.0 152.4 13.5 C146.0 16.6 145.9 16.6 143.9 17.1 C141.0 17.8 137.5 17.5 134.0 16.3 C133.4 16.0 132.7 15.8 132.6 15.8 C132.5 15.8 132.0 15.7 131.6 15.5 C131.2 15.3 129.8 15.0 128.6 14.8 C126.4 14.4 126.3 14.4 124.5 14.7 C123.4 14.9 122.2 15.2 121.7 15.4 C121.2 15.6 120.4 15.9 119.9 16.1 C119.5 16.2 118.1 16.7 116.9 17.1 C112.4 18.6 109.9 18.6 105.8 16.8 C105.1 16.5 104.2 16.2 103.8 16.0 C103.3 15.8 102.5 15.5 102.1 15.3 C101.3 14.9 101.1 14.9 98.4 14.9 C96.1 14.9 95.4 15.0 94.8 15.2 C94.4 15.4 93.6 15.7 93.0 15.8 C92.4 16.0 91.4 16.3 90.7 16.6 C88.8 17.2 85.4 17.8 82.9 18.0 C80.5 18.2 74.5 18.1 70.5 17.8 C66.9 17.6 55.4 16.9 53.2 16.7 C52.1 16.7 50.1 16.5 48.8 16.4 C47.4 16.3 44.3 16.1 41.9 15.9 C39.5 15.8 36.6 15.6 35.3 15.4 C34.1 15.3 31.8 15.1 30.1 15.0 C28.5 14.9 26.4 14.7 25.4 14.5 C21.2 13.7 11.8 13.7 9.7 14.5 C9.2 14.7 8.4 14.9 8.1 14.9 C7.0 15.1 4.9 16.3 3.9 17.2 C2.6 18.5 2.1 20.0 2.2 22.1 C2.4 25.9 4.7 28.5 8.8 29.5 C11.3 30.1 12.8 30.1 16.9 29.7 Z M8.9 27.7 C8.7 27.7 8.4 27.6 8.2 27.6 C7.7 27.5 6.6 26.4 6.2 25.8 C5.9 25.1 5.9 23.3 6.3 22.4 C8.1 18.8 11.6 18.0 25.4 18.2 C29.7 18.3 33.1 18.4 34.6 18.6 C35.9 18.7 38.3 18.9 39.9 19.0 C41.6 19.1 44.0 19.3 45.2 19.5 C46.5 19.7 48.8 19.9 50.2 20.0 C51.7 20.1 53.9 20.3 55.0 20.5 C56.2 20.7 59.0 20.9 61.3 21.1 C63.6 21.2 66.7 21.4 68.2 21.5 C71.7 21.7 78.0 21.7 79.9 21.5 C80.7 21.4 82.8 21.2 84.6 21.1 C86.3 20.9 88.3 20.7 89.1 20.5 C89.8 20.3 91.1 20.1 91.8 20.0 C92.5 19.9 93.7 19.7 94.4 19.5 C95.5 19.2 96.2 19.1 98.4 19.1 C101.0 19.1 101.1 19.1 102.1 19.5 C102.7 19.8 103.2 20.0 103.3 20.0 C103.5 20.0 106.3 21.3 106.5 21.5 C106.5 21.5 106.5 21.6 106.3 21.7 C106.1 21.9 104.3 22.0 99.2 22.1 C95.5 22.1 90.6 22.2 88.4 22.3 C86.2 22.4 81.9 22.6 78.8 22.8 C75.6 22.9 71.1 23.1 68.7 23.2 C66.2 23.3 62.9 23.5 61.2 23.6 C59.5 23.7 56.7 23.9 54.9 24.0 C53.2 24.1 50.5 24.3 48.9 24.5 C47.4 24.7 45.0 24.9 43.7 25.0 C42.3 25.1 40.2 25.3 39.0 25.5 C37.8 25.7 35.6 25.9 34.2 26.0 C32.9 26.1 30.6 26.3 29.2 26.5 C27.9 26.7 26.0 26.9 25.0 26.9 C24.0 27.0 21.5 27.2 19.3 27.3 C15.3 27.7 9.5 27.9 8.9 27.7 Z M115.3 21.9 C114.4 21.6 114.7 21.4 117.9 20.2 C118.4 20.1 119.1 19.8 119.6 19.6 C120.5 19.3 121.6 19.0 124.0 18.4 C124.8 18.2 125.6 18.2 127.5 18.2 C130.0 18.3 130.2 18.3 133.2 19.4 C133.8 19.5 134.7 19.8 135.2 20.0 C135.8 20.2 136.6 20.5 137.1 20.7 C137.5 21.0 138.0 21.2 138.2 21.2 C138.5 21.2 138.8 21.5 138.5 21.6 C138.4 21.7 133.7 21.8 128.0 21.8 C122.4 21.8 117.3 21.9 116.8 21.9 C116.2 21.9 115.6 21.9 115.3 21.9 Z"/></svg>';
    document.documentElement.classList.add('has-pin-cursor');
    let x = -100, y = -100, cx = x, cy = y;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('is-on'); });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    window.addEventListener('mousedown', () => cur.classList.add('is-down'));
    window.addEventListener('mouseup', () => cur.classList.remove('is-down'));
    const loop = () => {
      cx += (x - cx) * 0.35; cy += (y - cy) * 0.35;
      cur.style.transform = `translate3d(${cx - 3}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
    });
    $$('iframe').forEach(f => {
      f.addEventListener('mouseenter', () => { cur.classList.remove('is-on'); document.documentElement.classList.remove('has-pin-cursor'); });
      f.addEventListener('mouseleave', () => document.documentElement.classList.add('has-pin-cursor'));
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
