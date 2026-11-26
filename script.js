(() => {
  'use strict';

  /* ---------- CONFIG ---------- */
  const CONFIG = {
    RSVP_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyQ9TfS0aXGtpU6CGWkZyF-Nl_wZ_cGFI7gDKoO7P6U1U15qxF8kpWZV4ks7qratkLn/exec',
    RSVP_TIMEOUT_MS: 20000,
    MUSIC_SRC: 'assets/music.m4a',
    WEDDING_ISO: '2027-01-14T10:30:00+05:30',
    // Start times are confirmed. End times are NOT confirmed by the families:
    // calendar entries use a provisional 2-hour duration and say so in the description.
    PROVISIONAL_DURATION_MIN: 120,
    EVENTS: [
      { title: 'Engagement & Mylanchy', start: '2027-01-11T17:30:00+05:30', note: 'Followed by Reception at Church Parish Hall.', map: 'https://share.google/3c1I5vXT3Np3pLueB' },
      { title: 'Chanthamcharthal', start: '2027-01-12T18:00:00+05:30', note: 'A celebration of family, tradition and blessings.', map: 'https://share.google/0jLpBEZ9mTx78T9Vl' },
      { title: 'Holy Matrimony: Nikhil & Anithamol', start: '2027-01-14T10:30:00+05:30', note: 'United in love and blessed by faith.', map: 'https://share.google/nNH5E4ygvznROWcxG' }
    ],
    SHARE: { title: 'Nikhil & Anithamol | Wedding Invitation', text: 'You are invited to the wedding of Nikhil & Anithamol on 14 January 2027.' }
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);
  const animate = hasGsap && !reduced;

  const body = document.body, main = $('#main') || $('main');
  const opening = $('#opening'), ov = $('#openingVideo'), overlay = $('#openingOverlay');
  let openingDone = false, started = false, timers = [];

  /* ---------- HERO: split names into letters, set hidden start state ---------- */
  $$('[data-split]').forEach(el => {
    const txt = el.textContent; el.textContent = '';
    [...txt].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.appendChild(s); });
  });
  const heroHidden = '.hero__grace,.hero__amp,.hero__theme,.hero__date,.scroll-ind,.ch';
  function resetHero() {
    if (!animate) return;
    gsap.set(heroHidden, { opacity: 0, y: 26 });
    gsap.set('.hero__line', { scaleX: 0, opacity: 1 });
    gsap.set('.hero__img', { scale: 1.07 });
  }
  function playHero(delay = 0) {
    if (!animate) return;
    const tl = gsap.timeline({ delay, defaults: { ease: 'power3.out' } });
    tl.to('.hero__img', { scale: 1, duration: 3.2, ease: 'power2.out' }, 0)
      .to('.hero__grace', { opacity: 1, y: 0, duration: 1 }, 0.1)
      .to('.hn:first-of-type .ch', { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }, 0.4)
      .to('.hero__amp', { opacity: 1, y: 0, duration: 1 }, 0.95)
      .to('.hn:last-of-type .ch', { opacity: 1, y: 0, duration: 1.1, stagger: 0.06 }, 1.1)
      .to('.hero__line', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 1.9)
      .to('.hero__theme', { opacity: 1, y: 0, duration: 1 }, 2.1)
      .to('.hero__date', { opacity: 1, y: 0, duration: 1 }, 2.35)
      .to('.scroll-ind', { opacity: 1, y: 0, duration: 1 }, 2.9);
  }
  resetHero();
  if (main) main.inert = true; // keyboard focus stays on the opening until it ends

  /* ---------- OPENING ---------- */
  function finishOpening() {
    if (openingDone) return;
    openingDone = true;
    timers.forEach(clearTimeout); timers = [];
    window.scrollTo(0, 0);
    const done = () => {
      opening.style.display = 'none';
      body.classList.remove('locked');
      if (main) { main.inert = false; main.focus({ preventScroll: true }); }
      try { ov.pause(); } catch (_) {}
      if (hasST) ScrollTrigger.refresh();
    };
    // Hero sits beneath the opening, so there is never a blank frame. The video's last frame has its own baked-in names,
    // so the live names wait until it has mostly faded; this avoids two sets of text ghosting over each other.
    playHero(animate ? 0.85 : 0);
    if (animate) gsap.to(opening, { opacity: 0, duration: 1.5, ease: 'power2.inOut', onComplete: done });
    else done();
  }

  function startOpening() {
    if (started) return;
    started = true;
    if (animate) gsap.to(overlay, { opacity: 0, duration: 0.7, onComplete: () => (overlay.style.display = 'none') });
    else overlay.style.display = 'none';
    let p;
    try { p = ov.play(); } catch (_) { finishOpening(); return; }
    (p || Promise.resolve()).then(() => {
      // watchdogs: stalled video, or never-ending video
      timers.push(setTimeout(() => { if (ov.currentTime < 0.2) finishOpening(); }, 6000));
      timers.push(setTimeout(finishOpening, ((ov.duration || 12) * 1000) + 3000));
    }).catch(finishOpening);
  }

  ov.addEventListener('timeupdate', () => { if (started && ov.duration && ov.currentTime >= ov.duration - 1.3) finishOpening(); });
  ov.addEventListener('ended', finishOpening);
  ov.addEventListener('error', () => { if (started) finishOpening(); }); // before click: poster stays, click then skips ahead
  $('#openBtn').addEventListener('click', startOpening);
  $('#skipBtn').addEventListener('click', () => { started = true; finishOpening(); });

  $('#replayBtn').addEventListener('click', () => {
    openingDone = false; started = false;
    window.scrollTo(0, 0);
    body.classList.add('locked');
    if (main) main.inert = true;
    try { ov.pause(); ov.currentTime = 0; } catch (_) {}
    overlay.style.display = ''; overlay.style.opacity = 1;
    opening.style.display = ''; opening.style.opacity = 1;
    resetHero();
    $('#openBtn').focus({ preventScroll: true });
  });

  /* ---------- SCROLL ANIMATIONS ---------- */
  if (hasST && animate) {
    const once = (trigger, start = 'top 88%') => ({ trigger, start, once: true });
    $$('[data-reveal]').forEach(el => gsap.from(el, { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', scrollTrigger: once(el) }));
    $$('[data-line]').forEach(el => gsap.from(el, { scaleX: 0, opacity: 0, duration: 1.2, ease: 'power2.out', scrollTrigger: once(el, 'top 92%') }));

    // Chapters: each enters differently, same easing family and timing
    $$('.chapter').forEach(ch => {
      const media = $('.chapter__media', ch), kids = [...$('.chapter__text', ch).children];
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: once(ch, 'top 68%') });
      if (ch.classList.contains('chapter--engage')) tl.from(media, { opacity: 0, y: 70, duration: 1.4 });
      else if (ch.classList.contains('chapter--chantham')) tl.from(media, { opacity: 0, scale: 0.94, duration: 1.5 });
      else tl.from(media, { opacity: 0, y: 40, duration: 1.3 });
      tl.from(kids, { opacity: 0, y: 26, duration: 0.9, stagger: 0.11 }, '-=0.9');
    });

    // Subtle parallax: transform-only, scrubbed, small range, desktop and mobile alike
    $$('[data-parallax]').forEach(el => gsap.fromTo(el, { yPercent: -4 }, { yPercent: 4, ease: 'none', force3D: true, scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.to('.hero__img', { yPercent: 5, ease: 'none', force3D: true, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { y: -36, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '#hero', start: '30% top', end: 'bottom top', scrub: true } });
  }
  window.addEventListener('load', () => { if (hasST) ScrollTrigger.refresh(); });

  /* ---------- VIDEO: lazy start, pause offscreen/hidden, tap to toggle if autoplay is blocked ---------- */
  const vids = $$('video[data-autovideo]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting && !document.hidden) v.play().catch(() => {}); else v.pause();
    }), { threshold: 0.3, rootMargin: '80px 0px' });
    vids.forEach(v => io.observe(v));
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) vids.forEach(v => v.pause()); });
  vids.forEach(v => v.addEventListener('click', () => (v.paused ? v.play().catch(() => {}) : v.pause())));

  /* ---------- COUNTDOWN ---------- */
  const target = new Date(CONFIG.WEDDING_ISO).getTime();
  const pad = n => String(n).padStart(2, '0');
  const cd = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  function tick() {
    const left = Math.max(0, target - Date.now());
    cd.d.textContent = Math.floor(left / 864e5);
    cd.h.textContent = pad(Math.floor(left % 864e5 / 36e5));
    cd.m.textContent = pad(Math.floor(left % 36e5 / 6e4));
    cd.s.textContent = pad(Math.floor(left % 6e4 / 1e3));
    if (left === 0) { $('#countdown').hidden = true; $('#cd-done').hidden = false; clearInterval(timer); }
  }
  const timer = setInterval(tick, 1000); tick();

  /* ---------- CALENDAR (ICS) ---------- */
  const icsDate = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const icsEsc = t => String(t).replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\r?\n/g, '\\n');
  function buildICS() {
    const stamp = icsDate(new Date());
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nikhil and Anithamol//Wedding//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    CONFIG.EVENTS.forEach((e, i) => {
      const s = new Date(e.start), en = new Date(s.getTime() + CONFIG.PROVISIONAL_DURATION_MIN * 6e4);
      L.push('BEGIN:VEVENT', `UID:nikhil-anithamol-${i}-20270114@nikhil-anitha.vercel.app`, `DTSTAMP:${stamp}`,
        `DTSTART:${icsDate(s)}`, `DTEND:${icsDate(en)}`, `SUMMARY:${icsEsc(e.title)}`,
        `DESCRIPTION:${icsEsc(`${e.note}\nDirections: ${e.map}\nNote: the end time is provisional; the start time is confirmed.`)}`,
        `URL:${e.map}`, 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.join('\r\n');
  }
  $('#calBtn').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'nikhil-anithamol-wedding.ics' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  });

  /* ---------- RSVP (skipped while the RSVP section is commented out) ---------- */
  if ($('#rsvpForm')) {
  const F = {
    form: $('#rsvpForm'), name: $('#guestName'), guests: $('#guestCount'), wishes: $('#wishes'),
    hp: $('#hpField'), details: $('#detailFields'), btn: $('#rsvpBtn'), status: $('#formStatus'),
    att: () => $$('input[name="attendance"]', $('#rsvpForm')),
    events: () => $$('input[name="events"]', $('#rsvpForm'))
  };
  let submitting = false;
  const attVal = () => (F.att().find(r => r.checked) || {}).value;
  const setErr = (k, msg = '') => { const el = $(`[data-err="${k}"]`); if (el) el.textContent = msg; };
  const setStatus = msg => { F.status.textContent = msg; };

  function toggleDetails() {
    const no = attVal() === 'No';
    F.details.classList.toggle('is-hidden', no);
    F.guests.disabled = no; F.events().forEach(c => (c.disabled = no));
  }
  F.att().forEach(r => r.addEventListener('change', toggleDetails));

  function validate() {
    ['name', 'attendance', 'guests', 'events'].forEach(k => setErr(k));
    const bad = [];
    if (F.name.value.trim().length < 2) { setErr('name', 'Please enter your name.'); bad.push(F.name); }
    if (!attVal()) { setErr('attendance', 'Please choose Yes or No.'); bad.push(F.att()[0]); }
    if (attVal() === 'Yes') {
      const g = Number(F.guests.value);
      if (!Number.isInteger(g) || g < 1 || g > 10) { setErr('guests', 'Enter a whole number from 1 to 10.'); bad.push(F.guests); }
      if (!F.events().some(c => c.checked)) { setErr('events', 'Select at least one event.'); bad.push(F.events()[0]); }
    }
    if (bad.length) bad[0].focus();
    return bad.length === 0;
  }

  async function submitRSVP(data) {
    if (!CONFIG.RSVP_ENDPOINT) { const e = new Error('no-backend'); e.code = 'NO_BACKEND'; throw e; }
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), CONFIG.RSVP_TIMEOUT_MS);
    try {
      // text/plain avoids a CORS preflight, which Apps Script web apps do not answer
      const res = await fetch(CONFIG.RSVP_ENDPOINT, { method: 'POST', redirect: 'follow', signal: ctrl.signal, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
      let out = null;
      try { out = JSON.parse(await res.text()); } catch (_) {}
      if (!res.ok || !out) { const e = new Error('Bad response'); e.code = 'BAD_RESPONSE'; throw e; }
      if (out.ok !== true) { const e = new Error(out.error || 'Rejected'); e.code = 'REJECTED'; throw e; }
      return true; // success only when the backend itself says ok:true
    } finally { clearTimeout(t); }
  }

  F.form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;
    if (F.hp.value) return; // honeypot
    setStatus('');
    if (!validate()) { setStatus('Please check the highlighted fields.'); return; }
    const yes = attVal() === 'Yes';
    const data = {
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)),
      name: F.name.value.trim(), attendance: attVal(),
      guests: yes ? Number(F.guests.value) : 0,
      events: yes ? F.events().filter(c => c.checked).map(c => c.value) : [],
      message: F.wishes.value.trim(), submittedAt: new Date().toISOString()
    };
    submitting = true; F.btn.disabled = true; F.btn.textContent = 'Sending…'; F.form.setAttribute('aria-busy', 'true');
    try {
      await submitRSVP(data);
      setStatus('Thank you. Your RSVP has been received.');
      F.form.reset(); F.guests.value = 1; toggleDetails();
    } catch (err) {
      console.error('RSVP error:', err);
      if (err.code === 'NO_BACKEND') setStatus('RSVP is not connected yet, so your response has not been sent.');
      else if (err.name === 'AbortError') setStatus('This is taking too long, so your RSVP is not confirmed. Please try again.');
      else if (err.code === 'REJECTED') setStatus('Your RSVP was not accepted. Please check your details and try again.');
      else setStatus('We could not confirm your RSVP. Please check your connection and try again.');
    } finally {
      submitting = false; F.btn.disabled = false; F.btn.textContent = 'Send RSVP'; F.form.removeAttribute('aria-busy');
    }
  });
  }

  /* ---------- PHOTO LIGHTBOX ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), shots = $$('.mshot');
  let cur = 0, tx = 0;
  function showShot(i) {
    cur = (i + shots.length) % shots.length;
    lbImg.src = shots[cur].dataset.full;
    lbImg.alt = $('img', shots[cur]).alt;
  }
  shots.forEach((s, i) => s.addEventListener('click', () => { showShot(i); lb.showModal(); document.documentElement.style.overflow = 'hidden'; }));
  $('.lb-close').addEventListener('click', () => lb.close());
  $('.lb-prev').addEventListener('click', () => showShot(cur - 1));
  $('.lb-next').addEventListener('click', () => showShot(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => { document.documentElement.style.overflow = ''; lbImg.removeAttribute('src'); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') showShot(cur - 1); if (e.key === 'ArrowRight') showShot(cur + 1); });
  lb.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) showShot(cur + (d < 0 ? 1 : -1)); }, { passive: true });

  /* ---------- SHARE ---------- */
  $('#shareBtn').addEventListener('click', async () => {
    const out = $('#shareStatus'), url = location.href.split('#')[0];
    try {
      if (navigator.share) { await navigator.share({ ...CONFIG.SHARE, url }); return; }
      await navigator.clipboard.writeText(url); out.textContent = 'Invitation link copied.';
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); out.textContent = 'Invitation link copied.'; } catch (_) { out.textContent = 'Copy this link: ' + url; }
      t.remove();
    }
  });
  $('#toTop').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- MUSIC (only after a tap) ---------- */
  const mBtn = $('#musicBtn'), audio = $('#bgMusic');
  const paint = on => { mBtn.setAttribute('aria-pressed', String(on)); mBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); };
  function setMusic(on) {
    if (on) audio.play().then(() => paint(true)).catch(() => paint(false)); else { audio.pause(); paint(false); }
  }
  if (CONFIG.MUSIC_SRC) {
    audio.src = CONFIG.MUSIC_SRC; audio.volume = 0.6; mBtn.hidden = false;
    mBtn.addEventListener('click', () => setMusic(audio.paused));
    $('#openBtn').addEventListener('click', () => setMusic(true));
  }
})();
