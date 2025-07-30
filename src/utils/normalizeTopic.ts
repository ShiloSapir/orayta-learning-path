export const topicAliases: Record<string, string> = {
  'daily practice': 'daily_practice',
  'daily-practice': 'daily_practice',
  'hilchot deot': 'hilchot_deot',
  'hilchot-deot': 'hilchot_deot',
  'hilchot teshuva': 'hilchot_teshuva',
  'hilchot-teshuva': 'hilchot_teshuva',
  'weekly portion': 'weekly_portion',
  'weekly-portion': 'weekly_portion',
  // Treat various parasha spellings as the Tanakh category
  // since weekly portions are stored under Tanakh in the database
  'parasha': 'tanakh',
  'parsha': 'tanakh',
  'parashat_hashavua': 'tanakh',
  'pirkei avot': 'pirkei_avot',
  'pirkei_avos': 'pirkei_avot',
  'pirkei avos': 'pirkei_avot',
  'short sugyot': 'short_sugyot',
  'jewish thought': 'jewish_philosophy',
  'hashkafa': 'jewish_philosophy',
  'machshava': 'jewish_philosophy',
  'tanach': 'tanakh',
  'chasidut': 'chassidut',
  'chassidus': 'chassidut',
  'mixed topics': 'mixed',
  'mixed-topics': 'mixed',
  'musar': 'mussar',
  'chasidus': 'chassidut',
  'shabbos': 'shabbat',
  'halachah': 'halacha',
  'halakha': 'halacha',
  'gemara': 'talmud',
  'mishna': 'mishnah',
  'hilchot_deos': 'hilchot_deot',
  'hilchos_deos': 'hilchot_deot'
};

export const normalizeTopic = (topic: string): string => {
  const slug = topic
    .toLowerCase()
    .replace(/[’'"`]/g, '')
    .replace(/[&]/g, 'and')
    .replace(/[.,:!?]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
  return topicAliases[slug] || slug;
};
