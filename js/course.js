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
    voco: { la: 'vocō', en: 'I call', img: '📣', info: 'vocō, vocāre' },
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
    lapis: { la: 'lapis', en: 'stone', img: '🪨', info: 'lapis, lapidis (m.)' }
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
    'rēx': 'king', 'nauta': 'sailor'
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
    }
  ];

  const LESSON_INDEX = {};
  UNITS.forEach((u, ui) => u.lessons.forEach((l, li) => { LESSON_INDEX[l.id] = { unit: u, lesson: l, ui, li }; }));

  const Course = { WORDS, UNITS, GLOSS, LESSON_INDEX };
  root.Course = Course;
  if (typeof module !== 'undefined' && module.exports) module.exports = Course;
})(typeof globalThis !== 'undefined' ? globalThis : this);
