/* =====================================================================
 *  save.js — PROGRESS / SAVE SYSTEM
 *
 *  ⚠️  AI / DEVELOPER: READ AGENTS.md ("Save system contract") BEFORE
 *  CHANGING ANYTHING IN THIS FILE OR ANY ID IN course.js.
 *  Breaking this file = users lose months of progress.
 *
 *  Short version of the contract:
 *   1. NEVER rename/remove STORAGE_KEY, DEVICE_KEY, CODE_PREFIX, APP_ID.
 *   2. NEVER rename or reuse lesson / word / achievement IDs.
 *   3. Changing the SHAPE of the save?  → bump CURRENT_SCHEMA and add a
 *      migration MIGRATIONS[oldVersion] that converts old → new.
 *      Adding a NEW OPTIONAL field with a default in defaultSave() does
 *      NOT need a migration (normalize() fills it in).
 *   4. NEVER delete unknown fields / unknown IDs (they may belong to a
 *      newer or older app version). normalize() must preserve them.
 *   5. merge(a, b) must stay: commutative, idempotent, never loses data.
 *   6. Run `node tests/run-tests.js` — all save tests must pass.
 *
 *  Storage layers:
 *   - localStorage[STORAGE_KEY]   — autosave (updated after every lesson)
 *   - localStorage[BACKUP_KEY]    — previous good save (auto)
 *   - JSON file export / import   — manual backup + device sync
 *   - "sync code" (compressed text) — paste between devices via messenger
 *
 *  Cross-device sync is a MERGE, not an overwrite: counters are stored
 *  per device (a "G-counter"), so studying on two devices and merging
 *  in any order never loses or double-counts XP.
 * ===================================================================== */
