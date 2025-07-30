import { normalizeTopic } from './normalizeTopic';

// Mapping of main topics to their related topics or subcategories
export const topicRelations: Record<string, string[]> = {
  halacha: ['kashrut', 'shabbat', 'daily_practice'],
  rambam: ['hilchot_deot', 'hilchot_teshuva'],
  tanakh: ['weekly_portion', 'prophets', 'writings'],
  talmud: ['pirkei_avot', 'berakhot'],
  spiritual: ['mussar', 'chassidut', 'jewish_philosophy'],
  surprise: ['halacha', 'rambam', 'tanakh', 'talmud', 'spiritual']
};

// Subcategory to related topics mapping
export const subcategoryRelations: Record<string, string[]> = {
  mussar: ['spiritual', 'chassidut', 'jewish_philosophy'],
  chassidut: ['spiritual', 'mussar', 'jewish_philosophy'],
  jewish_philosophy: ['spiritual', 'mussar', 'chassidut'],
  shabbat: ['halacha', 'kashrut', 'daily_practice'],
  kashrut: ['halacha', 'shabbat', 'daily_practice'],
  daily_practice: ['halacha', 'shabbat', 'kashrut'],
  hilchot_deot: ['rambam', 'hilchot_teshuva'],
  hilchot_teshuva: ['rambam', 'hilchot_deot'],
  weekly_portion: ['tanakh', 'prophets', 'writings'],
  prophets: ['tanakh', 'weekly_portion', 'writings'],
  writings: ['tanakh', 'weekly_portion', 'prophets'],
  pirkei_avot: ['talmud', 'berakhot'],
  berakhot: ['talmud', 'pirkei_avot']
};

export const getRelatedTopics = (topic: string): string[] => {
  const normalized = normalizeTopic(topic);
  const relations =
    topicRelations[normalized] || subcategoryRelations[normalized] || [];

  if (topicRelations[normalized]) {
    return relations;
  }

  for (const [category, subs] of Object.entries(topicRelations)) {
    if (subs.includes(normalized)) {
      return [category, ...relations];
    }
  }

  return relations;
};
