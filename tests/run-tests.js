#!/usr/bin/env node
/* =====================================================================
 *  Latinum test suite — run:  node tests/run-tests.js
 *  MUST pass before any change is considered done (see AGENTS.md).
 *  No dependencies.
 * ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// minimal localStorage mock so save.js can run in node
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};

const L = require(path.join(root, 'js/latin.js'));
const S = require(path.join(root, 'js/save.js'));
const C = require(path.join(root, 'js/course.js'));

let pass = 0, fail = 0;
const tests = [];
function test(name, fn) { tests.push([name, fn]); }
function eq(a, b, msg) {
  const ja = JSON.stringify(a), jb = JSON.stringify(b);
  if (ja !== jb) throw new Error((msg || 'not equal') + `\n   got:      ${ja}\n   expected: ${jb}`);
}
function ok(c, msg) { if (!c) throw new Error(msg || 'assertion failed'); }
const fixture = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/save-v1.json'), 'utf8'));
const sortKeys = o => Array.isArray(o) ? o.map(sortKeys) : o && typeof o === 'object'
  ? Object.keys(o).sort().reduce((r, k) => (r[k] = sortKeys(o[k]), r), {}) : o;

// ---------------- stress engine ----------------
const STRESS = {
  'puella': 'pu-EL-la', 'fēmina': 'FĒ-mi-na', 'familia': 'fa-MI-li-a', 'amīcus': 'a-MĪ-cus',
  'Rōmānus': 'Rō-MĀ-nus', 'tenebrae': 'TE-ne-brae', 'fenestra': 'fe-NES-tra', 'magister': 'ma-GIS-ter',
  'quattuor': 'QUAT-tu-or', 'populus+que': 'po-pu-LUS-que', 'virum+que': 'vi-RUM-que', 'custōdiet': 'cus-TŌ-di-et',
  'Italia': 'I-TA-li-a', 'dīvīsa': 'dī-VĪ-sa', 'decōrum': 'de-CŌ-rum', 'ad|iu|vat': 'AD-iu-vat', 'labōrō': 'la-BŌ-rō',
  'ambulō': 'AM-bu-lō', 'rosa': 'RO-sa', 'sōl': 'SŌL', 'patria': 'PA-tri-a', 'lingua': 'LIN-gua', 'dextra': 'DEX-tra',
  'corpore': 'COR-po-re', 'rēgīna': 'rē-GĪ-na', 'Cicerō': 'CI-ce-rō', 'omnia': 'OM-ni-a', 'Iūlius': 'IŪ-li-us',
  // v0.3
  'amāmus': 'a-MĀ-mus', 'legimus': 'LE-gi-mus', 'discipulus': 'dis-CI-pu-lus', 'respondeō': 'res-PON-de-ō',
  'cubiculum': 'cu-BI-cu-lum', 'improbus': 'IM-pro-bus', 'aedificāvit': 'ae-di-fi-CĀ-vit', 'pugnāvērunt': 'pug-nā-VĒ-runt',
  'labōrāvimus': 'la-bō-RĀ-vi-mus', 'vidēs+ne': 'vi-DĒS-ne', 'repetītiō': 're-pe-TĪ-ti-ō', 'videō': 'VI-de-ō',
  'Iūlia': 'IŪ-li-a', 'īnsula': 'ĪN-su-la', 'hodiē': 'HO-di-ē', 'docendō': 'do-CEN-dō', 'iam': 'IAM', 'audiunt': 'AU-di-unt'
};
for (const [w, exp] of Object.entries(STRESS)) {
  test(`stress: ${w}`, () => {
    const a = L.analyze(w);
    eq(a.syllables.map((s, i) => (i === a.stress && a.n > 1) || a.n === 1 ? s.text.toUpperCase() : s.text).join('-'), exp);
  });
}
test('respell: amīcus', () => eq(L.respell('amīcus'), 'a-MEE-kus'));
test('respell: Caesar', () => eq(L.respell('Caesar'), 'KAI-sar'));
test('tts es accent forced on stressed vowel', () => eq(L.ttsWord('fēmina', 'es'), 'fémina'));
test('every course word/sentence token analyses without error', () => {
  const toks = [...Object.values(C.WORDS).map(w => w.la),
    ...C.UNITS.flatMap(u => u.lessons.flatMap(l => (l.sentences || []).flatMap(s => L.tokenize(s.la).filter(t => t.word).map(t => t.w))))];
  toks.forEach(t => { const a = L.analyze(t); ok(a.n >= 1, 'no syllables: ' + t); ok(a.stress >= 0 && a.stress < a.n, 'bad stress: ' + t); });
});

// ---------------- course integrity ----------------
test('lesson & unit ids unique', () => {
  const ids = C.UNITS.flatMap(u => [u.id, ...u.lessons.map(l => l.id)]);
  eq(ids.length, new Set(ids).size, 'duplicate ids');
});
test('lessons reference existing words', () => {
  C.UNITS.forEach(u => u.lessons.forEach(l => {
    l.words.forEach(w => ok(C.WORDS[w], `${l.id} references unknown word "${w}"`));
    (l.pairs || []).flat().forEach(w => ok(C.WORDS[w], `${l.id} pair references unknown word "${w}"`));
  }));
});
// all Latin a learner can tap: sentences, drills (+options), story lines
const lessonTexts = l => [...(l.sentences || []).map(s => s.la), ...(l.drills || []).flatMap(d => [d.la.replace(/[{}]/g, ''), ...d.opts]),
  ...(l.story ? l.story.lines.map(x => x.la) : [])];
test('every tappable Latin word has a gloss (GLOSS or WORDS)', () => {
  const known = new Set([...Object.keys(C.GLOSS), ...Object.values(C.WORDS).map(w => w.la.toLowerCase())]);
  const miss = new Set();
  C.UNITS.forEach(u => u.lessons.forEach(l => lessonTexts(l).forEach(t => L.tokenize(t).filter(x => x.word)
    .forEach(x => { const c = L.clean(x.w).toLowerCase(); if (!known.has(c)) miss.add(c); }))));
  eq([...miss], [], 'add these to GLOSS in course.js');
});
test('drills are well-formed (one {gap}, distinct options)', () => {
  C.UNITS.forEach(u => u.lessons.forEach(l => (l.drills || []).forEach(d => {
    const m = d.la.match(/\{([^}]+)\}/g);
    ok(m && m.length === 1, `${l.id}: drill needs exactly one {gap}: ${d.la}`);
    const ans = m[0].slice(1, -1);
    ok(Array.isArray(d.opts) && d.opts.length >= 1, `${l.id}: drill has no wrong options`);
    ok(!d.opts.map(o => o.toLowerCase()).includes(ans.toLowerCase()), `${l.id}: option equals answer: ${d.la}`);
    ok(d.en, `${l.id}: drill without English`);
  })));
});
test('stories are well-formed', () => {
  C.UNITS.forEach(u => u.lessons.forEach(l => { if (!l.story) return;
    ok(l.story.lines.length >= 3 && l.story.lines.every(x => x.la && x.en), `${l.id}: story lines`);
    l.story.qs.forEach(q => { ok(q.a && q.opts.length >= 2 && !q.opts.includes(q.a), `${l.id}: question "${q.q}"`);
      ok(q.line === undefined || l.story.lines[q.line], `${l.id}: q.line out of range`); });
  }));
});
test('every unit has exactly one review lesson, last in the unit, covering its lessons', () => {
  C.UNITS.forEach(u => {
    const r = u.lessons.filter(l => l.review);
    eq(r.length, 1, u.id + ' review count');
    ok(u.lessons[u.lessons.length - 1].review, u.id + ': review must be last');
    eq(r[0].from, u.lessons.filter(l => !l.review && !l.hidden).map(l => l.id), u.id + ': review sources');
  });
});
test('every unit belongs to a part', () => {
  const parts = new Set(C.PARTS.map(p => p.n));
  C.UNITS.forEach(u => ok(parts.has(u.part), u.id + ' has no valid part'));
  const seq = C.UNITS.map(u => u.part);
  eq(seq, seq.slice().sort((a, b) => a - b), 'units must be ordered by part');
});
test('FROZEN ids still exist (never delete ids that users may have saved)', () => {
  const fr = JSON.parse(fs.readFileSync(path.join(__dirname, 'frozen-ids.json'), 'utf8'));
  const lessons = new Set(C.UNITS.flatMap(u => u.lessons.map(l => l.id)));
  const units = new Set(C.UNITS.map(u => u.id));
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  fr.lessons.forEach(id => ok(lessons.has(id), `lesson id "${id}" was removed/renamed — set hidden:true instead`));
  fr.units.forEach(id => ok(units.has(id), `unit id "${id}" was removed/renamed`));
  fr.words.forEach(id => ok(C.WORDS[id], `word id "${id}" was removed/renamed`));
  fr.achievements.forEach(id => ok(app.includes(`id: '${id}'`), `achievement id "${id}" was removed/renamed`));
});

test('index.html cache-busting ?v= matches APP_VERSION', () => {
  const v = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8').match(/APP_VERSION = '([0-9.]+)/)[1];
  const refs = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/\?v=[0-9.]+/g) || [];
  eq(refs.length, 5, 'all 4 scripts + css need ?v='); refs.forEach(r => eq(r, '?v=' + v, 'bump ?v= in index.html'));
});

// ---------------- save system ----------------
test('frozen save constants unchanged', () => {
  eq([S.APP_ID, S.STORAGE_KEY, S.BACKUP_KEY, S.DEVICE_KEY, S.CODE_PREFIX],
    ['latinum', 'latinum.save', 'latinum.save.backup', 'latinum.deviceId', 'LATINUM1:']);
});
test('every schema below current has a migration', () => {
  for (let v = 0; v < S.CURRENT_SCHEMA; v++) ok(typeof S.MIGRATIONS[v] === 'function', 'missing MIGRATIONS[' + v + ']');
});
test('fixture v1 save migrates and keeps all data', () => {
  const s = S.migrate(fixture());
  eq(s.schema, S.CURRENT_SCHEMA);
  eq(S.totalXP(s), 95);
  eq(s.lessons.l_sounds_1.lvl, 2);
  eq(s.lessons.l_removed_in_future.lvl, 3, 'unknown lesson ids must be preserved');
  eq(s.ext.someFutureFeature, { x: 1 }, 'ext must be preserved');
  eq(s.unknownTopLevelField, 'must survive', 'unknown fields must be preserved');
  eq(s.profile.name, 'Fixture');
  eq(s.records.arenaBest, 17);
  ok(typeof s.settings.unlockAll === 'boolean', 'new default fields are filled in');
});
test('legacy unversioned save (schema missing) migrates', () => {
  const f = fixture(); delete f.schema;
  eq(S.totalXP(S.migrate(f)), 95);
});
test('save from a NEWER app version is refused, not destroyed', () => {
  const f = fixture(); f.schema = S.CURRENT_SCHEMA + 1;
  let code = null; try { S.migrate(f); } catch (e) { code = e.code; }
  eq(code, 'NEWER');
});
test('foreign JSON is refused', () => {
  let threw = false; try { S.migrate({ app: 'other' }); } catch (e) { threw = true; }
  ok(threw);
});
test('normalize repairs garbage without throwing', () => {
  const s = S.migrate({ app: 'latinum', schema: 1, counters: 'x', lessons: { a: 5, b: { lvl: 99 } }, profile: null });
  eq(s.lessons.b.lvl, 5); ok(!('a' in s.lessons)); eq(s.profile.dailyGoal, 30);
});
test('merge: XP from two devices adds up, never double-counts', () => {
  const a = S.defaultSave(), b = S.defaultSave();
  S.addXP(a, 'dev-A', 50); S.addXP(b, 'dev-B', 30); b.updatedAt = a.updatedAt + 10;
  const m = S.merge(a, b);
  eq(S.totalXP(m), 80);
  eq(S.totalXP(S.merge(m, a)), 80, 're-merging must not double count');
  eq(S.totalXP(S.merge(m, m)), 80);
});
test('merge: commutative (different timestamps)', () => {
  const a = S.migrate(fixture()), b = S.defaultSave();
  S.addXP(b, 'dev-tablet', 12); b.lessons.l_sounds_1 = { lvl: 4, best: 80, last: 5, n: 1 }; b.updatedAt = a.updatedAt + 1000;
  b.words.aqua = { s: 1, last: a.words.aqua.last + 1, c: 9, w: 0 };
  const ab = sortKeys(S.merge(a, b)), ba = sortKeys(S.merge(b, a));
  eq(ab, ba);
  eq(ab.lessons.l_sounds_1.lvl, 4); eq(ab.lessons.l_sounds_1.best, 90);
  eq(ab.words.aqua.s, 1, 'strength comes from the most recently practised copy');
  eq(ab.unknownTopLevelField, 'must survive');
});
test('merge: idempotent', () => {
  const a = S.migrate(fixture());
  eq(sortKeys(S.merge(a, a)), sortKeys(S.migrate(fixture())));
});
test('persist → load round trip', () => {
  const s = S.migrate(fixture());
  ok(S.persist(s));
  const r = S.load();
  eq(r.status, 'ok'); eq(S.totalXP(r.save), 95);
});
test('corrupt main save falls back to backup', () => {
  const s = S.migrate(fixture()); S.persist(s); S.persist(s);
  store[S.STORAGE_KEY] = '{broken';
  const r = S.load();
  eq(r.status, 'restored-backup'); eq(S.totalXP(r.save), 95);
});
test('streak counts consecutive days', () => {
  const s = S.defaultSave(); const d = new Date();
  for (let i = 1; i <= 3; i++) { const x = new Date(d); x.setDate(d.getDate() - i); S.addXP(s, 'dev', 5, x); }
  eq(S.streak(s), 3, 'today not yet studied keeps the streak');
  S.addXP(s, 'dev', 5); eq(S.streak(s), 4);
});
test('sync code round trip (compressed)', async () => {
  const s = S.migrate(fixture());
  const code = await S.toCode(s);
  ok(code.startsWith(S.CODE_PREFIX));
  const back = await S.parseImport(code);
  eq(sortKeys(back), sortKeys(s));
});
test('file JSON import round trip', async () => {
  const s = S.migrate(fixture());
  eq(sortKeys(await S.parseImport(S.toJSON(s))), sortKeys(s));
});

// ---------------- hardening (found by the "destroyer" review) ----------------
const clearStore = () => Object.keys(store).forEach(k => delete store[k]);
test('huge / NaN / negative counters are clamped (no freeze on load)', () => {
  const f = fixture();
  f.counters['dev-phone'].xpByDay['2026-11-08'] = 1e308;
  f.counters['dev-phone'].correct = -5;
  f.counters['dev-laptop'].xpByDay['2026-11-09'] = 'NaN';
  const m = S.migrate(f);
  ok(isFinite(S.totalXP(m)) && S.totalXP(m) <= 2e6, 'xp clamped: ' + S.totalXP(m));
  eq(m.counters['dev-phone'].correct, 0);
});
test('reserved keys (__proto__, constructor) are dropped from id maps', () => {
  const f = JSON.parse('{"app":"latinum","schema":1,"words":{"constructor":{"s":3},"__proto__":{"s":1},"aqua":{"s":2}},"lessons":{"toString":{"lvl":1}}}');
  const m = S.migrate(f);
  ok(!Object.prototype.hasOwnProperty.call(m.words, 'constructor'), 'constructor kept');
  ok(!Object.prototype.hasOwnProperty.call(m.words, '__proto__'), '__proto__ kept');
  eq(m.words.aqua.s, 2);
  eq(Object.getPrototypeOf(m.words), Object.prototype, 'prototype not polluted');
});
test('fractional / string levels are sanitised; truthy achievement junk stays unlocked', () => {
  const m = S.migrate({ app: 'latinum', schema: 1, lessons: { a: { lvl: 4.5 }, b: { lvl: '3' } }, achievements: { x: true, y: 0 } });
  eq(m.lessons.a.lvl, 4); eq(m.lessons.b.lvl, 3);
  ok(m.achievements.x > 0, 'x unlocked'); ok(!('y' in m.achievements));
  eq(S.merge(m, m).achievements.x, 1);
});
test('future updatedAt is clamped', () => {
  const m = S.migrate({ app: 'latinum', schema: 1, updatedAt: Date.now() + 1e12 });
  ok(m.updatedAt <= Date.now() + 864e5 + 10);
});
test('merge commutative even with equal updatedAt', () => {
  const a = S.defaultSave(), b = S.defaultSave();
  a.updatedAt = b.updatedAt = 1000; a.profile.name = 'A'; b.profile.name = 'B';
  eq(sortKeys(S.merge(a, b)), sortKeys(S.merge(b, a)));
});
test('corrupt main + NEWER backup → read-only, nothing overwritten', () => {
  clearStore();
  const newer = JSON.stringify(Object.assign(fixture(), { schema: S.CURRENT_SCHEMA + 1 }));
  store[S.STORAGE_KEY] = '{broken'; store[S.BACKUP_KEY] = newer;
  const r = S.load();
  eq(r.status, 'newer'); ok(S.readOnlyReason, 'read-only');
  ok(!S.persist(r.save), 'persist refused'); eq(store[S.BACKUP_KEY], newer);
  ok(Object.keys(store).some(k => k.startsWith('latinum.save.corrupt-')), 'raw corrupt main quarantined');
  clearStore(); S.load();
});
test('reset keeps a snapshot that survives later commits', () => {
  clearStore();
  const s = S.migrate(fixture()); S.persist(s);
  S.wipeLocal();
  const fresh = S.defaultSave(); S.persist(fresh); S.persist(fresh); S.persist(fresh);
  ok(S.hasSnapshot()); eq(S.totalXP(S.readSnapshot()), 95);
  clearStore();
});
test('after reset with a NEW device id, merging the old file adds up', () => {
  const old = S.defaultSave(); S.addXP(old, 'devX', 100); S.bump(old, 'devX', 'lessons', 200);
  const fresh = S.defaultSave(); S.addXP(fresh, 'devY', 50); S.bump(fresh, 'devY', 'lessons', 5);
  const m = S.merge(fresh, old);
  eq(S.totalXP(m), 150); eq(S.total(m, 'lessons'), 205);
});
test('stress engine survives junk input', () => {
  for (const w of ['', '|', '||', '+', 'rosa+', 'a+', 'xyz', 'ĀĒĪ', '+que']) { L.analyze(w); L.explain(w); L.respell(w); L.ttsWord(w, 'es'); }
  eq(L.analyze('rosa+').enclitic, false, 'only -que/-ne/-ve count as enclitics');
});
test('oversized sync code is rejected', async () => {
  let threw = false;
  try { await S.parseImport(S.CODE_PREFIX + 'j:' + 'A'.repeat(3e7)); } catch (e) { threw = true; }
  ok(threw);
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); pass++; }
    catch (e) { fail++; console.log(`✗ ${name}\n   ${e.message}`); }
  }
  console.log(`\n${fail ? '❌' : '✅'} ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
