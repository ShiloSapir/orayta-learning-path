-- Normalize topic and subcategory names to consistent slug format
-- This migration ensures all topics use lowercase with underscores
-- and maps legacy values to the new format

-- Convert spaces and camel case in category
UPDATE public.sources
SET category = lower(replace(category, ' ', '_'))
WHERE category ~ '[A-Z]' OR category LIKE '% %';

-- Convert spaces and camel case in subcategory
UPDATE public.sources
SET subcategory = lower(replace(subcategory, ' ', '_'))
WHERE subcategory IS NOT NULL AND (subcategory ~ '[A-Z]' OR subcategory LIKE '% %');

-- Specific legacy mappings
UPDATE public.sources SET category = 'tanakh' WHERE category IN ('tanach');
UPDATE public.sources SET subcategory = 'weekly_portion' WHERE subcategory IN ('parasha', 'parsha', 'parashat_hashavua');
