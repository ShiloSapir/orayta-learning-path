export const topicAliases: Record<string, string> = {
  'daily practice': 'daily_practice',
  'daily-practice': 'daily_practice',
  'hilchot deot': 'hilchot_deot',
  'hilchot-deot': 'hilchot_deot',
  'hilchot teshuva': 'hilchot_teshuva',
  'hilchot-teshuva': 'hilchot_teshuva',
  'weekly portion': 'weekly_portion',
  'weekly-portion': 'weekly_portion',
  'parasha': 'weekly_portion',
  'parsha': 'weekly_portion',
  'parashat_hashavua': 'weekly_portion',
  'pirkei avot': 'pirkei_avot',
  'short sugyot': 'short_sugyot',
  'jewish thought': 'jewish_philosophy',
  'tanach': 'tanakh',
  'chasidut': 'chassidut'
};

export const normalizeTopic = (topic: string): string => {
  const slug = topic.toLowerCase().replace(/[\s-]+/g, '_').trim();
  return topicAliases[slug] || slug;
};
