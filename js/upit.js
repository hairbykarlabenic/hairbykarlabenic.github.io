/* Hair by Karla Benić – planer upita za poseban dan (bez spremanja podataka na webu) */
(function () {
  const root = document.querySelector('[data-upit]');
  if (!root) return;
  const PHONE = '385919148737', MAIL = 'karla.benic@icloud.com';
  const MONTHS = ['siječanj','veljača','ožujak','travanj','svibanj','lipanj','srpanj','kolovoz','rujan','listopad','studeni','prosinac'];
  const MONTHS_GEN = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja','srpnja','kolovoza','rujna','listopada','studenoga','prosinca'];
  const DAYS = ['nedjelja','ponedjeljak','utorak','srijeda','četvrtak','petak','subota'];
  const state = { type: '', date: null, time: '', loc: '', place: '', n: 1, name: '', tel: '', note: '' };
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];

  /* ---------- odabir pilula ---------- */
  $$('[data-group]').forEach(g => {
    g.addEventListener('click', e => {
      const b = e.target.closest('button[data-val]'); if (!b) return;
      g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      state[g.dataset.group] = b.dataset.val;
      if (g.dataset.group === 'type') {
        const lbl = { 'vjenčanje': 'Datum vjenčanja', 'probnu frizuru': 'Željeni datum probe' }[b.dataset.val] || 'Datum';
        $('[data-date-label]').textContent = lbl;
      }
      if (g.dataset.group === 'loc') $('[data-place]').hidden = b.dataset.val !== 'na lokaciji';
      g.closest('.upit__step').classList.remove('is-missing');
      render();
    });
  });

  /* ---------- kalendar ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const min = new Date(today); min.setDate(min.getDate() + 1);
  const max = new Date(today); max.setFullYear(max.getFullYear() + 2);
  let view = new Date(min.getFullYear(), min.getMonth(), 1);
  const cal = $('[data-cal]');
  function drawCal() {
    const y = view.getFullYear(), m = view.getMonth();
    cal.querySelector('[data-cal-title]').textContent = MONTHS[m] + ' ' + y;
    cal.querySelector('[data-cal-prev]').disabled = (y === min.getFullYear() && m === min.getMonth());
    cal.querySelector('[data-cal-next]').disabled = (y === max.getFullYear() && m === max.getMonth());
    const grid = cal.querySelector('[data-cal-grid]'); grid.innerHTML = '';
    const first = (new Date(y, m, 1).getDay() + 6) % 7, len = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) grid.insertAdjacentHTML('beforeend', '<span></span>');
    for (let d = 1; d <= len; d++) {
      const dt = new Date(y, m, d), b = document.createElement('button');
      b.type = 'button'; b.textContent = d;
      b.disabled = dt < min || dt > max;
      if (dt.getDay() === 6) b.classList.add('is-sat');
      if (state.date && dt.getTime() === state.date.getTime()) b.setAttribute('aria-pressed', 'true');
      b.setAttribute('aria-label', d + '. ' + MONTHS_GEN[m] + ' ' + y);
      b.addEventListener('click', () => { state.date = dt; cal.closest('.upit__step').classList.remove('is-missing'); drawCal(); render(); });
      grid.appendChild(b);
    }
  }
  cal.querySelector('[data-cal-prev]').addEventListener('click', () => { view.setMonth(view.getMonth() - 1); drawCal(); });
  cal.querySelector('[data-cal-next]').addEventListener('click', () => { view.setMonth(view.getMonth() + 1); drawCal(); });
  drawCal();

  /* ---------- broj osoba ---------- */
  const nOut = $('[data-n]');
  $$('[data-step]').forEach(b => b.addEventListener('click', () => {
    state.n = Math.min(12, Math.max(1, state.n + (+b.dataset.step)));
    nOut.textContent = state.n; render();
  }));

  /* ---------- polja ---------- */
  $$('[data-field]').forEach(f => f.addEventListener('input', () => {
    state[f.dataset.field] = f.value.trim();
    if (f.value.trim()) f.closest('.upit__step')?.classList.remove('is-missing');
    render();
  }));

  /* ---------- pismo ---------- */
  const fmtDate = d => DAYS[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS_GEN[d.getMonth()] + ' ' + d.getFullYear() + '.';
  const osobe = n => n + (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? ' osobe' : ' osoba');
  const fill = (k, v) => { const el = $('[data-l="' + k + '"]'); el.textContent = v || ''; el.classList.toggle('is-empty', !v); };
  function render() {
    fill('name', state.name);
    fill('type', state.type);
    fill('date', state.date ? fmtDate(state.date) : '');
    fill('time', state.time);
    const loc = state.loc === 'na lokaciji' ? ('na lokaciji' + (state.place ? ' (' + state.place + ')' : '')) : state.loc;
    fill('loc', loc);
    fill('n', osobe(state.n));
    const note = $('[data-l-note]'); note.textContent = state.note; note.hidden = !state.note;
  }
  render();

  function message() {
    const loc = state.loc === 'na lokaciji' ? 'na lokaciji' + (state.place ? ' (' + state.place + ')' : '') : (state.loc || 'još ne znam');
    return [
      'Bok Karla! Ja sam ' + state.name + '.',
      'Javljam se za ' + state.type + '.',
      'Datum: ' + fmtDate(state.date),
      'Trebam biti spremna do: ' + (state.time || 'još ne znam'),
      'Mjesto: ' + loc,
      'Broj osoba: ' + state.n,
      state.note ? 'Napomena: ' + state.note : '',
      state.tel ? 'Moj broj: ' + state.tel : ''
    ].filter(Boolean).join('\n');
  }
  function valid() {
    const miss = [];
    if (!state.type) miss.push('[data-group="type"]');
    if (!state.date) miss.push('[data-cal]');
    if (!state.name) miss.push('[data-field="name"]');
    miss.forEach(s => $(s).closest('.upit__step').classList.add('is-missing'));
    if (miss.length) { $(miss[0]).closest('.upit__step').scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; }
    return true;
  }
  $('[data-send="wa"]').addEventListener('click', () => {
    if (!valid()) return;
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message()), '_blank', 'noopener');
  });
  $('[data-send="mail"]').addEventListener('click', () => {
    if (!valid()) return;
    const d = state.date, subj = 'Upit: ' + state.type + ', ' + d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear() + '.';
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(message());
  });
})();
