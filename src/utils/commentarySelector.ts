/**
 * Commentary Selection Utility
 * 
 * Provides 2 recommended commentaries based on specific criteria:
 * - Only if Topic ≠ Spiritual Growth
 * - Only if Source type ∈ {Tanach, Talmud, Rambam, Shulchan Aruch}
 * - Chooses appropriate commentators for each source type
 * - Never mixes types
 */

export interface CommentaryConfig {
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
  
  // Prioritize more specific types first to avoid generic matches like "torah"
  const priorityOrder: (keyof typeof SOURCE_TYPE_IDENTIFIERS)[] = ['rambam', 'shulchan_aruch', 'talmud', 'tanach'];
  for (const sourceType of priorityOrder) {
    const identifiers = SOURCE_TYPE_IDENTIFIERS[sourceType];
    if (identifiers.some(identifier => searchText.includes(identifier.toLowerCase()))) {
      return sourceType as keyof typeof COMMENTARY_MAPPINGS;
    }
  }

  // Fallback generic scan
  for (const [sourceType, identifiers] of Object.entries(SOURCE_TYPE_IDENTIFIERS)) {
    if (identifiers.some(identifier => searchText.includes(identifier.toLowerCase()))) {
      return sourceType as keyof typeof COMMENTARY_MAPPINGS;
    }
  }
  
  return null;
}

/**
 * Selects 2 appropriate commentaries based on the topic selected
 */
export function selectCommentaries(config: CommentaryConfig): string[] {
  const normalizedTopic = (config.topicSelected || '').toLowerCase();
  
  // First, try to identify the source type from the content itself
  const sourceType = identifySourceType(config);
  
  // Get commentaries based on detected source type, with topic-based fallbacks
  let availableCommentaries: readonly string[] = [];

  if (sourceType && COMMENTARY_MAPPINGS[sourceType]) {
    availableCommentaries = COMMENTARY_MAPPINGS[sourceType];
  } else {
    // Fallback based on topic if source type can't be identified
    if (normalizedTopic.includes('talmud')) {
      availableCommentaries = COMMENTARY_MAPPINGS.talmud;
    } else if (normalizedTopic.includes('halacha')) {
      availableCommentaries = COMMENTARY_MAPPINGS.shulchan_aruch;
    } else if (normalizedTopic.includes('tanach') || normalizedTopic.includes('tanakh')) {
      availableCommentaries = COMMENTARY_MAPPINGS.tanach;
    }
  }
  
  // Return first 2 commentaries for consistency
  return availableCommentaries.slice(0, 2);
}

/**
 * Helper function to determine if commentaries should be provided
 */
export function shouldProvideCommentaries(config: CommentaryConfig): boolean {
  return selectCommentaries(config).length > 0;
}

/**
 * Get all available commentaries for a specific source type (for testing/debugging)
 */
export function getCommentariesForSourceType(sourceType: keyof typeof COMMENTARY_MAPPINGS): string[] {
  return [...COMMENTARY_MAPPINGS[sourceType]];
}

/**
 * Debug function to see what source type was identified
 */
export function debugSourceTypeIdentification(config: CommentaryConfig): {
  sourceType: keyof typeof COMMENTARY_MAPPINGS | null;
  shouldProvide: boolean;
  selectedCommentaries: string[];
} {
  const sourceType = identifySourceType(config);
  const selectedCommentaries = selectCommentaries(config);
  
  return {
    sourceType,
    shouldProvide: selectedCommentaries.length > 0,
    selectedCommentaries
  };
}