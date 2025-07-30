-- Additional normalization for category and subcategory values
UPDATE public.sources SET category = lower(replace(category, ' ', '_'))
  WHERE category ~ '[A-Z]' OR category LIKE '% %';
UPDATE public.sources SET subcategory = lower(replace(subcategory, ' ', '_'))
  WHERE subcategory IS NOT NULL AND (subcategory ~ '[A-Z]' OR subcategory LIKE '% %');

-- Handle remaining known variations
UPDATE public.sources SET category = 'spiritual'
  WHERE category IN ('musar', 'mussar');
UPDATE public.sources SET subcategory = 'chassidut'
  WHERE subcategory IN ('chasidut', 'chasidus');
