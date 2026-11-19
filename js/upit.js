/* Hair by Karla Benić – kontakt forma */
(function () {
  const f = document.querySelector('[data-cform]');
  if (!f) return;
  const PHONE = '385919148737', MAIL = 'karla.benic@icloud.com';
  const vrsta = f.elements.vrsta, datum = f.elements.datum;
  const t = new Date(); t.setDate(t.getDate() + 1);
  datum.min = t.toISOString().slice(0, 10);

  vrsta.addEventListener('change', () => {
    const ev = vrsta.selectedOptions[0].hasAttribute('data-event');
    f.querySelectorAll('[data-event-only]').forEach(el => el.hidden = !ev);
    f.querySelector('[data-date-label]').textContent = vrsta.value === 'Vjenčanje' ? 'Datum vjenčanja' : ev ? 'Datum' : 'Željeni datum';
    f.querySelector('[data-time-label]').textContent = ev ? 'Do kada trebate biti spremni' : 'Željeno vrijeme';
    const sel = f.elements.vrijeme;
    if (sel.dataset.mode !== (ev ? 'ev' : 'sal')) {
      sel.dataset.mode = ev ? 'ev' : 'sal';
      sel.innerHTML = ev
        ? '<option value="">Još ne znam</option>' + ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => '<option>' + t + '</option>').join('')
        : '<option value="">Svejedno</option><option>Jutro (08:00 – 12:00)</option><option>Popodne (12:00 – 16:00)</option><option>Kasno popodne (16:00 – 21:00)</option>';
    }
  });
  f.addEventListener('input', e => e.target.closest('.cf, .cf-check')?.classList.remove('is-invalid'));
  f.addEventListener('change', e => e.target.closest('.cf, .cf-check')?.classList.remove('is-invalid'));

  const fmt = v => { if (!v) return ''; const [y, m, d] = v.split('-'); return +d + '. ' + +m + '. ' + y + '.'; };
  function check() {
    let ok = true;
    ['ime', 'tel', 'vrsta', 'poruka'].forEach(n => {
      const el = f.elements[n], bad = !el.value.trim();
      el.closest('.cf').classList.toggle('is-invalid', bad); if (bad) ok = false;
    });
    const g = f.elements.gdpr; g.closest('.cf-check').classList.toggle('is-invalid', !g.checked); if (!g.checked) ok = false;
    f.querySelector('[data-cform-error]').hidden = ok;
    if (!ok) f.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }
  function body() {
    const e = f.elements, ev = !f.querySelector('[data-event-only]').hidden;
    return [
      'Vrsta upita: ' + e.vrsta.value,
      e.datum.value ? 'Datum: ' + fmt(e.datum.value) : '',
      e.vrijeme.value ? (ev ? 'Trebam biti spremna do: ' : 'Vrijeme: ') + e.vrijeme.value : '',
      ev && e.mjesto.value ? 'Mjesto: ' + e.mjesto.value : '',
      ev ? 'Broj osoba: ' + e.osobe.value : '',
      '',
      e.poruka.value.trim(),
      '',
      e.ime.value.trim(),
      'Tel: ' + e.tel.value.trim(),
      e.email.value.trim() ? 'E-mail: ' + e.email.value.trim() : ''
    ].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
  }
  f.addEventListener('submit', e => {
    e.preventDefault(); if (!check()) return;
    const subj = 'Upit: ' + f.elements.vrsta.value + (datum.value ? ', ' + fmt(datum.value) : '');
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body());
  });
  f.querySelector('[data-wa]').addEventListener('click', () => {
    if (!check()) return;
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent('Bok Karla!\n' + body()), '_blank', 'noopener');
  });
})();
