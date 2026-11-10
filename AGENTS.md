# AGENTS.md — rules for AI assistants editing Latinum

> Read this file completely before changing any code. The user's study progress
> lives in save files made by this app. **A broken save system = months of progress lost.**
> When in doubt, ask the user instead of guessing.

## Project map

| File | Purpose | Risk |
|---|---|---|
| `index.html` | Shell. Loads scripts in order: latin → save → course → app | low |
| `js/latin.js` | Phonology: syllables, **stress**, respelling, TTS strings. Pure functions | medium |
| `js/save.js` | **Save system.** localStorage, file/code import/export, merge, migrations | **HIGH** |
| `js/course.js` | All content: `WORDS`, `UNITS` → lessons, `GLOSS` | medium (IDs!) |
| `js/app.js` | UI, exercises, XP, achievements | medium |
| `css/style.css` | Styles, light/dark tokens | low |
| `tests/run-tests.js` | Test suite (no deps). **Run after every change** | — |
| `tests/frozen-ids.json` | IDs that exist in users' saves. **Append-only** | — |
| frozen storage keys | `latinum.save`, `latinum.save.backup`, `latinum.save.prereset`, `latinum.save.corrupt-*`, `latinum.deviceId` | **HIGH** |
| `tests/fixtures/save-v1.json` | A real v1 save. Must always load. **Never edit; add new fixtures instead** | — |

No build step, no npm, no ES modules (must work from `file://`). Plain `<script>` globals:
`Latin`, `SaveSystem`, `Course`.

## ✅ Definition of done

```
node tests/run-tests.js      # must print: ✅ N passed, 0 failed
```
If a test fails, fix your code — **do not weaken or delete the test** (unless the user
explicitly asks and understands the consequence).

## 🔒 Save system contract (non-negotiable)

1. **Frozen constants** in `save.js` — never change: `APP_ID`, `STORAGE_KEY`, `BACKUP_KEY`,
   `DEVICE_KEY`, `CODE_PREFIX`. Changing them makes the app "forget" all progress.
2. **IDs are forever.** Word keys in `WORDS`, unit ids, lesson ids, achievement ids are stored
   in saves. Never rename, never reuse for different content, never delete.
   - To retire a lesson: add `hidden: true`. To retire a word: leave it in `WORDS` and just
     stop referencing it.
   - New content → new ids. Then **append** the new ids to `tests/frozen-ids.json`.
   - You *may* freely change everything else: translations, images, tips, order, sentences.
3. **Changing the save shape:**
   - Adding a new optional field → add it with a default to `defaultSave()` (or
     `counterDefaults()`). `normalize()` fills it into old saves. No migration needed.
   - Renaming/moving/re-typing a field → bump `CURRENT_SCHEMA` by 1 **and** add
     `MIGRATIONS[oldVersion] = s => { ...; return s; }`. Then add a fixture
     `tests/fixtures/save-v<old>.json` (copy of an old save) and a test that it migrates.
   - Never remove an old migration.
4. **Preserve unknown data.** `normalize()`, `migrate()` and `merge()` must keep fields and IDs
   they don't recognise (they may come from a newer/older version or another device).
   Put experimental per-user data under `save.ext.<yourFeature>` (e.g. `ext.daily` = daily quests).
5. **Merge must stay commutative and idempotent** (`merge(a,b) == merge(b,a)`,
   `merge(a,a) == a`) and must never lose progress. Additive counters (XP, number of
   correct answers…) live **per device** in `save.counters[deviceId]` and are merged with
   per-field `max` (a G-counter). Never store a cross-device total as a single number.
   - New additive stat → add it to `counterDefaults()`, increment it with
     `SaveSystem.bump(save, DEVICE, 'field')`, read it with `SaveSystem.total(save, 'field')`.
   - New "best/record" value → `save.records.<name>` (merged with max).
6. **Only `save.js` touches localStorage keys of the save.** `app.js` mutates the `save`
   object and calls `commit()`. Do not write `localStorage.setItem('latinum.save', …)` anywhere else.
7. A save from a newer schema must be refused (read-only), never overwritten. Keep that logic.
8. **Multi-tab & reset safety** (don't remove):
   - `app.js:commit()` re-reads storage and merges before every write (same `epoch`), so two
     tabs never overwrite each other.
   - Reset / replace-import / restore: take `SaveSystem.snapshot()` first, bump `save.epoch`,
     and call `SaveSystem.rotateDeviceId()` (per-device counters must never go backwards
     under the same id). Other tabs adopt a higher epoch instead of merging.
   - Unreadable saves are copied to `latinum.save.corrupt-<ts>` before anything is written.
   - `normalize()` clamps all numbers and drops `__proto__`/`constructor`/`prototype` keys;
     app code must look ids up with `hasOwn`/`isWord`, never `WORDS[id]` on untrusted ids.
   - Practice runs must not count as lessons (XP/achievement farming).
9. Never auto-delete or reset progress. Reset happens only through the explicit
   "Reset all progress" button (which keeps a backup copy).

## Content conventions (`course.js`)

- Long vowels with macrons (`ā ē ī ō ū ȳ`). Consonantal u = `v`. Consonantal i stays `i`.
- Enclitic: `virum+que`. Manual syllables (for compounds the algorithm gets wrong): `ad|iu|vat`.
  Markers are invisible to the learner.
- Check stress of new words: add them to the `STRESS` table in `tests/run-tests.js`
  if they are tricky. Classical (restored) pronunciation only — never ecclesiastical.
- Classical quotes go in `sentences` with an accurate `src` (author, work, line). Don't
  invent attributions; mark proverbs as "Latin proverb" / "after …".
- `en` is the main translation; extra accepted English goes in `alt` (articles a/an/the are
  ignored automatically when checking answers).

## Adding an exercise type

Add a renderer to `EX` in `app.js` returning `{ check(), reveal() }` where each returns
`{ ok, html, say?, words? }`, and generate it in `buildLesson` / `buildPractice`.
Exercise types are **not** stored in saves, so they can change freely.
