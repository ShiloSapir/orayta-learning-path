// Commentary selection utility for edge functions
// This mirrors the logic from src/utils/commentarySelector.ts

interface CommentaryConfig {
  topicSelected: string;
  sourceTitle: string;
  sourceRange: string;
  excerpt: string;
}

// Commentary mappings for each source type
const COMMENTARY_MAPPINGS = {
  tanach: ['Rashi', 'Ibn Ezra', 'Ramban', 'Radak', 'Sforno'],
  talmud: ['Rashi', 'Tosafot', 'Maharsha', 'Ritva'],
  rambam: ['Kesef Mishneh', 'Maggid Mishneh', 'Lechem Mishneh'],
  shulchan_aruch: ['Mishnah Berurah', 'Shach', 'Taz', 'Aruch HaShulchan']
} as const;

// Keywords to identify source types from titles and content
const SOURCE_TYPE_IDENTIFIERS = {
  tanach: [
    // Books of Torah
    'bereishit', 'genesis', 'שמות', 'exodus', 'vayikra', 'leviticus', 
    'bamidbar', 'numbers', 'devarim', 'deuteronomy',
    // Nevi'im
    'yehoshua', 'joshua', 'shoftim', 'judges', 'shmuel', 'samuel', 
    'melachim', 'kings', 'yeshayahu', 'isaiah', 'yirmiyahu', 'jeremiah',
    'yechezkel', 'ezekiel', 'hoshea', 'hosea', 'yoel', 'joel', 'amos',
    'ovadiah', 'obadiah', 'yonah', 'jonah', 'michah', 'micah', 'nachum', 'nahum',
    'chavakuk', 'habakkuk', 'tzefaniah', 'zephaniah', 'chaggai', 'haggai',
    'zechariah', 'malachi',
    // Ketuvim
    'tehillim', 'psalms', 'mishlei', 'proverbs', 'iyov', 'job', 'shir hashirim',
    'song of songs', 'rut', 'ruth', 'eicha', 'lamentations', 'kohelet', 'ecclesiastes',
    'esther', 'daniel', 'ezra', 'nechemiah', 'nehemiah', 'divrei hayamim', 'chronicles',
    // General terms
    'tanach', 'tanakh', 'bible', 'biblical', 'torah', 'chumash', 'parsha', 'parashah'
  ],
  talmud: [
    'talmud', 'bavli', 'yerushalmi', 'gemara', 'tractate', 'masechet', 'massekhet',
    'berachot', 'shabbat', 'eruvin', 'pesachim', 'rosh hashanah', 'yoma', 'sukkah',
    'beitzah', 'taanit', 'megillah', 'moed katan', 'chagigah', 'yevamot', 'ketubot',
    'nedarim', 'nazir', 'sotah', 'gittin', 'kiddushin', 'baba kamma', 'baba metzia',
    'baba batra', 'sanhedrin', 'makkot', 'shevuot', 'avodah zarah', 'horayot',
    'zevachim', 'menachot', 'hullin', 'bechorot', 'arachin', 'temurah', 'keritot',
    'meilah', 'kinnim', 'tamid', 'midot', 'niddah', 'pirkei avot', 'avot'
  ],
  rambam: [
    'rambam', 'maimonides', 'mishneh torah', 'hilchot', 'halachot', 'moreh nevuchim',
    'guide for the perplexed', 'yad hachazakah', 'sefer hamitzvot', 'commentary on mishnah'
  ],
  shulchan_aruch: [
    'shulchan aruch', 'orach chaim', 'yoreh deah', 'even haezer', 'choshen mishpat',
    'rama', 'rema', 'karo', 'beit yosef', 'tur'
  ]
};

/**
 * Determines the source type based on title, range, and content
 */
function identifySourceType(config: CommentaryConfig): keyof typeof COMMENTARY_MAPPINGS | null {
  const searchText = `${config.sourceTitle} ${config.sourceRange} ${config.excerpt}`.toLowerCase();
  
  // Check each source type for matching identifiers
  for (const [sourceType, identifiers] of Object.entries(SOURCE_TYPE_IDENTIFIERS)) {
    if (identifiers.some(identifier => searchText.includes(identifier.toLowerCase()))) {
      return sourceType as keyof typeof COMMENTARY_MAPPINGS;
    }
  }
  
  return null;
}

/**
 * Selects 2 appropriate commentaries based on the criteria
 */
export function selectCommentaries(config: CommentaryConfig): string[] {
  // Rule 1: Only provide commentaries if topic ≠ Spiritual Growth
  if (config.topicSelected.toLowerCase().includes('spiritual') || 
      config.topicSelected.toLowerCase().includes('growth')) {
    return [];
  }
  
  // Rule 2: Identify source type
  const sourceType = identifySourceType(config);
  
  // Rule 3: Only provide commentaries for supported source types
  if (!sourceType || !COMMENTARY_MAPPINGS[sourceType]) {
    return [];
  }
  
  // Rule 4: Select 2 commentaries from the appropriate type
  const availableCommentaries = COMMENTARY_MAPPINGS[sourceType];
  
  // Return first 2 commentaries for consistency
  return availableCommentaries.slice(0, 2);
}