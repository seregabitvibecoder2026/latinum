/* =====================================================================
 *  app.js — UI, exercises, gamification.
 *  Talks to the save ONLY through the `save` object + commit().
 *  Never write to localStorage directly — use SaveSystem (see AGENTS.md).
 * ===================================================================== */
(function () {
  'use strict';
  const { WORDS, UNITS, GLOSS } = window.Course;
  const S = window.SaveSystem, L = window.Latin;
  let DEVICE = S.getDeviceId();
  // Shown in the UI and in bug reports. Bump on every release.
  const APP_VERSION = '0.3.0-beta';
  const REPO_URL = 'https://github.com/seregabitvibecoder2026/latinum';
  const boot = S.load();
  let save = boot.save;

  let saveFailed = false;
  /**
   * Persist the in-memory save. Merges in whatever another tab stored first
   * (same epoch), so tabs never overwrite each other's progress.
   */
  function commit() {
    if (!S.readOnlyReason) {
      const stored = S.peek();
      save.updatedAt = Date.now(); // our in-memory changes are the newest
      if (stored && stored.epoch === save.epoch) save = S.merge(stored, save);
      else if (stored && stored.epoch > save.epoch) { save = stored; DEVICE = S.getDeviceId(); } // another tab reset/replaced: respect it
      const ok = S.persist(save);
      if (!ok && !saveFailed) { saveFailed = true; showSaveFailed(); }
      if (ok) { saveFailed = false; const b = document.getElementById('savefail'); b && b.remove(); }
    }
    renderTop();
  }
  function showSaveFailed() {
    if (document.getElementById('savefail')) return;
    const b = el(`<div id="savefail" class="banner bad sticky">⚠️ This browser is not saving your progress (storage full or blocked, e.g. private mode). <button class="btn small">⬇️ Download progress file</button></div>`);
    b.querySelector('button').onclick = () => { S.exportFile(save); };
    document.body.prepend(b);
  }
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const isWord = id => hasOwn(WORDS, id);

  // ================= utils =================
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uniq = a => [...new Set(a)];
  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  const LA2WORD = Object.create(null);
  Object.entries(WORDS).forEach(([id, w]) => { LA2WORD[w.la.toLowerCase()] = id; });

  // ================= sound effects =================
  const Sfx = {
    ctx: null,
    ensure() {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(f, t0, dur, type = 'sine', vol = 0.15) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    },
    play(name) {
      if (!save.settings.sound || !this.ensure()) return;
      if (name === 'ok') { this.tone(660, 0, 0.12, 'triangle'); this.tone(990, 0.09, 0.2, 'triangle'); }
      else if (name === 'bad') { this.tone(220, 0, 0.18, 'sawtooth', 0.06); this.tone(165, 0.12, 0.25, 'sawtooth', 0.06); }
      else if (name === 'done') { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.1, 0.3, 'triangle', 0.12)); }
      else if (name === 'tap') this.tone(880, 0, 0.04, 'sine', 0.05);
      else if (name === 'combo') { this.tone(1175, 0, 0.08, 'square', 0.04); this.tone(1568, 0.07, 0.12, 'square', 0.04); }
      else if (name === 'ach') { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, i * 0.08, 0.2, 'sine', 0.12)); }
    }
  };

  // ================= text-to-speech =================
  const Voice = {
    list: [], warned: false,
    init() {
      if (!this.supported()) return;
      const load = () => { this.list = speechSynthesis.getVoices(); syncVoiceClass(); };
      load();
      speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', load);
    },
    supported() { return 'speechSynthesis' in window; },
    candidates() { return this.list.filter(v => /^(la|es|it)/i.test(v.lang)); },
    chosen() {
      const c = this.candidates(); if (!c.length) return null;
      // Spanish first: its written accent reliably forces our stress; a Latin voice gets no stress cue
      return c.find(v => v.voiceURI === save.settings.voiceURI) || c.find(v => /^es/i.test(v.lang)) ||
        c.find(v => /^it/i.test(v.lang)) || c.find(v => /^la/i.test(v.lang));
    },
    available() { return this.supported() && save.settings.tts && !!this.chosen(); },
    canForce() { const v = this.available() && this.chosen(); return !!v && /^(es|it)/i.test(v.lang); },
    /** Speak a word with the stress forced onto syllable idx (for "hear the stress" drills). */
    speakForced(word, idx) {
      const v = this.chosen(); if (!v || !save.settings.tts) return;
      this._say(L.ttsWord(word, v.lang.slice(0, 2).toLowerCase(), idx), v, save.settings.ttsRate * 0.9);
    },
    speak(text, rate) {
      if (!this.supported() || !save.settings.tts) return;
      const v = this.chosen();
      if (!v) return;
      this._say(L.ttsText(text, v.lang.slice(0, 2).toLowerCase()), v, rate || save.settings.ttsRate);
    },
    stop() { this._tok = (this._tok || 0) + 1; if (this.supported()) speechSynthesis.cancel(); },
    /**
     * Only the latest request is ever spoken. Chrome may drop or delay an utterance queued in the
     * same tick as cancel(), so after cancelling we wait a moment; a newer tap supersedes older ones.
     * The utterance is kept on `this` so it is not garbage-collected mid-speech.
     */
    _say(str, v, rate) {
      const tok = this._tok = (this._tok || 0) + 1;
      const busy = speechSynthesis.speaking || speechSynthesis.pending;
      if (busy) speechSynthesis.cancel();
      const go = () => {
        if (tok !== this._tok) return;
        const u = new SpeechSynthesisUtterance(str);
        u.voice = v; u.lang = v.lang; u.rate = rate;
        this.u = u;
        if (speechSynthesis.paused) speechSynthesis.resume();
        speechSynthesis.speak(u);
      };
      if (busy) setTimeout(go, 60); else go();
    }
  };
  /** Speak after a short delay — but only if the learner is still on that same exercise. */
  function sayLater(ex, text, ms = 250) {
    const rid = Run.id;
    setTimeout(() => { if (Run.active && Run.id === rid && Run.cur === ex && Run.state === 'answer') Voice.speak(text); }, ms);
  }

  /** Hide all 🔊 buttons when no usable voice exists (instead of dead buttons). */
  function syncVoiceClass() { document.body.classList.toggle('novoice', !Voice.available()); }

  // ================= Latin rendering =================
  /** One word, syllables separated, stressed syllable highlighted. */
  function wordHTML(raw, opts = {}) {
    const a = L.analyze(raw);
    if (opts.plain) return `<span class="lw">${esc(a.display)}</span>`;
    const sep = opts.dots === false ? '' : '<span class="dot">·</span>';
    return '<span class="lw">' + a.syllables.map((s, i) =>
      `<span class="syl${i === a.stress && a.n > 1 ? ' st' : ''}">${esc(s.text)}</span>`).join(sep) + '</span>';
  }
  /** A sentence; each word is tappable for a gloss. */
  function textHTML(text, opts = {}) {
    return L.tokenize(text).map(t => t.word
      ? `<span class="tok" data-w="${esc(t.w)}">${wordHTML(t.w, { dots: false, plain: opts.plain })}</span>`
      : esc(t.w)).join('');
  }
  function glossFor(raw) {
    const c = L.clean(raw).toLowerCase();
    if (hasOwn(GLOSS, c)) return GLOSS[c];
    if (LA2WORD[c]) return WORDS[LA2WORD[c]].en;
    return '…';
  }
  function speakBtn(text, cls = '') {
    return `<button class="spk ${cls}" data-say="${esc(text)}" title="Listen" aria-label="Listen">🔊</button>`;
  }
  const respellAt = (raw, i) => { const p = L.respell(raw).toLowerCase().split('-'); p[i] = p[i].toUpperCase(); return p.join('-'); };
  const srcBadge = s => s && s.src ? `<div class="src">📜 ${esc(s.src)}</div>` : '';

  // global click helpers: speak buttons & gloss bubbles
  document.addEventListener('click', e => {
    const sp = e.target.closest('[data-say]');
    if (sp) { e.stopPropagation(); Voice.speak(sp.dataset.say, sp.classList.contains('slow') ? 0.5 : undefined); return; }
    const tok = e.target.closest('.tok');
    $$('.gloss').forEach(g => g.remove());
    if (tok && !tok.closest('.nogloss')) {
      const g = el(`<div class="gloss"><b>${esc(L.clean(tok.dataset.w))}</b> — ${esc(glossFor(tok.dataset.w))}<div class="gr">${esc(L.respell(tok.dataset.w))}</div></div>`);
      document.body.appendChild(g);
      const r = tok.getBoundingClientRect();
      g.style.left = Math.max(8, Math.min(window.innerWidth - g.offsetWidth - 8, r.left + r.width / 2 - g.offsetWidth / 2)) + 'px';
      g.style.top = (r.top + window.scrollY - g.offsetHeight - 8) + 'px';
      Voice.speak(tok.dataset.w);
    }
  });

  // ================= toasts, modal, confetti =================
  function toast(html, ms = 3200) {
    const t = el(`<div class="toast">${html}</div>`);
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 400);
  }
  function modal(html, buttons = [{ label: 'OK', primary: true }]) {
    return new Promise(res => {
      const m = el(`<div class="modal-bg"><div class="modal">${html}<div class="mbtns"></div></div></div>`);
      buttons.forEach((b, i) => {
        const btn = el(`<button class="btn ${b.primary ? 'primary' : b.danger ? 'danger' : 'ghost'}">${b.label}</button>`);
        btn.onclick = () => { m.remove(); res(b.value !== undefined ? b.value : i); };
        $('.mbtns', m).appendChild(btn);
      });
      m.addEventListener('click', e => { if (e.target === m) { m.remove(); res(null); } });
      document.body.appendChild(m);
    });
  }
  function confetti() {
    const c = el('<canvas class="confetti"></canvas>'); document.body.appendChild(c);
    const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const cols = ['#d99a1e', '#c0583a', '#7b3fe4', '#3f9b2f', '#2f7fc0', '#e5484d'];
    const P = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5,
      vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 6, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, col: pick(cols) }));
    let t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
      if (t - t0 < 3000) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }

  // ================= progress model =================
  const ALL_LESSONS = UNITS.flatMap(u => u.lessons.filter(l => !l.hidden).map(l => ({ u, l })));
  const lst = id => save.lessons[id] || { lvl: 0, best: 0, last: 0, n: 0 };
  /**
   * A lesson opens when the previous REGULAR lesson is done. Unit reviews (🏆) open when every
   * lesson of their unit is done, and never block the path — so old progress stays unlocked.
   */
  function unlocked(id) {
    if (save.settings.unlockAll || lst(id).lvl > 0) return true;
    const i = ALL_LESSONS.findIndex(x => x.l.id === id);
    if (i < 0) return false;
    const { u, l } = ALL_LESSONS[i];
    if (l.review) return u.lessons.filter(x => !x.hidden && !x.review).every(x => lst(x.id).lvl > 0);
    const prev = ALL_LESSONS.slice(0, i).filter(x => !x.l.review).pop();
    return !prev || lst(prev.l.id).lvl > 0;
  }
  // ---- medals for replaying a lesson (Duolingo-style): 1st replay bronze, 2nd silver, 3rd gold ----
  const MEDALS = [null, null, ['bronze', '🥉', 'Bronze'], ['silver', '🥈', 'Silver'], ['gold', '🥇', 'Gold']];
  const medalOf = n => MEDALS[Math.min(4, n || 0)];
  const MEDAL_XP = { bronze: 5, silver: 10, gold: 15 };
  const need = n => 25 * (n - 1) * n;
  function levelInfo(xp) {
    xp = Math.max(0, Math.min(1e9, Number(xp) || 0));
    let lvl = Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 6.25)) / 2));
    while (need(lvl + 1) <= xp) lvl++; // float safety (at most a step or two)
    while (lvl > 1 && need(lvl) > xp) lvl--;
    return { lvl, cur: xp - need(lvl), span: need(lvl + 1) - need(lvl) };
  }
  const RANKS = [[1, 'Tīrō', 'recruit'], [3, 'Mīles', 'soldier'], [5, 'Decuriō', 'squad leader'], [8, 'Centuriō', 'centurion'],
    [12, 'Tribūnus', 'tribune'], [16, 'Lēgātus', 'legate'], [20, 'Praetor', 'magistrate'], [25, 'Cōnsul', 'consul'], [30, 'Imperātor', 'commander']];
  const rankOf = lvl => RANKS.filter(r => r[0] <= lvl).pop();
  const learnedIds = () => Object.keys(save.words).filter(isWord);
  // ---- spaced repetition: a word is due after 0,1,2,4,8,16,30 days depending on strength ----
  const INTERVAL = [0, 1, 2, 4, 8, 16, 30];
  const dueAt = id => { const w = save.words[id]; return w.last + INTERVAL[Math.min(6, Math.floor(w.s))] * 864e5; };
  const dueIds = () => learnedIds().filter(id => !WORDS[id].proper && dueAt(id) <= Date.now()).sort((a, b) => dueAt(a) - dueAt(b));
  function wordEff(id) {
    const w = save.words[id]; if (!w) return -1;
    const days = (Date.now() - w.last) / 864e5;
    return w.s - days / Math.pow(2, w.s);
  }
  function touchWord(id) { if (isWord(id) && !save.words[id]) save.words[id] = { s: 0, last: Date.now(), c: 0, w: 0 }; }
  function recordWord(id, ok) {
    if (!isWord(id)) return;
    touchWord(id);
    const w = save.words[id]; w.last = Date.now();
    if (ok) { w.c++; w.s = Math.min(5, w.s + 1); } else { w.w++; w.s = Math.max(0, w.s - 1); }
  }

  // ================= achievements =================
  const ACH = [
    { id: 'first_lesson', icon: '🎓', name: 'Prīmus gradus', desc: 'Finish your first lesson', test: () => S.total(save, 'lessons') >= 1, prog: () => [S.total(save, 'lessons'), 1] },
    { id: 'unit_sounds', icon: '🗣️', name: 'Ōrātor', desc: 'Finish the pronunciation unit', test: () => UNITS[0].lessons.every(l => lst(l.id).lvl > 0) },
    { id: 'perfect_1', icon: '💎', name: 'Sine errōre', desc: 'A lesson with no mistakes', test: () => S.total(save, 'perfect') >= 1, prog: () => [S.total(save, 'perfect'), 1] },
    { id: 'perfect_10', icon: '👑', name: 'Perfectus', desc: '10 flawless lessons', test: () => S.total(save, 'perfect') >= 10, prog: () => [S.total(save, 'perfect'), 10] },
    { id: 'stress_50', icon: '🎯', name: 'Accentus', desc: '50 correct stress answers', test: () => S.total(save, 'stress') >= 50, prog: () => [S.total(save, 'stress'), 50] },
    { id: 'stress_300', icon: '🏹', name: 'Sagittārius', desc: '300 correct stress answers', test: () => S.total(save, 'stress') >= 300, prog: () => [S.total(save, 'stress'), 300] },
    { id: 'streak_3', icon: '🔥', name: 'Trīduum', desc: '3-day streak', test: () => S.streak(save) >= 3, prog: () => [S.streak(save), 3] },
    { id: 'streak_7', icon: '🌋', name: 'Hebdomas', desc: '7-day streak', test: () => S.streak(save) >= 7, prog: () => [S.streak(save), 7] },
    { id: 'streak_30', icon: '☄️', name: 'Mēnsis', desc: '30-day streak', test: () => S.streak(save) >= 30, prog: () => [S.streak(save), 30] },
    { id: 'xp_100', icon: '⭐', name: 'Centum', desc: 'Earn 100 XP', test: () => S.totalXP(save) >= 100, prog: () => [S.totalXP(save), 100] },
    { id: 'xp_1000', icon: '🌟', name: 'Mīlle', desc: 'Earn 1000 XP', test: () => S.totalXP(save) >= 1000, prog: () => [S.totalXP(save), 1000] },
    { id: 'words_50', icon: '📚', name: 'Lexicon', desc: 'Learn 50 words', test: () => learnedIds().length >= 50, prog: () => [learnedIds().length, 50] },
    { id: 'quote_1', icon: '📜', name: 'Lēctor', desc: 'Finish a lesson with a classical quote', test: () => ALL_LESSONS.some(x => (x.l.sentences || []).some(s => s.src) && lst(x.l.id).lvl > 0) },
    { id: 'classics', icon: '🏺', name: 'Philologus', desc: 'Finish every classics lesson', test: () => UNITS.filter(u => u.id.startsWith('u_classics')).every(u => u.lessons.every(l => lst(l.id).lvl > 0)) },
    { id: 'lvl5', icon: '🏆', name: 'Magister', desc: 'Take any lesson to level 5', test: () => ALL_LESSONS.some(x => lst(x.l.id).lvl >= 5) },
    { id: 'arena_20', icon: '⚔️', name: 'Gladiātor', desc: 'Score 20 in the Accent Arena', test: () => save.records.arenaBest >= 20, prog: () => [save.records.arenaBest, 20] },
    { id: 'arena_40', icon: '🦁', name: 'Victor', desc: 'Score 40 in the Accent Arena', test: () => save.records.arenaBest >= 40, prog: () => [save.records.arenaBest, 40] },
    { id: 'all_done', icon: '🏛️', name: 'Opus perfectum', desc: 'Finish every lesson in the course', test: () => ALL_LESSONS.every(x => lst(x.l.id).lvl > 0) },
    { id: 'backup', icon: '💾', name: 'Tabellārius', desc: 'Save your progress to a file or code', test: () => save.lastExportAt > 0 },
    { id: 'fabula_1', icon: '📖', name: 'Fābulātor', desc: 'Read your first Latin story', test: () => ALL_LESSONS.some(x => x.l.story && lst(x.l.id).lvl > 0) },
    { id: 'review_1', icon: '🏆', name: 'Probātus', desc: 'Pass a unit review', test: () => ALL_LESSONS.some(x => x.l.review && lst(x.l.id).lvl > 0) },
    { id: 'medal_gold', icon: '🥇', name: 'Aurum', desc: 'Earn a gold medal (replay a lesson 3 times)', test: () => ALL_LESSONS.some(x => lst(x.l.id).n >= 4) },
    { id: 'medal_gold_10', icon: '👑', name: 'Thēsaurus', desc: '10 gold medals', test: () => ALL_LESSONS.filter(x => lst(x.l.id).n >= 4).length >= 10, prog: () => [ALL_LESSONS.filter(x => lst(x.l.id).n >= 4).length, 10] }
  ];
  // ================= daily quests =================
  // Stored in save.ext.daily (ext = free space, see AGENTS.md). Resets each day.
  const QUESTS = {
    xp: { icon: '⭐', text: () => `Earn ${save.profile.dailyGoal} XP`, val: () => S.xpToday(save), goal: () => save.profile.dailyGoal },
    stress: { icon: '🎯', text: () => 'Get 15 stress answers right', val: d => d.stress, goal: () => 15 },
    perfect: { icon: '💎', text: () => 'Finish a lesson with no mistakes', val: d => d.perfect, goal: () => 1 },
    lessons: { icon: '🎓', text: () => 'Complete 2 lessons', val: d => d.lessons, goal: () => 2 },
    quote: { icon: '📜', text: () => 'Translate a classical quote', val: d => d.quote, goal: () => 1 },
    arena: { icon: '⚔️', text: () => 'Score 10+ in the Accent Arena', val: d => d.arena, goal: () => 10 }
  };
  function daily() {
    const today = S.dayKey();
    let d = save.ext.daily;
    if (!d || typeof d !== 'object' || d.day !== today) {
      d = save.ext.daily = { day: today, stress: 0, perfect: 0, lessons: 0, quote: 0, arena: 0, claimed: {} };
    }
    if (!d.claimed || typeof d.claimed !== 'object') d.claimed = {};
    return d;
  }
  function todaysQuests() {
    // xp quest + 2 others chosen deterministically from the date (same on every device)
    const others = ['stress', 'perfect', 'lessons', 'quote', 'arena'];
    let h = 0; for (const ch of S.dayKey()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const a = others[h % 5], b = others[(h % 5 + 1 + (h >> 3) % 4) % 5];
    return ['xp', a, b];
  }
  function dailyBump(field, n = 1, max) {
    const d = daily();
    d[field] = max ? Math.max(Number(d[field]) || 0, n) : (Number(d[field]) || 0) + n;
  }
  function checkQuests() {
    const d = daily(), qs = todaysQuests();
    qs.forEach((id, i) => {
      const q = QUESTS[id];
      if (!d.claimed[id] && q.val(d) >= q.goal()) {
        d.claimed[id] = 1; S.addXP(save, DEVICE, 10);
        setTimeout(() => { Sfx.play('ach'); toast(`<span class="ti">🎁</span><div><b>Quest complete!</b> +10 XP<br><small>${q.text()}</small></div>`, 3500); }, 400 + i * 700);
      }
    });
    if (!d.claimed.all && qs.every(id => d.claimed[id])) {
      d.claimed.all = 1; S.addXP(save, DEVICE, 20);
      setTimeout(() => { Sfx.play('done'); toast('<span class="ti">🏺</span><div><b>All quests done!</b> Bonus chest +20 XP</div>', 4000); }, 2200);
    }
  }
  function questsHTML() {
    const d = daily();
    return `<div class="card quests"><h2 class="h2">🗓️ Daily quests</h2>${todaysQuests().map(id => {
      const q = QUESTS[id], v = Math.min(q.val(d), q.goal()), g = q.goal(), done = !!d.claimed[id];
      return `<div class="quest ${done ? 'done' : ''}"><span class="qi">${done ? '✅' : q.icon}</span><div class="qb"><div>${q.text()}</div><div class="qbar"><i style="width:${v / g * 100}%"></i></div></div><span class="qv">${v}/${g}</span></div>`;
    }).join('')}<p class="muted small">Each quest +10 XP · all three → 🏺 +20 XP</p></div>`;
  }

  function checkAchievements() {
    const got = [];
    for (const a of ACH) if (!save.achievements[a.id] && a.test()) { save.achievements[a.id] = Date.now(); got.push(a); }
    got.forEach((a, i) => setTimeout(() => { Sfx.play('ach'); toast(`<span class="ti">${a.icon}</span><div><b>${a.name}</b><br><small>${a.desc}</small></div>`, 4000); }, 600 + i * 900));
    return got;
  }

  // ================= top bar & navigation =================
  function ring(frac) {
    const r = 15, C = 2 * Math.PI * r;
    return `<svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="${r}" class="rbg"/><circle cx="18" cy="18" r="${r}" class="rfg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(1, frac))}"/></svg>`;
  }
  function renderTop() {
    const xp = S.totalXP(save), li = levelInfo(xp), today = S.xpToday(save), goal = save.profile.dailyGoal;
    const st = S.streak(save), studiedToday = today > 0;
    $('#top').innerHTML = `
      <div class="brand">🦉 <span>LATINUM</span></div>
      <div class="stats">
        <div class="stat ${studiedToday ? 'fire' : 'cold'}" title="Day streak">🔥 ${st}</div>
        <div class="stat" title="Total XP">⭐ ${xp}</div>
        <div class="stat goal" title="Daily goal: ${today}/${goal} XP">${ring(today / goal)}<span>${Math.min(today, goal)}/${goal}</span></div>
        <div class="stat lvl" title="${rankOf(li.lvl)[1]} — level ${li.lvl}">Lv ${li.lvl}</div>
      </div>`;
  }
  const NAV = [['learn', '🏛️', 'Learn'], ['practice', '🔁', 'Practice'], ['arena', '🎯', 'Arena'], ['sounds', '🗣️', 'Sounds'], ['profile', '👤', 'Profile']];
  let current = 'learn';
  function go(name) {
    current = name;
    $('#nav').innerHTML = NAV.map(([id, ic, lb]) => `<button data-nav="${id}" class="${id === name ? 'on' : ''}"><span>${ic}</span><small>${lb}</small></button>`).join('');
    const scr = $('#screen'); scr.innerHTML = ''; scr.scrollTop = 0; window.scrollTo(0, 0);
    ({ learn: renderLearn, practice: renderPractice, arena: renderArenaHome, sounds: renderSounds, profile: renderProfile })[name](scr);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-nav]'); if (b) { Sfx.play('tap'); go(b.dataset.nav); } });

  // ================= LEARN (path) =================
  const OFFS = [0, 56, 84, 56, 0, -56, -84, -56];
  function renderLearn(scr) {
    if (S.readOnlyReason) scr.appendChild(el(`<div class="banner bad">⚠️ ${esc(S.readOnlyReason)} Progress will NOT be saved until you update.</div>`));
    const xp = S.totalXP(save);
    const days = save.lastExportAt ? (Date.now() - save.lastExportAt) / 864e5 : Infinity;
    if (xp >= 30 && days > 7) {
      const b = el(`<div class="banner">💾 ${save.lastExportAt ? `Last backup was ${Math.floor(days)} days ago.` : 'You have never backed up your progress.'} <button class="btn small">Back up</button></div>`);
      $('button', b).onclick = () => go('profile');
      scr.appendChild(b);
    }
    const due = dueIds();
    if (due.length >= 3) {
      const b = el(`<div class="banner review">🔁 <b>${due.length} words</b> are due for review — keep them fresh! <button class="btn small primary">Review</button></div>`);
      $('button', b).onclick = () => startLesson(null, 'review');
      scr.appendChild(b);
    }
    if (S.totalXP(save) > 0) scr.appendChild(el(questsHTML()));
    let k = 0, part = 0;
    const firstOpen = ALL_LESSONS.find(x => !x.l.review && unlocked(x.l.id) && lst(x.l.id).lvl === 0);
    const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    UNITS.forEach(u => {
      if (u.part && u.part !== part) {
        part = u.part;
        const P = (window.Course.PARTS || []).find(p => p.n === part);
        if (P) scr.appendChild(el(`<div class="parthead"><div class="pnum">PARS ${ROMAN[part] || part}</div><h2>${esc(P.la)} <span class="muted">· ${esc(P.en)}</span></h2><p>🎯 ${P.goal}</p></div>`));
      }
      const ls = u.lessons.filter(l => !l.hidden);
      const done = ls.filter(l => lst(l.id).lvl > 0).length;
      const sec = el(`<section class="unit" style="--uc:${u.color}">
        <div class="uhead"><div class="uicon">${u.icon}</div><div><h2>${esc(u.title)}</h2><p>${esc(u.sub)} · ${done}/${ls.length}</p>${u.gram ? `<p class="ugram">🧩 ${esc(u.gram)}</p>` : ''}</div></div>
        <div class="path"></div></section>`);
      const path = $('.path', sec);
      ls.forEach(l => {
        const s = lst(l.id), open = unlocked(l.id), isNext = firstOpen && firstOpen.l.id === l.id;
        const md = medalOf(s.n);
        const cls = !open ? 'locked' : md ? 'medal-' + md[0] : s.lvl > 0 ? 'done' : 'open';
        const badge = l.story ? '📖' : (l.sentences || []).some(x => x.src) ? '📜' : '';
        const n = el(`<div class="node-wrap" style="transform:translateX(${OFFS[k++ % OFFS.length]}px)">
          ${isNext ? '<div class="start-tag">START</div>' : ''}
          <button class="node ${cls} ${isNext ? 'next' : ''} ${l.review ? 'review' : ''}" aria-label="${esc(l.title)}">
            <span class="nicon">${open ? l.icon || '⭐' : '🔒'}</span>
            ${badge ? `<span class="qbadge">${badge}</span>` : ''}
            ${md ? `<span class="medal">${md[1]}</span>` : ''}
          </button>
          <div class="crowns">${s.lvl > 0 ? '★'.repeat(Math.min(5, s.lvl)) + '☆'.repeat(Math.max(0, 5 - s.lvl)) : ''}</div>
          <div class="nlabel">${esc(l.title)}</div></div>`);
        $('.node', n).onclick = () => { Sfx.play('tap'); lessonPopup(u, l); };
        path.appendChild(n);
      });
      scr.appendChild(sec);
    });
    scr.appendChild(el(`<div class="endnote">🏛️ More units coming — <i>Rōma nōn ūnō diē aedificāta est</i> <span class="muted">(medieval proverb)</span></div>`));
    if (firstOpen) setTimeout(() => { const n = $('.node.next'); n && n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 50);
  }
  async function lessonPopup(u, l) {
    const s = lst(l.id), open = unlocked(l.id);
    const words = l.words.map(id => WORDS[id]).filter(Boolean);
    const md = medalOf(s.n), nextMd = s.n >= 1 && s.n < 4 ? medalOf(s.n + 1) : null;
    const medalRow = s.n >= 1 ? `<div class="medals">${[2, 3, 4].map(i => `<span class="${s.n >= i ? 'got' : ''}" title="${MEDALS[i][2]}">${MEDALS[i][1]}</span>`).join('')}</div>
      <p class="muted small">${nextMd ? `Replay for <b>${nextMd[1]} ${nextMd[2]}</b> · +${MEDAL_XP[nextMd[0]]} bonus XP` : '🥇 All medals earned!'}</p>` : '';
    const html = `<div class="lp" style="--uc:${u.color}"><div class="lpicon">${l.icon || '⭐'}</div><h2>${esc(l.title)}</h2>
      <p class="muted">${esc(u.title)} · ${s.lvl > 0 ? `Level ${s.lvl}/5 · best ${s.best}%${md ? ' · ' + md[1] : ''}` : 'New lesson'}</p>
      ${l.gram ? `<p class="lgram">${l.review ? '🏆' : l.story ? '📖' : '🧩'} ${esc(l.gram)}</p>` : ''}
      ${medalRow}
      <div class="chips">${words.slice(0, 12).map(w => `<span class="chip">${w.img} ${wordHTML(w.la, { dots: false })}</span>`).join('')}${words.length > 12 ? `<span class="chip">+${words.length - 12}</span>` : ''}</div>
      ${open ? '' : `<p class="muted">🔒 ${l.review ? 'Finish every lesson of this unit to unlock the review.' : 'Finish the previous lesson first'} (or enable "Unlock all" in Profile).</p>`}</div>`;
    const btns = [{ label: 'Close', value: 'x' }];
    if (l.tip) btns.unshift({ label: '💡 Tips', value: 'tip' });
    if (open) btns.push({ label: s.lvl === 0 ? 'Start' : nextMd ? `Replay → ${nextMd[1]}` : s.lvl < 5 ? `Level up → ${s.lvl + 1}` : 'Practise ★', primary: true, value: 'go' });
    const r = await modal(html, btns);
    if (r === 'tip') { await modal(`<div class="tip">${l.tip}</div>`, [{ label: 'Got it', primary: true }]); lessonPopup(u, l); }
    if (r === 'go') {
      // first time: show the rules before the lesson (they ARE the teaching)
      if (s.lvl === 0 && l.tip) {
        const t = await modal(`<div class="tip">${l.tip}</div>`, [{ label: 'Back', value: 0 }, { label: 'Start lesson', primary: true, value: 1 }]);
        if (t !== 1) return;
      }
      startLesson(l);
    }
  }

  // ================= exercise generation =================
  const meanings = w => [w.en, ...(w.alt || [])].map(s => s.toLowerCase());
  function wordPool(extra = []) {
    const ids = new Set([...learnedIds(), ...extra]);
    if (ids.size < 10) Object.keys(WORDS).forEach(id => ids.add(id));
    return [...ids];
  }
  function distractors(id, n, pool, mode) {
    const w = WORDS[id], m = new Set(meanings(w)), res = [];
    for (const d of shuffle(pool)) {
      if (d === id || res.includes(d)) continue;
      const dw = WORDS[d];
      if (meanings(dw).some(x => m.has(x))) continue;
      if (L.normLatin(dw.la) === L.normLatin(w.la)) continue;
      if (mode === 'img' && (dw.img === w.img || !canPic(d) || (w.grp && dw.grp === w.grp) || res.some(r => WORDS[r].img === dw.img))) continue;
      if (res.some(r => WORDS[r].en === dw.en)) continue;
      res.push(d); if (res.length >= n) break;
    }
    return res;
  }
  const canPic = id => !WORDS[id].nopic && !WORDS[id].proper;
  function mk(type, id, pool) {
    if (type === 'pic' && !canPic(id)) type = 'la2en';
    const ex = { type, id };
    if (['pic', 'la2en', 'en2la', 'listen'].includes(type)) ex.opts = shuffle([id, ...distractors(id, 3, pool, type === 'pic' ? 'img' : '')]);
    return ex;
  }
  /** up to 5 words with distinct meanings (no ambiguous pairs) */
  function matchSet(ids) {
    const out = [], seen = new Set();
    for (const id of uniq(ids)) { const m = meanings(WORDS[id]); if (m.some(x => seen.has(x))) continue; m.forEach(x => seen.add(x)); out.push(id); if (out.length >= 5) break; }
    return shuffle(out);
  }
  function stressCandidates(words, sentences) {
    const fromWords = words.map(id => WORDS[id].la);
    const fromSent = (sentences || []).flatMap(s => L.tokenize(s.la).filter(t => t.word).map(t => t.w));
    const all = uniq([...fromWords, ...fromSent]).filter(w => L.analyze(w).n >= 2);
    const three = shuffle(all.filter(w => L.analyze(w).n >= 3)), two = shuffle(all.filter(w => L.analyze(w).n === 2));
    return [...three, ...two];
  }
  function allStressWords() {
    const s = new Set(Object.values(WORDS).map(w => w.la));
    ALL_LESSONS.forEach(x => (x.l.sentences || []).forEach(se => L.tokenize(se.la).forEach(t => t.word && s.add(t.w))));
    return [...s].filter(w => L.analyze(w).n >= 2);
  }

  const formEx = d => ({ type: 'form', d });
  /** 🏆 Unit review: a mix of every topic of the unit — no new words, just recall. */
  function buildReview(lesson) {
    const src = (lesson.from || []).map(id => window.Course.LESSON_INDEX[id]).filter(Boolean).map(x => x.lesson);
    const words = lesson.words.filter(isWord), quiz = words.filter(id => !WORDS[id].proper);
    const pool = wordPool(words), items = [];
    const sentences = src.flatMap(l => l.sentences || []), drills = src.flatMap(l => l.drills || []);
    shuffle(quiz).slice(0, 7).forEach((id, i) => items.push(mk(['pic', 'la2en', 'en2la', 'type'][i % 4], id, pool)));
    shuffle(lesson.pairs || []).slice(0, 2).forEach(p => items.push({ type: 'macron', pair: p, target: pick(p) }));
    const cands = stressCandidates(words, sentences);
    cands.slice(0, lesson.focus === 'stress' ? 6 : 3).forEach((w, i) => items.push({ type: ['stressTap', 'stressPick', 'weigh'][i % 3], word: w }));
    shuffle(drills).slice(0, 5).forEach(d => items.push(formEx(d)));
    shuffle(sentences).slice(0, 4).forEach((s, i) => items.push({ type: i % 2 ? 'buildLa' : 'buildEn', s }));
    src.filter(l => l.story).forEach(l => items.push({ type: 'storyQ', story: l.story, q: pick(l.story.qs) }));
    if (Voice.available() && save.settings.listening) shuffle(quiz).slice(0, 2).forEach(id => items.push(mk('listen', id, pool)));
    const match = { type: 'match', ids: matchSet(shuffle(quiz)) };
    if (match.ids.length >= 4) items.push(match);
    if (lst(lesson.id).lvl >= 2) items.forEach(x => { x.plain = true; });
    return shuffle(items);
  }

  function buildLesson(lesson) {
    if (lesson.review) return buildReview(lesson);
    const lvl = lst(lesson.id).lvl;
    const words = lesson.words.filter(id => WORDS[id]);
    const pool = wordPool(words);
    const head = [], mid = [];
    const quiz = words.filter(id => !WORDS[id].proper); // names get stress drills, not translation quizzes
    for (const id of words) {
      if (!save.words[id] || lvl === 0) head.push({ type: 'teach', id });
      if (WORDS[id].proper) continue;
      if (lvl === 0 || Math.random() < 0.5) head.push(mk(canPic(id) && Math.random() < 0.6 ? 'pic' : 'la2en', id, pool));
    }
    // 📖 the story is read right after the new words, then its comprehension questions
    if (lesson.story) {
      head.push({ type: 'story', story: lesson.story });
      lesson.story.qs.forEach(q => head.push({ type: 'storyQ', story: lesson.story, q }));
    }
    // 🧩 grammar drills: all of them the first time, a selection on replays
    shuffle(lesson.drills || []).slice(0, lvl === 0 ? 8 : 5).forEach(d => mid.push(formEx(d)));
    (lesson.pairs || []).forEach(p => mid.push({ type: 'macron', pair: p, target: pick(p) }));
    const cands = stressCandidates(words, lesson.sentences);
    const has3 = cands.some(w => L.analyze(w).n >= 3);
    const nStress = lesson.focus === 'stress' ? (has3 ? 5 : 3) : 2;
    cands.slice(0, nStress).forEach((w, i) => mid.push({ type: i % 2 ? 'stressPick' : 'stressTap', word: w }));
    const three = cands.filter(w => L.analyze(w).n >= 3);
    if (lesson.focus === 'stress' && three.length) shuffle(three).slice(0, 2).forEach(w => mid.push({ type: 'weigh', word: w }));
    if (Voice.canForce() && three.length) mid.push({ type: 'stressHear', word: pick(three) });
    shuffle(quiz).slice(0, 4).forEach(id => mid.push(mk(lvl >= 2 && Math.random() < 0.5 ? 'type' : 'en2la', id, pool)));
    if (lvl >= 1) shuffle(quiz).slice(0, 2).forEach(id => mid.push(mk('type', id, pool)));
    if (pool.length >= 5) mid.push({ type: 'match', ids: matchSet([...shuffle(quiz), ...shuffle(learnedIds().filter(id => !WORDS[id].proper))]) });
    if (Voice.available() && save.settings.listening) shuffle(quiz).slice(0, lvl >= 1 ? 2 : 1).forEach(id => mid.push(mk('listen', id, pool)));
    shuffle(lesson.sentences || []).slice(0, 4).forEach((s, i) => mid.push({ type: (i + lvl) % 2 ? 'buildLa' : 'buildEn', s }));
    learnedIds().filter(id => !words.includes(id) && !WORDS[id].proper).sort((a, b) => wordEff(a) - wordEff(b)).slice(0, 2)
      .forEach(id => mid.push(mk(pick(['la2en', 'en2la']), id, pool)));
    // match must have >= 4 items
    const fixed = mid.filter(x => x.type !== 'match' || x.ids.length >= 4);
    // sentences tend to come later
    // from level 3 on, stress marks are hidden in prompts and options: recall, not recognition
    if (lvl >= 3) fixed.forEach(x => { x.plain = true; });
    const early = shuffle(fixed.filter(x => !x.s)), late = shuffle(fixed.filter(x => x.s));
    return [...head, ...early.slice(0, Math.ceil(early.length / 2)), ...shuffle([...early.slice(Math.ceil(early.length / 2)), ...late])];
  }
  function buildPractice(kind, extra) {
    if (kind === 'custom') return extra.slice(); // debug/testing: run exact exercise objects
    if (kind === 'missed') return shuffle(extra).map((w, i) => ({ type: i % 2 ? 'stressPick' : 'stressTap', word: w }));
    if (kind === 'mistakes') {
      const p = wordPool(extra.words);
      return shuffle([...extra.words.map(id => mk(pick(['la2en', 'en2la', 'type']), id, p)), ...extra.stress.map(w => ({ type: 'stressTap', word: w }))]);
    }
    if (kind === 'review') {
      const ids = dueIds().slice(0, 10), p = wordPool(ids);
      const items = ids.map(id => mk(pick(Voice.available() ? ['la2en', 'en2la', 'type', 'listen', 'pic'] : ['la2en', 'en2la', 'type', 'pic']), id, p));
      if (ids.length >= 4) items.push({ type: 'match', ids: matchSet(ids) });
      return shuffle(items);
    }
    const learned = learnedIds();
    const pool = wordPool();
    if (kind === 'stress') {
      const src = learned.length >= 6 ? stressCandidates(learned, doneSentences()) : shuffle(allStressWords());
      return shuffle(src).slice(0, 12).map((w, i) => ({ type: L.analyze(w).n >= 3 && i % 4 === 3 ? 'weigh' : i % 3 === 2 ? 'stressPick' : 'stressTap', word: w }));
    }
    if (kind === 'sentences') {
      return shuffle(doneSentences()).slice(0, 8).map((s, i) => ({ type: i % 2 ? 'buildLa' : 'buildEn', s }));
    }
    if (kind === 'grammar') return shuffle(doneDrills()).slice(0, 10).map(formEx);
    const weak = learned.filter(id => !WORDS[id].proper).sort((a, b) => wordEff(a) - wordEff(b)).slice(0, 8);
    const items = weak.map(id => mk(pick(Voice.available() ? ['la2en', 'en2la', 'type', 'listen', 'pic'] : ['la2en', 'en2la', 'type', 'pic']), id, pool));
    stressCandidates(weak).slice(0, 2).forEach(w => items.push({ type: 'stressTap', word: w }));
    if (weak.length >= 4) items.push({ type: 'match', ids: matchSet(weak) });
    return shuffle(items);
  }
  const doneSentences = () => ALL_LESSONS.filter(x => lst(x.l.id).lvl > 0).flatMap(x => x.l.sentences || []);
  const doneDrills = () => ALL_LESSONS.filter(x => lst(x.l.id).lvl > 0).flatMap(x => x.l.drills || []);
  /** Info screens (no answer to check): new word, story text. */
  const isInfo = t => t === 'teach' || t === 'story';

  // ================= lesson runner =================
  const PRAISE = [['Optimē!', 'excellent'], ['Bene!', 'good'], ['Euge!', 'bravo'], ['Rēctē!', 'correct'], ['Mīrābile!', 'wonderful'], ['Pulchrē!', 'beautiful'], ['Ita vērō!', 'yes indeed']];
  const OOPS = [['Nōn rēctē', 'not right'], ['Errāre hūmānum est', 'to err is human'], ['Iterum temptā', 'try again']];
  const NEAR = ['Paene!', 'almost'];
  const Run = { active: false };

  function startLesson(lesson, practiceKind, extra) {
    const items = practiceKind ? buildPractice(practiceKind, extra) : buildLesson(lesson);
    if (!items.length) { toast('Nothing to practise yet — finish a lesson first!'); return; }
    $$('#lesson').forEach(x => x.remove()); // never two lesson screens at once
    Run.id = (Run.id || 0) + 1;
    Object.assign(Run, { active: true, lesson, practiceKind, missedWords: new Set(), missedStress: new Set(), queue: items, done: 0, firstTry: 0, mistakes: 0, combo: 0, maxCombo: 0, t0: Date.now(), cur: null, state: 'answer', handle: null });
    $('#app').classList.add('in-lesson');
    const ls = el(`<div id="lesson">
      <header class="lhead"><button class="x" aria-label="Quit">✕</button><div class="bar"><div class="fill"></div></div><div class="combo"></div></header>
      <main id="lbody"></main>
      <footer id="lfoot" class="lfoot"><div id="lfb" aria-live="polite"></div><div class="row"><button id="lskip" class="btn ghost">Skip</button><button id="lgo" class="btn primary">Check</button></div></footer>
    </div>`);
    document.body.appendChild(ls);
    $('.x', ls).onclick = async () => {
      const r = await modal('<h3>Quit the lesson?</h3><p class="muted">Progress in this lesson will be lost.</p>', [{ label: 'Keep learning', primary: true, value: 0 }, { label: 'Quit', danger: true, value: 1 }]);
      if (r === 1) endLesson();
    };
    $('#lgo').onclick = onGo;
    $('#lskip').onclick = () => { if (Run.state === 'answer' && Run.handle && Run.handle.reveal) feedback(Run.handle.reveal()); };
    nextEx();
  }
  function endLesson() { Run.active = false; Voice.stop(); $('#lesson') && $('#lesson').remove(); $('#app').classList.remove('in-lesson'); go(current); }
  function updateBar() {
    const left = Run.queue.filter(x => !isInfo(x.type)).length;
    const tot = Run.done + left + (Run.cur && !isInfo(Run.cur.type) && Run.state === 'answer' ? 1 : 0);
    $('#lesson .fill').style.width = (tot ? (Run.done / tot) * 100 : 0) + '%';
    $('#lesson .combo').innerHTML = Run.combo >= 3 ? `<span class="cflame">🔥 ${Run.combo}</span>` : '';
  }
  function nextEx() {
    $$('.gloss').forEach(g => g.remove());
    Voice.stop(); // audio belongs to the exercise it was started in
    if (!Run.queue.length) return finishLesson();
    Run.cur = Run.queue.shift();
    Run.selectIndex = null;
    Run.state = 'answer';
    const body = $('#lbody'), foot = $('#lfoot'), go = $('#lgo'), skip = $('#lskip');
    body.innerHTML = ''; body.className = 'pop'; void body.offsetWidth; body.classList.add('in');
    foot.className = 'lfoot'; $('#lfb').innerHTML = '';
    const teach = isInfo(Run.cur.type);
    go.textContent = teach ? 'Continue' : 'Check'; go.disabled = !teach;
    skip.style.visibility = teach || Run.cur.type === 'match' ? 'hidden' : 'visible';
    go.style.visibility = Run.cur.type === 'match' ? 'hidden' : 'visible';
    const api = {
      ready: on => { if (Run.state === 'answer') go.disabled = !on; },
      done: res => feedback(res),
      submit: () => onGo()
    };
    Run.handle = EX[Run.cur.type](Run.cur, body, api) || {};
    updateBar();
  }
  function onGo() {
    if (Run.state === 'feedback') return nextEx();
    if (isInfo(Run.cur.type)) { if (Run.cur.id) touchWord(Run.cur.id); return nextEx(); }
    if ($('#lgo').disabled || !Run.handle.check) return;
    const res = Run.handle.check();
    if (res) feedback(res);
  }
  function feedback(res) {
    Run.state = 'feedback';
    const ex = Run.cur, ok = !!res.ok;
    (res.words || (ex.id ? [ex.id] : [])).forEach(id => recordWord(id, ok));
    S.bump(save, DEVICE, ok ? 'correct' : 'wrong');
    const isStress = ['stressTap', 'stressPick', 'weigh', 'stressHear'].includes(ex.type);
    if (ok && isStress) { S.bump(save, DEVICE, 'stress'); dailyBump('stress'); }
    if (ok && ex.s && ex.s.src) dailyBump('quote');
    if (!ok) { if (isStress) Run.missedStress.add(ex.word); else if (ex.id && isWord(ex.id)) Run.missedWords.add(ex.id); }
    if (ok) {
      Run.done++; Run.combo++; Run.maxCombo = Math.max(Run.maxCombo, Run.combo);
      if (!ex.retry) Run.firstTry++;
      Sfx.play(Run.combo % 5 === 0 ? 'combo' : 'ok');
    } else {
      Run.combo = 0; Run.mistakes++; Sfx.play('bad');
      if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) { /* ignore */ }
      let copy = Object.assign({}, ex, { retry: true });
      // retry with fresh options (and pic → en2la) so it can't be memorised by position
      if (copy.opts && copy.id) copy = Object.assign(mk(copy.type === 'pic' ? 'en2la' : copy.type, copy.id, wordPool([copy.id])), { retry: true });
      Run.queue.splice(Math.min(Run.queue.length, 2 + Math.floor(Math.random() * 3)), 0, copy);
    }
    const [t, tr] = ok ? pick(PRAISE) : res.near ? NEAR : pick(OOPS);
    const foot = $('#lfoot');
    foot.className = 'lfoot ' + (ok ? 'ok' : 'bad');
    $('#lfb').innerHTML = `<div class="fbt">${ok ? '✓' : '✗'} ${t} <small>(${tr})</small>${Run.combo >= 5 && ok ? ` <span class="cflame">🔥 ${Run.combo} combo!</span>` : ''}</div>${res.html ? `<div class="fbd">${res.html}</div>` : ''}`;
    $('#lgo').textContent = 'Continue'; $('#lgo').disabled = false; $('#lgo').style.visibility = 'visible';
    $('#lskip').style.visibility = 'hidden';
    $('#lbody').classList.add('locked');
    if (ok) { const f = $('#lesson .fill'); f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); }
    if (res.say) Voice.speak(res.say);
    updateBar();
  }
  function finishLesson() {
    const scored = Run.done || 1;
    const acc = Math.round((Run.firstTry / scored) * 100);
    const perfect = Run.mistakes === 0;
    const comboBonus = Math.floor(Run.maxCombo / 5) * 2;
    // practice/drills: base XP scales with length so 1-question runs can't be farmed
    const real = !!(Run.lesson && !Run.practiceKind);
    const base = real ? 10 : Math.min(10, Run.done);
    const perfectBonus = perfect && Run.done >= 6 ? 5 : 0;
    const xp = base + Run.firstTry + comboBonus + perfectBonus;
    const before = S.xpToday(save), goal = save.profile.dailyGoal;
    const lvBefore = levelInfo(S.totalXP(save)).lvl;
    S.addXP(save, DEVICE, xp);
    if (real) {
      S.bump(save, DEVICE, 'lessons'); dailyBump('lessons');
      if (perfect) { S.bump(save, DEVICE, 'perfect'); dailyBump('perfect'); }
    }
    checkQuests();
    let lvlUp = null, medal = null;
    if (Run.lesson && !Run.practiceKind) {
      const s = save.lessons[Run.lesson.id] || (save.lessons[Run.lesson.id] = { lvl: 0, best: 0, last: 0, n: 0 });
      if (s.lvl < 5) { s.lvl++; lvlUp = s.lvl; }
      s.best = Math.max(s.best, acc); s.last = Date.now(); s.n++;
      // a NEW medal on this replay → one-time bonus XP (n only grows, so each medal pays once)
      if (s.n >= 2 && s.n <= 4) { medal = medalOf(s.n); S.addXP(save, DEVICE, MEDAL_XP[medal[0]]); }
    }
    checkAchievements();
    commit();
    const xpAll = xp + (medal ? MEDAL_XP[medal[0]] : 0);
    const lvAfter = levelInfo(S.totalXP(save)).lvl;
    const secs = Math.round((Date.now() - Run.t0) / 1000);
    Sfx.play('done'); confetti();
    const goalHit = before < goal && S.xpToday(save) >= goal;
    $('#lfoot').className = 'lfoot'; $('#lfb').innerHTML = '';
    $('#lskip').style.visibility = 'hidden';
    $('.lhead .fill').style.width = '100%';
    $('#lbody').className = 'pop in';
    $('#lbody').innerHTML = `<div class="result">
      <div class="trophy">${perfect ? '💎' : acc >= 80 ? '🏆' : '🎉'}</div>
      <h1>${perfect ? 'Sine errōre!' : 'Lesson complete!'}</h1>
      <p class="muted">${perfect ? 'Flawless — no mistakes' : 'Bene factum — well done'}</p>
      <div class="rcards">
        <div class="rc gold"><small>TOTAL XP</small><b class="count" data-to="${xpAll}">0</b></div>
        <div class="rc green"><small>ACCURACY</small><b>${acc}%</b></div>
        <div class="rc purple"><small>BEST COMBO</small><b>🔥${Run.maxCombo}</b></div>
        <div class="rc blue"><small>TIME</small><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
      </div>
      <div class="xpbreak muted">${base} ${real ? 'lesson' : 'practice'} + ${Run.firstTry} answers${comboBonus ? ` + ${comboBonus} combo` : ''}${perfectBonus ? ' + 5 perfect' : ''}${medal ? ` + ${MEDAL_XP[medal[0]]} medal` : ""}</div>
      ${Run.missedWords.size + Run.missedStress.size ? '<button class="btn" id="revmist">🔁 Review my mistakes</button>' : ''}
      ${goalHit ? `<div class="lvup goal">🎯 Daily goal reached! 🔥 Streak: ${S.streak(save)} day${S.streak(save) === 1 ? '' : 's'}</div>` : ''}
      ${medal ? `<div class="lvup medalup ${medal[0]}">${medal[1]} ${medal[2]} medal! <small>+${MEDAL_XP[medal[0]]} bonus XP</small></div>` : ''}
      ${lvlUp ? `<div class="lvup">Lesson level ${lvlUp}/5 <span>${'★'.repeat(Math.min(5, lvlUp))}${'☆'.repeat(Math.max(0, 5 - lvlUp))}</span></div>` : ''}
      ${lvAfter > lvBefore ? `<div class="lvup big">⬆️ Level ${lvAfter} — ${rankOf(lvAfter)[1]} <small>(${rankOf(lvAfter)[2]})</small></div>` : ''}
    </div>`;
    const c = $(".count"); let v = 0; const step = () => { v = Math.min(xpAll, v + Math.ceil(xpAll / 25)); c.textContent = "+" + v; if (v < xpAll) requestAnimationFrame(step); }; step();
    Run.state = 'feedback';
    const mist = { words: [...Run.missedWords], stress: [...Run.missedStress] };
    const rv = $('#revmist'); if (rv) rv.onclick = () => startLesson(null, 'mistakes', mist);
    $('#lgo').textContent = 'Continue'; $('#lgo').disabled = false;
    let leaving = false;
    $('#lgo').onclick = async () => {
      if (leaving) return; leaving = true;
      if (goalHit) {
        const n = S.streak(save);
        Sfx.play('ach');
        await modal(`<div class="center streakscr"><div class="bigflame">🔥</div><div class="snum">${n}</div><h2>day streak!</h2><p class="muted">Daily goal reached. Come back tomorrow to keep the fire burning — <i>nūlla diēs sine līneā</i> <small>(after Pliny)</small>.</p></div>`, [{ label: 'Continue', primary: true }]);
      }
      endLesson();
    };
  }

  // ================= exercise renderers =================
  // Each returns { check():res|null, reveal():res } ; res = { ok, html, say?, words? }
  function optionList(container, items, render, onSel) {
    let sel = -1;
    const wrap = el('<div class="opts"></div>');
    items.forEach((it, i) => {
      const b = el(`<button class="opt"><span class="key">${i + 1}</span><span class="ol">${render(it)}</span></button>`);
      b.onclick = () => { if ($('#lbody').classList.contains('locked')) return; Sfx.play('tap'); sel = i; $$('.opt', wrap).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); onSel(i, it); };
      wrap.appendChild(b);
    });
    container.appendChild(wrap);
    Run.selectIndex = i => { const b = $$('.opt', wrap)[i]; b && b.click(); };
    return { get: () => sel, mark(right) { $$('.opt', wrap).forEach((b, i) => { if (i === right) b.classList.add('right'); else if (i === sel) b.classList.add('wrong'); }); } };
  }
  function wordFeedback(id) {
    const w = WORDS[id];
    return `<div class="fw">${w.img} ${wordHTML(w.la)} <span class="muted">[${esc(L.respell(w.la))}]</span> = <b>${esc(w.en)}</b></div>`;
  }
  /** speakOpts: options show Latin → say the word the moment its block is tapped. */
  function choiceEx(ex, body, api, prompt, render, cls = '', speakOpts = false) {
    body.innerHTML = prompt;
    let spoken = null;
    const ol = optionList(body, ex.opts, render, (i, id) => { if (speakOpts) { Voice.speak(WORDS[id].la); spoken = id; } api.ready(true); });
    if (cls) $('.opts', body).classList.add(cls);
    const right = ex.opts.indexOf(ex.id);
    const resolve = ok => {
      ol.mark(right);
      const sel = ol.get();
      let you = '';
      if (!ok && sel >= 0 && ex.opts[sel] !== ex.id) { const o = WORDS[ex.opts[sel]]; you = `<div class="you">You chose: ${o.img} ${wordHTML(o.la, { dots: false })} = ${esc(o.en)}</div>`; }
      // don't repeat the word the learner has just heard by tapping it
      return { ok, html: you + wordFeedback(ex.id), say: spoken === ex.id ? undefined : WORDS[ex.id].la };
    };
    return { check: () => resolve(ol.get() === right), reveal: () => resolve(false) };
  }
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  /** Why the learner's chosen stress is wrong (in terms of the rule). */
  function stressWhy(a, sel) {
    if (sel < 0 || sel === a.stress) return '';
    let why;
    if (sel === a.n - 1) why = 'Latin never stresses the <b>last</b> syllable of a longer word.';
    else if (sel < a.n - 3) why = 'Stress never goes further back than the <b>third syllable from the end</b>.';
    else if (a.enclitic) why = 'The enclitic pulls the stress onto the syllable <b>right before it</b>.';
    else if (sel === a.n - 2) why = 'The penult is <b>light</b>, so it can\'t hold the stress.';
    else why = 'The penult is <b>heavy</b>, so it grabs the stress.';
    return `<div class="you">You stressed <b>${esc(a.syllables[sel].text)}</b>. ${why}</div>`;
  }

  const EX = {
    teach(ex, body) {
      const w = WORDS[ex.id];
      body.innerHTML = `<div class="ttl">New word</div>
        <div class="teach"><div class="timg">${w.img}</div>
        <div class="tword">${wordHTML(w.la)} ${speakBtn(w.la)}</div>
        <div class="tresp">say: <b>${esc(L.respell(w.la))}</b></div>
        <div class="ten">${esc(w.en)}</div>
        ${w.info ? `<div class="tinfo">${esc(w.info)}</div>` : ''}
        ${L.analyze(w.la).n > 1 ? `<div class="texp">🎯 ${L.explain(w.la)}</div>` : ''}</div>`;
      sayLater(ex, w.la);
      return {};
    },
    story(ex, body) {
      const st = ex.story;
      body.innerHTML = `<div class="ttl">📖 Fābula: <i>${esc(st.title)}</i></div>
        <p class="muted center small">Tap a word for its meaning · 🔊 listen · 👁️ translation</p>
        <div class="story">${st.lines.map(ln => `<div class="sline"><div class="sla">${textHTML(ln.la, { plain: ex.plain })}</div>
          <div class="sbtns">${speakBtn(ln.la)}<button class="spk eye" aria-label="Show translation">👁️</button></div>
          <div class="sen" hidden>${esc(ln.en)}</div></div>`).join('')}</div>
        <button class="btn small" id="readall">🔊 Read it all</button>`;
      $$('.eye', body).forEach(b => b.onclick = e => { e.stopPropagation(); const s = $('.sen', b.closest('.sline')); s.hidden = !s.hidden; });
      $('#readall', body).onclick = () => Voice.speak(st.lines.map(l => l.la).join(' '));
      return {};
    },
    storyQ(ex, body, api) {
      const st = ex.story, q = ex.q, opts = shuffle([q.a, ...q.opts]), right = opts.indexOf(q.a);
      body.innerHTML = `<div class="ttl">${esc(q.q)}</div>
        <details class="story mini"><summary>📖 Reread <i>${esc(st.title)}</i></summary>${st.lines.map(ln => `<div class="sla">${textHTML(ln.la, { plain: true })}</div>`).join('')}</details>`;
      const ol = optionList(body, opts, o => esc(o), () => api.ready(true));
      const ln = st.lines[q.line];
      const resolve = ok => { ol.mark(right); return { ok, html: `<div><b>${esc(q.a)}</b></div>${ln ? `<div class="fs">${textHTML(ln.la)}</div><div class="muted">${esc(ln.en)}</div>` : ''}`, say: ln && ln.la }; };
      return { check: () => resolve(ol.get() === right), reveal: () => resolve(false) };
    },
    form(ex, body, api) {
      const d = ex.d, ans = d.la.match(/\{([^}]+)\}/)[1], full = d.la.replace(/[{}]/g, '');
      const [pre, post] = d.la.split(/\{[^}]+\}/);
      // a gap at the start of the sentence would give the answer away by its capital letter
      allTokens();
      const atStart = !/[A-Za-zāēīōū]/.test(pre);
      const show = o => atStart && !PROPER.has(o.toLowerCase()) ? o.toLowerCase() : o;
      const opts = shuffle([ans, ...d.opts]), right = opts.indexOf(ans);
      body.innerHTML = `<div class="ttl">Pick the right form</div>
        <div class="sent"><div class="owl">🦉</div><div class="bubble">${esc(d.en)}</div></div>
        <div class="gap">${textHTML(pre, { plain: ex.plain })}<span class="blank">?</span>${textHTML(post, { plain: ex.plain })}</div>`;
      let spoken = null;
      const ol = optionList(body, opts, o => wordHTML(show(o), { dots: false, plain: ex.plain }), (i, o) => { Voice.speak(o); spoken = o; api.ready(true); });
      const resolve = ok => {
        ol.mark(right);
        const blank = $('.blank', body); blank.textContent = ans; blank.classList.add(ok ? 'right' : 'wrong');
        const sel = ol.get();
        const you = !ok && sel >= 0 ? `<div class="you">You chose: <b>${esc(show(opts[sel]))}</b></div>` : '';
        const words = laTokens(full).map(t => LA2WORD[t.toLowerCase()]).filter(id => id && save.words[id]);
        return { ok, html: `${you}<div class="fs">${textHTML(full)}</div><div>${esc(d.en)}</div>${d.why ? `<div class="gnote">💡 ${d.why}</div>` : ''}`, say: spoken === ans && full.split(/\s+/).length < 2 ? undefined : full, words: ok ? words : [] };
      };
      return { check: () => resolve(ol.get() === right), reveal: () => resolve(false) };
    },
    pic(ex, body, api) {
      const w = WORDS[ex.id];
      return choiceEx(ex, body, api, `<div class="ttl">Which one is <span class="big">${wordHTML(w.la, { plain: ex.plain })}</span> ${speakBtn(w.la)}</div>`,
        id => `<span class="pimg">${WORDS[id].img}</span>`, 'grid');
    },
    la2en(ex, body, api) {
      const w = WORDS[ex.id];
      sayLater(ex, w.la, 200);
      return choiceEx(ex, body, api, `<div class="ttl">What does this mean?</div><div class="prompt">${wordHTML(w.la, { plain: ex.plain })} ${speakBtn(w.la)}</div>`,
        id => esc(WORDS[id].en));
    },
    en2la(ex, body, api) {
      const w = WORDS[ex.id];
      return choiceEx(ex, body, api, `<div class="ttl">How do you say this in Latin?</div><div class="prompt">${w.img} “${esc(w.en)}”</div>`,
        id => wordHTML(WORDS[id].la, { dots: false, plain: ex.plain }), '', true);
    },
    listen(ex, body, api) {
      const w = WORDS[ex.id];
      sayLater(ex, w.la);
      return choiceEx(ex, body, api, `<div class="ttl">What do you hear?</div><div class="prompt"><button class="spk huge" data-say="${esc(w.la)}">🔊</button><button class="spk huge slow" data-say="${esc(w.la)}">🐢</button></div>`,
        id => wordHTML(WORDS[id].la, { plain: true }));
    },
    type(ex, body, api) {
      const w = WORDS[ex.id];
      body.innerHTML = `<div class="ttl">Write this in Latin</div><div class="prompt">${w.img} “${esc(w.en)}”</div>
        <input class="tin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type in Latin…">
        <div class="mkeys">${'āēīōū'.split('').map(c => `<button class="mk">${c}</button>`).join('')}</div>
        <p class="muted small">Macrons are optional — but you get a ✨ for them.</p>`;
      const inp = $('.tin', body);
      setTimeout(() => inp.focus(), 50);
      inp.oninput = () => api.ready(inp.value.trim().length > 0);
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); api.submit(); } };
      $$('.mk', body).forEach(b => b.onclick = () => {
        const p = inp.selectionStart ?? inp.value.length;
        inp.value = inp.value.slice(0, p) + b.textContent + inp.value.slice(inp.selectionEnd ?? p);
        inp.focus(); inp.setSelectionRange(p + 1, p + 1); api.ready(true);
      });
      const resolve = ok => {
        const v = inp.value;
        const exact = L.normLatin(v, true) === L.normLatin(w.la, true);
        const plain = L.normLatin(v), target = L.normLatin(w.la);
        const dist = lev(plain, target);
        const typo = ok !== false && plain !== target && dist === 1 && target.length >= 4;
        const okk = ok !== false && (plain === target || typo);
        inp.classList.add(okk ? 'right' : 'wrong'); inp.disabled = true;
        let note = '';
        if (typo) note = `<div>Almost — watch the spelling: <b>${esc(w.la)}</b> (you wrote “${esc(v.trim())}”)</div>`;
        else if (okk && exact && /[āēīōū]/i.test(w.la)) note = '<div>✨ Perfect macrons!</div>';
        else if (okk && !exact) note = `<div>Mind the long vowels: <b>${esc(w.la)}</b></div>`;
        else if (!okk && v.trim()) note = `<div class="you">Your answer: “${esc(v.trim())}”</div>`;
        return { ok: okk, near: !okk && !!v.trim() && dist <= 2, html: note + wordFeedback(ex.id), say: w.la };
      };
      return { check: () => resolve(), reveal: () => resolve(false) };
    },
    stressTap(ex, body, api) {
      const a = L.analyze(ex.word), id = LA2WORD[a.display.toLowerCase()];
      body.innerHTML = `<div class="ttl">Tap the <span class="hl">stressed</span> syllable</div>
        ${id ? `<div class="muted center">${WORDS[id].img} ${esc(WORDS[id].en)}</div>` : `<div class="muted center">${esc(glossFor(ex.word))}</div>`}
        <div class="syls"></div>`;
      let sel = -1;
      const wrap = $('.syls', body);
      a.syllables.forEach((s, i) => {
        const b = el(`<button class="sylb">${esc(s.text)}</button>`);
        b.onclick = () => { if ($('#lbody').classList.contains('locked')) return; Sfx.play('tap'); sel = i; $$('.sylb', wrap).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); api.ready(true); };
        wrap.appendChild(b);
      });
      Run.selectIndex = i => { const b = $$('.sylb', wrap)[i]; b && b.click(); };
      const resolve = ok => {
        $$('.sylb', wrap).forEach((b, i) => { if (i === a.stress) b.classList.add('right'); else if (i === sel) b.classList.add('wrong'); });
        return { ok, html: `${ok ? '' : stressWhy(a, sel)}<div class="fw">${wordHTML(ex.word)} <span class="muted">[${esc(L.respell(ex.word))}]</span></div><div class="exp">🎯 ${L.explain(ex.word)}</div>`, say: ex.word, words: id ? [id] : [] };
      };
      return { check: () => resolve(sel === a.stress), reveal: () => resolve(false) };
    },
    stressPick(ex, body, api) {
      const a = L.analyze(ex.word), id = LA2WORD[a.display.toLowerCase()];
      const idxs = [];
      for (let i = a.n - 1; i >= Math.max(0, a.n - 3); i--) idxs.push(i);
      const opts = shuffle(idxs);
      body.innerHTML = `<div class="ttl">Which pronunciation is right?</div>
        <div class="prompt">${esc(a.display)}</div>
        ${id ? `<div class="muted center">${WORDS[id].img} ${esc(WORDS[id].en)}</div>` : ''}`;
      const ol = optionList(body, opts, i => `<span class="resp">${esc(respellAt(ex.word, i))}</span>`, () => api.ready(true));
      const resolve = ok => { ol.mark(opts.indexOf(a.stress)); return { ok, html: `${ok ? '' : stressWhy(a, ol.get() >= 0 ? opts[ol.get()] : -1)}<div class="fw">${wordHTML(ex.word)}</div><div class="exp">🎯 ${L.explain(ex.word)}</div>`, say: ex.word, words: id ? [id] : [] }; };
      return { check: () => resolve(opts[ol.get()] === a.stress), reveal: () => resolve(false) };
    },
    weigh(ex, body, api) {
      const a = L.analyze(ex.word), p = a.syllables[a.n - 2], heavy = p.heavy;
      body.innerHTML = `<div class="ttl">Is the <span class="hl">penult</span> heavy or light?</div>
        <div class="prompt">${a.syllables.map((x, i) => i === a.n - 2 ? `<span class="pen">${esc(x.text)}</span>` : esc(x.text)).join('<span class="dot">·</span>')}</div>
        <p class="muted center small">Heavy = long vowel, diphthong, or closed by a consonant.</p>`;
      const opts = ['heavy', 'light'];
      const ol = optionList(body, opts, o => o === 'heavy' ? '🏋️ Heavy → it takes the stress' : '🪶 Light → stress moves back', () => api.ready(true));
      const right = heavy ? 0 : 1;
      const resolve = ok => { ol.mark(right); return { ok, html: `<div class="fw">${wordHTML(ex.word)} <span class="muted">[${esc(L.respell(ex.word))}]</span></div><div class="exp">🎯 ${L.explain(ex.word)}</div>`, say: ex.word }; };
      return { check: () => resolve(ol.get() === right), reveal: () => resolve(false) };
    },
    stressHear(ex, body, api) {
      const a = L.analyze(ex.word), id = LA2WORD[a.display.toLowerCase()];
      const idxs = shuffle([a.n - 1, a.n - 2, a.n - 3].filter(i => i >= 0));
      // nothing plays by itself: the learner sees the word and taps each version to hear it
      body.innerHTML = `<div class="ttl">Which recording has the <span class="hl">right stress</span>?</div>
        <div class="prompt">${esc(a.display)}</div>${id ? `<div class="muted center">${WORDS[id].img} ${esc(WORDS[id].en)}</div>` : ''}
        <p class="muted center small">Tap a version to hear it — tap again to replay.</p>`;
      const ol = optionList(body, idxs, (i) => `🔊 Version ${'ABC'[idxs.indexOf(i)]}`, (k) => { Voice.speakForced(ex.word, idxs[k]); api.ready(true); });
      const resolve = ok => { ol.mark(idxs.indexOf(a.stress)); return { ok, html: `${ok ? '' : stressWhy(a, ol.get() >= 0 ? idxs[ol.get()] : -1)}<div class="fw">${wordHTML(ex.word)} [${esc(L.respell(ex.word))}]</div><div class="exp">🎯 ${L.explain(ex.word)}</div>`, say: ok ? undefined : ex.word, words: id ? [id] : [] }; };
      return { check: () => resolve(idxs[ol.get()] === a.stress), reveal: () => resolve(false) };
    },
    macron(ex, body, api) {
      const t = WORDS[ex.target], opts = shuffle(ex.pair);
      body.innerHTML = `<div class="ttl">Careful — length changes the meaning!</div><div class="prompt">${t.img} “${esc(t.en)}”</div>`;
      const ol = optionList(body, opts, id => `<span class="bigla">${esc(WORDS[id].la)}</span>`, (i, id) => { Voice.speak(WORDS[id].la); api.ready(true); });
      const resolve = ok => { ol.mark(opts.indexOf(ex.target)); return { ok, html: ex.pair.map(wordFeedback).join(''), say: t.la, words: [ex.target] }; };
      return { check: () => resolve(opts[ol.get()] === ex.target), reveal: () => resolve(false) };
    },
    match(ex, body, api) {
      body.innerHTML = `<div class="ttl">Tap the matching pairs</div><div class="match"><div class="mcol l"></div><div class="mcol r"></div></div>`;
      const left = shuffle(ex.ids), right = shuffle(ex.ids);
      let selL = null, selR = null, left_n = ex.ids.length, errs = 0;
      const mkBtn = (id, side) => {
        const b = el(`<button class="mbtn" data-id="${id}">${side === 'l' ? wordHTML(WORDS[id].la, { dots: false }) : `${WORDS[id].img} ${esc(WORDS[id].en)}`}</button>`);
        b.onclick = () => {
          if (b.classList.contains('gone')) return;
          if (side === 'l') { selL = b; Voice.speak(WORDS[id].la); } else selR = b;
          $$(`.mcol.${side} .mbtn`, body).forEach(x => x.classList.toggle('sel', x === b));
          if (selL && selR) {
            if (selL.dataset.id === selR.dataset.id) {
              Sfx.play('tap'); [selL, selR].forEach(x => { x.classList.remove('sel'); x.classList.add('gone'); });
              const rid = Run.id;
              if (--left_n === 0) setTimeout(() => Run.active && Run.id === rid && Run.cur === ex && Run.state === 'answer' && api.done({ ok: true, words: ex.ids, html: errs ? `${errs} mismatch${errs > 1 ? 'es' : ''} — but all pairs found!` : 'All pairs, no mismatches!' }), 250);
            } else {
              errs++; Run.mistakes++; Sfx.play('bad'); Run.combo = 0; updateBar(); const a = selL, c = selR;
              [a, c].forEach(x => x.classList.add('shake'));
              setTimeout(() => [a, c].forEach(x => x.classList.remove('shake', 'sel')), 450);
            }
            selL = selR = null;
          }
        };
        return b;
      };
      left.forEach(id => $('.mcol.l', body).appendChild(mkBtn(id, 'l')));
      right.forEach(id => $('.mcol.r', body).appendChild(mkBtn(id, 'r')));
      return {};
    },
    buildEn(ex, body, api) { return buildEx(ex, body, api, 'en'); },
    buildLa(ex, body, api) { return buildEx(ex, body, api, 'la'); }
  };

  // ----- sentence builders -----
  const enTokens = s => s.replace(/[.,!?;:“”"]/g, ' ').split(/\s+/).filter(Boolean);
  const laTokens = s => L.tokenize(s).filter(t => t.word).map(t => L.clean(t.w));
  function normEN(s) {
    return s.toLowerCase().replace(/[’`]/g, "'").replace(/\bdon't\b/g, 'do not').replace(/n't\b/g, ' not').replace(/\bi'm\b/g, 'i am')
      .replace(/\bo\b/g, 'oh').replace(/favour/g, 'favor').replace(/[^a-z' ]+/g, ' ').split(/\s+/)
      .filter(t => t && !['a', 'an', 'the'].includes(t)).join(' ');
  }
  let _allEn = null, _allLa = null, PROPER = null;
  /** Lower-case a tile unless it is a proper noun (so capitals don't give away the first word). */
  const tileCase = t => PROPER.has(t.toLowerCase()) ? t : t.toLowerCase();
  function allTokens() {
    if (!_allEn) {
      const sents = ALL_LESSONS.flatMap(x => x.l.sentences || []);
      const texts = [...sents, ...ALL_LESSONS.flatMap(x => (x.l.drills || []).map(d => ({ la: d.la.replace(/[{}]/g, ''), en: d.en }))),
        ...ALL_LESSONS.flatMap(x => x.l.story ? x.l.story.lines : [])];
      PROPER = new Set(['i']);
      Object.values(WORDS).filter(w => w.proper).forEach(w => PROPER.add(w.la.toLowerCase()));
      // a capital that is not at the start of a sentence marks a proper noun
      const scanCaps = (str, tok) => str.split(/[.!?:]/).forEach(part => tok(part).forEach((t, i) => { if (i > 0 && /^[A-ZĀĒĪŌŪ]/.test(t)) PROPER.add(t.toLowerCase()); }));
      texts.forEach(s => { scanCaps(s.en, enTokens); scanCaps(s.la, laTokens); });
      _allEn = uniq(sents.flatMap(s => enTokens(s.en)).map(tileCase)).filter(t => !['a', 'an', 'the'].includes(t));
      _allLa = uniq([...sents.flatMap(s => laTokens(s.la)), ...Object.values(WORDS).map(w => w.la)].map(tileCase));
    }
    return { en: _allEn, la: _allLa };
  }
  /** Latin word order is free: compare as a bag of words, keeping "nōn" glued to the next word. */
  function laBag(str) {
    const t = L.normLatin(str, true).split(' ').filter(Boolean), u = [];
    for (let i = 0; i < t.length; i++) { if (t[i] === 'nōn' && i + 1 < t.length) { u.push('nōn ' + t[i + 1]); i++; } else u.push(t[i]); }
    return u.sort().join('|');
  }
  function buildEx(ex, body, api, target) {
    const s = ex.s;
    allTokens();
    // English tiles come from a random accepted translation, so alternatives are buildable too
    const enModel = target === 'en' ? pick([s.en, ...(s.alt || [])]) : s.en;
    const answer = (target === 'en' ? enTokens(enModel) : laTokens(s.la)).map(tileCase);
    const lc = new Set(answer.map(x => x.toLowerCase()));
    const pool = (target === 'en' ? allTokens().en : allTokens().la).filter(t => !lc.has(t.toLowerCase()));
    const tiles = shuffle([...answer, ...shuffle(pool).slice(0, Math.min(4, Math.max(2, 7 - answer.length)))]);
    if (target === 'en') sayLater(ex, s.la);
    body.innerHTML = `<div class="ttl">${target === 'en' ? 'Translate this sentence' : 'Write this in Latin'}</div>
      <div class="sent">${target === 'en'
        ? `<div class="owl">🦉</div><div class="bubble">${textHTML(s.la)} ${speakBtn(s.la)}${srcBadge(s)}</div>`
        : `<div class="owl">🦉</div><div class="bubble">${esc(s.en)}${srcBadge(s)}</div>`}</div>
      <div class="ans"></div><div class="bank ${target === 'la' ? 'nogloss' : ''}"></div>`;
    const ans = $('.ans', body), bank = $('.bank', body);
    const placed = [];
    tiles.forEach((t, i) => {
      const slot = el(`<span class="slot"></span>`);
      const b = el(`<button class="tile">${esc(t)}</button>`);
      b.onclick = () => {
        if ($('#lbody').classList.contains('locked')) return;
        Sfx.play('tap');
        if (b.parentElement === slot) { ans.appendChild(b); placed.push(i); if (target === 'la') Voice.speak(t); }
        else { slot.appendChild(b); placed.splice(placed.indexOf(i), 1); }
        api.ready(placed.length > 0);
      };
      slot.appendChild(b); bank.appendChild(slot);
    });
    const user = () => $$('.tile', ans).map(b => b.textContent).join(' ');
    const resolve = forceWrong => {
      let ok;
      if (target === 'en') ok = [s.en, ...(s.alt || [])].some(a => normEN(a) === normEN(user()));
      else ok = [s.la, ...(s.altLa || [])].some(a => L.normLatin(a, true) === L.normLatin(user(), true));
      let note = '';
      if (!ok && !forceWrong && target === 'la' && laBag(user()) === laBag(s.la)) {
        ok = true;
        note = s.src ? `<div>✓ Right words! But the famous line goes in this order:</div>` : `<div>✓ Also good Latin — word order is free. The model order:</div>`;
      }
      if (forceWrong) ok = false;
      const you = !ok && user() ? `<div class="you">Your answer: “${esc(user())}”</div>` : '';
      const html = `${you}${note}<div class="fs">${textHTML(s.la)}</div><div>${esc(s.en)}</div>${srcBadge(s)}${s.note ? `<div class="gnote">💡 ${s.note}</div>` : ''}`;
      // only words already met count as practised (sentence words aren't "learned" before being taught)
      const words = laTokens(s.la).map(t => LA2WORD[t.toLowerCase()]).filter(id => id && save.words[id]);
      return { ok, html, say: s.la, words: ok ? words : [] };
    };
    return { check: () => resolve(false), reveal: () => resolve(true) };
  }

  // keyboard
  document.addEventListener('keydown', e => {
    if (!Run.active) return;
    if (document.querySelector('.modal-bg')) return; // a dialog is open: don't act behind it
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Enter') { e.preventDefault(); $('#lgo') && !$('#lgo').disabled && $('#lgo').click(); }
    else if (/^[1-9]$/.test(e.key) && Run.state === 'answer' && Run.selectIndex) Run.selectIndex(+e.key - 1);
  });

  // ================= PRACTICE =================
  function renderPractice(scr) {
    const ids = learnedIds();
    const sorted = ids.slice().sort((a, b) => wordEff(a) - wordEff(b));
    scr.innerHTML = `<h1 class="h1">🔁 Practice</h1>
      <p class="muted">Unlimited — practise as much as you like. Words fade over time; practice brings them back.</p>
      <div class="pcards">
        <button class="pcard ${dueIds().length ? 'hot' : ''}" data-p="review"><span>⏰</span><b>Due review</b><small>${dueIds().length} word${dueIds().length === 1 ? '' : 's'} due now</small></button>
        <button class="pcard" data-p="weak"><span>🧠</span><b>Weak words</b><small>Your ${Math.min(8, ids.length)} faintest words</small></button>
        <button class="pcard" data-p="stress"><span>🎯</span><b>Stress drill</b><small>12 accent questions</small></button>
        <button class="pcard" data-p="sentences"><span>📜</span><b>Sentences</b><small>From finished lessons</small></button>
        <button class="pcard" data-p="grammar"><span>🧩</span><b>Grammar</b><small>${doneDrills().length} forms to choose</small></button>
      </div>
      ${quotesHTML()}
      <h2 class="h2">Lexicon <span class="muted">(${ids.length} words)</span></h2>
      <div class="lex">${sorted.map(id => {
        const w = WORDS[id], eff = Math.max(0, Math.round(wordEff(id)));
        return `<div class="lexrow" data-say="${esc(w.la)}"><span class="limg">${w.img}</span><span class="lla">${wordHTML(w.la)}</span><span class="len">${esc(w.en)}</span><span class="str s${eff}">${'<i></i>'.repeat(5)}</span></div>`;
      }).join('') || '<p class="muted">No words yet — start the first lesson!</p>'}</div>`;
    $$('.pcard', scr).forEach(b => b.onclick = () => {
      const k = b.dataset.p;
      if (k === 'weak' && ids.length < 4) return toast('Learn at least 4 words first.');
      if (k === 'review' && !dueIds().length) return toast('Nothing due right now — come back later! ⏰');
      if (k === 'sentences' && !doneSentences().length) return toast('Finish a lesson with sentences first.');
      if (k === 'grammar' && !doneDrills().length) return toast('Finish a grammar lesson (🧩) first — e.g. "We, you all, they".');
      startLesson(null, k);
    });
  }

  /** "Sententiae" scrapbook: every classical quote you have unlocked. */
  function quotesHTML() {
    const all = [], seen = new Set();
    ALL_LESSONS.forEach(x => (x.l.sentences || []).forEach(q => { if (q.src && !seen.has(q.la)) { seen.add(q.la); all.push({ q, open: lst(x.l.id).lvl > 0 }); } }));
    const got = all.filter(a => a.open);
    return `<h2 class="h2">📜 Sententiae <span class="muted">(${got.length}/${all.length})</span></h2>
      <div class="quotes">${got.map(({ q }) => `<div class="quote"><div class="qla">${textHTML(q.la)} ${speakBtn(q.la)}</div><div class="qen">“${esc(q.en)}”</div><div class="src">${esc(q.src)}</div></div>`).join('')}
      ${all.length - got.length ? `<div class="quote locked">🔒 ${all.length - got.length} more quotes waiting in later lessons</div>` : ''}</div>`;
  }

  // ================= ACCENT ARENA =================
  function renderArenaHome(scr) {
    scr.innerHTML = `<div class="arena-home"><div class="ahero">🏟️</div><h1 class="h1">Accent Arena</h1>
      <p>60 seconds. Tap the stressed syllable of as many words as you can. Each streak of 5 adds a bonus second!</p>
      <div class="rc gold big"><small>YOUR RECORD</small><b>${save.records.arenaBest}</b></div>
      <button class="btn primary big" id="astart">⚔️ Fight!</button>
      <p class="muted small">XP = your score. Uses the full stress rule — apply it to words you have never seen.</p></div>`;
    $('#astart').onclick = startArena;
  }
  function startArena() {
    // mostly 3+ syllable words: 2-syllable ones are always "first syllable" and teach little
    const allW = allStressWords(), long = allW.filter(w => L.analyze(w).n >= 3), short = allW.filter(w => L.analyze(w).n === 2);
    const pool = shuffle([...long, ...shuffle(short).slice(0, Math.ceil(long.length / 4))]);
    let score = 0, combo = 0, idx = 0, timeLeft = 60, busy = false, ended = false, correct = 0, paused = false, quitEarly = false;
    const missed = [];
    $('#app').classList.add('in-lesson');
    const A = el(`<div id="lesson" class="arena"><header class="lhead"><button class="x">✕</button><div class="bar"><div class="fill tfill"></div></div><div class="combo"></div></header>
      <main id="lbody"><div class="ascore"><span>⚔️ <b id="asc">0</b></span><span>⏱ <b id="atm">60</b></span></div><div id="aword"></div></main></div>`);
    document.body.appendChild(A);
    Run.active = false;
    const tick = setInterval(() => {
      if (paused) return;
      timeLeft -= 0.1;
      $('#atm').textContent = Math.max(0, Math.ceil(timeLeft));
      $('.tfill', A).style.width = Math.max(0, timeLeft / 60 * 100) + '%';
      if (timeLeft <= 0) end();
    }, 100);
    $('.x', A).onclick = () => { quitEarly = true; end(true); };
    function show() {
      const w = pool[idx++ % pool.length], a = L.analyze(w), id = LA2WORD[a.display.toLowerCase()];
      const box = $('#aword');
      box.innerHTML = `<div class="muted center">${id ? WORDS[id].img + ' ' + esc(WORDS[id].en) : esc(glossFor(w))}</div><div class="syls"></div><div class="aexp"></div>`;
      a.syllables.forEach((s, i) => {
        const b = el(`<button class="sylb">${esc(s.text)}</button>`);
        b.onclick = () => {
          if (busy || ended) return;
          busy = true;
          const ok = i === a.stress;
          $$('.sylb', box)[a.stress].classList.add('right');
          if (ok) {
            score++; combo++; correct++;
            if (combo % 5 === 0) { timeLeft += 1; Sfx.play('combo'); } else Sfx.play('ok');
          } else {
            combo = 0; b.classList.add('wrong'); Sfx.play('bad');
            if (!missed.includes(w)) missed.push(w);
            // the clock stops while you read why — learning beats speed
            paused = true;
            $('.aexp', box).innerHTML = `${stressWhy(a, i)}<div class="fw">${wordHTML(w)}</div><div class="exp">${L.explain(w)}</div><button class="btn primary anext">Next ⏵</button><div class="muted small">⏸ clock paused</div>`;
            $('.anext', box).onclick = () => { paused = false; busy = false; if (!ended) show(); };
          }
          $('#asc').textContent = score;
          $('.combo', A).innerHTML = combo >= 3 ? `<span class="cflame">🔥 ${combo}</span>` : '';
          if (ok) setTimeout(() => { busy = false; if (!ended) show(); }, 260);
        };
        $('.syls', box).appendChild(b);
      });
    }
    async function end(quit) {
      if (ended) return; ended = true; clearInterval(tick);
      if (!quit || score > 0) {
        const best = score > save.records.arenaBest;
        if (best) save.records.arenaBest = score;
        if (score > 0) S.addXP(save, DEVICE, score);
        dailyBump('arena', score, true); checkQuests();
        S.bump(save, DEVICE, 'stress', correct);
        checkAchievements(); commit();
        if (score > 0) { Sfx.play('done'); if (best) confetti(); }
        const r2 = await modal(`<div class="center"><div class="trophy">${best ? '🏆' : '⚔️'}</div><h2>${best ? 'New record!' : quitEarly ? 'Ended early' : 'Time!'}</h2><p class="big">Score: <b>${score}</b></p><p class="muted">Record: ${save.records.arenaBest} · +${score} XP</p>
          ${missed.length ? `<h3>Missed (${missed.length})</h3><div class="chips">${missed.map(m => `<span class="chip">${wordHTML(m)}</span>`).join('')}</div>` : '<p>No mistakes! 🎯</p>'}</div>`,
          missed.length ? [{ label: 'Continue', value: 0 }, { label: '🎯 Drill my mistakes', primary: true, value: 1 }] : [{ label: 'Continue', primary: true, value: 0 }]);
        A.remove(); $('#app').classList.remove('in-lesson');
        if (r2 === 1) { go('arena'); startLesson(null, 'missed', missed); return; }
        go('arena'); return;
      }
      A.remove(); $('#app').classList.remove('in-lesson'); go('arena');
    }
    show();
  }

  // ================= SOUNDS (guide + stress lab) =================
  function renderSounds(scr) {
    const row = (l, ex, d) => `<tr><td class="gl">${l}</td><td>${d}</td><td>${ex.map(w => `<button class="exw" data-say="${esc(w)}">${wordHTML(w, { dots: false })}</button>`).join(' ')}</td></tr>`;
    scr.innerHTML = `<h1 class="h1">🗣️ Classical pronunciation</h1>
      <div class="card"><h2 class="h2">🔬 Stress Lab</h2>
        <p class="muted">Type any Latin word (with macrons) — see its syllables, weights and stress.</p>
        <input id="labin" class="tin" value="fēmina" autocomplete="off" spellcheck="false">
        <div class="mkeys">${'āēīōū'.split('').map(c => `<button class="mk">${c}</button>`).join('')}</div>
        <div id="labout"></div>
        <div class="chips">${['puella', 'Rōmānus', 'tenebrae', 'familia', 'magister', 'populus+que', 'Cicerō', 'custōdiet', 'dextra'].map(w => `<button class="chip lab" data-w="${esc(w)}">${esc(L.clean(w))}${w.includes('+') ? ' (+que)' : ''}</button>`).join('')}</div>
        <p class="muted small">Tip: write an enclitic as <code>populus+que</code>.</p>
      </div>
      <div class="card"><h2 class="h2">🎯 The stress rule</h2>
        <ol class="rule"><li><b>1 syllable</b> → that syllable.</li><li><b>2 syllables</b> → the first: <i>RO-sa</i>.</li>
        <li><b>3+</b> → is the <b>penult</b> (2nd-to-last) <b>heavy</b>? Heavy = long vowel, diphthong, or followed by 2 consonants (x = 2).<br>
        ✅ yes → stress it: <i>a-MĪ-cus, pu-EL-la</i><br>❌ no → stress the <b>antepenult</b>: <i>FĒ-mi-na</i></li>
        <li>⚠️ stop + l/r (<i>br, tr, pl, cr…</i>) does <b>not</b> make the penult heavy: <i>TE-ne-brae</i>.</li>
        <li>➕ enclitic <i>-que, -ne, -ve</i> → stress the syllable just before it: <i>po-pu-LUS-que</i>.</li></ol></div>
      <div class="card"><h2 class="h2">🔤 Vowels</h2><table class="tbl g">
        ${row('a / ā', ['amō', 'māter'], 'short "cup" / long "father"')}
        ${row('e / ē', ['et', 'fēmina'], 'short "pet" / long "they"')}
        ${row('i / ī', ['in', 'vīnum'], 'short "pit" / long "machine"')}
        ${row('o / ō', ['bonus', 'Rōma'], 'short "pot" / long "note"')}
        ${row('u / ū', ['lupus', 'lūna'], 'short "put" / long "rule"')}
        ${row('ae', ['caelum', 'Caesar'], '"eye"')}${row('au', ['auris', 'taurus'], '"how"')}${row('oe', ['poena'], '"boy"')}</table></div>
      <div class="card"><h2 class="h2">🔡 Consonants</h2><table class="tbl g">
        ${row('c', ['Cicerō', 'caelum'], 'always K')}${row('g', ['magister', 'gladius'], 'always hard, "go"')}
        ${row('v', ['vīnum', 'vēnī'], 'English W')}${row('i (cons.)', ['iam', 'maior'], 'English Y; between vowels = double')}
        ${row('qu', ['quattuor', 'aqua'], 'KW')}${row('s', ['rosa', 'silva'], 'always S, never Z')}
        ${row('x', ['sex', 'rēx'], 'KS')}${row('r', ['rēx', 'terra'], 'trilled')}
        ${row('h', ['homō', 'mihi'], 'light breath, often weak')}
        ${row('final -m', ['rosam', 'templum'], 'only nasalises the vowel (rosã) — in verse it elides')}
        ${row('gn', ['magnus', 'pugnō'], '[ŋn]: "hangnail", not Italian "gn"')}
        ${row('n + c/g', ['longus', 'quīnque'], '[ŋ] as in "finger"')}
        ${row('ph th ch', ['Philologus', 'theātrum'], 'aspirated p, t, k (p-h) — not f / th')}
        ${row('y', ['lyra'], 'French "u" / German "ü" (Greek words)')}
        ${row('z', ['zōna'], '[dz] (Greek words)')}
        ${row('eu, ui', ['heu', 'huic'], 'rare diphthongs: e+u, u+i in one syllable')}
        ${row('bb, ll, tt…', ['puella', 'terra'], 'double = held longer')}</table></div>
      <div class="card"><h2 class="h2">🔊 Audio</h2><p class="muted">Browsers have no Latin voice, so Latinum feeds a <b>Spanish or Italian</b> voice a respelled text with a written accent on the stressed vowel — this forces the correct stress. It's an approximation (long vowels are not audible). The visual marks and respellings are the reference.</p>
        <p>Current voice: <b>${Voice.chosen() ? esc(Voice.chosen().name + ' (' + Voice.chosen().lang + ')') : 'none found'}</b></p></div>`;
    const inp = $('#labin', scr), out = $('#labout', scr);
    const upd = () => {
      const v = inp.value.trim().split(/\s+/)[0] || '';
      if (!v) { out.innerHTML = ''; return; }
      const a = L.analyze(v);
      let hint = '';
      if (!/[āēīōūȳ]/i.test(v)) {
        const cand = uniq([...Object.values(WORDS).map(w => w.la), ...allStressWords()]).find(c => /[āēīōūȳ]/.test(c) && L.normLatin(c) === L.normLatin(v));
        hint = cand ? `<div class="you">Did you mean <button class="chip lab" data-w="${esc(cand)}">${esc(L.clean(cand))}</button> ? Without macrons every vowel counts as short.</div>`
          : '<div class="muted small center">No macrons → every vowel is treated as short.</div>';
      }
      out.innerHTML = hint + `<div class="labw">${wordHTML(v)} ${speakBtn(v)}</div>
        <div class="weights">${a.syllables.map((s, i) => `<span class="wt ${s.heavy ? 'H' : 'Lt'} ${i === a.stress ? 'st' : ''}"><b>${esc(s.text)}</b><small>${s.heavy ? 'heavy' : 'light'}</small></span>`).join('')}</div>
        <div class="tresp">say: <b>${esc(L.respell(v))}</b></div><div class="texp">${L.explain(v)}</div>`;
    };
    inp.oninput = upd; upd();
    out.addEventListener('click', e => { const c = e.target.closest('.chip.lab'); if (c) { inp.value = c.dataset.w; upd(); } });
    $$('.mk', scr).forEach(b => b.onclick = () => { const p = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, p) + b.textContent + inp.value.slice(p); inp.focus(); inp.setSelectionRange(p + 1, p + 1); upd(); });
    $$('.chip.lab', scr).forEach(b => b.onclick = () => { inp.value = b.dataset.w; upd(); });
  }

  // ================= PROFILE + SAVE/SYNC =================
  function renderProfile(scr) {
    const xp = S.totalXP(save), li = levelInfo(xp), rk = rankOf(li.lvl);
    const corr = S.total(save, 'correct'), wr = S.total(save, 'wrong');
    const days = []; const m = S.xpByDay(save);
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push([d, m[S.dayKey(d)] || 0]); }
    const maxD = Math.max(save.profile.dailyGoal, ...days.map(x => x[1]));
    const voices = Voice.candidates();
    const s = save.settings;
    const exportAgo = save.lastExportAt ? new Date(save.lastExportAt).toLocaleString() : 'never';
    scr.innerHTML = `
      <div class="card prof"><div class="avatar">🦉</div><div>
        <input id="pname" class="nameinp" placeholder="Your name" value="${esc(save.profile.name)}">
        <div class="rank">${rk[1]} <span class="muted">(${rk[2]}) · Level ${li.lvl}</span></div>
        <div class="lvbar"><div style="width:${li.cur / li.span * 100}%"></div></div><small class="muted">${li.cur}/${li.span} XP to level ${li.lvl + 1}</small></div></div>
      <div class="sgrid">
        <div class="rc"><small>STREAK</small><b>🔥 ${S.streak(save)}</b></div><div class="rc"><small>TOTAL XP</small><b>⭐ ${xp}</b></div>
        <div class="rc"><small>WORDS</small><b>📚 ${learnedIds().length}</b></div><div class="rc"><small>LESSONS</small><b>🎓 ${S.total(save, 'lessons')}</b></div>
        <div class="rc"><small>ACCURACY</small><b>🎯 ${corr + wr ? Math.round(corr / (corr + wr) * 100) : 0}%</b></div><div class="rc"><small>STRESS ✓</small><b>🗣️ ${S.total(save, 'stress')}</b></div>
      </div>
      <div class="card"><h2 class="h2">This week</h2><div class="week">${days.map(([d, v]) => `<div class="wd"><div class="wb"><div style="height:${v / maxD * 100}%" class="${v >= save.profile.dailyGoal ? 'hit' : ''}"></div></div><small>${d.toLocaleDateString(undefined, { weekday: 'short' })}</small><small class="muted">${v}</small></div>`).join('')}</div>
        <label class="row2">Daily goal <select id="goal">${[10, 20, 30, 50, 100].map(g => `<option ${g === save.profile.dailyGoal ? 'selected' : ''} value="${g}">${g} XP${g === 10 ? ' — casual' : g === 30 ? ' — regular' : g === 50 ? ' — serious' : g === 100 ? ' — insane' : ''}</option>`).join('')}</select></label></div>
      <div class="card"><h2 class="h2">🏅 Achievements <span class="muted">${Object.keys(save.achievements).filter(k => ACH.find(a => a.id === k)).length}/${ACH.length}</span></h2>
        <div class="achs">${ACH.map(a => `<div class="ach ${save.achievements[a.id] ? 'got' : ''}" title="${esc(a.desc)}"><span>${a.icon}</span><b>${a.name}</b><small>${a.desc}</small>${!save.achievements[a.id] && a.prog ? (([c, m]) => `<div class="aprog"><i style="width:${Math.min(100, c / m * 100)}%"></i></div><small>${Math.min(c, m)}/${m}</small>`)(a.prog()) : ''}</div>`).join('')}</div></div>

      <div class="card sync"><h2 class="h2">💾 Save & Sync</h2>
        <p>✅ Progress is <b>saved automatically</b> in this browser after every lesson.</p>
        <p class="muted small">Last file/code backup: <b>${exportAgo}</b> · device id: <code>${esc(DEVICE)}</code></p>
        <div class="btns">
          <button class="btn primary" id="exp">⬇️ Download progress file</button>
          <button class="btn" id="imp">⬆️ Load progress file</button>
          <button class="btn" id="cpy">📋 Copy sync code</button>
          <button class="btn" id="pst">📥 Paste sync code</button>
        </div>
        <input type="file" id="impf" accept=".json,application/json,text/plain" hidden>
        <details><summary>How to sync between devices</summary>
          <ol><li>On device A: <b>Download progress file</b> (or <b>Copy sync code</b> and send it to yourself in a messenger).</li>
          <li>On device B: <b>Load progress file</b> (or <b>Paste sync code</b>).</li>
          <li>Progress is <b>merged</b>, never overwritten: XP from both devices is added correctly, the best lesson levels are kept. You can merge in any order, any number of times.</li></ol>
          <p>Updating the app: just replace the files — progress stays in the browser. To be extra safe, download a file before updating.</p></details>
        <details><summary>Danger zone</summary>
          <label class="row2"><input type="checkbox" id="replace"> Import <b>replaces</b> instead of merging</label>
          <button class="btn danger" id="reset">🗑️ Reset all progress</button>
          ${S.hasSnapshot() ? '<button class="btn" id="restore">↩️ Restore state before last reset/replace</button>' : ''}</details>
      </div>

      <div class="card"><h2 class="h2">⚙️ Settings</h2>
        <label class="row2"><input type="checkbox" id="snd" ${s.sound ? 'checked' : ''}> Sound effects</label>
        <label class="row2"><input type="checkbox" id="tts" ${s.tts ? 'checked' : ''}> Speak Latin aloud</label>
        <label class="row2"><input type="checkbox" id="lis" ${s.listening ? 'checked' : ''}> Listening exercises</label>
        <label class="row2">Voice <select id="voice"><option value="">Auto</option>${voices.map(v => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === s.voiceURI ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select> <button class="btn small" data-say="Salvē, amīce! Vēnī, vīdī, vīcī.">▶ Test</button></label>
        ${voices.length ? '' : '<p class="muted small">No Spanish/Italian/Latin voice found. On Linux install <code>espeak-ng</code> + speech-dispatcher (Chromium) or use Firefox/Chrome with online voices; on phones they are built in.</p>'}
        <label class="row2">Speech speed <input type="range" id="rate" min="0.5" max="1.2" step="0.05" value="${s.ttsRate}"></label>
        <label class="row2">Theme <select id="theme">${['auto', 'light', 'dark'].map(t => `<option ${t === s.darkMode ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="row2"><input type="checkbox" id="unl" ${s.unlockAll ? 'checked' : ''}> Unlock all lessons</label>
      </div>
      <div class="card"><h2 class="h2">🐞 Feedback</h2>
        <p class="muted">Found a bug, a wrong translation or wrong stress? Have an idea? Tell us!</p>
        <div class="btns2"><a class="btn" target="_blank" rel="noopener" href="${issueURL('bug')}">🐞 Report a bug</a>
        <a class="btn" target="_blank" rel="noopener" href="${issueURL('idea')}">💡 Suggest an idea</a></div>
        <p class="muted small">Opens GitHub (free account needed). Your progress is not sent.</p></div>
      <p class="muted small center">Latinum v${APP_VERSION} · save schema v${S.CURRENT_SCHEMA}</p>`;

    const set = (k, v) => { save.settings[k] = v; commit(); };
    $('#pname').onchange = e => { save.profile.name = e.target.value.slice(0, 40); commit(); };
    $('#goal').onchange = e => { save.profile.dailyGoal = +e.target.value; commit(); };
    $('#snd').onchange = e => set('sound', e.target.checked);
    $('#tts').onchange = e => { set('tts', e.target.checked); syncVoiceClass(); };
    $('#lis').onchange = e => set('listening', e.target.checked);
    $('#voice').onchange = e => set('voiceURI', e.target.value);
    $('#rate').onchange = e => set('ttsRate', +e.target.value);
    $('#theme').onchange = e => { set('darkMode', e.target.value); applyTheme(); };
    $('#unl').onchange = e => set('unlockAll', e.target.checked);
    $('#exp').onclick = () => { S.exportFile(save); checkAchievements(); commit(); toast('💾 File downloaded. Keep it safe — or open it on another device.'); setTimeout(() => go('profile'), 300); };
    $('#imp').onclick = () => $('#impf').click();
    $('#impf').onchange = async e => { const f = e.target.files[0]; if (!f) return; importText(await f.text()); e.target.value = ''; };
    $('#cpy').onclick = async () => {
      save.lastExportAt = Date.now(); checkAchievements(); commit();
      const code = await S.toCode(save);
      try { await navigator.clipboard.writeText(code); toast('📋 Sync code copied! Paste it on another device.'); }
      catch (err) { await modal(`<h3>Your sync code</h3><p class="muted">Copy it manually:</p><textarea class="code" readonly>${esc(code)}</textarea>`); }
    };
    $('#pst').onclick = async () => {
      window.__codein = '';
      const r = await modal(`<h3>Paste a sync code</h3><textarea class="code" id="codein" placeholder="${S.CODE_PREFIX}…"></textarea>`, [{ label: 'Cancel', value: null }, { label: 'Import', primary: true, value: 'ok' }]);
      // modal removed its DOM; read value captured on input
      if (r === 'ok' && window.__codein) importText(window.__codein);
    };
    $('#reset').onclick = async () => {
      const r = await modal('<h3>Reset ALL progress?</h3><p>This cannot be undone (unless you have a backup file). The previous state is kept as an internal backup copy.</p>', [{ label: 'Cancel', primary: true, value: 0 }, { label: 'Reset', danger: true, value: 1 }]);
      if (r === 1) {
        const epoch = save.epoch + 1;
        S.wipeLocal(); // keeps a snapshot for "Restore"
        save = S.defaultSave(); save.epoch = epoch;
        DEVICE = S.rotateDeviceId(); // counters must never go backwards under the same id
        commit(); toast('Progress reset. (You can still restore it in Danger zone.)'); go('learn');
      }
    };
    if ($('#restore')) $('#restore').onclick = async () => {
      const snap = S.readSnapshot(); if (!snap) return;
      const r = await modal(`<h3>Restore previous state?</h3><p>That state has <b>${S.totalXP(snap)} XP</b>. Your current state (${S.totalXP(save)} XP) becomes the new restore point.</p>`, [{ label: 'Cancel', primary: true, value: 0 }, { label: 'Restore', value: 1 }]);
      if (r !== 1) return;
      S.snapshot();
      snap.epoch = Math.max(snap.epoch, save.epoch) + 1;
      save = snap; DEVICE = S.rotateDeviceId();
      commit(); applyTheme(); toast('↩️ Restored.'); go('profile');
    };
  }
  document.addEventListener('input', e => { if (e.target.id === 'codein') window.__codein = e.target.value; });

  /** Prefilled GitHub issue link — contains only app version + browser, never the save. */
  function issueURL(kind) {
    const env = `App: v${APP_VERSION} · Screen: ${innerWidth}×${innerHeight} · Browser: ${navigator.userAgent}`;
    const p = kind === 'bug'
      ? { template: 'bug.yml', title: '[Bug] ', env }
      : { template: 'idea.yml', title: '[Idea] ' };
    return REPO_URL + '/issues/new?' + new URLSearchParams(p).toString();
  }

  async function importText(text) {
    let inc;
    try { inc = await S.parseImport(text); }
    catch (e) { await modal(`<h3>❌ Could not import</h3><p>${esc(e.message || e)}</p>`); return; }
    if (S.readOnlyReason) { await modal(`<h3>Update the app first</h3><p>${esc(S.readOnlyReason)}</p>`); return; }
    const replace = $('#replace') && $('#replace').checked;
    const before = { xp: S.totalXP(save), l: Object.values(save.lessons).filter(l => l.lvl > 0).length, w: learnedIds().length };
    if (replace) {
      S.snapshot();
      inc.epoch = Math.max(inc.epoch, save.epoch) + 1;
      save = inc; DEVICE = S.rotateDeviceId();
    } else save = S.merge(save, inc);
    checkAchievements(); commit();
    const after = { xp: S.totalXP(save), l: Object.values(save.lessons).filter(l => l.lvl > 0).length, w: learnedIds().length };
    await modal(`<h3>✅ Progress ${replace ? 'replaced' : 'merged'}</h3>
      <table class="tbl"><tr><td>XP</td><td>${before.xp} → <b>${after.xp}</b></td></tr><tr><td>Lessons done</td><td>${before.l} → <b>${after.l}</b></td></tr><tr><td>Words</td><td>${before.w} → <b>${after.w}</b></td></tr></table>`);
    applyTheme(); go('profile');
  }

  // ================= theme, boot =================
  function applyTheme() {
    const m = save.settings.darkMode;
    if (m === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', m);
  }
  // another tab saved → merge it in so tabs never overwrite each other
  window.addEventListener('storage', e => {
    if (e.key !== S.STORAGE_KEY || !e.newValue) return;
    try {
      const inc = S.migrate(JSON.parse(e.newValue));
      if (inc.epoch > save.epoch) { save = inc; DEVICE = S.getDeviceId(); if (!Run.active) go(current); }
      else if (inc.epoch === save.epoch) save = S.merge(save, inc);
      renderTop();
    } catch (err) { /* ignore */ }
  });

  Voice.init();
  syncVoiceClass();
  applyTheme();
  renderTop();
  go('learn');
  if (boot.status === 'restored-backup') toast('⚠️ Main save was damaged — restored from the automatic backup.', 6000);
  if (boot.status === 'corrupt') DEVICE = S.rotateDeviceId();
  if (!S.storageWritable()) showSaveFailed();
  if (boot.status === 'corrupt') modal(`<h3>⚠️ Save could not be read</h3><p>${esc(boot.error)}</p><p>Starting fresh. If you have a progress file, load it in Profile → Save & Sync.</p>`);
  if (boot.status === 'new') setTimeout(() => modal(`<div class="center"><div class="trophy">🦉</div><h2>Salvē!</h2><p>Welcome to <b>Latinum</b> — learn Latin the way Cicero spoke it.</p><p class="muted">The course has six parts: sounds → first words → actions → the world → Roman life → real classical texts. Each unit gives you words, grammar, a story or a quote, and a 🏆 review. Start with <b>Prōnūntiātiō</b>.</p></div>`, [{ label: 'Incipiāmus! (Let\'s begin)', primary: true }]), 300);
  checkAchievements();

  // exposed for debugging / tests in the browser console
  window.__latinum = { get save() { return save; }, buildLesson, startLesson, runCustom: items => startLesson(null, 'custom', items),
    finishNow: () => { if (Run.active) { Run.queue = []; Run.done = Math.max(Run.done, 1); nextEx(); } } };
})();
