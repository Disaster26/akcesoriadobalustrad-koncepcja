(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* wysokość nagłówka (telefon: logo + wyszukiwarka) */
  const top = $('#top');
  const setH = () => document.documentElement.style.setProperty('--top-h', top.offsetHeight + 'px');
  setH(); addEventListener('resize', setH);

  /* menu mobilne */
  const burger = $('.burger'), menu = $('#menu-mob');
  const zamknij = () => { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); menu.hidden = true; };
  burger.addEventListener('click', () => {
    const otw = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
    menu.hidden = !otw;
  });
  $$('#menu-mob a').forEach(a => a.addEventListener('click', zamknij));
  addEventListener('keydown', e => { if (e.key === 'Escape') zamknij(); });

  /* dolny pasek po przewinięciu za główny przycisk */
  const pasek = $('#mob-pasek'), cta = $('#hero-cta');
  if (pasek && cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      const pokaz = !e.isIntersecting && e.boundingClientRect.top < 0;
      pasek.classList.toggle('widac', pokaz);
      pasek.setAttribute('aria-hidden', String(!pokaz));
      $$('a', pasek).forEach(a => a.tabIndex = pokaz ? 0 : -1);
    }).observe(cta);
  }

  /* toast */
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  let tt; const pokazToast = t => { toast.textContent = t; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 2600); };
  $('#koszyk').addEventListener('click', e => { e.preventDefault(); pokazToast('Koszyk jest pusty.'); });

  /* galerie w kartach: palec, mysz, strzałki, klawiatura */
  const strz = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'}"/></svg>`;
  $$('[data-gal]').forEach(g => {
    const tor = $('.gal-tor', g), imgs = $$('img', tor), n = imgs.length;
    if (n < 2) { g.classList.add('jedno'); return; }
    let i = 0;
    g.tabIndex = 0; g.setAttribute('role', 'region'); g.setAttribute('aria-roledescription', 'galeria'); g.setAttribute('aria-label', 'Zdjęcia produktu, ' + n);
    const l = document.createElement('button'), p = document.createElement('button');
    l.className = 'gal-str l'; p.className = 'gal-str p'; l.type = p.type = 'button';
    l.innerHTML = strz(0); p.innerHTML = strz(1); l.setAttribute('aria-label', 'Poprzednie zdjęcie'); p.setAttribute('aria-label', 'Następne zdjęcie');
    const kropki = document.createElement('div'); kropki.className = 'gal-kropki';
    kropki.innerHTML = imgs.map(() => '<i></i>').join('');
    const licz = document.createElement('span'); licz.className = 'gal-licz';
    g.append(l, p, kropki, licz);
    const idz = k => {
      i = Math.max(0, Math.min(n - 1, k));
      tor.style.transform = `translateX(${-i * 100}%)`;
      $$('i', kropki).forEach((d, j) => d.classList.toggle('on', j === i));
      l.disabled = i === 0; p.disabled = i === n - 1;
      licz.textContent = (i + 1) + ' / ' + n;
      const nast = imgs[i + 1]; if (nast) nast.loading = 'eager';
    };
    l.addEventListener('click', e => { e.stopPropagation(); idz(i - 1); });
    p.addEventListener('click', e => { e.stopPropagation(); idz(i + 1); });
    g.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') idz(i - 1); if (e.key === 'ArrowRight') idz(i + 1); });
    let x0 = null, y0 = 0, dx = 0, poziomo = null, w = 1;
    g.addEventListener('pointerdown', e => {
      if (e.target.closest('.gal-str')) return;
      x0 = e.clientX; y0 = e.clientY; dx = 0; poziomo = null; w = g.offsetWidth;
      if (e.pointerType === 'mouse') { g.setPointerCapture(e.pointerId); e.preventDefault(); }
    });
    g.addEventListener('pointermove', e => {
      if (x0 === null) return;
      dx = e.clientX - x0; const dy = e.clientY - y0;
      if (poziomo === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        poziomo = Math.abs(dx) > Math.abs(dy);
        if (poziomo) { g.classList.add('drag'); try { g.setPointerCapture(e.pointerId); } catch (_) {} }
      }
      if (!poziomo) return;
      let o = dx; if ((i === 0 && dx > 0) || (i === n - 1 && dx < 0)) o = dx / 3;
      tor.style.transform = `translateX(calc(${-i * 100}% + ${o}px))`;
    });
    const koniec = () => {
      if (x0 === null) return;
      g.classList.remove('drag');
      if (poziomo && Math.abs(dx) > w * 0.15) idz(i + (dx < 0 ? 1 : -1)); else idz(i);
      x0 = null;
    };
    g.addEventListener('pointerup', koniec); g.addEventListener('pointercancel', koniec);
    g.addEventListener('lostpointercapture', koniec);
    idz(0);
  });

  /* wyszukiwarka pokazowa: kategorie i produkty z podglądu */
  const KAT = ['Uchwyty do szkła', 'Mocowania pręta', 'Mocowania poręczy', 'Stopy i maskownice', 'Zaślepki i kule', 'Kształtki, kolanka',
    'Balustrady samonośne', 'Profil kwadratowy 40x40', 'Systemy ścianek szklanych', 'Akcesoria do kabin prysznicowych', 'Słupki i pochwyty',
    'Chemia montażowa', 'Linki i mocowania', 'Elementy złączne', 'Akcesoria do drewna', 'Balkony francuskie', 'Zawiasy i zasuwki', 'Daszki',
    'Uchwyty do szkła model 4545', 'Uchwyty do szkła model 4050', 'Uchwyty do szkła model 5570', 'Uchwyty do szkła model 5555',
    'Uchwyty punktowe 50 mm', 'Uchwyty punktowe do 35 mm', 'Uszczelki do uchwytów', 'Profil U do montażu podłogowego', 'Profil F do montażu podłogowego',
    'Profil Y do montażu bocznego', 'Kotwy chemiczne', 'Nitonakrętki', 'Zawiasy do drzwi szklanych', 'Uszczelki do kabin', 'Maskownica 42,4', 'Uchwyty ścienne do poręczy'];
  const PROD = [
    ['Uchwyt do szkła zaciskowy 4545 A2 00', '14,16 zł', 'p-4545-1'],
    ['Uchwyt do szkła zaciskowy 4050 A2 42,4 P', '22,46 zł', 'p-4050-1'],
    ['Uchwyt do szkła zaciskowy 5570RZ 00', '31,46 zł', 'p-5570-1'],
    ['Uchwyt punktowy 1050A2 dystans 30 mm', '35,86 zł', 'p-1050-1'],
    ['Uchwyt poręczy ścienny 1210 A2 42,4 P', '26,99 zł', 'p-1210-1'],
    ['Stopa montażowa 1840 A2 50x42,4/100 mm poler', '41,96 zł', 'p-1840-1'],
    ['Zaślepka soczewkowa 1420 A2 33,7', '10,36 zł', 'p-1420'],
    ['Uchwyt pionowy 1990 h-182/50x50', '129,15 zł', 'p-1990'],
    ['Uchwyt do szkła 1030A2 42, 6-16 mm', '13,60 zł', 'p-1030'],
    ['Uchwyt do szkła 4545P RZ 00 + płytka', '9,25 zł', 'p-4545p'],
    ['Uchwyt zaciskowy 5555A4 00', '47,41 zł', 'p-5555'],
    ['Kotwa chemiczna POLYVALENT 410 bez styrenu', '36,99 zł', 'p-kotwa'],
    ['Profil bazowy 1970AL ELOX 121x45, 2,5 m', '819,73 zł', 'p-profil-u'],
    ['Kolanko proste poziome 1301 A2 42,4', '', 'p-kolanko'],
  ];
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[.,]/g, '');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const zazn = (t, q) => {
    const nt = norm(t), nq = norm(q).trim(); if (!nq) return esc(t);
    // zaznaczenie po pozycji w tekście znormalizowanym (bez kropek/przecinków różnice długości pomijamy)
    let k = nt.length === t.length ? nt.indexOf(nq) : -1; let L = nq.length;
    if (k < 0) { const ql = q.trim().toLowerCase(); k = t.toLowerCase().indexOf(ql); L = ql.length; } if (k < 0) return esc(t);
    return esc(t.slice(0, k)) + '<mark>' + esc(t.slice(k, k + L)) + '</mark>' + esc(t.slice(k + L));
  };
  const q = $('#q'), box = $('#podpowiedzi'), form = $('#szukaj');
  let sel = -1;
  const pasuje = (t, s) => norm(s).split(/\s+/).filter(Boolean).every(w => norm(t).includes(w));
  const rysuj = () => {
    const s = q.value.trim(); sel = -1;
    if (s.length < 2) { box.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    const k = KAT.filter(t => pasuje(t, s)).slice(0, 4);
    const p = PROD.filter(([t]) => pasuje(t, s)).slice(0, 6);
    let h = '';
    if (k.length) h += '<div class="grp">Kategorie</div>' + k.map(t => `<a href="#kategorie" role="option"><span>${zazn(t, s)}</span></a>`).join('');
    if (p.length) h += '<div class="grp">Produkty</div>' + p.map(([t, c, im]) => `<a href="#produkty" role="option"><img src="img/${im}.webp" alt="" width="42" height="42"><span>${zazn(t, s)}</span><span class="pc">${c}</span></a>`).join('');
    if (!h) h = `<div class="brak">Nie znaleźliśmy „${esc(s)}”. Zadzwoń: <a href="tel:+48506076904" style="display:inline;padding:0">506 076 904</a>, pomożemy dobrać element.</div>`;
    box.innerHTML = h; box.hidden = false; q.setAttribute('aria-expanded', 'true');
    $$('a[role=option]', box).forEach(a => a.addEventListener('click', () => { box.hidden = true; }));
  };
  q.addEventListener('input', rysuj);
  q.addEventListener('focus', rysuj);
  q.addEventListener('keydown', e => {
    const o = $$('a[role=option]', box); if (box.hidden || !o.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + o.length) % o.length;
      o.forEach((a, j) => a.setAttribute('aria-selected', String(j === sel))); o[sel].scrollIntoView({ block: 'nearest' });
    }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const o = $$('a[role=option]', box);
    if (!box.hidden && o.length) { (o[Math.max(sel, 0)]).click(); location.hash = o[Math.max(sel, 0)].getAttribute('href'); }
    box.hidden = true; q.blur();
  });
  document.addEventListener('click', e => { if (!form.contains(e.target)) box.hidden = true; });

  /* formularz pokazowy */
  const f = $('#formularz'), info = $('.form-info', f), plik = $('input[type=file]', f);
  plik.addEventListener('change', () => { $('.plik-nazwa', f).textContent = plik.files[0] ? plik.files[0].name : 'PDF, JPG, PNG, DWG'; });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const brak = $$('[required]', f).find(el => el.type === 'checkbox' ? !el.checked : !el.value.trim());
    info.classList.toggle('blad', !!brak);
    if (brak) { info.textContent = 'Uzupełnij wszystkie pola i zaznacz zgodę.'; brak.focus(); return; }
    info.textContent = 'Dziękujemy. To formularz pokazowy - na docelowej stronie zapytanie trafi prosto na adres sklepu.';
    f.reset(); $('.plik-nazwa', f).textContent = 'PDF, JPG, PNG, DWG';
  });
})();
