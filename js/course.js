/* =====================================================================
 *  course.js — ALL COURSE CONTENT (words, units, lessons, sentences)
 *
 *  ⚠️  ID RULES (see AGENTS.md):
 *   - Keys of WORDS and every `id` of a unit/lesson are stored in users'
 *     save files. NEVER rename or reuse them. To "remove" content, set
 *     `hidden: true` (lesson) instead of deleting the id.
 *   - You MAY freely: fix translations, add new words/lessons/units
 *     with NEW ids, reorder lessons, change images, tips, sentences.
 *
 *  Latin spelling conventions (see latin.js): macrons for long vowels,
 *  v for consonantal u, "+" before an enclitic (virum+que),
 *  "|" for a manual syllable split (ad|iu|vat).
 *
 *  Sentence fields: la, en, alt (other accepted English), altLa (other
 *  accepted Latin), src (attribution → shown with 📜 badge).
 * ===================================================================== */
(function (root) {
  'use strict';

  // id: { la, en, img, info?, alt?, nopic? (abstract: no picture quiz), proper? (name: no translation quiz), grp? (look-alike pictures) }
  const WORDS = {
    // --- sounds ---
    aqua: { la: 'aqua', en: 'water', img: '💧', info: 'aqua, aquae (f.)' },
    rosa: { la: 'rosa', en: 'rose', img: '🌹', info: 'rosa, rosae (f.)' },
    vinum: { la: 'vīnum', en: 'wine', img: '🍷', info: 'vīnum, vīnī (n.) — v = English w!' },
    caelum: { la: 'caelum', en: 'sky', img: '🌌', info: 'caelum, caelī (n.) — c = k, ae = "eye"', alt: ['heaven'] },
    caesar: { proper: true, la: 'Caesar', en: 'Caesar', img: '🦅', info: 'Gāius Iūlius Caesar — said KAI-sar' },
    roma: { proper: true, la: 'Rōma', en: 'Rome', img: '🐺', info: 'Rōma, Rōmae (f.)' },
    malum_apple: { la: 'mālum', en: 'apple', img: '🍎', info: 'mālum, mālī (n.) — long ā!' },
    malum_evil: { nopic: true, la: 'malum', en: 'evil', img: '😈', info: 'malum, malī (n.) — short a', alt: ['bad thing'] },
    liber_book: { la: 'liber', en: 'book', img: '📖', info: 'liber, librī (m.) — short i' },
    liber_free: { nopic: true, la: 'līber', en: 'free', img: '🔓', info: 'līber, lībera, līberum — long ī' },
    os_mouth: { la: 'ōs', en: 'mouth', img: '👄', info: 'ōs, ōris (n.) — long ō' },
    os_bone: { la: 'os', en: 'bone', img: '🦴', info: 'os, ossis (n.) — short o' },
    amicus: { grp: 'people', la: 'amīcus', en: 'friend', img: '🤝', info: 'amīcus, amīcī (m.)' },
    fenestra: { la: 'fenestra', en: 'window', img: '🪟', info: 'fenestra, fenestrae (f.)' },
    romanus: { proper: true, la: 'Rōmānus', en: 'Roman', img: '🛡️', info: 'Rōmānus, -a, -um', alt: ['a roman'] },
    puella: { grp: 'people', la: 'puella', en: 'girl', img: '👧', info: 'puella, puellae (f.)' },
    magister: { grp: 'people', la: 'magister', en: 'teacher', img: '🧑‍🏫', info: 'magister, magistrī (m.)', alt: ['master'] },
    femina: { grp: 'people', la: 'fēmina', en: 'woman', img: '👩', info: 'fēmina, fēminae (f.)' },
    dominus: { grp: 'people', la: 'dominus', en: 'master', img: '🧔', info: 'dominus, dominī (m.)', alt: ['lord'] },
    filius: { grp: 'people', la: 'fīlius', en: 'son', img: '🧒', info: 'fīlius, fīliī (m.)' },
    cicero: { proper: true, la: 'Cicerō', en: 'Cicero', img: '📜', info: 'Mārcus Tullius Cicerō — KI-ke-roh, never "SIS-er-oh"' },
    tenebrae: { la: 'tenebrae', en: 'darkness', img: '🌑', info: 'tenebrae, tenebrārum (f. pl.)' },
    italia: { proper: true, la: 'Ītalia', en: 'Italy', img: '🥾', info: 'Italia, Italiae (f.)' },
    // --- basics ---
    salve: { nopic: true, la: 'salvē', en: 'hello', img: '👋', info: 'salvē! (to one person)', alt: ['hi'] },
    vale: { nopic: true, la: 'valē', en: 'goodbye', img: '🚪', info: 'valē! (to one person)', alt: ['bye', 'farewell'] },
    puer: { grp: 'people', la: 'puer', en: 'boy', img: '👦', info: 'puer, puerī (m.)' },
    vir: { grp: 'people', la: 'vir', en: 'man', img: '👨', info: 'vir, virī (m.)' },
    sum: { nopic: true, la: 'sum', en: 'I am', img: '🙋', info: 'sum, es, est — to be' },
    es: { nopic: true, la: 'es', en: 'you are', img: '🫵', info: 'sum, es, est — to be' },
    est: { nopic: true, la: 'est', en: 'is', img: '👉', info: 'sum, es, est — to be', alt: ['he is', 'she is', 'it is'] },
    et: { nopic: true, la: 'et', en: 'and', img: '➕' },
    non: { nopic: true, la: 'nōn', en: 'not', img: '🚫' },
    ita: { nopic: true, la: 'ita', en: 'yes', img: '✅', info: 'literally "so, thus"', alt: ['so', 'thus'] },
    minime: { nopic: true, la: 'minimē', en: 'no', img: '❌', info: 'literally "least of all"', alt: ['not at all'] },
    quoque: { nopic: true, la: 'quoque', en: 'also', img: '🔁', alt: ['too'] },
    sed: { nopic: true, la: 'sed', en: 'but', img: '⚖️' },
    // --- family ---
    pater: { grp: 'people', la: 'pater', en: 'father', img: '👨‍🍼', info: 'pater, patris (m.)' },
    mater: { grp: 'people', la: 'māter', en: 'mother', img: '🤱', info: 'māter, mātris (f.)' },
    filia: { grp: 'people', la: 'fīlia', en: 'daughter', img: '👱‍♀️', info: 'fīlia, fīliae (f.)' },
    familia: { nopic: true, la: 'familia', en: 'family', img: '👨‍👩‍👧‍👦', info: 'familia, familiae (f.) — fa-MI-li-a' },
    frater: { grp: 'people', la: 'frāter', en: 'brother', img: '👬', info: 'frāter, frātris (m.)' },
    soror: { grp: 'people', la: 'soror', en: 'sister', img: '👭', info: 'soror, sorōris (f.)' },
    avus: { grp: 'people', la: 'avus', en: 'grandfather', img: '👴', info: 'avus, avī (m.)' },
    avia: { grp: 'people', la: 'avia', en: 'grandmother', img: '👵', info: 'avia, aviae (f.)' },
    // --- animals ---
    canis: { la: 'canis', en: 'dog', img: '🐕', info: 'canis, canis (m./f.)' },
    feles: { la: 'fēlēs', en: 'cat', img: '🐈', info: 'fēlēs, fēlis (f.)' },
    mus: { la: 'mūs', en: 'mouse', img: '🐭', info: 'mūs, mūris (m.)' },
    avis: { la: 'avis', en: 'bird', img: '🐦', info: 'avis, avis (f.)' },
    piscis: { la: 'piscis', en: 'fish', img: '🐟', info: 'piscis, piscis (m.)' },
    equus: { la: 'equus', en: 'horse', img: '🐎', info: 'equus, equī (m.)' },
    lupus: { la: 'lupus', en: 'wolf', img: '🐺', info: 'lupus, lupī (m.)' },
    ursus: { la: 'ursus', en: 'bear', img: '🐻', info: 'ursus, ursī (m.)' },
    leo: { la: 'leō', en: 'lion', img: '🦁', info: 'leō, leōnis (m.)' },
    taurus: { la: 'taurus', en: 'bull', img: '🐂', info: 'taurus, taurī (m.)' },
    homo: { grp: 'people', la: 'homō', en: 'human', img: '🧑', info: 'homō, hominis (m.)', alt: ['person', 'man', 'human being'] },
    // --- verbs ---
    amo: { la: 'amō', en: 'I love', img: '😍', info: 'amō, amāre — amō, amās, amat' },
    ambulo: { la: 'ambulō', en: 'I walk', img: '🚶', info: 'ambulō, ambulāre' },
    canto: { la: 'cantō', en: 'I sing', img: '🎤', info: 'cantō, cantāre' },
    laboro: { la: 'labōrō', en: 'I work', img: '🔨', info: 'labōrō, labōrāre — la-BOH-roh' },
    nato: { la: 'natō', en: 'I swim', img: '🏊', info: 'natō, natāre' },
    navigo: { la: 'nāvigō', en: 'I sail', img: '⛵', info: 'nāvigō, nāvigāre' },
    specto: { la: 'spectō', en: 'I watch', img: '👀', info: 'spectō, spectāre', alt: ['I look at'] },
    habito: { la: 'habitō', en: 'I live', img: '🏡', info: 'habitō, habitāre — to dwell', alt: ['I dwell'] },
    voco: { grp: 'voice', la: 'vocō', en: 'I call', img: '📣', info: 'vocō, vocāre' },
    nauta: { grp: 'people', la: 'nauta', en: 'sailor', img: '🧑‍✈️', info: 'nauta, nautae (m.) — a masculine word in -a!' },
    pugno: { la: 'pugnō', en: 'I fight', img: '🥊', info: 'pugnō, pugnāre' },
    odi: { nopic: true, la: 'ōdī', en: 'I hate', img: '😠', info: 'ōdī, ōdisse (perfect form, present meaning)' },
    // --- food ---
    cibus: { la: 'cibus', en: 'food', img: '🍲', info: 'cibus, cibī (m.)' },
    panis: { la: 'pānis', en: 'bread', img: '🍞', info: 'pānis, pānis (m.) — acc. pānem' },
    caseus: { la: 'cāseus', en: 'cheese', img: '🧀', info: 'cāseus, cāseī (m.) — KAA-se-us' },
    lac: { la: 'lac', en: 'milk', img: '🥛', info: 'lac, lactis (n.)' },
    mel: { la: 'mel', en: 'honey', img: '🍯', info: 'mel, mellis (n.)' },
    ovum: { la: 'ōvum', en: 'egg', img: '🥚', info: 'ōvum, ōvī (n.)' },
    uva: { la: 'ūva', en: 'grape', img: '🍇', info: 'ūva, ūvae (f.)' },
    habeo: { nopic: true, la: 'habeō', en: 'I have', img: '🤲', info: 'habeō, habēre — habeō, habēs, habet' },
    // --- nature ---
    sol: { la: 'sōl', en: 'sun', img: '☀️', info: 'sōl, sōlis (m.)' },
    luna: { la: 'lūna', en: 'moon', img: '🌙', info: 'lūna, lūnae (f.)' },
    stella: { la: 'stella', en: 'star', img: '⭐', info: 'stella, stellae (f.)' },
    terra: { la: 'terra', en: 'earth', img: '🌍', info: 'terra, terrae (f.)', alt: ['land'] },
    mare: { la: 'mare', en: 'sea', img: '🌊', info: 'mare, maris (n.) — abl. marī' },
    in: { nopic: true, la: 'in', en: 'in', img: '📍', info: 'in + ablative = in / on', alt: ['on'] },
    silva: { la: 'silva', en: 'forest', img: '🌲', info: 'silva, silvae (f.)', alt: ['wood', 'woods'] },
    flumen: { la: 'flūmen', en: 'river', img: '🏞️', info: 'flūmen, flūminis (n.)' },
    mons: { la: 'mōns', en: 'mountain', img: '⛰️', info: 'mōns, montis (m.)' },
    arbor: { la: 'arbor', en: 'tree', img: '🌳', info: 'arbor, arboris (f.)' },
    flos: { la: 'flōs', en: 'flower', img: '🌸', info: 'flōs, flōris (m.)' },
    // --- adjectives ---
    magnus: { nopic: true, la: 'magnus', en: 'big', img: '🐘', info: 'magnus, magna, magnum', alt: ['great', 'large'] },
    parvus: { nopic: true, la: 'parvus', en: 'small', img: '🐜', info: 'parvus, parva, parvum', alt: ['little'] },
    bonus: { nopic: true, la: 'bonus', en: 'good', img: '👍', info: 'bonus, bona, bonum' },
    malus: { nopic: true, la: 'malus', en: 'bad', img: '👎', info: 'malus, mala, malum', alt: ['evil'] },
    novus: { nopic: true, la: 'novus', en: 'new', img: '✨', info: 'novus, nova, novum' },
    laetus: { nopic: true, la: 'laetus', en: 'happy', img: '😊', info: 'laetus, laeta, laetum', alt: ['glad', 'joyful'] },
    tristis: { nopic: true, la: 'trīstis', en: 'sad', img: '😢', info: 'trīstis, trīste' },
    albus: { la: 'albus', en: 'white', img: '⚪', info: 'albus, alba, album' },
    niger: { la: 'niger', en: 'black', img: '⚫', info: 'niger, nigra, nigrum' },
    ruber: { la: 'ruber', en: 'red', img: '🔴', info: 'ruber, rubra, rubrum' },
    longus: { nopic: true, la: 'longus', en: 'long', img: '📏', info: 'longus, longa, longum' },
    // --- numbers ---
    unus: { la: 'ūnus', en: 'one', img: '1️⃣' },
    duo: { la: 'duo', en: 'two', img: '2️⃣' },
    tres: { la: 'trēs', en: 'three', img: '3️⃣' },
    quattuor: { la: 'quattuor', en: 'four', img: '4️⃣', info: 'KWAT-tu-or' },
    quinque: { la: 'quīnque', en: 'five', img: '5️⃣' },
    sex: { la: 'sex', en: 'six', img: '6️⃣' },
    septem: { la: 'septem', en: 'seven', img: '7️⃣' },
    octo: { la: 'octō', en: 'eight', img: '8️⃣' },
    novem: { la: 'novem', en: 'nine', img: '9️⃣' },
    decem: { la: 'decem', en: 'ten', img: '🔟' },
    // --- body ---
    caput: { nopic: true, la: 'caput', en: 'head', img: '🗿', info: 'caput, capitis (n.)' },
    oculus: { la: 'oculus', en: 'eye', img: '👁️', info: 'oculus, oculī (m.)' },
    nasus: { la: 'nāsus', en: 'nose', img: '👃', info: 'nāsus, nāsī (m.)' },
    auris: { la: 'auris', en: 'ear', img: '👂', info: 'auris, auris (f.)' },
    dens: { la: 'dēns', en: 'tooth', img: '🦷', info: 'dēns, dentis (m.)' },
    manus: { la: 'manus', en: 'hand', img: '✋', info: 'manus, manūs (f.)' },
    pes: { la: 'pēs', en: 'foot', img: '🦶', info: 'pēs, pedis (m.)' },
    cor: { la: 'cor', en: 'heart', img: '❤️', info: 'cor, cordis (n.)' },
    bracchium: { la: 'bracchium', en: 'arm', img: '💪', info: 'bracchium, bracchiī (n.)' },
    corpus: { la: 'corpus', en: 'body', img: '🧍', info: 'corpus, corporis (n.)' },
    mens: { nopic: true, la: 'mēns', en: 'mind', img: '🧠', info: 'mēns, mentis (f.)' },
    // --- city ---
    urbs: { la: 'urbs', en: 'city', img: '🏙️', info: 'urbs, urbis (f.) — abl. urbe' },
    via: { la: 'via', en: 'road', img: '🛣️', info: 'via, viae (f.)', alt: ['way', 'street'] },
    domus: { la: 'domus', en: 'house', img: '🏠', info: 'domus, domūs (f.)', alt: ['home'] },
    templum: { la: 'templum', en: 'temple', img: '🛕', info: 'templum, templī (n.)' },
    forum: { proper: true, la: 'forum', en: 'forum', img: '🏛️', info: 'forum, forī (n.) — market square', alt: ['marketplace'] },
    rex: { grp: 'people', la: 'rēx', en: 'king', img: '👑', info: 'rēx, rēgis (m.)' },
    regina: { grp: 'people', la: 'rēgīna', en: 'queen', img: '👸', info: 'rēgīna, rēgīnae (f.)' },
    miles: { grp: 'people', la: 'mīles', en: 'soldier', img: '🪖', info: 'mīles, mīlitis (m.)' },
    gladius: { la: 'gladius', en: 'sword', img: '🗡️', info: 'gladius, gladiī (m.)' },
    bellum: { la: 'bellum', en: 'war', img: '🔥', info: 'bellum, bellī (n.)' },
    pax: { la: 'pāx', en: 'peace', img: '🕊️', info: 'pāx, pācis (f.)' },
    // --- classical vocabulary ---
    dies: { nopic: true, la: 'diēs', en: 'day', img: '📅', info: 'diēs, diēī (m.) — acc. diem' },
    tempus: { nopic: true, la: 'tempus', en: 'time', img: '⏳', info: 'tempus, temporis (n.)' },
    lente: { nopic: true, la: 'lentē', en: 'slowly', img: '🐢' },
    spero: { nopic: true, la: 'spērō', en: 'I hope', img: '🙏', info: 'spērō, spērāre' },
    amor: { nopic: true, la: 'amor', en: 'love', img: '💘', info: 'amor, amōris (m.)' },
    fortuna: { nopic: true, la: 'fortūna', en: 'fortune', img: '🎡', info: 'fortūna, fortūnae (f.)', alt: ['luck'] },
    astrum: { la: 'astrum', en: 'star', img: '🌠', info: 'astrum, astrī (n.) — pl. astra' },
    humanus: { nopic: true, la: 'hūmānus', en: 'human', img: '🫂', info: 'hūmānus, -a, -um', alt: ['humane'] },
    arma: { la: 'arma', en: 'weapons', img: '⚔️', info: 'arma, armōrum (n. pl.)', alt: ['arms'] },
    patria: { nopic: true, la: 'patria', en: 'homeland', img: '🏳️', info: 'patria, patriae (f.)', alt: ['fatherland', 'country'] },
    dulcis: { nopic: true, la: 'dulcis', en: 'sweet', img: '🍬', info: 'dulcis, dulce' },
    gutta: { la: 'gutta', en: 'drop', img: '💦', info: 'gutta, guttae (f.)' },
    lapis: { la: 'lapis', en: 'stone', img: '🪨', info: 'lapis, lapidis (m.)' },

    // ===== added in v0.3 (Via Latina curriculum) =====
    // --- first story ---
    ecce: { nopic: true, la: 'ecce', en: 'look!', img: '👀', info: 'ecce! — "look, here is…"', alt: ['behold', 'here is'] },
    ubi: { nopic: true, la: 'ubi', en: 'where', img: '📍', info: 'ubi? = where?', alt: ['where?'] },
    ibi: { nopic: true, la: 'ibi', en: 'there', img: '👉', info: 'ibi = there (in that place)' },
    marcus: { proper: true, la: 'Mārcus', en: 'Marcus', img: '👦', info: 'Mārcus, Mārcī (m.) — a common Roman first name' },
    iulia: { proper: true, la: 'Iūlia', en: 'Julia', img: '👧', info: 'Iūlia, Iūliae (f.) — i before a vowel = y: YOO-li-a' },
    // --- persons ---
    ego: { nopic: true, la: 'ego', en: 'I', img: '🙋', info: 'ego — only for emphasis; the verb ending already says "I"' },
    tu: { nopic: true, la: 'tū', en: 'you', img: '🫵', info: 'tū = you (one person)', alt: ['you (one person)'] },
    nos: { nopic: true, la: 'nōs', en: 'we', img: '👥', info: 'nōs = we / us', alt: ['us'] },
    vos: { nopic: true, la: 'vōs', en: 'you all', img: '👐', info: 'vōs = you (several people)', alt: ['you (plural)'] },
    // --- objects ---
    porto: { la: 'portō', en: 'I carry', img: '📦', info: 'portō, portāre' },
    paro: { nopic: true, la: 'parō', en: 'I prepare', img: '🥣', info: 'parō, parāre', alt: ['I get ready'] },
    cena: { la: 'cēna', en: 'dinner', img: '🍗', info: 'cēna, cēnae (f.) — the main Roman meal, in the afternoon', alt: ['meal', 'supper'] },
    apis: { la: 'apis', en: 'bee', img: '🐝', info: 'apis, apis (f.) — plural apēs' },
    quaero: { nopic: true, la: 'quaerō', en: 'I look for', img: '🔍', info: 'quaerō, quaerere — quaeris, quaerit', alt: ['I seek', 'I search for'] },
    clamo: { grp: 'voice', la: 'clāmō', en: 'I shout', img: '📢', info: 'clāmō, clāmāre', alt: ['I cry out'] },
    // --- prepositions ---
    ad: { nopic: true, la: 'ad', en: 'to', img: '➡️', info: 'ad + accusative = to, towards', alt: ['towards', 'toward'] },
    ex: { nopic: true, la: 'ex', en: 'out of', img: '⬅️', info: 'ex / ē + ablative = out of, from', alt: ['from'] },
    cum: { nopic: true, la: 'cum', en: 'with', img: '🤝', info: 'cum + ablative = (together) with' },
    insula: { la: 'īnsula', en: 'island', img: '🏝️', info: 'īnsula, īnsulae (f.) — in Rome also a block of flats' },
    // --- adjectives ---
    pulcher: { nopic: true, la: 'pulcher', en: 'beautiful', img: '🌺', info: 'pulcher, pulchra, pulchrum — ch = aspirated k', alt: ['pretty', 'handsome'] },
    fessus: { nopic: true, la: 'fessus', en: 'tired', img: '🥱', info: 'fessus, fessa, fessum', alt: ['weary'] },
    multus: { nopic: true, la: 'multus', en: 'much', img: '🔢', info: 'multus, -a, -um — plural multī = many', alt: ['many'] },
    brevis: { nopic: true, la: 'brevis', en: 'short', img: '🤏', info: 'brevis, breve', alt: ['brief'] },
    ars: { nopic: true, la: 'ars', en: 'art', img: '🎨', info: 'ars, artis (f.) — art, skill, craft', alt: ['skill', 'craft'] },
    // --- to be ---
    sumus: { nopic: true, la: 'sumus', en: 'we are', img: '👥', info: 'sum, es, est, sumus, estis, sunt' },
    estis: { nopic: true, la: 'estis', en: 'you all are', img: '👐', info: 'sum, es, est, sumus, estis, sunt', alt: ['you are (plural)'] },
    sunt: { nopic: true, la: 'sunt', en: 'they are', img: '👫', info: 'sum, es, est, sumus, estis, sunt', alt: ['there are'] },
    // --- city story ---
    hodie: { nopic: true, la: 'hodiē', en: 'today', img: '📆', info: 'hodiē = hōc diē, "on this day"' },
    nunc: { nopic: true, la: 'nunc', en: 'now', img: '⏱️' },
    // --- 2nd & 3rd conjugation ---
    video: { nopic: true, la: 'videō', en: 'I see', img: '👁️', info: 'videō, vidēre — vidēs, videt' },
    timeo: { nopic: true, la: 'timeō', en: 'I fear', img: '😨', info: 'timeō, timēre — timēs, timet', alt: ['I am afraid of', 'I am afraid'] },
    sedeo: { la: 'sedeō', en: 'I sit', img: '🪑', info: 'sedeō, sedēre' },
    rideo: { la: 'rīdeō', en: 'I laugh', img: '😂', info: 'rīdeō, rīdēre', alt: ['I smile'] },
    doceo: { nopic: true, la: 'doceō', en: 'I teach', img: '📐', info: 'doceō, docēre' },
    schola: { la: 'schola', en: 'school', img: '🏫', info: 'schola, scholae (f.) — ch = aspirated k' },
    discipulus: { grp: 'people', la: 'discipulus', en: 'pupil', img: '🧑‍🎓', info: 'discipulus, discipulī (m.)', alt: ['student'] },
    lego: { la: 'legō', en: 'I read', img: '👓', info: 'legō, legere — 3rd conjugation: legis, legit' },
    scribo: { la: 'scrībō', en: 'I write', img: '✍️', info: 'scrībō, scrībere — scrībis, scrībit' },
    dico: { nopic: true, la: 'dīcō', en: 'I say', img: '💬', info: 'dīcō, dīcere — c = k: DEE-koh', alt: ['I speak', 'I tell'] },
    disco: { nopic: true, la: 'discō', en: 'I learn', img: '🎓', info: 'discō, discere — discis, discit' },
    respondeo: { nopic: true, la: 'respondeō', en: 'I answer', img: '🗨️', info: 'respondeō, respondēre', alt: ['I reply', 'I respond'] },
    subito: { nopic: true, la: 'subitō', en: 'suddenly', img: '⚡' },
    // --- the Roman house ---
    villa: { la: 'vīlla', en: 'villa', img: '🏘️', info: 'vīlla, vīllae (f.) — a Roman country house or farm estate', alt: ['country house', 'farmhouse'] },
    hortus: { la: 'hortus', en: 'garden', img: '🪴', info: 'hortus, hortī (m.)' },
    servus: { grp: 'people', la: 'servus', en: 'slave', img: '⛓️', info: 'servus, servī (m.)', alt: ['servant'] },
    ancilla: { grp: 'people', la: 'ancilla', en: 'maid', img: '🧹', info: 'ancilla, ancillae (f.) — a slave woman, maidservant', alt: ['maidservant', 'slave girl'] },
    mensa: { nopic: true, la: 'mēnsa', en: 'table', img: '🍽️', info: 'mēnsa, mēnsae (f.) — ns: the e is long and nasal' },
    culina: { la: 'culīna', en: 'kitchen', img: '🍳', info: 'culīna, culīnae (f.)' },
    coquus: { grp: 'people', la: 'coquus', en: 'cook', img: '🧑‍🍳', info: 'coquus, coquī (m.)' },
    rapio: { nopic: true, la: 'rapiō', en: 'I snatch', img: '🫳', info: 'rapiō, rapere — rapis, rapit', alt: ['I grab', 'I seize'] },
    // --- questions ---
    quis: { nopic: true, la: 'quis', en: 'who', img: '🕵️', info: 'quis? = who? · quid? = what?', alt: ['who?'] },
    quid: { nopic: true, la: 'quid', en: 'what', img: '❔', alt: ['what?'] },
    cur: { nopic: true, la: 'cūr', en: 'why', img: '🤔', alt: ['why?'] },
    quia: { nopic: true, la: 'quia', en: 'because', img: '💡' },
    nox: { la: 'nox', en: 'night', img: '🌃', info: 'nox, noctis (f.)' },
    fur: { grp: 'people', la: 'fūr', en: 'thief', img: '🦹', info: 'fūr, fūris (m.)' },
    cubiculum: { la: 'cubiculum', en: 'bedroom', img: '🛏️', info: 'cubiculum, cubiculī (n.)', alt: ['room'] },
    // --- commands ---
    venio: { nopic: true, la: 'veniō', en: 'I come', img: '🏃', info: 'veniō, venīre — 4th conjugation: venīs, venit · command: venī!' },
    audio: { nopic: true, la: 'audiō', en: 'I hear', img: '🎧', info: 'audiō, audīre — command: audī!', alt: ['I listen'] },
    dormio: { la: 'dormiō', en: 'I sleep', img: '😴', info: 'dormiō, dormīre — dormīs, dormit, dormiunt' },
    taceo: { nopic: true, la: 'taceō', en: 'I am silent', img: '🤫', info: 'taceō, tacēre — command: tacē! (be quiet!)', alt: ['I am quiet', 'I keep quiet'] },
    caveo: { nopic: true, la: 'caveō', en: 'I beware', img: '⚠️', info: 'caveō, cavēre — command: cavē!', alt: ['I watch out'] },
    audeo: { nopic: true, la: 'audeō', en: 'I dare', img: '🦸', info: 'audeō, audēre — command: audē!' },
    vivo: { nopic: true, la: 'vīvō', en: 'I am alive', img: '🌱', info: 'vīvō, vīvere — to be alive (habitō = to dwell)', alt: ['I live'] },
    // --- the past ---
    heri: { nopic: true, la: 'herī', en: 'yesterday', img: '⏮️' },
    iam: { nopic: true, la: 'iam', en: 'already', img: '✔️', info: 'iam — i before a vowel = y: YAM' },
    semper: { nopic: true, la: 'semper', en: 'always', img: '♾️' },
    numquam: { nopic: true, la: 'numquam', en: 'never', img: '⛔' },
    lupa: { la: 'lupa', en: 'she-wolf', img: '🐺', info: 'lupa, lupae (f.) — the she-wolf who nursed Romulus and Remus' },
    gemini: { la: 'geminī', en: 'twins', img: '👶', info: 'geminus, -a, -um — plural geminī = twins' },
    aedifico: { la: 'aedificō', en: 'I build', img: '🏗️', info: 'aedificō, aedificāre' },
    servo: { nopic: true, la: 'servō', en: 'I save', img: '🛟', info: 'servō, servāre — cf. servus (slave)', alt: ['I rescue', 'I keep'] },
    olim: { nopic: true, la: 'ōlim', en: 'once upon a time', img: '📜', alt: ['once', 'long ago'] },
    // --- classics III ---
    vita: { nopic: true, la: 'vīta', en: 'life', img: '🧬', info: 'vīta, vītae (f.)' },
    otium: { nopic: true, la: 'ōtium', en: 'leisure', img: '🏖️', info: 'ōtium, ōtiī (n.)', alt: ['free time', 'rest'] },
    mors: { nopic: true, la: 'mors', en: 'death', img: '💀', info: 'mors, mortis (f.)' },
    labor: { nopic: true, la: 'labor', en: 'toil', img: '⚒️', info: 'labor, labōris (m.)', alt: ['work', 'labour', 'labor'] },
    sententia: { nopic: true, la: 'sententia', en: 'opinion', img: '💭', info: 'sententia, sententiae (f.) — also "saying, motto"', alt: ['saying', 'view'] },
    fabula: { nopic: true, la: 'fābula', en: 'story', img: '📚', info: 'fābula, fābulae (f.)', alt: ['tale', 'fable', 'play'] },
    certus: { nopic: true, la: 'certus', en: 'reliable', img: '🎯', info: 'certus, -a, -um', alt: ['sure', 'certain', 'true'] }
  };

  // English glosses for inflected forms that appear in sentences (tap-to-peek hints).
  const GLOSS = {
    'sum': 'I am', 'es': 'you are', 'est': 'is', 'sumus': 'we are', 'sunt': 'they are',
    'puerī': 'boys', 'puellae': 'girls / of the girl', 'fēminae': 'women', 'virī': 'men',
    'amat': 'loves', 'amās': 'you love', 'cantat': 'sings', 'cantō': 'I sing', 'cantant': 'they sing',
    'ambulat': 'walks', 'labōrat': 'works', 'labōrās': 'you work', 'natat': 'swims', 'natant': 'they swim',
    'nāvigat': 'sails', 'spectat': 'watches', 'habitat': 'lives', 'vocat': 'calls', 'vocās': 'you call',
    'pugnat': 'fights', 'pugnant': 'they fight', 'habet': 'has', 'habēs': 'you have',
    'rosam': 'rose (object)', 'piscem': 'fish (object)', 'pānem': 'bread (object)', 'cāseum': 'cheese (object)',
    'aquam': 'water (object)', 'mālum': 'apple', 'cibum': 'food (object)', 'ūvam': 'grape (object)',
    'flōrem': 'flower (object)', 'lūnam': 'moon (object)', 'gladium': 'sword (object)', 'templum': 'temple',
    'caelō': 'sky (in…)', 'silvā': 'forest (in…)', 'marī': 'sea (in…)', 'urbe': 'city (in…)', 'flūmine': 'river (in…)',
    'magna': 'big (f.)', 'magnum': 'big (n.)', 'parva': 'small (f.)', 'laeta': 'happy (f.)', 'rubra': 'red (f.)',
    'nigra': 'black (f.)', 'alba': 'white (f.)', 'bona': 'good (f.)', 'longa': 'long (f.)', 'nova': 'new (f.)',
    'stellae': 'stars', 'equī': 'horses', 'canēs': 'dogs', 'piscēs': 'fish (pl.)', 'pedēs': 'feet',
    'oculōs': 'eyes (object)', 'duōs': 'two (object)', 'mīlitēs': 'soldiers',
    'homō': 'human', 'hominī': 'to a human', 'lupus': 'wolf',
    'mēns': 'mind', 'sāna': 'healthy (f.)', 'corpore': 'body (in…)', 'sānō': 'healthy',
    'carpe': 'seize! / pluck!', 'diem': 'the day', 'festīnā': 'hurry!', 'lentē': 'slowly',
    'vēnī': 'I came', 'vīdī': 'I saw', 'vīcī': 'I conquered', 'ālea': 'the die', 'iacta': 'thrown, cast',
    'tempus': 'time', 'fugit': 'flees, flies', 'dum': 'while', 'spīrō': 'I breathe', 'spērō': 'I hope',
    'errāre': 'to err', 'hūmānum': 'human', 'per': 'through', 'aspera': 'rough things, hardships',
    'ad': 'to, towards', 'astra': 'the stars', 'fortēs': 'the brave', 'fortūna': 'fortune', 'adiuvat': 'helps',
    'omnia': 'all things', 'vincit': 'conquers', 'amor': 'love', 'ō': 'oh', 'tempora': 'times', 'mōrēs': 'customs, morals',
    'quis': 'who?', 'custōdiet': 'will guard', 'ipsōs': 'themselves', 'custōdēs': 'guards',
    'arma': 'weapons, arms', 'virumque': 'and the man', 'canō': 'I sing (of)', 'gallia': 'Gaul', 'omnis': 'whole, all',
    'dīvīsa': 'divided', 'partēs': 'parts', 'trēs': 'three', 'duae': 'two (f.)', 'in': 'in, on (+abl.); into (+acc.)', 'ōdī': 'I hate', 'amō': 'I love',
    'dulce': 'sweet', 'decōrum': 'fitting, honourable', 'prō': 'for', 'patriā': 'homeland', 'morī': 'to die',
    'senātus': 'the senate', 'populusque': 'and the people', 'rōmānus': 'Roman',
    'gutta': 'a drop', 'cavat': 'hollows', 'lapidem': 'stone (object)',
    'rēx': 'king', 'nauta': 'sailor',
    // ----- v0.3 -----
    // verbs: persons
    'ambulās': 'you walk', 'ambulant': 'they walk', 'ambulāmus': 'we walk', 'ambulātis': 'you (all) walk',
    'labōrāmus': 'we work', 'natātis': 'you (all) swim', 'nāvigant': 'they sail', 'nāvigās': 'you sail',
    'amāmus': 'we love', 'cantāmus': 'we sing', 'cantās': 'you sing', 'clāmat': 'shouts', 'clāmās': 'you shout',
    'portat': 'carries', 'portant': 'they carry', 'parat': 'prepares', 'parā': 'prepare!', 'quaerit': 'looks for',
    'habent': 'they have', 'rapit': 'snatches', 'pungunt': 'they sting', 'fugit': 'flees, runs away',
    'videt': 'sees', 'vident': 'they see', 'vidēmus': 'we see', 'vidēs': 'you see', 'vidēsne': 'do you see?',
    'timet': 'fears', 'timent': 'they fear', 'timēmus': 'we fear', 'timuit': 'feared',
    'sedet': 'sits', 'sedent': 'they sit', 'rīdet': 'laughs, smiles', 'rīdent': 'they laugh', 'rīdēs': 'you laugh',
    'docet': 'teaches', 'docēs': 'you teach', 'docendō': 'by teaching', 'respondet': 'answers',
    'legit': 'reads', 'legat': 'may read (not "reads"!)', 'legunt': 'they read', 'legimus': 'we read',
    'scrībit': 'writes', 'scrībunt': 'they write', 'scrībimus': 'we write',
    'dīcit': 'says', 'dīcis': 'you say', 'discit': 'learns', 'discis': 'you learn', 'discimus': 'we learn',
    'audit': 'hears', 'audiunt': 'they listen', 'audī': 'listen!', 'audīte': 'listen! (pl.)',
    'venī': 'come!', 'venīte': 'come! (pl.)', 'venit': 'comes', 'dormī': 'sleep!', 'dormiunt': 'they sleep',
    'tacē': 'be quiet!', 'tacēte': 'be quiet! (pl.)', 'tacet': 'is silent', 'spectāte': 'look! (pl.)',
    'cavē': 'beware!', 'cavēte': 'beware! (pl.)', 'cavet': 'is careful', 'cavent': 'they are careful',
    'audē': 'dare!', 'audet': 'dares', 'audentēs': 'those who dare, the bold', 'sapere': 'to be wise',
    'vīve': 'live!', 'nōsce': 'know! get to know!', 'salvēte': 'hello (to several)', 'vīs': 'you want',
    'ambulāvī': 'I walked', 'ambulāvit': 'walked', 'cantāvit': 'sang', 'cantāvistī': 'you sang',
    'labōrāvī': 'I worked', 'labōrāvit': 'worked', 'labōrāvimus': 'we (have) worked', 'nāvigāvī': 'I (have) sailed',
    'pugnāvit': 'fought', 'pugnāvērunt': 'they fought', 'servāvit': 'saved', 'portāvit': 'carried',
    'aedificāvit': 'built', 'invēnit': 'found', 'cūrāvit': 'looked after', 'vīcit': 'conquered', 'vīcērunt': 'they conquered',
    'erat': 'was', 'erant': 'they were', 'agitat': 'moves, stirs', 'cernitur': 'is seen, is recognised', 'iuvat': 'helps',
    // nouns & adjectives
    'nautae': 'sailors / of the sailor', 'cēnam': 'dinner (object)', 'cēnae': 'of dinner', 'lupum': 'wolf (object)',
    'lupī': 'wolves / of the wolf', 'puellam': 'girl (object)', 'puellā': 'girl (with…)', 'puerum': 'boy (object)',
    'apēs': 'bees', 'ursum': 'bear (object)', 'silvam': 'forest (object / to…)', 'īnsulam': 'island (to…)', 'īnsulā': 'island (on…)',
    'mātre': 'mother (with…)', 'aquā': 'water (in / out of…)', 'pulchra': 'beautiful (f.)', 'pulchrum': 'beautiful (n.)',
    'multae': 'many (f.)', 'multī': 'many', 'laetum': 'happy (n.)', 'laetī': 'happy (pl.)', 'bonum': 'good (n.)', 'rubrum': 'red (n.)',
    'rubram': 'red (f. object)', 'novum': 'new (n.)', 'novam': 'new (f. object)', 'mala': 'bad (f.)', 'parvī': 'little (pl.)',
    'amīcī': 'friends / of the friend', 'amīce': 'friend! (calling)', 'amīcum': 'friend (object)', 'quot': 'how many / as many',
    'hominēs': 'people', 'tot': 'so many', 'sententiae': 'opinions', 'sententiam': 'opinion (object)', 'equum': 'horse (object)',
    'rōmānī': 'Romans', 'canem': 'dog (object)', 'forō': 'forum (in…)', 'rosās': 'roses (object)',
    'stellās': 'stars (object)', 'librum': 'book (object)', 'epistulam': 'letter (object)', 'scholā': 'school (in…)',
    'scholae': 'for school / of the school', 'vītae': 'for life / of life', 'vītam': 'life (object)',
    'discipulī': 'pupils / of the pupil', 'mārcum': 'Marcus (object)', 'mārce': 'Marcus! (calling)', 'mārcī': 'of Marcus',
    'iūliae': 'of Julia', 'iūliam': 'Julia (object)', 'fenestrā': 'window (in…)', 'fenestram': 'window (to…)', 'omnēs': 'all',
    'dominī': 'of the master', 'dominum': 'master (object)', 'rēgīnae': 'of the queen', 'rēgīnam': 'queen (object)',
    'repetītiō': 'repetition', 'studiōrum': 'of studies, of learning', 'servī': 'slaves / of the slave', 'servum': 'slave (object)',
    'culīnā': 'kitchen (in…)', 'culīnam': 'kitchen (object)', 'culīnae': 'of the kitchen', 'mēnsam': 'table (to…)',
    'mēnsā': 'table (on…)', 'mēnsae': 'of the table', 'coquī': 'of the cook', 'coquum': 'cook (object)', 'vīllā': 'villa (in…)',
    'esne': 'are you…?', 'estne': 'is it…?', 'cui': 'to whom', 'bonō': 'for a benefit', 'hortō': 'garden (in…)',
    'cubiculō': 'bedroom (in…)', 'sonum': 'a sound (object)', 'arbore': 'tree (in…)', 'fīlī': 'son! (calling)',
    'tē': 'you (object)', 'ipsum': 'yourself, itself', 'sī': 'if', 'pācem': 'peace (object)',
    'geminōs': 'twins (object)', 'rōmulus': 'Romulus (founder of Rome)', 'remus': 'Remus (his twin)', 'urbem': 'city (object)',
    'posteā': 'afterwards, later', 'pāstor': 'shepherd', 'tandem': 'at last', 'rōmam': 'Rome (object)',
    'sine': 'without (+abl.)', 'litterīs': 'letters, books (without…)', 'improbus': 'relentless, wicked',
    'mōlem': 'mass, bulk (object)', 'nūlla': 'no, not any (f.)', 'līneā': 'line (without…)', 'mortem': 'death (object)',
    'mortis': 'of death', 'rē': 'matter, situation', 'incertā': 'uncertain', 'fābulā': 'story (in…)', 'fābulam': 'story (object)',
    'vae': 'woe!', 'victīs': 'to the conquered', 'certa': 'sure (f.)', 'certum': 'sure (n.)'
  };

  /*
   * Units → lessons. A lesson:
   *   { id, title, words:[wordIds], sentences:[...], focus?:'stress'|'macron', pairs?:[[id,id]], tip:'<html>' }
   */
  const UNITS = [
    {
      id: 'u_sounds', title: 'Prōnūntiātiō', sub: 'Sounds & Stress', icon: '🗣️', color: '#7b3fe4',
      lessons: [
        {
          id: 'l_sounds_1', title: 'Hard C, V = W', icon: '🔊', focus: 'stress',
          words: ['aqua', 'rosa', 'vinum', 'caelum', 'caesar', 'roma'],
          tip: `<h3>Classical pronunciation in 4 rules</h3>
<ul><li><b>C is always K</b>: <i>Cicerō</i> = KI-ke-roh, <i>caelum</i> = KAI-lum.</li>
<li><b>G is always hard</b> (as in "go"): <i>magister</i> = ma-GIS-ter.</li>
<li><b>V sounds like English W</b>: <i>vīnum</i> = WEE-num. (Caesar said "WAY-nee, WEE-dee, WEE-kee"!)</li>
<li><b>AE = "eye", AU = "ow", OE = "oy"</b>: <i>Caesar</i> = KAI-sar.</li></ul>
<p>Letters are pronounced as written — no silent "e" as in English. Doubled consonants are held longer: <i>puel-la</i>. (Fine print: <b>h</b> was weak, a final <b>-m</b> mostly just nasalised the vowel, and a vowel before <b>ns/nf</b> is always long and nasal: <i>mēns</i>.)</p>`
        },
        {
          id: 'l_sounds_2', title: 'Long vowels', icon: '➖', focus: 'macron',
          words: ['malum_apple', 'malum_evil', 'liber_book', 'liber_free', 'os_mouth', 'os_bone'],
          pairs: [['malum_apple', 'malum_evil'], ['liber_book', 'liber_free'], ['os_mouth', 'os_bone']],
          tip: `<h3>The macron: ā ē ī ō ū</h3>
<p>Latin vowels are either <b>short</b> or <b>long</b>. A long vowel is held about twice as long. Textbooks mark it with a line — a <b>macron</b>.</p>
<p>Length changes meaning! <i>malum</i> = evil, but <i>mālum</i> = apple. <i>liber</i> = book, <i>līber</i> = free.</p>
<p>Length also decides <b>where the stress falls</b> — that's the next lesson.</p>
<table class="tbl"><tr><td>a</td><td>like <i>u</i> in "cup"</td><td>ā</td><td>like "father"</td></tr>
<tr><td>e</td><td>"pet"</td><td>ē</td><td>"they" (pure)</td></tr>
<tr><td>i</td><td>"pit"</td><td>ī</td><td>"machine"</td></tr>
<tr><td>o</td><td>British "pot"</td><td>ō</td><td>"no" (pure)</td></tr>
<tr><td>u</td><td>"put"</td><td>ū</td><td>"rule"</td></tr></table>`
        },
        {
          id: 'l_sounds_3', title: 'Stress: the penult', icon: '🎯', focus: 'stress',
          words: ['amicus', 'fenestra', 'romanus', 'puella', 'magister'],
          tip: `<h3>The stress rule, part 1</h3>
<p>Latin never stresses the last syllable of a longer word. Count syllables <b>from the end</b>:</p>
<ul><li><b>2 syllables</b> → stress the first: <i>RO-sa</i>, <i>A-qua</i>.</li>
<li><b>3+ syllables</b> → look at the <b>penult</b> (second-to-last). If it is <b>heavy</b>, it gets the stress.</li></ul>
<p>A syllable is <b>heavy</b> if:</p>
<ol><li>it has a <b>long vowel</b>: a-<b>MĪ</b>-cus, Rō-<b>MĀ</b>-nus</li>
<li>or a <b>diphthong</b> (ae, au, oe)</li>
<li>or it is <b>closed by a consonant</b> (two consonants follow the vowel): pu-<b>EL</b>-la, fe-<b>NES</b>-tra, ma-<b>GIS</b>-ter</li></ol>`
        },
        {
          id: 'l_sounds_4', title: 'Stress: the antepenult', icon: '⏪', focus: 'stress',
          words: ['femina', 'dominus', 'filius', 'cicero', 'tenebrae', 'italia'],
          tip: `<h3>The stress rule, part 2</h3>
<p>If the penult is <b>light</b> (short vowel and open), the stress moves one syllable further back — to the <b>antepenult</b>:</p>
<p><i><b>FĒ</b>-mi-na</i>, <i><b>DO</b>-mi-nus</i>, <i><b>FĪ</b>-li-us</i>, <i>I-<b>TA</b>-li-a</i>.</p>
<p><b>Trap:</b> a stop (b c d g p t, and f) + <b>l</b> or <b>r</b> stays together and does <i>not</i> make the syllable heavy: <i><b>TE</b>-ne-brae</i> (not te-NEB-rae).</p>
<p><b>That's the whole rule.</b> It never goes further back than three syllables.</p>`
        }
      ]
    },
    {
      id: 'u_basics', title: 'Salvē!', sub: 'First words', icon: '👋', color: '#c0583a',
      lessons: [
        {
          id: 'l_basics_1', title: 'Greetings', icon: '👋',
          words: ['salve', 'vale', 'puer', 'vir', 'sum', 'es', 'est'],
          sentences: [
            { la: 'Salvē, puer!', en: 'Hello, boy!', alt: ['Hi, boy!'] },
            { la: 'Valē, puella!', en: 'Goodbye, girl!', alt: ['Bye, girl!'] },
            { la: 'Puer sum.', en: 'I am a boy.' },
            { la: 'Fēmina es.', en: 'You are a woman.' },
            { la: 'Puella est.', en: 'She is a girl.', alt: ['It is a girl.', 'There is a girl.'] }
          ],
          tip: `<h3>No "a", no "the"</h3><p>Latin has <b>no articles</b>: <i>puer</i> = "boy", "a boy" or "the boy".</p>
<p>The verb often comes <b>last</b>, and the ending tells you who: <i>sum</i> = I am, <i>es</i> = you are, <i>est</i> = he/she/it is.</p>`
        },
        {
          id: 'l_basics_2', title: 'Yes and no', icon: '✅',
          words: ['et', 'non', 'ita', 'minime', 'quoque', 'sed'],
          sentences: [
            { la: 'Puer et puella.', en: 'A boy and a girl.', alt: ['The boy and the girl.'] },
            { la: 'Vir nōn est puer.', en: 'The man is not a boy.' },
            { la: 'Ita, fēmina sum.', en: 'Yes, I am a woman.' },
            { la: 'Minimē, puer nōn sum.', en: 'No, I am not a boy.' },
            { la: 'Fēmina sum, nōn puella.', en: 'I am a woman, not a girl.' },
            { la: 'Puella quoque est.', en: 'There is also a girl.', alt: ['She is also a girl.', 'It is also a girl.', 'There is a girl too.', 'She is a girl too.', 'It is a girl too.'] }
          ],
          tip: `<h3>Saying yes and no</h3><p>Latin has no single word for "yes": Romans said <i>ita</i> ("so"), <i>ita est</i>, or repeated the verb. "No" is often <i>minimē</i> ("least of all").</p><p><i>nōn</i> goes right before the word it negates.</p>`
        }
      ]
    },
    {
      id: 'u_family', title: 'Familia', sub: 'Family', icon: '👨‍👩‍👧', color: '#d99a1e',
      lessons: [
        {
          id: 'l_family_1', title: 'Parents', icon: '👪',
          words: ['pater', 'mater', 'filius', 'filia', 'familia'],
          sentences: [
            { la: 'Pater et māter.', en: 'Father and mother.', alt: ['A father and a mother.', 'The father and the mother.'] },
            { la: 'Fīlia est puella.', en: 'The daughter is a girl.' },
            { la: 'Fīlius nōn est vir.', en: 'The son is not a man.' },
            { la: 'Familia est.', en: 'It is a family.', alt: ['There is a family.'] }
          ],
          tip: `<h3>Watch the stress!</h3><p><i>fa-<b>MI</b>-li-a</i> (not fa-mi-LI-a), <i><b>FĪ</b>-li-us</i>, <i><b>MĀ</b>-ter</i>. The penult in <i>familia</i> — "li" — is light, so the stress goes back to "mi".</p>`
        },
        {
          id: 'l_family_2', title: 'Siblings', icon: '👭',
          words: ['frater', 'soror', 'avus', 'avia'],
          sentences: [
            { la: 'Frāter et soror.', en: 'Brother and sister.', alt: ['A brother and a sister.', 'The brother and the sister.'] },
            { la: 'Avus est vir.', en: 'Grandfather is a man.', alt: ['The grandfather is a man.'] },
            { la: 'Soror nōn est frāter.', en: 'The sister is not a brother.' },
            { la: 'Avia nōn est puella.', en: 'Grandmother is not a girl.', alt: ['The grandmother is not a girl.'] }
          ],
          tip: `<h3>Short o, long ō</h3><p><i>soror</i> has two short o's, but its genitive is <i>so-<b>RŌ</b>-ris</i> — the long ō pulls the stress. Same word, different stress!</p>`
        }
      ]
    },
    {
      id: 'u_animals', title: 'Animālia', sub: 'Animals', icon: '🐾', color: '#3f9b6f',
      lessons: [
        {
          id: 'l_animals_1', title: 'Pets', icon: '🐕',
          words: ['canis', 'feles', 'mus', 'avis', 'piscis'],
          sentences: [
            { la: 'Canis nōn est fēlēs.', en: 'The dog is not a cat.' },
            { la: 'Fēlēs et mūs.', en: 'A cat and a mouse.', alt: ['The cat and the mouse.'] },
            { la: 'Avis est, nōn piscis.', en: 'It is a bird, not a fish.' }
          ]
        },
        {
          id: 'l_animals_2', title: 'Wild beasts', icon: '🐺',
          words: ['equus', 'lupus', 'ursus', 'leo', 'taurus', 'homo'],
          sentences: [
            { la: 'Leō nōn est lupus.', en: 'The lion is not a wolf.' },
            { la: 'Equus et taurus.', en: 'A horse and a bull.', alt: ['The horse and the bull.'] },
            { la: 'Ursus est, sed nōn leō.', en: 'It is a bear, but not a lion.' },
            { la: 'Lupus est homō hominī.', en: 'Man is a wolf to man.', alt: ['A human is a wolf to a human.'], src: 'Plautus, Asinaria 495' }
          ],
          tip: `<h3>📜 Your first classical quote</h3><p><i>Lupus est homō hominī</i> — "man is a wolf to man". Plautus wrote it around 200 BC; philosophers have quoted it ever since.</p><p>Plautus's full line: <i>lupus est homō hominī, nōn homō</i> — later shortened to the famous <i>homō hominī lupus</i>. <i>hominī</i> = "to a human" (dative).</p><p><i><b>HO</b>-mō</i>, but <i><b>HO</b>-mi-nī</i>: "mi" is light, so the stress goes back.</p>`
        },
        {
          id: 'l_animals_3', title: 'Story: Where is the dog?', icon: '📖', gram: 'Reading: your first story',
          words: ['ecce', 'ubi', 'ibi', 'marcus', 'iulia'],
          sentences: [
            { la: 'Ecce Mārcus!', en: 'Look, Marcus!', alt: ['Here is Marcus!', 'Look! Marcus!', 'Behold Marcus!'] },
            { la: 'Ubi est canis?', en: 'Where is the dog?', alt: ['Where is a dog?'] },
            { la: 'Ibi est lupus.', en: 'There is a wolf.', alt: ['The wolf is there.', 'A wolf is there.', 'There is the wolf.'] },
            { la: 'Iūlia est soror.', en: 'Julia is a sister.', alt: ['Julia is the sister.', 'Julia is his sister.'] }
          ],
          story: {
            title: 'Ubi est canis?',
            lines: [
              { la: 'Ecce Mārcus. Mārcus puer est.', en: 'Look, Marcus. Marcus is a boy.' },
              { la: 'Ecce Iūlia. Iūlia est soror.', en: 'Look, Julia. Julia is his sister.' },
              { la: '“Ubi est canis?”', en: '“Where is the dog?”' },
              { la: '“Ecce! Ibi est lupus!”', en: '“Look! There is a wolf!”' },
              { la: '“Minimē, nōn est lupus. Canis est!”', en: '“No, it is not a wolf. It is the dog!”' },
              { la: 'Canis nōn est lupus, sed amīcus.', en: 'The dog is not a wolf, but a friend.' }
            ],
            qs: [
              { q: 'Who is Julia?', a: "Marcus's sister", opts: ["Marcus's mother", 'a teacher'], line: 1 },
              { q: 'What do they think they see?', a: 'a wolf', opts: ['a lion', 'a cat'], line: 3 },
              { q: 'What is it really?', a: 'the dog', opts: ['a wolf', 'a horse'], line: 4 }
            ]
          },
          tip: `<h3>📖 Your first story</h3><p>Every unit ends with a short <b>fābula</b> (story). You won't know every word — that's the point: <b>tap any word</b> to see what it means, and guess the rest from context. That's how Romans' children learned, too.</p>
<p>New: <i>ecce!</i> = look! · <i>ubi?</i> = where? · <i>ibi</i> = there.</p>`
        }
      ]
    },
    {
      id: 'u_verbs', title: 'Verba', sub: 'Actions', icon: '🏃', color: '#2f7fc0',
      lessons: [
        {
          id: 'l_verbs_1', title: 'I, you, he', icon: '🎤',
          words: ['amo', 'ambulo', 'canto', 'laboro', 'nato'],
          sentences: [
            { la: 'Puella cantat.', en: 'The girl sings.', alt: ['The girl is singing.', 'A girl sings.'] },
            { la: 'Puer ambulat.', en: 'The boy walks.', alt: ['The boy is walking.'] },
            { la: 'Labōrās.', en: 'You work.', alt: ['You are working.'] },
            { la: 'Pater labōrat, māter cantat.', en: 'Father works, mother sings.', alt: ['The father works, the mother sings.'] },
            { la: 'Nōn cantō.', en: 'I do not sing.', alt: ['I am not singing.', "I don't sing."] },
            { la: 'Canis natat.', en: 'The dog swims.', alt: ['The dog is swimming.'] }
          ],
          tip: `<h3>Endings do the work</h3><p><i>am-<b>ō</b></i> = I love · <i>am-<b>ās</b></i> = you love · <i>am-<b>at</b></i> = he/she loves.</p>
<p>No need for "I/you/he" — the ending says it. And stress stays put: <i><b>AM</b>-bu-lō</i>, <i><b>AM</b>-bu-lat</i>; <i>la-<b>BŌ</b>-rō</i>, <i>la-<b>BŌ</b>-rat</i>.</p>`
        },
        {
          id: 'l_verbs_2', title: 'Sailing & fighting', icon: '⛵',
          words: ['navigo', 'specto', 'habito', 'voco', 'pugno', 'odi', 'nauta'],
          sentences: [
            { la: 'Nauta nāvigat.', en: 'The sailor sails.', alt: ['A sailor sails.', 'The sailor is sailing.'] },
            { la: 'Leō pugnat.', en: 'The lion fights.', alt: ['The lion is fighting.'] },
            { la: 'Avus spectat.', en: 'Grandfather watches.', alt: ['The grandfather watches.', 'Grandfather is watching.'] },
            { la: 'Vocās et ambulō.', en: 'You call and I walk.' },
            { la: 'Ōdī et amō.', en: 'I hate and I love.', alt: ['I hate and love.'], src: 'Catullus, Carmen 85' }
          ],
          tip: `<h3>📜 Catullus</h3><p><i>Ōdī et amō</i> — the most famous love poem in two lines begins with these three words (c. 60 BC). Say it right: <i><b>Ō</b>-dī et <b>A</b>-mō</i>.</p>`
        },
        {
          id: 'l_verbs_3', title: 'We, you all, they', icon: '👥', gram: 'Endings -ō -s -t -mus -tis -nt',
          words: ['ego', 'tu', 'nos', 'vos'],
          sentences: [
            { la: 'Ego cantō, tū ambulās.', en: 'I sing, you walk.', alt: ['I am singing, you are walking.'] },
            { la: 'Nōs labōrāmus.', en: 'We work.', alt: ['We are working.'] },
            { la: 'Vōs natātis.', en: 'You swim.', alt: ['You all swim.', 'You are swimming.', 'You all are swimming.'] },
            { la: 'Puellae cantant.', en: 'The girls sing.', alt: ['The girls are singing.', 'Girls sing.'] },
            { la: 'Nautae nāvigant.', en: 'The sailors sail.', alt: ['Sailors sail.', 'The sailors are sailing.'] },
            { la: 'Amāmus, sed nōn labōrāmus.', en: 'We love, but we do not work.', alt: ["We love, but we don't work.", 'We love but do not work.'] }
          ],
          drills: [
            { la: 'Nōs {cantāmus}.', opts: ['cantat', 'cantant'], en: 'We sing.', why: 'nōs (we) → -<b>mus</b>' },
            { la: 'Vōs {ambulātis}.', opts: ['ambulās', 'ambulant'], en: 'You (all) walk.', why: 'vōs (you all) → -<b>tis</b>' },
            { la: 'Ego {labōrō}.', opts: ['labōrat', 'labōrās'], en: 'I work.', why: 'ego (I) → -<b>ō</b>' },
            { la: 'Tū {vocās}.', opts: ['vocō', 'vocat'], en: 'You call.', why: 'tū (you, one person) → -<b>s</b>' },
            { la: 'Puer et puella {natant}.', opts: ['natat', 'natō'], en: 'The boy and the girl swim.', why: 'two people = "they" → -<b>nt</b>' },
            { la: 'Nauta {nāvigat}.', opts: ['nāvigant', 'nāvigās'], en: 'The sailor sails.', why: 'one sailor = "he" → -<b>t</b>' }
          ],
          tip: `<h3>Six endings — the whole verb</h3>
<table class="tbl"><tr><td>amō</td><td>I love</td><td>amāmus</td><td>we love</td></tr>
<tr><td>amās</td><td>you love</td><td>amātis</td><td>you (all) love</td></tr>
<tr><td>amat</td><td>he/she loves</td><td>amant</td><td>they love</td></tr></table>
<p>The pronouns <i>ego, tū, nōs, vōs</i> exist, but Romans used them only for <b>emphasis</b> — the ending already tells you who.</p>
<p>🎯 Stress moves! <i><b>A</b>-mō</i> but <i>a-<b>MĀ</b>-mus</i>, <i>a-<b>MĀ</b>-tis</i> — the long ā in the penult grabs it.</p>`
        }
      ]
    },
    {
      id: 'u_food', title: 'Cibus', sub: 'Food & objects', icon: '🍞', color: '#b4432b',
      lessons: [
        {
          id: 'l_food_1', title: 'Breakfast', icon: '🧀',
          words: ['cibus', 'panis', 'caseus', 'lac', 'mel'],
          sentences: [
            { la: 'Puer pānem habet.', en: 'The boy has bread.', alt: ['A boy has bread.'] },
            { la: 'Ursus mel amat.', en: 'The bear loves honey.', alt: ['A bear loves honey.', 'The bear likes honey.'] },
            { la: 'Fēlēs lac amat.', en: 'The cat loves milk.', alt: ['The cat likes milk.'] },
            { la: 'Māter cāseum habet.', en: 'Mother has cheese.', alt: ['The mother has cheese.'] }
          ],
          tip: `<h3>The object gets an -m</h3><p>The thing being loved, had, seen… takes the <b>accusative</b>, usually ending in <b>-m</b>:</p>
<p><i>rosa → rosa<b>m</b></i>, <i>cāseus → cāseu<b>m</b></i>, <i>pānis → pāne<b>m</b></i>. (Neuter words like <i>mel</i>, <i>lac</i> don't change.)</p>
<p>So word order is free: <i>Puella rosam amat</i> = <i>Rosam puella amat</i>.</p>`
        },
        {
          id: 'l_food_2', title: 'Fruit', icon: '🍇',
          words: ['ovum', 'uva', 'habeo', 'piscis'],
          sentences: [
            { la: 'Mālum habeō.', en: 'I have an apple.' },
            { la: 'Fēlēs piscem amat.', en: 'The cat loves fish.', alt: ['The cat loves the fish.', 'The cat likes fish.'] },
            { la: 'Puella rosam amat.', en: 'The girl loves the rose.', alt: ['The girl loves a rose.', 'The girl likes the rose.'] },
            { la: 'Ōvum et ūvam habēs.', en: 'You have an egg and a grape.' },
            { la: 'Canis aquam amat.', en: 'The dog loves water.', alt: ['The dog likes water.'] }
          ]
        },
        {
          id: 'l_food_3', title: 'Subject or object?', icon: '🔀', gram: 'Nominative vs accusative',
          words: ['porto', 'paro', 'cena'],
          sentences: [
            { la: 'Puella aquam portat.', en: 'The girl carries water.', alt: ['The girl is carrying water.', 'A girl carries water.'] },
            { la: 'Māter cēnam parat.', en: 'Mother prepares dinner.', alt: ['The mother prepares dinner.', 'Mother is preparing dinner.', 'The mother is preparing dinner.'] },
            { la: 'Nauta piscem portat.', en: 'The sailor carries a fish.', alt: ['The sailor carries the fish.', 'The sailor is carrying a fish.'] },
            { la: 'Lupum puer spectat.', en: 'The boy watches the wolf.', alt: ['The boy is watching the wolf.', 'The boy looks at the wolf.'], note: 'The <b>-um</b> ending marks <i>lupum</i> as the object — even though it comes first.' }
          ],
          drills: [
            { la: 'Puella {rosam} amat.', opts: ['rosa'], en: 'The girl loves the rose.', why: 'the rose is loved → object → <b>-m</b>' },
            { la: '{Puella} rosam amat.', opts: ['puellam'], en: 'The girl loves the rose.', why: 'the girl does the loving → subject → no -m' },
            { la: 'Fēlēs {piscem} amat.', opts: ['piscis'], en: 'The cat loves fish.', why: '<i>piscis → piscem</i>: object' },
            { la: 'Puer {aquam} portat.', opts: ['aqua'], en: 'The boy carries water.', why: 'what is carried → object → <b>-m</b>' },
            { la: '{Lupus} puerum spectat.', opts: ['lupum'], en: 'The wolf watches the boy.', why: 'the wolf does the watching → subject' },
            { la: 'Lupum {puer} spectat.', opts: ['puerum'], en: 'The boy watches the wolf.', why: 'word order is free — <i>lupum</i> is the object, so <i>puer</i> must be the subject' },
            { la: 'Māter {cēnam} parat.', opts: ['cēna'], en: 'Mother prepares dinner.', why: 'what is prepared → object' }
          ],
          tip: `<h3>Who does it — and to whom?</h3><p>English uses word order. Latin uses <b>endings</b>:</p>
<table class="tbl"><tr><td><b>subject</b> (nominative)</td><td>puella · lupus · puer · piscis</td></tr>
<tr><td><b>object</b> (accusative)</td><td>puella<b>m</b> · lupu<b>m</b> · puer<b>um</b> · pisce<b>m</b></td></tr></table>
<p><i>Puer lupum spectat</i> = <i>Lupum puer spectat</i> = "the boy watches the wolf". Swap the endings — <i>Lupus puerum spectat</i> — and the wolf is watching the boy!</p>`
        },
        {
          id: 'l_food_4', title: 'Story: The bear and the honey', icon: '🐻', gram: 'Reading: verbs + objects',
          words: ['apis', 'quaero', 'clamo'],
          sentences: [
            { la: 'Ursus mel quaerit.', en: 'The bear looks for honey.', alt: ['The bear is looking for honey.', 'The bear seeks honey.', 'A bear looks for honey.'] },
            { la: 'Apēs mel habent.', en: 'The bees have honey.', alt: ['Bees have honey.'] },
            { la: 'Ursus clāmat.', en: 'The bear shouts.', alt: ['The bear is shouting.', 'The bear cries out.'] }
          ],
          story: {
            title: 'Ursus et mel',
            lines: [
              { la: 'Ursus mel amat.', en: 'The bear loves honey.' },
              { la: 'Ursus ambulat et mel quaerit.', en: 'The bear walks and looks for honey.' },
              { la: 'Ecce apēs! Apēs mel habent.', en: 'Look, bees! The bees have honey.' },
              { la: 'Ursus mel rapit.', en: 'The bear snatches the honey.' },
              { la: 'Sed apēs ursum pungunt!', en: 'But the bees sting the bear!' },
              { la: 'Ursus clāmat et fugit. Apēs rīdent.', en: 'The bear shouts and runs away. The bees laugh.' }
            ],
            qs: [
              { q: 'What does the bear look for?', a: 'honey', opts: ['fish', 'milk'], line: 1 },
              { q: 'Who has the honey?', a: 'the bees', opts: ['the bear', 'a boy'], line: 2 },
              { q: 'Why does the bear shout?', a: 'the bees sting him', opts: ['he finds honey', 'he sees a wolf'], line: 4 }
            ]
          },
          tip: `<h3>📖 Spot the endings</h3><p>While you read, look at the ends of words: <i>ursus</i> (subject) vs <i>urs<b>um</b></i> (object); <i>habe<b>t</b></i> (one) vs <i>habe<b>nt</b></i> (several).</p>`
        }
      ]
    },
    {
      id: 'u_nature', title: 'Nātūra', sub: 'Nature', icon: '🌿', color: '#2e8b57',
      lessons: [
        {
          id: 'l_nature_1', title: 'Sky & sea', icon: '🌙',
          words: ['sol', 'luna', 'stella', 'terra', 'mare', 'in'],
          sentences: [
            { la: 'Stella in caelō est.', en: 'The star is in the sky.', alt: ['A star is in the sky.', 'There is a star in the sky.'] },
            { la: 'Piscis in marī natat.', en: 'The fish swims in the sea.', alt: ['A fish swims in the sea.'] },
            { la: 'Sōl et lūna.', en: 'The sun and the moon.', alt: ['Sun and moon.'] },
            { la: 'Puella lūnam spectat.', en: 'The girl watches the moon.', alt: ['The girl looks at the moon.'] }
          ],
          tip: `<h3><i>in</i> + ablative</h3><p>"In / on" a place: <i>in</i> + the <b>ablative</b>, which often has a long vowel: <i>in silv<b>ā</b></i>, <i>in cael<b>ō</b></i>, <i>in mar<b>ī</b></i>.</p><p>Listen to the length: <i>silva</i> (subject) vs <i>silvā</i> (in the forest).</p>`
        },
        {
          id: 'l_nature_2', title: 'Forest', icon: '🌲',
          words: ['silva', 'flumen', 'mons', 'arbor', 'flos'],
          sentences: [
            { la: 'Lupus in silvā habitat.', en: 'The wolf lives in the forest.', alt: ['A wolf lives in the forest.'] },
            { la: 'Puer flōrem spectat.', en: 'The boy watches the flower.', alt: ['The boy looks at the flower.'] },
            { la: 'Equus in flūmine natat.', en: 'The horse swims in the river.' },
            { la: 'Per aspera ad astra.', en: 'Through hardships to the stars.', alt: ['Through difficulties to the stars.'], src: 'Modern motto; cf. Seneca, Hercules Furens 437 "non est ad astra mollis e terris via"' }
          ],
          tip: `<h3>Stress in <i>flūmen</i></h3><p><i><b>FLŪ</b>-men</i>, but in the ablative <i><b>FLŪ</b>-mi-ne</i> — "mi" is light, so stress stays on "flū". Long ū, like in "rule".</p>`
        },
        {
          id: 'l_nature_3', title: 'To, from, with', icon: '🧭', gram: 'ad + acc. · in, ex, cum + abl.',
          words: ['ad', 'ex', 'cum', 'insula'],
          sentences: [
            { la: 'Puer ad silvam ambulat.', en: 'The boy walks to the forest.', alt: ['The boy is walking to the forest.', 'The boy walks towards the forest.', 'The boy walks toward the forest.'] },
            { la: 'Nauta ad īnsulam nāvigat.', en: 'The sailor sails to the island.', alt: ['The sailor is sailing to the island.', 'The sailor sails towards the island.'] },
            { la: 'Ursus ex silvā ambulat.', en: 'The bear walks out of the forest.', alt: ['The bear walks from the forest.', 'The bear is walking out of the forest.'] },
            { la: 'Puella cum mātre ambulat.', en: 'The girl walks with her mother.', alt: ['The girl walks with the mother.', 'The girl is walking with her mother.', 'The girl walks with mother.'] },
            { la: 'Piscis in aquā habitat.', en: 'The fish lives in the water.', alt: ['A fish lives in the water.', 'The fish lives in water.'] }
          ],
          drills: [
            { la: 'Ad {silvam} ambulō.', opts: ['silvā', 'silva'], en: 'I walk to the forest.', why: '<i>ad</i> + <b>accusative</b> (-m): where to?' },
            { la: 'In {silvā} habitō.', opts: ['silvam', 'silva'], en: 'I live in the forest.', why: '<i>in</i> + <b>ablative</b> (long -ā): where?' },
            { la: 'Cum {puellā} cantō.', opts: ['puellam', 'puella'], en: 'I sing with the girl.', why: '<i>cum</i> + <b>ablative</b>' },
            { la: 'Ex {aquā} ambulat.', opts: ['aquam', 'aqua'], en: 'He walks out of the water.', why: '<i>ex</i> + <b>ablative</b>: where from?' },
            { la: 'Nauta ad {īnsulam} nāvigat.', opts: ['īnsulā', 'īnsula'], en: 'The sailor sails to the island.', why: '<i>ad</i> + accusative' }
          ],
          tip: `<h3>Where? Where to? Where from?</h3>
<table class="tbl"><tr><td><b>where to?</b></td><td><i>ad</i> + accusative</td><td>ad silva<b>m</b></td></tr>
<tr><td><b>where?</b></td><td><i>in</i> + ablative</td><td>in silv<b>ā</b></td></tr>
<tr><td><b>where from?</b></td><td><i>ex / ē</i> + ablative</td><td>ex silv<b>ā</b></td></tr>
<tr><td><b>with whom?</b></td><td><i>cum</i> + ablative</td><td>cum puell<b>ā</b>, cum mātr<b>e</b></td></tr></table>
<p>👂 Listen for the difference between <i>silvam</i> and <i>silvā</i>: a nasal ending vs a long vowel.</p>`
        }
      ]
    },
    {
      id: 'u_adj', title: 'Quālis?', sub: 'Colours & qualities', icon: '🎨', color: '#c0398a',
      lessons: [
        {
          id: 'l_adj_1', title: 'Big & small', icon: '🐘',
          words: ['magnus', 'parvus', 'bonus', 'malus', 'novus', 'laetus'],
          sentences: [
            { la: 'Leō magnus est.', en: 'The lion is big.', alt: ['The lion is large.', 'The lion is great.'] },
            { la: 'Mūs parvus est.', en: 'The mouse is small.', alt: ['The mouse is little.'] },
            { la: 'Puella laeta est.', en: 'The girl is happy.', alt: ['The girl is glad.'] },
            { la: 'Magister bonus est.', en: 'The teacher is good.' },
            { la: 'Errāre hūmānum est.', en: 'To err is human.', src: 'Proverb (post-classical); cf. Cicero, Philippics 12.5 "cuiusvis hominis est errare"' }
          ],
          tip: `<h3>Adjectives agree</h3><p>An adjective copies the <b>gender, number and case</b> of its noun: <i>puer laet<b>us</b></i>, <i>puella laet<b>a</b></i>, <i>templum magn<b>um</b></i>.</p>
<p>⚠️ Gender belongs to the noun, not the ending: <i>nauta</i> (sailor) is masculine → <i>nauta bon<b>us</b></i>; <i>manus</i> and <i>domus</i> are feminine → <i>manus parv<b>a</b></i>, <i>domus nov<b>a</b></i>.</p>`
        },
        {
          id: 'l_adj_2', title: 'Colours', icon: '🎨',
          words: ['tristis', 'albus', 'niger', 'ruber', 'longus', 'via'],
          sentences: [
            { la: 'Rosa rubra est.', en: 'The rose is red.' },
            { la: 'Fēlēs nigra est.', en: 'The cat is black.' },
            { la: 'Equus albus est.', en: 'The horse is white.' },
            { la: 'Puer trīstis nōn est.', en: 'The boy is not sad.' },
            { la: 'Via longa est.', en: 'The road is long.', alt: ['The way is long.'] }
          ]
        },
        {
          id: 'l_adj_3', title: 'Agreement', icon: '🧩', gram: '-us / -a / -um must match the noun',
          words: ['pulcher', 'fessus', 'multus', 'brevis', 'ars'],
          sentences: [
            { la: 'Rēgīna pulchra est.', en: 'The queen is beautiful.', alt: ['The queen is pretty.'] },
            { la: 'Nauta fessus est.', en: 'The sailor is tired.', alt: ['The sailor is weary.'] },
            { la: 'Templum pulchrum est.', en: 'The temple is beautiful.' },
            { la: 'Multae stellae in caelō sunt.', en: 'There are many stars in the sky.', alt: ['Many stars are in the sky.'] },
            { la: 'Ars longa, vīta brevis.', en: 'Art is long, life is short.', alt: ['Art is long, life short.', 'Skill takes long, life is short.'], src: 'Latin rendering of Hippocrates, Aphorisms 1.1; cf. Seneca, Dē Brevitāte Vītae 1.1', note: '<i>est</i> is left out — very common in mottos. <i>vīta</i> is feminine, so <i>brevis</i> (an adjective with the same form for m. and f.).' }
          ],
          drills: [
            { la: 'Puella {laeta} est.', opts: ['laetus', 'laetum'], en: 'The girl is happy.', why: '<i>puella</i> is feminine → <b>-a</b>' },
            { la: 'Templum {magnum} est.', opts: ['magnus', 'magna'], en: 'The temple is big.', why: '<i>templum</i> is neuter → <b>-um</b>' },
            { la: 'Nauta {bonus} est.', opts: ['bona', 'bonum'], en: 'The sailor is good.', why: '<i>nauta</i> ends in -a but is masculine → <b>-us</b>' },
            { la: 'Rosa {rubra} est.', opts: ['ruber', 'rubrum'], en: 'The rose is red.', why: 'feminine of <i>ruber</i> is <i>rubra</i>' },
            { la: 'Domus {nova} est.', opts: ['novus', 'novum'], en: 'The house is new.', why: '<i>domus</i> is feminine (despite -us) → <b>-a</b>' },
            { la: 'Rēgīna {pulchra} est.', opts: ['pulcher', 'pulchrum'], en: 'The queen is beautiful.', why: 'feminine → <i>pulchra</i>' },
            { la: 'Bellum {malum} est.', opts: ['malus', 'mala'], en: 'War is bad.', why: '<i>bellum</i> is neuter → <b>-um</b>' }
          ],
          tip: `<h3>Adjectives copy their noun</h3>
<table class="tbl"><tr><td>masculine</td><td>puer laet<b>us</b> · nauta bon<b>us</b></td></tr>
<tr><td>feminine</td><td>puella laet<b>a</b> · domus nov<b>a</b></td></tr>
<tr><td>neuter</td><td>templum magn<b>um</b> · bellum mal<b>um</b></td></tr></table>
<p>Copy the <b>gender</b>, not the letters: <i>nauta</i> looks feminine but is a man. Some adjectives (<i>trīstis, brevis, dulcis</i>) have one form for m. and f.</p>
<p>📜 <i>Ars longa, vīta brevis</i> — a Greek doctor's saying that Romans loved to quote.</p>`
        }
      ]
    },
    {
      id: 'u_numbers', title: 'Numerī', sub: 'Numbers & plurals', icon: '🔢', color: '#5b6bd6',
      lessons: [
        {
          id: 'l_num_1', title: 'One to five', icon: '✋',
          words: ['unus', 'duo', 'tres', 'quattuor', 'quinque'],
          sentences: [
            { la: 'Trēs puellae cantant.', en: 'Three girls sing.', alt: ['Three girls are singing.'] },
            { la: 'Quattuor equī.', en: 'Four horses.' },
            { la: 'Ūnus canis et duae fēlēs.', en: 'One dog and two cats.', note: '<i>duo</i> declines: <i>duo</i> (m./n.), <i>duae</i> (f.) — <i>fēlēs</i> is feminine.' },
            { la: 'Gallia est omnis dīvīsa in partēs trēs.', en: 'All Gaul is divided into three parts.', alt: ['Gaul as a whole is divided into three parts.'], src: 'Caesar, Dē Bellō Gallicō 1.1', note: 'Here <i>in</i> + accusative (<i>partēs</i>) means <b>into</b> — motion or division. <i>in</i> + ablative means <b>in / on</b>.' }
          ],
          tip: `<h3>Plurals</h3><p><i>puella → puell<b>ae</b></i>, <i>equus → equ<b>ī</b></i>, <i>canis → can<b>ēs</b></i>. Verbs: <i>canta<b>t</b></i> (sings) → <i>canta<b>nt</b></i> (they sing).</p>
<p><i>in</i> + <b>accusative</b> = "into": <i>in partēs</i> "into parts" (but <i>in silvā</i> = "in the forest").</p>
<p>📜 Caesar opened his war diary with "Gallia est omnis dīvīsa in partēs trēs". Stress: <i>dī-<b>VĪ</b>-sa</i>, <i><b>PAR</b>-tēs</i>.</p>`
        },
        {
          id: 'l_num_2', title: 'Six to ten', icon: '🔟',
          words: ['sex', 'septem', 'octo', 'novem', 'decem'],
          sentences: [
            { la: 'Septem stellae.', en: 'Seven stars.' },
            { la: 'Quīnque piscēs natant.', en: 'Five fish swim.', alt: ['Five fish are swimming.'] },
            { la: 'Decem mīlitēs pugnant.', en: 'Ten soldiers fight.', alt: ['Ten soldiers are fighting.'] }
          ],
          tip: `<h3>X = KS</h3><p><i>sex</i> = "seks". Because X is two consonants, a vowel before it always makes a <b>heavy</b> syllable.</p>`
        },
        {
          id: 'l_num_3', title: 'We are, they are', icon: '👫', gram: 'sumus · estis · sunt; noun plurals',
          words: ['sumus', 'estis', 'sunt'],
          sentences: [
            { la: 'Puerī laetī sunt.', en: 'The boys are happy.', alt: ['The boys are glad.'] },
            { la: 'Amīcī sumus.', en: 'We are friends.' },
            { la: 'Puellae estis.', en: 'You are girls.', alt: ['You all are girls.'] },
            { la: 'Equī in silvā sunt.', en: 'The horses are in the forest.', alt: ['There are horses in the forest.'] },
            { la: 'Quot hominēs, tot sententiae.', en: 'So many people, so many opinions.', alt: ['As many people, as many opinions.', 'There are as many opinions as there are people.'], src: 'Terence, Phormio 454', note: '<i>hominēs</i> and <i>sententiae</i> are plurals: <i>homō → hominēs</i>, <i>sententia → sententiae</i>.' }
          ],
          drills: [
            { la: 'Duae {puellae} cantant.', opts: ['puella', 'puellam'], en: 'Two girls sing.', why: 'plural of <i>puella</i> → <b>-ae</b>' },
            { la: 'Trēs {equī} natant.', opts: ['equus', 'equum'], en: 'Three horses swim.', why: 'plural of <i>equus</i> → <b>-ī</b>' },
            { la: 'Lupī {pugnant}.', opts: ['pugnat', 'pugnō'], en: 'The wolves fight.', why: 'plural subject → <b>-nt</b>' },
            { la: 'Puerī laetī {sunt}.', opts: ['est', 'sum'], en: 'The boys are happy.', why: 'they are = <i>sunt</i>' },
            { la: 'Nōs amīcī {sumus}.', opts: ['sunt', 'estis'], en: 'We are friends.', why: 'we are = <i>sumus</i>' },
            { la: 'Vōs {estis} Rōmānī.', opts: ['sumus', 'es'], en: 'You (all) are Romans.', why: 'you all are = <i>estis</i>' },
            { la: 'Quattuor {canēs} sunt.', opts: ['canis', 'canem'], en: 'There are four dogs.', why: 'plural of <i>canis</i> → <b>-ēs</b>' }
          ],
          tip: `<h3>"To be" — complete</h3>
<table class="tbl"><tr><td>sum</td><td>I am</td><td>sumus</td><td>we are</td></tr>
<tr><td>es</td><td>you are</td><td>estis</td><td>you (all) are</td></tr>
<tr><td>est</td><td>he/she/it is</td><td>sunt</td><td>they are</td></tr></table>
<h3>Plurals</h3><p>-a → -<b>ae</b> (puellae) · -us → -<b>ī</b> (equī) · -er → -<b>ī</b> (puerī) · 3rd declension → -<b>ēs</b> (canēs, hominēs) · neuter → -<b>a</b> (templa, arma).</p>
<p>📜 Terence, the comic poet, gives us a proverb built of plurals: <i>Quot hominēs, tot sententiae</i>.</p>`
        }
      ]
    },
    {
      id: 'u_body', title: 'Corpus', sub: 'The body', icon: '💪', color: '#d0683a',
      lessons: [
        {
          id: 'l_body_1', title: 'Head', icon: '👁️',
          words: ['caput', 'oculus', 'nasus', 'auris', 'dens'],
          sentences: [
            { la: 'Duōs oculōs habeō.', en: 'I have two eyes.' },
            { la: 'Caput magnum est.', en: 'The head is big.', alt: ['The head is large.'] }
          ]
        },
        {
          id: 'l_body_2', title: 'Body & mind', icon: '🧠',
          words: ['manus', 'pes', 'cor', 'bracchium', 'corpus', 'mens'],
          sentences: [
            { la: 'Canis quattuor pedēs habet.', en: 'The dog has four feet.', alt: ['A dog has four feet.'] },
            { la: 'Manus parva est.', en: 'The hand is small.' },
            { la: 'Mēns sāna in corpore sānō.', en: 'A healthy mind in a healthy body.', alt: ['A sound mind in a sound body.'], src: 'Juvenal, Satires 10.356' }
          ],
          tip: `<h3>📜 Juvenal</h3><p><i>Mēns sāna in corpore sānō</i>. Stress: <i><b>COR</b>-po-re</i> — "po" is light, so the stress goes back to "cor".</p>`
        }
      ]
    },
    {
      id: 'u_city', title: 'Urbs Rōma', sub: 'The city', icon: '🏛️', color: '#8a5a2b',
      lessons: [
        {
          id: 'l_city_1', title: 'Streets', icon: '🛣️',
          words: ['urbs', 'via', 'domus', 'templum', 'forum'],
          sentences: [
            { la: 'Rōma urbs magna est.', en: 'Rome is a great city.', alt: ['Rome is a big city.', 'Rome is a large city.'] },
            { la: 'Via longa est.', en: 'The road is long.', alt: ['The street is long.'] },
            { la: 'Domus nova est.', en: 'The house is new.' }
          ]
        },
        {
          id: 'l_city_2', title: 'War & peace', icon: '🗡️',
          words: ['rex', 'regina', 'miles', 'gladius', 'bellum', 'pax'],
          sentences: [
            { la: 'Rēx in urbe habitat.', en: 'The king lives in the city.' },
            { la: 'Mīles gladium habet.', en: 'The soldier has a sword.' },
            { la: 'Rēgīna templum spectat.', en: 'The queen watches the temple.', alt: ['The queen looks at the temple.'] },
            { la: 'Pāx, nōn bellum.', en: 'Peace, not war.' },
            { la: 'Senātus Populus+que Rōmānus', en: 'The Senate and the Roman People', alt: ['The Senate and People of Rome'], src: 'S·P·Q·R — official formula of the Roman state' }
          ],
          tip: `<h3>Enclitic -que = "and"</h3><p><i>-que</i> sticks to the end of a word and means "and": <i>Senātus Populus<b>que</b></i> = "the Senate <b>and</b> the People".</p>
<p>The Roman grammarians say it pulls the stress to the syllable right before it: <i><b>LĪ</b>-mi-na</i> (thresholds) → <i>lī-mi-<b>NA</b>-que</i>. (In <i>po-pu-<b>LUS</b>-que</i> the normal rule gives the same result anyway.) Some modern scholars doubt how strictly this applied — but it's the standard teaching.</p>`
        },
        {
          id: 'l_city_3', title: 'Story: In the forum', icon: '🌹', gram: 'Reading: place, objects, adjectives',
          words: ['hodie', 'nunc'],
          sentences: [
            { la: 'Hodiē pāx est.', en: 'Today there is peace.', alt: ['There is peace today.', 'Today it is peace.'] },
            { la: 'Nunc mīles laetus est.', en: 'Now the soldier is happy.', alt: ['The soldier is happy now.', 'Now the soldier is glad.'] }
          ],
          story: {
            title: 'In forō',
            lines: [
              { la: 'Hodiē mīles in urbe ambulat.', en: 'Today a soldier walks in the city.' },
              { la: 'Gladium magnum habet.', en: 'He has a big sword.' },
              { la: 'In forō multī hominēs sunt.', en: 'There are many people in the forum.' },
              { la: 'Ibi puella rosās habet.', en: 'There a girl has roses.' },
              { la: 'Mīles rosam rubram spectat et rīdet.', en: 'The soldier looks at a red rose and smiles.' },
              { la: '“Nunc pāx est, nōn bellum!”', en: '“Now there is peace, not war!”' }
            ],
            qs: [
              { q: 'Where is the soldier walking?', a: 'in the city', opts: ['in the forest', 'to the sea'], line: 0 },
              { q: 'What does the girl have?', a: 'roses', opts: ['a sword', 'bread'], line: 3 },
              { q: 'Why does the soldier smile?', a: 'there is peace, not war', opts: ['he has a new sword', 'he sees the king'], line: 5 }
            ]
          },
          tip: `<h3>📖 Everything together</h3><p>This story uses everything from Part IV: <i>in</i> + ablative (<i>in urbe, in forō</i>), objects (<i>gladium, rosam</i>), adjectives that agree (<i>rosam rubram</i>) and plurals (<i>multī hominēs</i>).</p>`
        }
      ]
    },
    // ======================= PART V — Vīta Rōmāna =======================
    {
      id: 'u_vita', title: 'Vīta cottīdiāna', sub: 'Daily life', icon: '🏫', color: '#3a7d8c', part: 5, gram: '2nd & 3rd conjugation',
      lessons: [
        {
          id: 'l_vita_1', title: 'I see, I fear', icon: '👁️', gram: '2nd conjugation: -eō, -ēs, -et',
          words: ['video', 'timeo', 'sedeo', 'rideo', 'doceo'],
          sentences: [
            { la: 'Puer lupum videt.', en: 'The boy sees the wolf.', alt: ['The boy sees a wolf.', 'A boy sees a wolf.'] },
            { la: 'Lupum timeō.', en: 'I fear the wolf.', alt: ['I am afraid of the wolf.', 'I fear a wolf.', 'I am afraid of a wolf.'] },
            { la: 'Magister puellam docet.', en: 'The teacher teaches the girl.' },
            { la: 'Avia sedet et rīdet.', en: 'Grandmother sits and laughs.', alt: ['Grandmother sits and smiles.', 'The grandmother sits and laughs.', 'The grandmother sits and smiles.'] },
            { la: 'Stellās vidēmus.', en: 'We see the stars.', alt: ['We see stars.'] }
          ],
          drills: [
            { la: 'Puella lūnam {videt}.', opts: ['vident', 'videō'], en: 'The girl sees the moon.', why: 'she → <b>-t</b>; the e stays: <i>vide-t</i>' },
            { la: 'Nōs {timēmus}.', opts: ['timet', 'timent'], en: 'We are afraid.', why: 'we → <i>timē-<b>mus</b></i>' },
            { la: 'Puerī {sedent}.', opts: ['sedet', 'sedeō'], en: 'The boys sit.', why: 'they → <b>-nt</b>' },
            { la: 'Tū {rīdēs}.', opts: ['rīdet', 'rīdeō'], en: 'You laugh.', why: 'you → <b>-s</b>' },
            { la: 'Ego {doceō}.', opts: ['docet', 'docēs'], en: 'I teach.', why: 'I → <i>doce-<b>ō</b></i> (the e stays!)' }
          ],
          tip: `<h3>Verb family 2: the e-verbs</h3>
<table class="tbl"><tr><td>videō</td><td>I see</td><td>vidēmus</td><td>we see</td></tr>
<tr><td>vidēs</td><td>you see</td><td>vidētis</td><td>you (all) see</td></tr>
<tr><td>videt</td><td>he/she sees</td><td>vident</td><td>they see</td></tr></table>
<p>Same endings as <i>amō</i> — but the <b>e</b> stays everywhere, even in <i>vide-ō</i>. Dictionaries show the family by the infinitive: <i>am<b>āre</b></i> (1st), <i>vid<b>ēre</b></i> (2nd).</p>
<p>🎯 <i><b>VI</b>-de-ō</i> (the e before a vowel is short), but <i>vi-<b>DĒ</b>-mus</i>.</p>`
        },
        {
          id: 'l_vita_2', title: 'Reading & writing', icon: '✍️', gram: '3rd conjugation: -ō, -is, -it, -unt',
          words: ['schola', 'discipulus', 'lego', 'scribo', 'dico', 'disco'],
          sentences: [
            { la: 'Discipulus librum legit.', en: 'The pupil reads a book.', alt: ['The pupil reads the book.', 'The student reads a book.', 'The student reads the book.', 'The pupil is reading a book.'] },
            { la: 'Puella epistulam scrībit.', en: 'The girl writes a letter.', alt: ['The girl is writing a letter.', 'The girl writes the letter.'] },
            { la: 'In scholā discimus.', en: 'We learn at school.', alt: ['We learn in school.', 'We learn in the school.'] },
            { la: 'Legimus et scrībimus.', en: 'We read and write.', alt: ['We read and we write.'] },
            { la: 'Nōn scholae sed vītae discimus.', en: 'We learn not for school but for life.', alt: ['We do not learn for school but for life.', 'We learn not for school, but for life.'], src: 'after Seneca, Epistulae 106.12 — who wrote it the other way round, as a complaint', note: '<i>scholae, vītae</i> = dative: "<b>for</b> school", "<b>for</b> life".' }
          ],
          drills: [
            { la: 'Discipulus {legit}.', opts: ['legat', 'legunt'], en: 'The pupil reads.', why: '3rd conjugation: <i>leg-<b>it</b></i> — an <b>i</b> before the ending' },
            { la: 'Discipulī {legunt}.', opts: ['legit', 'legimus'], en: 'The pupils read.', why: 'they → <i>leg-<b>unt</b></i>, not -int!' },
            { la: 'Nōs {scrībimus}.', opts: ['scrībit', 'scrībunt'], en: 'We write.', why: 'we → <i>scrīb-<b>imus</b></i>' },
            { la: 'Tū {dīcis}.', opts: ['dīcit', 'dīcō'], en: 'You say.', why: 'you → <i>dīc-<b>is</b></i>' },
            { la: 'Ego {discō}.', opts: ['discit', 'discis'], en: 'I learn.', why: 'I → <b>-ō</b>' }
          ],
          tip: `<h3>Verb family 3</h3>
<table class="tbl"><tr><td>legō</td><td>I read</td><td>legimus</td><td>we read</td></tr>
<tr><td>legis</td><td>you read</td><td>legitis</td><td>you (all) read</td></tr>
<tr><td>legit</td><td>he/she reads</td><td>legunt</td><td>they read</td></tr></table>
<p>A short <b>i</b> slips in before the endings, and "they" is <b>-unt</b>. Infinitive: <i>leg<b>ere</b></i> with a short e.</p>
<p>🎯 Compare <i>a-<b>MĀ</b>-mus</i> with <i><b>LE</b>-gi-mus</i>: the short i can't hold the stress.</p>
<p>📜 Seneca grumbled <i>nōn vītae sed scholae discimus</i> — "we learn for school, not for life". Teachers flipped it into the motto you just read.</p>`
        },
        {
          id: 'l_vita_3', title: 'Story: At school', icon: '📚', gram: 'Reading: a preview of questions',
          words: ['respondeo', 'subito'],
          sentences: [
            { la: 'Iūlia respondet.', en: 'Julia answers.', alt: ['Julia replies.', 'Julia is answering.'] },
            { la: 'Subitō Mārcus rīdet.', en: 'Suddenly Marcus laughs.', alt: ['Marcus suddenly laughs.', 'Suddenly Marcus smiles.'] }
          ],
          story: {
            title: 'In scholā',
            lines: [
              { la: 'Mārcus et Iūlia in scholā sedent.', en: 'Marcus and Julia sit in the school.' },
              { la: 'Magister librum legit; discipulī audiunt.', en: 'The teacher reads a book; the pupils listen.' },
              { la: 'Subitō Mārcus rīdet.', en: 'Suddenly Marcus laughs.' },
              { la: 'Magister Mārcum videt: “Cūr rīdēs, Mārce?”', en: 'The teacher sees Marcus: “Why are you laughing, Marcus?”' },
              { la: 'Iūlia respondet: “Fēlēs in fenestrā sedet!”', en: 'Julia answers: “A cat is sitting in the window!”' },
              { la: 'Nunc omnēs discipulī rīdent — et magister quoque.', en: 'Now all the pupils laugh — and the teacher too.' }
            ],
            qs: [
              { q: 'Where are Marcus and Julia?', a: 'at school', opts: ['in the forest', 'at dinner'], line: 0 },
              { q: 'What does the teacher do?', a: 'reads a book', opts: ['sings', 'sleeps'], line: 1 },
              { q: 'Why does Marcus laugh?', a: 'a cat is sitting in the window', opts: ['the teacher sings', 'Julia is asleep'], line: 4 }
            ]
          },
          tip: `<h3>📖 A sneak peek</h3><p>This story already uses things from the next units: a question word (<i>cūr?</i> = why?) and the form used to call someone (<i>Mārce!</i>). Tap them — you'll meet them properly soon.</p>`
        }
      ]
    },
    {
      id: 'u_domus', title: 'Domus Rōmāna', sub: 'The Roman house', icon: '🏡', color: '#9a5b3c', part: 5, gram: 'Genitive "of": -ae / -ī',
      lessons: [
        {
          id: 'l_domus_1', title: 'Whose is it?', icon: '🔑', gram: 'Genitive: -ae / -ī = "of"',
          words: ['villa', 'hortus', 'servus', 'ancilla'],
          sentences: [
            { la: 'Vīlla dominī magna est.', en: "The master's villa is big.", alt: ['The villa of the master is big.', "The master's villa is large."] },
            { la: 'Hortus Iūliae pulcher est.', en: "Julia's garden is beautiful.", alt: ['The garden of Julia is beautiful.', "Julia's garden is pretty."] },
            { la: 'Servus dominī labōrat.', en: "The master's slave works.", alt: ["The master's servant works.", 'The slave of the master works.'] },
            { la: 'Ancilla rēgīnae cantat.', en: "The queen's maid sings.", alt: ['The maid of the queen sings.'] },
            { la: 'Repetītiō est māter studiōrum.', en: 'Repetition is the mother of learning.', alt: ['Repetition is the mother of studies.'], src: 'Latin proverb (medieval)', note: '<i>studiōrum</i> = "of studies" — the genitive <b>plural</b> ends in <b>-ōrum</b> / <b>-ārum</b>.' }
          ],
          drills: [
            { la: 'Vīlla {dominī} magna est.', opts: ['dominus', 'dominum'], en: "The master's villa is big.", why: '"of the master" → genitive <b>-ī</b>' },
            { la: 'Rosa {puellae} rubra est.', opts: ['puella', 'puellam'], en: "The girl's rose is red.", why: '"of the girl" → genitive <b>-ae</b>' },
            { la: 'Canis {Mārcī} nōn est lupus.', opts: ['Mārcus', 'Mārcum'], en: "Marcus's dog is not a wolf.", why: '"of Marcus" → <b>-ī</b>' },
            { la: 'Hortus {Iūliae} pulcher est.', opts: ['Iūlia', 'Iūliam'], en: "Julia's garden is beautiful.", why: '"of Julia" → <b>-ae</b>' },
            { la: '{Servus} dominī labōrat.', opts: ['servī', 'servum'], en: "The master's slave works.", why: 'the slave is the subject → nominative' },
            { la: 'Fīlia {rēgīnae} cantat.', opts: ['rēgīna', 'rēgīnam'], en: "The queen's daughter sings.", why: '"of the queen" → <b>-ae</b>' }
          ],
          tip: `<h3>The genitive = "of" / "'s"</h3>
<table class="tbl"><tr><td>puella</td><td>→ puell<b>ae</b></td><td>of the girl</td></tr>
<tr><td>dominus</td><td>→ domin<b>ī</b></td><td>of the master</td></tr>
<tr><td>puer</td><td>→ puer<b>ī</b></td><td>of the boy</td></tr></table>
<p>It usually comes <b>after</b> its noun: <i>vīlla dominī</i> = the master's villa.</p>
<p>⚠️ <i>puellae</i> can also mean "girls" (plural) — context decides. <i>Puellae cantant</i> = the girls sing; <i>rosa puellae</i> = the girl's rose.</p>
<p>A Roman <i>vīlla</i> was a country estate, worked by enslaved people (<i>servī, ancillae</i>) — a hard fact of Roman life.</p>`
        },
        {
          id: 'l_domus_2', title: 'Dinner', icon: '🍽️', gram: 'Review: nom · gen · acc · abl',
          words: ['mensa', 'culina', 'coquus'],
          sentences: [
            { la: 'Coquus in culīnā labōrat.', en: 'The cook works in the kitchen.', alt: ['The cook is working in the kitchen.'] },
            { la: 'Coquus cēnam parat.', en: 'The cook prepares dinner.', alt: ['The cook prepares the dinner.', 'The cook is preparing dinner.'] },
            { la: 'Ancilla vīnum ad mēnsam portat.', en: 'The maid carries wine to the table.', alt: ['The maid carries the wine to the table.', 'The maid is carrying wine to the table.'] },
            { la: 'Cēna dominī bona est.', en: "The master's dinner is good.", alt: ['The dinner of the master is good.'] },
            { la: 'Pānis in mēnsā est.', en: 'The bread is on the table.', alt: ['There is bread on the table.', 'Bread is on the table.'] }
          ],
          drills: [
            { la: 'Coquus in {culīnā} labōrat.', opts: ['culīnam', 'culīnae'], en: 'The cook works in the kitchen.', why: '<i>in</i> + ablative (where?) → <b>-ā</b>' },
            { la: 'Ancilla ad {mēnsam} ambulat.', opts: ['mēnsā', 'mēnsae'], en: 'The maid walks to the table.', why: '<i>ad</i> + accusative (where to?) → <b>-am</b>' },
            { la: 'Cēna {coquī} bona est.', opts: ['coquus', 'coquum'], en: "The cook's dinner is good.", why: '"of the cook" → genitive <b>-ī</b>' },
            { la: 'Servī {cēnam} portant.', opts: ['cēna', 'cēnae'], en: 'The slaves carry the dinner.', why: 'what is carried → accusative' },
            { la: 'Pānis in {mēnsā} est.', opts: ['mēnsam', 'mēnsa'], en: 'The bread is on the table.', why: '<i>in</i> + ablative = in / on' }
          ],
          tip: `<h3>Four cases of <i>mēnsa</i></h3>
<table class="tbl"><tr><td>nominative</td><td>mēns<b>a</b></td><td>the table (subject)</td></tr>
<tr><td>genitive</td><td>mēns<b>ae</b></td><td>of the table</td></tr>
<tr><td>accusative</td><td>mēns<b>am</b></td><td>the table (object), ad mēnsam</td></tr>
<tr><td>ablative</td><td>mēns<b>ā</b></td><td>in mēnsā, cum…, ex…</td></tr></table>
<p>The Roman <i>cēna</i> began in the afternoon; rich Romans ate it lying on couches around the <i>mēnsa</i>.</p>`
        },
        {
          id: 'l_domus_3', title: 'Story: Dinner party', icon: '🧀', gram: 'Reading: the whole household',
          words: ['rapio'],
          sentences: [
            { la: 'Canis cāseum rapit.', en: 'The dog snatches the cheese.', alt: ['The dog grabs the cheese.', 'The dog seizes the cheese.'] },
            { la: 'Dominus clāmat.', en: 'The master shouts.', alt: ['The master is shouting.'] }
          ],
          story: {
            title: 'Cēna',
            lines: [
              { la: 'Hodiē in vīllā cēna magna est.', en: 'Today there is a big dinner in the villa.' },
              { la: 'Coquus in culīnā labōrat.', en: 'The cook works in the kitchen.' },
              { la: 'Ancilla vīnum et pānem ad mēnsam portat.', en: 'The maid carries wine and bread to the table.' },
              { la: 'Canis dominī cibum spectat.', en: "The master's dog watches the food." },
              { la: 'Subitō canis cāseum rapit et fugit!', en: 'Suddenly the dog snatches the cheese and runs away!' },
              { la: 'Dominus clāmat, sed fīlius dominī rīdet.', en: "The master shouts, but the master's son laughs." }
            ],
            qs: [
              { q: 'Where does the cook work?', a: 'in the kitchen', opts: ['in the garden', 'in the forum'], line: 1 },
              { q: 'What does the dog take?', a: 'the cheese', opts: ['the wine', 'the bread'], line: 4 },
              { q: 'Who laughs?', a: "the master's son", opts: ['the master', 'the cook'], line: 5 }
            ]
          },
          tip: `<h3>📖 Cases in action</h3><p>Before you read, remember: <b>-ī / -ae</b> after a noun = "of" (<i>canis dominī</i>), <b>-m</b> = object, <b>-ā / -ō</b> after <i>in</i> = place.</p>`
        }
      ]
    },
    {
      id: 'u_quaest', title: 'Quis? Quid?', sub: 'Asking questions', icon: '❓', color: '#5d6fb0', part: 5, gram: 'quis, quid, ubi, cūr, -ne',
      lessons: [
        {
          id: 'l_quaest_1', title: 'Who? What? Why?', icon: '❓', gram: 'Question words; -ne',
          words: ['quis', 'quid', 'cur', 'quia'],
          sentences: [
            { la: 'Quis est?', en: 'Who is it?', alt: ['Who is he?', 'Who is she?', 'Who is there?'] },
            { la: 'Quid est?', en: 'What is it?', alt: ['What is this?', 'What is that?'] },
            { la: 'Ubi est Mārcus?', en: 'Where is Marcus?' },
            { la: 'Cūr rīdēs?', en: 'Why are you laughing?', alt: ['Why do you laugh?', 'Why are you smiling?', 'Why do you smile?'] },
            { la: 'Quia laetus sum.', en: 'Because I am happy.', alt: ['Because I am glad.'] },
            { la: 'Es+ne laetus?', en: 'Are you happy?', alt: ['Are you glad?'], note: '<i>-ne</i> on the first word turns a sentence into a yes/no question.' },
            { la: 'Vidēs+ne lupum?', en: 'Do you see the wolf?', alt: ['Do you see a wolf?', 'Can you see the wolf?'] },
            { la: 'Cui bonō?', en: 'Who benefits?', alt: ['To whose benefit?', 'For whose good?', 'Good for whom?'], src: 'Cicero, Prō Milōne 32 (quoting the judge L. Cassius)', note: 'Literally "to whom (is it) for a good?" — a detective\'s question that lawyers still use.' }
          ],
          drills: [
            { la: '{Quis} est? Mārcus est.', opts: ['Quid', 'Ubi'], en: 'Who is it? It is Marcus.', why: 'a person → <i>quis</i> (who)' },
            { la: '{Quid} est? Rosa est.', opts: ['Quis', 'Cūr'], en: 'What is it? It is a rose.', why: 'a thing → <i>quid</i> (what)' },
            { la: '{Ubi} est canis? In hortō.', opts: ['Quis', 'Cūr'], en: 'Where is the dog? In the garden.', why: 'a place → <i>ubi</i> (where)' },
            { la: '{Cūr} rīdēs? Quia laetus sum.', opts: ['Ubi', 'Quid'], en: 'Why are you laughing? Because I am happy.', why: 'a reason → <i>cūr</i> (why)' },
            { la: 'Cūr clāmās? {Quia} lupum videō!', opts: ['Ubi', 'Sed'], en: 'Why are you shouting? Because I see a wolf!', why: '"because" = <i>quia</i>' }
          ],
          tip: `<h3>Asking in Latin</h3>
<table class="tbl"><tr><td><i>quis?</i></td><td>who?</td><td><i>quid?</i></td><td>what?</td></tr>
<tr><td><i>ubi?</i></td><td>where?</td><td><i>cūr?</i></td><td>why?</td></tr></table>
<p><b>Yes/no questions:</b> stick <b>-ne</b> on the first word: <i>Es laetus</i> (you are happy) → <i>Es<b>ne</b> laetus?</i> (are you happy?)</p>
<p>🎯 <i>-ne</i> is an enclitic like <i>-que</i>: <i>vi-<b>DĒS</b>-ne</i>.</p>
<p>📜 Cicero's <i>Cui bonō?</i> — "who gains from it?" — is the oldest detective question.</p>`
        },
        {
          id: 'l_quaest_2', title: 'Story: Who is in the garden?', icon: '🌙', gram: 'Reading: questions in a story',
          words: ['nox', 'fur', 'cubiculum'],
          sentences: [
            { la: 'Nox est.', en: 'It is night.', alt: ['It is nighttime.'] },
            { la: 'Quis est in hortō?', en: 'Who is in the garden?' },
            { la: 'Fūr nōn es!', en: 'You are not a thief!', alt: ["You aren't a thief!"] }
          ],
          story: {
            title: 'Quis est in hortō?',
            lines: [
              { la: 'Nox est. Iūlia in cubiculō est.', en: 'It is night. Julia is in her bedroom.' },
              { la: 'Subitō Iūlia sonum audit.', en: 'Suddenly Julia hears a sound.' },
              { la: '“Quis est in hortō? Est+ne fūr?”', en: '“Who is in the garden? Is it a thief?”' },
              { la: 'Iūlia ad fenestram ambulat et spectat.', en: 'Julia walks to the window and looks.' },
              { la: 'Ecce! In arbore fēlēs nigra sedet.', en: 'Look! A black cat is sitting in the tree.' },
              { la: 'Iūlia rīdet: “Fūr nōn es, sed fēlēs!”', en: 'Julia laughs: “You are not a thief, but a cat!”' }
            ],
            qs: [
              { q: 'Where is Julia at the start?', a: 'in her bedroom', opts: ['in the kitchen', 'in the forum'], line: 0 },
              { q: 'What is Julia afraid of?', a: 'a thief', opts: ['a wolf', 'the teacher'], line: 2 },
              { q: 'Who is really in the garden?', a: 'a black cat', opts: ['a thief', 'Marcus'], line: 4 }
            ]
          },
          tip: `<h3>📖 Night in the villa</h3><p>Watch for <i>quis?</i> and the <i>-ne</i> question. <i>In arbore</i> = in the tree (ablative of <i>arbor</i>).</p>`
        }
      ]
    },
    {
      id: 'u_imper', title: 'Audī!', sub: 'Commands & calling people', icon: '📢', color: '#b0473f', part: 5, gram: 'Imperative & vocative',
      lessons: [
        {
          id: 'l_imper_1', title: 'Come! Listen!', icon: '👂', gram: 'Imperative -ā/-ē/-e/-ī, plural -te; vocative',
          words: ['venio', 'audio', 'dormio', 'taceo'],
          sentences: [
            { la: 'Venī, Mārce!', en: 'Come, Marcus!', alt: ['Come here, Marcus!'] },
            { la: 'Audīte, discipulī!', en: 'Listen, pupils!', alt: ['Listen, students!', 'Hear, pupils!'] },
            { la: 'Tacē, puer!', en: 'Be quiet, boy!', alt: ['Be silent, boy!', 'Quiet, boy!'] },
            { la: 'Dormī, fīlī!', en: 'Sleep, son!', alt: ['Sleep, my son!'] },
            { la: 'Puerī dormiunt.', en: 'The boys sleep.', alt: ['The boys are sleeping.', 'The boys are asleep.'] },
            { la: 'Spectāte, amīcī!', en: 'Look, friends!', alt: ['Watch, friends!'] }
          ],
          drills: [
            { la: '{Venīte}, puerī!', opts: ['Venī', 'Venit'], en: 'Come, boys!', why: 'several people → plural command <b>-te</b>' },
            { la: '{Audī}, Mārce!', opts: ['Audīte', 'Audit'], en: 'Listen, Marcus!', why: 'one person → the bare stem <i>audī</i>' },
            { la: 'Salvē, {Mārce}!', opts: ['Mārcus', 'Mārcum'], en: 'Hello, Marcus!', why: 'calling someone: <i>-us</i> → <b>-e</b> (vocative)' },
            { la: '{Tacēte}, discipulī!', opts: ['Tacē', 'Tacet'], en: 'Be quiet, pupils!', why: 'plural → <b>-te</b>' },
            { la: 'Valē, {amīce}!', opts: ['amīcus', 'amīcum'], en: 'Goodbye, friend!', why: 'vocative of <i>amīcus</i> → <i>amīce</i>' },
            { la: 'Salvēte, {puellae}!', opts: ['puella', 'puellam'], en: 'Hello, girls!', why: 'plural vocative = plural nominative' }
          ],
          tip: `<h3>Giving orders</h3>
<table class="tbl"><tr><td>amāre</td><td>am<b>ā</b>!</td><td>amā<b>te</b>!</td></tr>
<tr><td>vidēre</td><td>vid<b>ē</b>!</td><td>vidē<b>te</b>!</td></tr>
<tr><td>legere</td><td>leg<b>e</b>!</td><td>leg<b>ite</b>!</td></tr>
<tr><td>audīre</td><td>aud<b>ī</b>!</td><td>audī<b>te</b>!</td></tr></table>
<p>You already know two: <i>salvē!</i> (be well = hello) and <i>valē!</i> — to a group: <i>salvē<b>te</b>, valē<b>te</b></i>.</p>
<h3>Calling someone: the vocative</h3><p><i>-us</i> → <b>-e</b>: <i>Mārce! amīce!</i> · <i>-ius</i> → <b>-ī</b>: <i>fīlī!</i> · everything else stays: <i>puella! pater!</i></p>`
        },
        {
          id: 'l_imper_2', title: 'Beware of the dog!', icon: '🐕', gram: 'Mottos in the imperative',
          words: ['caveo', 'audeo', 'vivo'],
          sentences: [
            { la: 'Cavē canem!', en: 'Beware of the dog!', alt: ['Beware the dog!', 'Watch out for the dog!'], src: 'Petronius, Satyricon 29 (and a famous mosaic in Pompeii)', note: 'Romans usually said it fast, with a short e: <i>cave</i>.' },
            { la: 'Sapere audē.', en: 'Dare to be wise.', alt: ['Dare to know.'], src: 'Horace, Epistles 1.2.40', note: '<i>sapere</i> = "to be wise" (infinitive). Kant made it the motto of the Enlightenment.' },
            { la: 'Vīve, valē!', en: 'Live, be well!', alt: ['Live, farewell!', 'Live and be well!'], src: 'Horace, Epistles 1.6.67' },
            { la: 'Nōsce tē ipsum.', en: 'Know yourself.', alt: ['Know thyself.'], src: 'Latin form of the Delphic maxim γνῶθι σεαυτόν; cf. Cicero, Tusculan Disputations 1.52' },
            { la: 'Sī vīs pācem, parā bellum.', en: 'If you want peace, prepare for war.', alt: ['If you want peace, prepare war.', 'If you wish for peace, prepare for war.'], src: 'after Vegetius, Epitoma Rei Militaris 3, preface' }
          ],
          drills: [
            { la: '{Cavē} canem, Mārce!', opts: ['Cavēte', 'Cavet'], en: 'Beware of the dog, Marcus!', why: 'one person → <i>cavē</i>' },
            { la: '{Cavēte} canem, puerī!', opts: ['Cavē', 'Cavent'], en: 'Beware of the dog, boys!', why: 'several people → <i>cavē<b>te</b></i>' },
            { la: 'Sī vīs pācem, {parā} bellum.', opts: ['parat', 'parō'], en: 'If you want peace, prepare for war.', why: 'a command to one person: <i>parā!</i>' },
            { la: 'Sapere {audē}.', opts: ['audet', 'audeō'], en: 'Dare to be wise.', why: 'command: <i>audē!</i>' }
          ],
          tip: `<h3>📜 Mottos are commands</h3><p>Many famous Latin sayings are imperatives — short, sharp orders: <i>carpe diem, festīnā lentē, sapere audē, cavē canem</i>.</p>
<p>From here on, the quotes get more real: these are the authors' <b>own words</b>, not simplified.</p>`
        }
      ]
    },
    {
      id: 'u_past', title: 'Herī', sub: 'The past', icon: '🕰️', color: '#7a6a3a', part: 5, gram: 'Perfect tense',
      lessons: [
        {
          id: 'l_past_1', title: 'I came, I saw', icon: '🏁', gram: 'Perfect: -vī, -vistī, -vit, -vērunt',
          words: ['heri', 'iam', 'semper', 'numquam'],
          sentences: [
            { la: 'Herī ambulāvī.', en: 'Yesterday I walked.', alt: ['I walked yesterday.'] },
            { la: 'Puella cantāvit.', en: 'The girl sang.', alt: ['The girl has sung.'] },
            { la: 'Rōmānī pugnāvērunt.', en: 'The Romans fought.', alt: ['The Romans have fought.'] },
            { la: 'Iam labōrāvimus.', en: 'We have already worked.', alt: ['We already worked.'] },
            { la: 'Numquam nāvigāvī.', en: 'I have never sailed.', alt: ['I never sailed.'] },
            { la: 'Vēnī, vīdī, vīcī.', en: 'I came, I saw, I conquered.', src: 'Caesar, quoted by Suetonius, Dīvus Iūlius 37', note: 'Three perfects of three irregular verbs: <i>veniō → vēnī</i>, <i>videō → vīdī</i>, <i>vincō → vīcī</i>.' }
          ],
          drills: [
            { la: 'Herī {ambulāvī}.', opts: ['ambulō', 'ambulat'], en: 'Yesterday I walked.', why: 'past, "I" → <i>ambulāv-<b>ī</b></i>' },
            { la: 'Hodiē {ambulō}.', opts: ['ambulāvī', 'ambulāvit'], en: 'Today I walk.', why: 'today → present' },
            { la: 'Herī Mārcus {labōrāvit}.', opts: ['labōrat', 'labōrāvī'], en: 'Yesterday Marcus worked.', why: 'past, "he" → <i>-v<b>it</b></i>' },
            { la: 'Herī {cantāvistī}.', opts: ['cantās', 'cantāvit'], en: 'Yesterday you sang.', why: 'past, "you" → <i>-v<b>istī</b></i>' },
            { la: 'Rōmānī {pugnāvērunt}.', opts: ['pugnāvit', 'pugnant'], en: 'The Romans fought.', why: 'past, "they" → <i>-v<b>ērunt</b></i>' },
            { la: 'Nōs iam {labōrāvimus}.', opts: ['labōrāmus', 'labōrāvit'], en: 'We have already worked.', why: 'past, "we" → <i>-v<b>imus</b></i>' }
          ],
          tip: `<h3>The perfect: "I did / I have done"</h3>
<table class="tbl"><tr><td>amāv<b>ī</b></td><td>I loved</td><td>amāv<b>imus</b></td><td>we loved</td></tr>
<tr><td>amāv<b>istī</b></td><td>you loved</td><td>amāv<b>istis</b></td><td>you (all) loved</td></tr>
<tr><td>amāv<b>it</b></td><td>he/she loved</td><td>amāv<b>ērunt</b></td><td>they loved</td></tr></table>
<p>a-verbs add <b>-v-</b>. Other verbs often change the stem — learn them like words: <i>veniō → <b>vēnī</b></i>, <i>videō → <b>vīdī</b></i>, <i>vincō → <b>vīcī</b></i>. That's Caesar's famous boast!</p>
<p>🎯 <i>pug-nā-<b>VĒ</b>-runt</i>, <i>la-bō-<b>RĀ</b>-vi-mus</i>.</p>`
        },
        {
          id: 'l_past_2', title: 'Story: Romulus and Remus', icon: '🐺', gram: "Reading: Rome's founding myth",
          words: ['lupa', 'gemini', 'aedifico', 'servo', 'olim'],
          sentences: [
            { la: 'Lupa geminōs servāvit.', en: 'The she-wolf saved the twins.', alt: ['A she-wolf saved the twins.'] },
            { la: 'Rōmulus urbem aedificāvit.', en: 'Romulus built a city.', alt: ['Romulus built the city.'] },
            { la: 'Ōlim rēx malus erat.', en: 'Once upon a time there was an evil king.', alt: ['Once there was an evil king.', 'Once there was a bad king.', 'Long ago there was an evil king.', 'Once upon a time there was a bad king.'] }
          ],
          story: {
            title: 'Rōmulus et Remus',
            lines: [
              { la: 'Ōlim Rōmulus et Remus parvī geminī erant.', en: 'Once upon a time Romulus and Remus were little twins.' },
              { la: 'Rēx malus geminōs timuit.', en: 'An evil king feared the twins.' },
              { la: 'Servus geminōs ad flūmen portāvit.', en: 'A slave carried the twins to the river.' },
              { la: 'Ibi lupa geminōs invēnit et servāvit.', en: 'There a she-wolf found the twins and saved them.' },
              { la: 'Posteā pāstor geminōs cūrāvit.', en: 'Later a shepherd looked after the twins.' },
              { la: 'Tandem Rōmulus urbem novam aedificāvit: Rōmam!', en: 'At last Romulus built a new city: Rome!' }
            ],
            qs: [
              { q: 'Who feared the twins?', a: 'an evil king', opts: ['the she-wolf', 'the shepherd'], line: 1 },
              { q: 'Who found the twins at the river?', a: 'a she-wolf', opts: ['a sailor', 'a bear'], line: 3 },
              { q: 'What did Romulus build?', a: 'a new city — Rome', opts: ['a temple', 'a ship'], line: 5 }
            ]
          },
          tip: `<h3>📖 How Rome began</h3><p>The historian Livy tells this story at the start of his history of Rome (<i>Ab Urbe Conditā</i> 1.4–7). Traditional date of the founding: <b>753 BC</b>.</p><p>Spot the perfects: <i>timu<b>it</b>, portāv<b>it</b>, invēn<b>it</b>, servāv<b>it</b></i>. (<i>erant</i> = "they were".)</p>`
        }
      ]
    },
    {
      id: 'u_classics1', title: 'Sententiae I', sub: 'Famous mottos', icon: '📜', color: '#a6781e',
      lessons: [
        {
          id: 'l_cl_1', title: 'Seize the day', icon: '⏳',
          words: ['dies', 'tempus', 'lente', 'spero'],
          sentences: [
            { la: 'Carpe diem.', en: 'Seize the day.', alt: ['Pluck the day.'], src: 'Horace, Odes 1.11.8' },
            { la: 'Festīnā lentē.', en: 'Make haste slowly.', alt: ['Hurry slowly.'], src: 'Augustus\'s Greek motto σπεῦδε βραδέως, Suetonius, Augustus 25.4 (Latin rendering)' },
            { la: 'Tempus fugit.', en: 'Time flies.', alt: ['Time flees.'], src: 'after Vergil, Georgics 3.284' },
            { la: 'Dum spīrō, spērō.', en: 'While I breathe, I hope.', src: 'Post-classical motto; cf. Cicero, Ad Atticum 9.10.3' }
          ],
          tip: `<h3>Short and sharp</h3><p><i><b>CAR</b>-pe <b>DI</b>-em</i> — two syllables each, so stress the first. <i>fes-<b>TĪ</b>-nā <b>LEN</b>-tē</i> — long ī in the penult.</p>`
        },
        {
          id: 'l_cl_2', title: 'Caesar', icon: '🦅',
          words: ['caesar', 'fortuna', 'amor'],
          sentences: [
            { la: 'Vēnī, vīdī, vīcī.', en: 'I came, I saw, I conquered.', src: 'Caesar, quoted by Suetonius, Dīvus Iūlius 37' },
            { la: 'Iacta ālea est.', altLa: ['Ālea iacta est.'], en: 'The die is cast.', alt: ['The die has been cast.'], src: 'Caesar at the Rubicon, Suetonius, Dīvus Iūlius 32 (popularly "Ālea iacta est")', note: 'Plutarch says Caesar actually said it in Greek, quoting the poet Menander.' },
            { la: 'Fortēs fortūna ad|iu|vat.', en: 'Fortune helps the brave.', alt: ['Fortune favours the brave.', 'Fortune favors the brave.'], src: 'Terence, Phormio 203' },
            { la: 'Omnia vincit Amor.', en: 'Love conquers all.', alt: ['Love conquers all things.'], src: 'Vergil, Eclogues 10.69' }
          ],
          tip: `<h3>WAY-nee, WEE-dee, WEE-kee</h3><p>With classical V = W and C = K, Caesar's boast sounds nothing like "veni vidi vichi". Suetonius wrote <i><b>IAK</b>-ta <b>Ā</b>-le-a est</i>: in <i>ālea</i> the penult "le" is light, so the stress goes to the antepenult — here that happens to be the long ā (its length is not the reason).</p>`
        }
      ]
    },
    {
      id: 'u_classics2', title: 'Sententiae II', sub: 'The great authors', icon: '🏺', color: '#6b4fa0',
      lessons: [
        {
          id: 'l_cl_3', title: 'Cicero & Juvenal', icon: '⚖️',
          words: ['cicero', 'humanus', 'astrum', 'gutta', 'lapis'],
          sentences: [
            { la: 'Ō tempora, ō mōrēs!', en: 'Oh the times, oh the customs!', alt: ['O the times, o the customs!', 'Oh the times, oh the morals!'], src: 'Cicero, In Catilīnam 1.2' },
            { la: 'Quis custōdiet ipsōs custōdēs?', en: 'Who will guard the guards themselves?', alt: ['Who will watch the watchmen?', 'Who will guard the guardians themselves?', 'Who will watch the watchmen themselves?'], src: 'Juvenal, Satires 6.347' },
            { la: 'Mēns sāna in corpore sānō.', en: 'A healthy mind in a healthy body.', alt: ['A sound mind in a sound body.'], src: 'Juvenal, Satires 10.356' },
            { la: 'Gutta cavat lapidem.', en: 'A drop hollows the stone.', alt: ['Dripping water hollows stone.', 'The drop hollows the stone.'], src: 'Ovid, Epistulae ex Pontō 4.10.5' }
          ],
          tip: `<h3>Rhythm matters</h3><p><i><b>TEM</b>-po-ra</i>, <i>cus-<b>TŌ</b>-di-et</i>, <i>cus-<b>TŌ</b>-dēs</i>. Roman orators were trained to hear long and short syllables — Cicero said a whole theatre would hiss at an actor who got one wrong!</p>`
        },
        {
          id: 'l_cl_4', title: 'Vergil & Horace', icon: '🎭',
          words: ['arma', 'patria', 'dulcis', 'gutta', 'lapis'],
          sentences: [
            { la: 'Arma virum+que canō.', en: 'I sing of arms and the man.', alt: ['I sing of weapons and the man.'], src: 'Vergil, Aeneid 1.1' },
            { la: 'Dulce et decōrum est prō patriā morī.', en: 'It is sweet and fitting to die for the homeland.', alt: ['It is sweet and fitting to die for the fatherland.', "It is sweet and fitting to die for one's country."], src: 'Horace, Odes 3.2.13' },
            { la: 'Ōdī et amō.', en: 'I hate and I love.', alt: ['I hate and love.'], src: 'Catullus, Carmen 85' },
            { la: 'Omnia vincit Amor.', en: 'Love conquers all.', src: 'Vergil, Eclogues 10.69' }
          ],
          tip: `<h3>The first line of the Aeneid</h3><p><i><b>AR</b>-ma wi-<b>RUM</b>-kwe <b>KA</b>-noh</i> — note how <i>-que</i> pulls the stress onto "rum". Vergil's whole epic (9,896 lines) is built on long and short syllables.</p>`
        }
      ]
    },
    {
      id: 'u_classics3', title: 'Sententiae III', sub: 'Wisdom of the Romans', icon: '🦉', color: '#4f6b3a', part: 6, gram: 'Real lines, all grammar',
      lessons: [
        {
          id: 'l_cl_5', title: 'School of life', icon: '🎓', gram: 'Original lines: Seneca, Vergil, Pliny',
          words: ['vita', 'otium', 'mors', 'labor'],
          sentences: [
            { la: 'Ōtium sine litterīs mors est.', en: 'Leisure without books is death.', alt: ['Leisure without literature is death.', 'Leisure without letters is death.'], src: 'Seneca, Epistulae 82.3' },
            { la: 'Labor omnia vīcit improbus.', en: 'Relentless work conquered everything.', alt: ['Relentless toil conquered all things.', 'Relentless work conquered all.', 'Hard work conquered all.'], src: 'Vergil, Georgics 1.145–146', note: '<i>vīcit</i> is a perfect (like <i>vēnī, vīdī, vīcī</i>); the adjective <i>improbus</i> is separated from <i>labor</i> — poets love that.' },
            { la: 'Mēns agitat mōlem.', en: 'Mind moves matter.', alt: ['The mind moves the mass.', 'Mind moves the mass.'], src: 'Vergil, Aeneid 6.727' },
            { la: 'Nūlla diēs sine līneā.', en: 'No day without a line.', alt: ['Not a day without a line.'], src: 'after Pliny the Elder, Natural History 35.84 (about the painter Apelles)' },
            { la: 'Docendō discimus.', en: 'By teaching we learn.', alt: ['We learn by teaching.'], src: 'after Seneca, Epistulae 7.8 “hominēs, dum docent, discunt”' }
          ],
          drills: [
            { la: 'Ōtium sine litterīs {mors} est.', opts: ['mortem', 'mortis'], en: 'Leisure without books is death.', why: 'after <i>est</i> the noun stays nominative' },
            { la: 'Labor omnia {vīcit} improbus.', opts: ['vincit', 'vīcērunt'], en: 'Relentless work conquered everything.', why: 'past, one subject → perfect <i>vīc<b>it</b></i>' },
            { la: 'Nōn scholae sed {vītae} discimus.', opts: ['vīta', 'vītam'], en: 'We learn not for school but for life.', why: '"for life" → dative <b>-ae</b>' }
          ],
          tip: `<h3>📜 Original Latin</h3><p>No more simplifications: these are the lines as their authors wrote them. Use everything you know — cases, verb endings, the perfect — and tap words you've not met.</p>
<p>🎯 <i>do-<b>CEN</b>-dō</i>, <i><b>Ō</b>-ti-um</i>, <i><b>LĪ</b>-ne-ā</i>.</p>`
        },
        {
          id: 'l_cl_6', title: 'Friends & foes', icon: '⚔️', gram: 'Original lines: Ennius, Terence, Livy, Vergil',
          words: ['sententia', 'fabula', 'certus'],
          sentences: [
            { la: 'Amīcus certus in rē incertā cernitur.', en: 'A sure friend is seen in an unsure situation.', alt: ['A true friend is known in a time of trouble.', 'A reliable friend is seen in an uncertain situation.', 'A sure friend is seen in an uncertain situation.'], src: 'Ennius, quoted by Cicero, Dē Amīcitiā 64', note: 'A play on words: <i>certus</i> (sure) — <i>in-certā</i> (unsure).' },
            { la: 'Lupus in fābulā!', en: 'The wolf in the story!', alt: ['Speak of the wolf!', 'The wolf in the fable!'], src: 'Terence, Adelphoe 537', note: 'Said when the person you are talking about suddenly appears — "speak of the devil".' },
            { la: 'Vae victīs!', en: 'Woe to the conquered!', alt: ['Woe to the vanquished!'], src: 'Livy, Ab Urbe Conditā 5.48.9 — the Gallic chief Brennus, 390 BC' },
            { la: 'Audentēs fortūna iuvat.', en: 'Fortune helps the bold.', alt: ['Fortune favours the bold.', 'Fortune favors the bold.', 'Fortune helps those who dare.'], src: 'Vergil, Aeneid 10.284' }
          ],
          drills: [
            { la: 'Lupus in {fābulā}!', opts: ['fābulam', 'fābula'], en: 'The wolf in the story!', why: '<i>in</i> + ablative (where?)' },
            { la: 'Amīcus {certus} in rē incertā cernitur.', opts: ['certa', 'certum'], en: 'A sure friend is seen in an unsure situation.', why: '<i>amīcus</i> is masculine → <b>-us</b>' },
            { la: 'Quot hominēs, tot {sententiae}.', opts: ['sententia', 'sententiam'], en: 'So many people, so many opinions.', why: 'many opinions → plural <b>-ae</b>' }
          ],
          tip: `<h3>📜 Old poets, old proverbs</h3><p>Ennius (239–169 BC) was the "father of Roman poetry"; Terence wrote comedies; Livy wrote Rome's history in 142 books. Compare <i>Audentēs fortūna iuvat</i> with Terence's <i>Fortēs fortūna adiuvat</i> from Sententiae I — Vergil was quoting an old proverb.</p>`
        }
      ]
    }
  ];

  /*
   * PARTS — the learning concept ("Via Latina"). Every unit has `part` and `gram`.
   * Each unit: new words → grammar drills → a 📖 story / 📜 quote → 🏆 unit review.
   * Quotes start simplified ("after …") and become original lines by Part VI.
   */
  const PARTS = [
    { n: 1, la: 'Vōcēs', en: 'Sounds', goal: 'Read any Latin word aloud — with the stress in the right place.' },
    { n: 2, la: 'Prīma verba', en: 'First words', goal: 'Say who and what things are — and read your first story.' },
    { n: 3, la: 'Agere', en: 'Actions', goal: 'Who does what to whom: every verb ending and the object case.' },
    { n: 4, la: 'Mundus', en: 'The world', goal: 'Where things are, what they are like, and how many.' },
    { n: 5, la: 'Vīta Rōmāna', en: 'Roman life', goal: 'All verb families, "of", questions, commands — and the past.' },
    { n: 6, la: 'Sententiae', en: 'The classics', goal: 'Read real lines by Caesar, Cicero, Vergil, Horace and Seneca.' }
  ];
  const UNIT_META = {
    u_sounds: [1, 'Letters, long vowels, the stress rule'], u_basics: [2, 'sum · es · est — no articles'],
    u_family: [2, 'Nouns & stress practice'], u_animals: [2, 'X est Y · nōn · sed · first story'],
    u_verbs: [3, 'Verb endings for every person'], u_food: [3, 'The object: accusative -m'],
    u_nature: [4, 'in · ad · ex · cum + case'], u_adj: [4, 'Adjective agreement'],
    u_numbers: [4, 'Plurals · sumus · sunt'], u_body: [4, 'Review: plurals & objects'], u_city: [4, 'Enclitic -que · story'],
    u_classics1: [6, 'Famous mottos'], u_classics2: [6, 'The great authors']
  };
  UNITS.forEach(u => { const m = UNIT_META[u.id]; if (m) { if (!u.part) u.part = m[0]; if (!u.gram) u.gram = m[1]; } });
  // Classics I–II come after Part V in the path (they now build on its grammar).
  (function moveClassics() {
    const cl = UNITS.filter(u => u.id === 'u_classics1' || u.id === 'u_classics2');
    cl.forEach(u => UNITS.splice(UNITS.indexOf(u), 1));
    UNITS.splice(UNITS.findIndex(u => u.id === 'u_classics3'), 0, ...cl);
  })();

  /*
   * 🏆 Unit review ("summary lesson"): one per unit, mixing ALL topics of the unit
   * (words, stress, drills, sentences, story questions). Ids are FROZEN — when you
   * add a unit, add its review id here and to tests/frozen-ids.json.
   */
  const REVIEW_IDS = {
    u_sounds: 'l_sounds_rev', u_basics: 'l_basics_rev', u_family: 'l_family_rev', u_animals: 'l_animals_rev',
    u_verbs: 'l_verbs_rev', u_food: 'l_food_rev', u_nature: 'l_nature_rev', u_adj: 'l_adj_rev', u_numbers: 'l_num_rev',
    u_body: 'l_body_rev', u_city: 'l_city_rev', u_vita: 'l_vita_rev', u_domus: 'l_domus_rev', u_quaest: 'l_quaest_rev',
    u_imper: 'l_imper_rev', u_past: 'l_past_rev', u_classics1: 'l_cl1_rev', u_classics2: 'l_cl2_rev', u_classics3: 'l_cl3_rev'
  };
  UNITS.forEach(u => {
    const id = REVIEW_IDS[u.id]; if (!id) return;
    const src = u.lessons.filter(l => !l.hidden && !l.review);
    u.lessons.push({
      id, review: true, title: 'Unit review', icon: '🏆', gram: 'Everything from ' + u.title,
      focus: src.some(l => l.focus === 'stress') ? 'stress' : undefined,
      words: [...new Set(src.flatMap(l => l.words))],
      pairs: src.flatMap(l => l.pairs || []),
      from: src.map(l => l.id)
    });
  });

  const LESSON_INDEX = {};
  UNITS.forEach((u, ui) => u.lessons.forEach((l, li) => { LESSON_INDEX[l.id] = { unit: u, lesson: l, ui, li }; }));

  const Course = { WORDS, UNITS, GLOSS, LESSON_INDEX, PARTS };
  root.Course = Course;
  if (typeof module !== 'undefined' && module.exports) module.exports = Course;
})(typeof globalThis !== 'undefined' ? globalThis : this);