(function (root) {
  'use strict';

  // ---- FROZEN CONSTANTS (never change) ----
  const APP_ID = 'latinum';
  const STORAGE_KEY = 'latinum.save';
  const BACKUP_KEY = 'latinum.save.backup';
  const DEVICE_KEY = 'latinum.deviceId';
  const CODE_PREFIX = 'LATINUM1:';

  // ---- Schema version: bump ONLY together with a migration ----
  const CURRENT_SCHEMA = 1;

  /** The canonical shape. New optional fields go here with a default. */
  function defaultSave() {
    const now = Date.now();
    return {
      app: APP_ID,
      schema: CURRENT_SCHEMA,
      createdAt: now,
      updatedAt: now,
      lastExportAt: 0,
      profile: { name: '', dailyGoal: 30 },
      settings: { sound: true, tts: true, voiceURI: '', ttsRate: 0.8, listening: true, darkMode: 'auto', unlockAll: false },
      // per-device additive counters: { [deviceId]: counterDefaults() }
      counters: {},
      // { [lessonId]: { lvl: 0..5, best: 0..100, last: timestamp, n: timesCompleted } }
      lessons: {},
      // { [wordId]: { s: strength 0..5, last: timestamp, c: correct, w: wrong } }
      words: {},
      // { [achievementId]: unlockTimestamp }
      achievements: {},
      records: { arenaBest: 0 },
      // free space for future features (keep unknown keys!)
      ext: {}
    };
  }
  function counterDefaults() {
    return { xpByDay: {}, correct: 0, wrong: 0, stress: 0, lessons: 0, perfect: 0 };
  }

  /**
   * MIGRATIONS[n] converts a save with schema n into schema n+1.
   * Must be pure-ish: take the object, return the upgraded object.
   * Example for the future:
   *   MIGRATIONS[1] = s => { s.profile.avatar = s.profile.icon || '🦉'; delete s.profile.icon; return s; };
   * (and set CURRENT_SCHEMA = 2)
   */
  const MIGRATIONS = {
    // 0: legacy/unversioned → 1
    0: s => { s.schema = 1; return s; }
  };

  // Maps whose keys are dynamic IDs: normalize() keeps all their keys.
  const OPEN_MAPS = ['counters', 'lessons', 'words', 'achievements', 'ext'];

  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);

  /** Fill missing / wrong-typed fields from defaults; preserve unknown fields. */
  function normalize(s) {
    const d = defaultSave();
    if (!isObj(s)) return d;
    for (const k of Object.keys(d)) {
      if (OPEN_MAPS.includes(k)) { if (!isObj(s[k])) s[k] = {}; continue; }
      if (isObj(d[k])) {
        if (!isObj(s[k])) s[k] = {};
        for (const kk of Object.keys(d[k])) {
          if (typeof s[k][kk] !== typeof d[k][kk]) s[k][kk] = d[k][kk];
        }
      } else if (typeof s[k] !== typeof d[k]) s[k] = d[k];
    }
    for (const dev of Object.keys(s.counters)) {
      const c = s.counters[dev];
      if (!isObj(c)) { s.counters[dev] = counterDefaults(); continue; }
      const cd = counterDefaults();
      for (const kk of Object.keys(cd)) if (typeof c[kk] !== typeof cd[kk]) c[kk] = cd[kk];
      if (!isObj(c.xpByDay)) c.xpByDay = {};
    }
    for (const id of Object.keys(s.lessons)) {
      const l = s.lessons[id];
      if (!isObj(l)) { delete s.lessons[id]; continue; }
      l.lvl = Math.max(0, Math.min(5, num(l.lvl))); l.best = num(l.best); l.last = num(l.last); l.n = num(l.n);
    }
    for (const id of Object.keys(s.words)) {
      const w = s.words[id];
      if (!isObj(w)) { delete s.words[id]; continue; }
      w.s = Math.max(0, Math.min(5, num(w.s))); w.last = num(w.last); w.c = num(w.c); w.w = num(w.w);
    }
    s.app = APP_ID;
    return s;
  }

  /** Upgrade any older save to CURRENT_SCHEMA. Throws on foreign data. */
  function migrate(s) {
    if (!isObj(s)) throw new Error('Not a save object');
    if (s.app !== undefined && s.app !== APP_ID) throw new Error('This file is not a Latinum save');
    let v = typeof s.schema === 'number' ? s.schema : 0;
    if (v > CURRENT_SCHEMA) {
      const e = new Error(`This save is from a NEWER version of the app (schema ${v}). Update the app first.`);
      e.code = 'NEWER'; throw e;
    }
    while (v < CURRENT_SCHEMA) {
      if (!MIGRATIONS[v]) throw new Error('No migration from schema ' + v);
      s = MIGRATIONS[v](s);
      v++;
      s.schema = v;
    }
    return normalize(s);
  }

  // ---------- merge (multi-device sync) ----------
  function mergeMaxMap(a, b) {
    const out = Object.assign({}, a);
    for (const k of Object.keys(b)) out[k] = Math.max(num(out[k]), num(b[k]));
    return out;
  }
  function deepCopy(x) { return JSON.parse(JSON.stringify(x)); }

  /**
   * Combine two saves. Commutative & idempotent: merge(a,b) == merge(b,a),
   * merge(a,a) == a. Nothing is lost.
   */
  function merge(aIn, bIn) {
    const a = normalize(deepCopy(aIn)), b = normalize(deepCopy(bIn));
    const newer = a.updatedAt >= b.updatedAt ? a : b;
    const older = newer === a ? b : a;
    // start from the newer one so profile/settings/unknown top-level fields come from it
    const out = deepCopy(newer);
    // unknown top-level fields only in the older save are kept too
    for (const k of Object.keys(older)) if (!(k in out)) out[k] = deepCopy(older[k]);

    out.createdAt = Math.min(a.createdAt, b.createdAt);
    out.updatedAt = Math.max(a.updatedAt, b.updatedAt);
    out.lastExportAt = Math.max(a.lastExportAt, b.lastExportAt);
    out.schema = CURRENT_SCHEMA;

    // counters: per device, per field max (G-counter)
    out.counters = {};
    for (const dev of new Set([...Object.keys(a.counters), ...Object.keys(b.counters)])) {
      const ca = a.counters[dev] || counterDefaults(), cb = b.counters[dev] || counterDefaults();
      const c = Object.assign({}, ca, cb);
      for (const k of Object.keys(counterDefaults())) {
        if (k === 'xpByDay') c.xpByDay = mergeMaxMap(ca.xpByDay, cb.xpByDay);
        else c[k] = Math.max(num(ca[k]), num(cb[k]));
      }
      out.counters[dev] = c;
    }
    // lessons: per field max
    out.lessons = {};
    for (const id of new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)])) {
      const la = a.lessons[id], lb = b.lessons[id];
      if (!la || !lb) { out.lessons[id] = deepCopy(la || lb); continue; }
      out.lessons[id] = Object.assign({}, la, lb, {
        lvl: Math.max(la.lvl, lb.lvl), best: Math.max(la.best, lb.best),
        last: Math.max(la.last, lb.last), n: Math.max(la.n, lb.n)
      });
    }
    // words: strength from the most recently practised copy, counts max
    out.words = {};
    for (const id of new Set([...Object.keys(a.words), ...Object.keys(b.words)])) {
      const wa = a.words[id], wb = b.words[id];
      if (!wa || !wb) { out.words[id] = deepCopy(wa || wb); continue; }
      const recent = wa.last > wb.last ? wa : wb.last > wa.last ? wb : (wa.s >= wb.s ? wa : wb);
      out.words[id] = Object.assign({}, wa, wb, {
        s: recent.s, last: Math.max(wa.last, wb.last), c: Math.max(wa.c, wb.c), w: Math.max(wa.w, wb.w)
      });
    }
    // achievements: union, earliest unlock time
    out.achievements = {};
    for (const id of new Set([...Object.keys(a.achievements), ...Object.keys(b.achievements)])) {
      const ta = num(a.achievements[id], Infinity), tb = num(b.achievements[id], Infinity);
      out.achievements[id] = Math.min(ta, tb);
    }
    // records: max of every numeric record
    out.records = Object.assign({}, older.records, newer.records);
    for (const k of new Set([...Object.keys(a.records), ...Object.keys(b.records)])) {
      if (typeof a.records[k] === 'number' || typeof b.records[k] === 'number')
        out.records[k] = Math.max(num(a.records[k]), num(b.records[k]));
    }
    // ext: keep everything, newer wins on conflicts
    out.ext = Object.assign({}, older.ext, newer.ext);
    return normalize(out);
  }

  // ---------- storage ----------
  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }

  let readOnlyReason = ''; // set when the stored save is from a newer app version

  function getDeviceId() {
    const store = ls();
    let id = null;
    try { id = store && store.getItem(DEVICE_KEY); } catch (e) { /* ignore */ }
    if (!id) {
      id = 'dev-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      try { store && store.setItem(DEVICE_KEY, id); } catch (e) { /* ignore */ }
    }
    return id;
  }

  /** Load from localStorage. Returns { save, status, error? } */
  function load() {
    const store = ls();
    readOnlyReason = '';
    const tryKey = key => {
      const txt = store && store.getItem(key);
      if (!txt) return null;
      return migrate(JSON.parse(txt));
    };
    try {
      const s = tryKey(STORAGE_KEY);
      if (s) return { save: s, status: 'ok' };
    } catch (e) {
      if (e.code === 'NEWER') {
        readOnlyReason = e.message;
        return { save: normalize(JSON.parse(store.getItem(STORAGE_KEY))), status: 'newer', error: e.message };
      }
      try {
        const b = tryKey(BACKUP_KEY);
        if (b) return { save: b, status: 'restored-backup', error: String(e.message || e) };
      } catch (e2) { /* fall through */ }
      return { save: defaultSave(), status: 'corrupt', error: String(e.message || e) };
    }
    return { save: defaultSave(), status: 'new' };
  }

  /** Persist to localStorage (keeps the previous version as backup). */
  function persist(s) {
    if (readOnlyReason) return false;
    const store = ls();
    if (!store) return false;
    try {
      s.updatedAt = Date.now();
      const prev = store.getItem(STORAGE_KEY);
      if (prev) { try { JSON.parse(prev); store.setItem(BACKUP_KEY, prev); } catch (e) { /* corrupt: don't back up */ } }
      store.setItem(STORAGE_KEY, JSON.stringify(s));
      return true;
    } catch (e) {
      console.error('[save] persist failed', e);
      return false;
    }
  }

  function wipeLocal() {
    const store = ls();
    if (!store) return;
    const prev = store.getItem(STORAGE_KEY);
    if (prev) store.setItem(BACKUP_KEY, prev);
    store.removeItem(STORAGE_KEY);
    readOnlyReason = '';
  }

  // ---------- file / code import-export ----------
  function dayKey(d) {
    d = d ? new Date(d) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function toJSON(s) { return JSON.stringify(s, null, 1); }

  function exportFile(s) {
    s.lastExportAt = Date.now();
    persist(s);
    const blob = new Blob([toJSON(s)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `latinum-progress-${dayKey()}.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function b64encode(bytes) {
    let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64decode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '=';
    const bin = atob(str); const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function streamBytes(bytes, stream) {
    const s = new Blob([bytes]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(s).arrayBuffer());
  }

  /** Compact text code for copy-paste sync: "LATINUM1:z:...." */
  async function toCode(s) {
    const json = new TextEncoder().encode(JSON.stringify(s));
    if (typeof CompressionStream !== 'undefined') {
      return CODE_PREFIX + 'z:' + b64encode(await streamBytes(json, new CompressionStream('deflate-raw')));
    }
    return CODE_PREFIX + 'j:' + b64encode(json);
  }

  /** Parse a JSON file text OR a sync code into a migrated save. */
  async function parseImport(text) {
    text = String(text).trim();
    let obj;
    if (text.startsWith(CODE_PREFIX)) {
      const body = text.slice(CODE_PREFIX.length).replace(/\s+/g, '');
      const mode = body.slice(0, 2), data = b64decode(body.slice(2));
      const bytes = mode === 'z:' ? await streamBytes(data, new DecompressionStream('deflate-raw')) : data;
      obj = JSON.parse(new TextDecoder().decode(bytes));
    } else {
      obj = JSON.parse(text);
    }
    return migrate(obj);
  }

  // ---------- helpers used by the app ----------
  function counter(s, deviceId) {
    if (!s.counters[deviceId]) s.counters[deviceId] = counterDefaults();
    return s.counters[deviceId];
  }
  function addXP(s, deviceId, n, when) {
    const c = counter(s, deviceId), k = dayKey(when);
    c.xpByDay[k] = num(c.xpByDay[k]) + n;
  }
  function bump(s, deviceId, field, n = 1) { const c = counter(s, deviceId); c[field] = num(c[field]) + n; }
  function total(s, field) {
    return Object.values(s.counters).reduce((t, c) => t + num(c[field]), 0);
  }
  function xpByDay(s) {
    const m = {};
    for (const c of Object.values(s.counters)) for (const [d, v] of Object.entries(c.xpByDay)) m[d] = num(m[d]) + num(v);
    return m;
  }
  function totalXP(s) { return Object.values(xpByDay(s)).reduce((a, b) => a + b, 0); }
  function xpToday(s) { return num(xpByDay(s)[dayKey()]); }
  /** Consecutive days with XP; today not yet studied doesn't break it. */
  function streak(s) {
    const m = xpByDay(s);
    const d = new Date(); d.setHours(12, 0, 0, 0);
    let n = 0;
    if (!(m[dayKey(d)] > 0)) d.setDate(d.getDate() - 1);
    while (m[dayKey(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  const SaveSystem = {
    APP_ID, STORAGE_KEY, BACKUP_KEY, DEVICE_KEY, CODE_PREFIX, CURRENT_SCHEMA, MIGRATIONS,
    defaultSave, normalize, migrate, merge, load, persist, wipeLocal, getDeviceId,
    exportFile, toCode, parseImport, toJSON,
    dayKey, addXP, bump, total, xpByDay, totalXP, xpToday, streak,
    get readOnlyReason() { return readOnlyReason; }
  };
  root.SaveSystem = SaveSystem;
  if (typeof module !== 'undefined' && module.exports) module.exports = SaveSystem;
})(typeof globalThis !== 'undefined' ? globalThis : this);
