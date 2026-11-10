/* =====================================================================
 *  latin.js — Classical Latin phonology engine
 *  - syllabification
 *  - stress (accent) placement by the classical "penultimate rule"
 *  - human-readable explanations of WHY a syllable is stressed
 *  - English respelling ("a-MEE-kus")
 *  - text-to-speech helpers (respelling for Spanish / Italian voices,
 *    whose written accents let us FORCE the correct stress)
 *
 *  Input conventions for Latin text in course.js:
 *    - long vowels are written with macrons: ā ē ī ō ū ȳ
 *    - consonantal u is written as v (vīnum = WEE-num)
 *    - consonantal i is written as i (iam, maior); handled automatically
 *    - enclitics are marked with "+":  virum+que, populus+que
 *    - manual syllabification override with "|":  ad|iu|vat
 *  These markers are never shown to the learner.
 *
 *  Pure functions, no DOM. Tested by tests/run-tests.js.
 * ===================================================================== */
(function (root) {
  'use strict';

  const MACRON_MAP = { 'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u', 'ȳ': 'y',
    'Ā': 'A', 'Ē': 'E', 'Ī': 'I', 'Ō': 'O', 'Ū': 'U', 'Ȳ': 'Y' };
  const LONG_VOWELS = 'āēīōūȳ';
  const VOWELS = 'aeiouy' + LONG_VOWELS;
  const DIPHTHONGS = ['ae', 'au', 'oe'];
  const MUTAE = ['b', 'c', 'd', 'g', 'p', 't', 'f', 'k', 'ch', 'ph', 'th'];
  const LIQUIDAE = ['l', 'r'];
  const FRONT = ['e', 'i', 'y', 'ē', 'ī', 'ȳ', 'ae', 'oe'];

  function stripMacrons(s) {
    return String(s).replace(/[āēīōūȳĀĒĪŌŪȲ]/g, c => MACRON_MAP[c]);
  }
  function isVowel(ch) { return !!ch && VOWELS.includes(ch.toLowerCase()); }
  /** Remove internal markers (+ and |) — what the learner sees. */
  function clean(s) { return String(s).replace(/[+|]/g, ''); }

  /** Split a word into phonological units. */
  function segment(word) {
    const w = word, lw = word.toLowerCase();
    const out = [];
    let i = 0;
    while (i < lw.length) {
      const c = lw[i], n = lw[i + 1] || '', n2 = lw[i + 2] || '';
      const prev = out[out.length - 1];
      if (c === 'q' && n === 'u') { out.push({ t: 'C', s: w.substr(i, 2), k: 'qu' }); i += 2; continue; }
      if ('cptr'.includes(c) && n === 'h') { out.push({ t: 'C', s: w.substr(i, 2), k: c + 'h' }); i += 2; continue; }
      if (c === 'g' && n === 'u' && prev && prev.k === 'n' && isVowel(n2)) {
        out.push({ t: 'C', s: w.substr(i, 2), k: 'gu' }); i += 2; continue;
      }
      if (isVowel(c)) {
        const pair = lw.substr(i, 2);
        if (DIPHTHONGS.includes(pair)) {
          out.push({ t: 'V', s: w.substr(i, 2), k: pair, long: true, diph: true }); i += 2; continue;
        }
        // consonantal i: word-initial before a vowel (iam), or between vowels (maior = mai-ior)
        if (c === 'i' && isVowel(n)) {
          if (i === 0) { out.push({ t: 'C', s: w[i], k: 'j' }); i++; continue; }
          if (prev && prev.t === 'V') { out.push({ t: 'C', s: w[i], k: 'jj' }); i++; continue; }
        }
        out.push({ t: 'V', s: w[i], k: c, long: LONG_VOWELS.includes(c), diph: false });
        i++; continue;
      }
      out.push({ t: 'C', s: w[i], k: c });
      i++;
    }
    return out;
  }

  const isDouble = u => u.k === 'x' || u.k === 'z' || u.k === 'jj';
  const isMCL = (a, b) => a && b && MUTAE.includes(a.k) && LIQUIDAE.includes(b.k);

  function syllabifyUnits(units) {
    const vIdx = [];
    units.forEach((u, i) => { if (u.t === 'V') vIdx.push(i); });
    if (vIdx.length === 0) return [{ units: units.slice(), mclNext: false }];
    const sylls = [];
    let start = 0;
    for (let k = 0; k < vIdx.length; k++) {
      const v = vIdx[k];
      if (k === vIdx.length - 1) { sylls.push({ units: units.slice(start), mclNext: false }); break; }
      const nextV = vIdx[k + 1];
      const cons = units.slice(v + 1, nextV);
      let cut; // index in units where the next syllable starts
      let mclNext = false;
      if (cons.length === 0) cut = v + 1;
      else if (cons.length === 1) cut = isDouble(cons[0]) ? v + 2 : v + 1;
      else {
        const a = cons[cons.length - 2], b = cons[cons.length - 1];
        if (isMCL(a, b)) { cut = nextV - 2; if (cons.length === 2) mclNext = true; }
        else cut = nextV - 1;
      }
      sylls.push({ units: units.slice(start, cut), mclNext });
      start = cut;
    }
    return sylls;
  }

  function describe(syl) {
    const nuc = syl.units.find(u => u.t === 'V');
    const last = syl.units[syl.units.length - 1];
    const coda = [];
    if (nuc) {
      const ni = syl.units.indexOf(nuc);
      for (let j = ni + 1; j < syl.units.length; j++) coda.push(syl.units[j]);
    }
    const closed = coda.length > 0;
    return {
      text: syl.units.map(u => u.s).join(''),
      units: syl.units,
      nucleus: nuc ? nuc.s : '',
      longV: !!(nuc && nuc.long && !nuc.diph),
      diph: !!(nuc && nuc.diph),
      coda: coda.map(u => u.s).join(''),
      closed,
      doubleCoda: !!(last && isDouble(last)),
      mclNext: syl.mclNext,
      heavy: !!(nuc && nuc.long) || closed
    };
  }

  const _cache = new Map();
  /**
   * Analyse one word. Returns
   * { word, display, syllables:[{text, heavy, longV, diph, coda, closed, mclNext,...}], stress, enclitic, manual }
   */
  function analyze(rawWord) {
    if (_cache.has(rawWord)) return _cache.get(rawWord);
    let raw = String(rawWord).replace(/[^A-Za-zāēīōūȳĀĒĪŌŪȲ+|]/g, '');
    // only a real enclitic (-que / -ne / -ve after a real word) counts; stray "+" is ignored
    const enclitic = /[a-zāēīōūȳ]{2,}\+(que|ne|ve)$/i.test(raw);
    if (!enclitic) raw = raw.replace(/\+/g, '');
    const manual = raw.includes('|');
    let syllables;
    if (manual) {
      syllables = raw.replace(/\+/g, '').split('|').filter(Boolean)
        .map(p => describe({ units: segment(p), mclNext: false }));
    } else {
      syllables = syllabifyUnits(segment(raw.replace(/\+/g, ''))).map(describe);
    }
    syllables = syllables.filter(x => x.text);
    if (!syllables.length) syllables = [describe({ units: [], mclNext: false })];
    const n = syllables.length;
    let stress;
    if (n <= 2) stress = 0;
    else if (enclitic) stress = n - 2;
    else stress = syllables[n - 2].heavy ? n - 2 : n - 3;
    if (enclitic && n === 2) stress = 0;
    const res = { word: raw, display: clean(raw), syllables, stress, n, enclitic, manual };
    _cache.set(rawWord, res);
    return res;
  }

  /** Plain-English (learner-facing) explanation of the stress of a word. */
  function explain(rawWord) {
    const a = analyze(rawWord);
    const S = a.syllables, n = a.n;
    const st = S[a.stress] ? S[a.stress].text : '';
    if (!a.display) return '';
    if (n === 1) return `One syllable — it carries the stress by itself.`;
    if (a.enclitic) return `"-${S[n - 1].text}" is an enclitic tacked onto the word: the stress jumps to the syllable right before it — <b>${st}</b>.`;
    if (n === 2) return `Two syllables → the stress is <b>always on the first</b> one: <b>${st}</b>.`;
    const p = S[n - 2];
    if (p.heavy) {
      let why;
      if (p.diph) why = `it contains the diphthong <b>${p.nucleus}</b> (diphthongs are always long)`;
      else if (p.longV) why = `its vowel <b>${p.nucleus}</b> is long (macron)`;
      else if (p.doubleCoda) why = `"${p.coda}" counts as two consonants, closing the syllable`;
      else why = `it is closed by a consonant (<b>${p.coda}</b> + next consonant)`;
      return `The second-to-last syllable <b>${p.text}</b> is heavy — ${why} — so it takes the stress.`;
    }
    let extra = p.mclNext ? ` (A stop + l/r like "${S[n - 1].units.slice(0, 2).map(u => u.s).join('')}" stays together and does <i>not</i> make it heavy.)` : '';
    return `The second-to-last syllable <b>${p.text}</b> is light (short vowel, open) — so the stress moves back one: <b>${st}</b>.${extra}`;
  }

  // ---------- English respelling ----------
  const EN_V = { a: 'a', 'ā': 'aa', e: 'e', 'ē': 'ay', i: 'i', 'ī': 'ee', o: 'o', 'ō': 'oh', u: 'u', 'ū': 'oo', y: 'ü', 'ȳ': 'üü',
    ae: 'ai', au: 'ow', oe: 'oy' };
  const EN_C = { c: 'k', k: 'k', ch: 'k', qu: 'kw', gu: 'gw', v: 'w', j: 'y', jj: 'y', x: 'ks', ph: 'p', th: 't', rh: 'r' };
  function respell(rawWord) {
    const a = analyze(rawWord);
    return a.syllables.map((s, i) => {
      const prev = a.syllables[i - 1];
      const jjOn = prev && prev.units.length && prev.units[prev.units.length - 1].k === 'jj' ? 'y' : '';
      const t = jjOn + s.units.map(u => u.t === 'V' ? EN_V[u.k.toLowerCase()] || u.k : (EN_C[u.k] !== undefined ? EN_C[u.k] : u.k)).join('');
      return i === a.stress && a.n > 1 ? t.toUpperCase() : t;
    }).join('-');
  }

  // ---------- TTS respelling ----------
  // We feed Spanish/Italian voices a spelling that (1) sounds like classical
  // Latin and (2) has a written accent on the stressed vowel, which those
  // voices obey. It is an approximation; long vowels are not rendered.
  const ACC_ES = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'í' };
  const ACC_IT = { a: 'à', e: 'é', i: 'ì', o: 'ó', u: 'ù', y: 'ì' };
  function ttsWord(rawWord, lang, forceStress) {
    const a0 = analyze(rawWord);
    const a = forceStress === undefined ? a0 : Object.assign({}, a0, { stress: forceStress });
    const flat = []; // [{u, syl}]
    a.syllables.forEach((s, si) => s.units.forEach(u => flat.push({ u, si })));
    let out = '';
    flat.forEach((f, idx) => {
      const u = f.u, next = flat[idx + 1] && flat[idx + 1].u;
      const nk = next ? (next.t === 'V' ? stripMacrons(next.k.toLowerCase()) : '') : '';
      // ae/oe are rewritten to ai/oi below, so they are BACK vowels for c/g spelling
      const front = ['e', 'i', 'y'].includes(nk);
      if (u.t === 'V') {
        let base = stripMacrons(u.k.toLowerCase());
        if (base === 'ae') base = 'ai';
        if (base === 'oe') base = 'oi';
        if (base === 'y') base = 'i';
        if (f.si === a.stress && a.n > 1) {
          const acc = lang === 'it' ? ACC_IT : ACC_ES;
          base = acc[base[0]] + base.slice(1);
        }
        out += base; return;
      }
      const k = u.k;
      if (k === 'c' || k === 'k' || k === 'ch') out += front ? (lang === 'it' ? 'ch' : 'qu') : 'c';
      else if (k === 'qu') out += lang === 'it' ? 'qu' : (front ? 'cu' : 'cu');
      else if (k === 'gu') out += lang === 'it' ? 'gu' : (front ? 'gü' : 'gu');
      else if (k === 'v') out += 'u';
      else if (k === 'j' || k === 'jj') out += lang === 'it' ? 'i' : 'y';
      else if (k === 'ph') out += 'p'; // classical ph = aspirated p, not f
      else if (k === 'g' && next && next.k === 'n' && lang === 'it') out += 'n'; // gn = [ŋn], not Italian [ɲ]
      else if (k === 'g') out += front ? (lang === 'it' ? 'gh' : 'gu') : 'g';
      else if (k === 'th') out += 't';
      else if (k === 'rh') out += 'r';
      else if (k === 'l' && lang === 'es' && next && next.k === 'l') out += ''; // avoid Spanish "ll"
      else out += k;
    });
    return out;
  }
  /** Convert a Latin text to the string a TTS voice of `lang` should read. */
  function ttsText(text, lang) {
    if (lang === 'la') return stripMacrons(clean(text));
    return String(text).replace(/[A-Za-zāēīōūȳĀĒĪŌŪȲ+|]+/g, w => ttsWord(w, lang));
  }

  /** Tokenize a sentence into word / punctuation pieces. */
  function tokenize(text) {
    const re = /([A-Za-zāēīōūȳĀĒĪŌŪȲ+|]+)|([^A-Za-zāēīōūȳĀĒĪŌŪȲ+|]+)/g;
    const out = []; let m;
    while ((m = re.exec(text))) out.push(m[1] ? { w: m[1], word: true } : { w: m[2], word: false });
    return out;
  }

  /** Normalise Latin for comparison (case, punctuation, optional macrons). */
  function normLatin(s, keepMacrons) {
    let t = clean(String(s)).toLowerCase().replace(/[^a-zāēīōūȳ ]+/g, ' ').replace(/\s+/g, ' ').trim();
    return keepMacrons ? t : stripMacrons(t);
  }

  const Latin = { analyze, explain, respell, ttsText, ttsWord, tokenize, clean, stripMacrons, normLatin, segment };
  root.Latin = Latin;
  if (typeof module !== 'undefined' && module.exports) module.exports = Latin;
})(typeof globalThis !== 'undefined' ? globalThis : this);
