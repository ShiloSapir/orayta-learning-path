-- Ensure subcategories use lowercase with underscores and fix known cases
UPDATE public.sources
SET subcategory = lower(replace(subcategory, ' ', '_'))
WHERE subcategory IS NOT NULL AND (subcategory ~ '[A-Z]' OR subcategory LIKE '% %');

UPDATE public.sources SET subcategory = 'daily_practice'
  WHERE subcategory IN ('Daily Practice', 'dailyPractice', 'daily_practice');
UPDATE public.sources SET subcategory = 'hilchot_deot'
  WHERE subcategory IN ('Hilchot Deot', 'hilchotDeot', 'Hilchot_Deot');
UPDATE public.sources SET subcategory = 'hilchot_teshuva'
  WHERE subcategory IN ('Hilchot Teshuva', 'hilchotTeshuva', 'Hilchot_Teshuva');
UPDATE public.sources SET subcategory = 'pirkei_avot'
  WHERE subcategory IN ('Pirkei Avot', 'pirkeiAvot', 'Pirkei_Avot');
UPDATE public.sources SET subcategory = 'weekly_portion'
  WHERE subcategory IN ('Weekly Portion', 'weeklyPortion', 'Weekly_Portion');
UPDATE public.sources SET subcategory = 'mixed'
  WHERE subcategory IN ('Mixed Topics', 'mixedTopics', 'Mixed_Topics');
UPDATE public.sources SET subcategory = 'mussar'
  WHERE subcategory IN ('Mussar');
UPDATE public.sources SET subcategory = 'shabbat'
  WHERE subcategory IN ('Shabbat');
