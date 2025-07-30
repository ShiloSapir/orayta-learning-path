-- Merge parasha category into tanakh and ensure subcategory is weekly_portion
UPDATE public.sources
SET category = 'tanakh',
    subcategory = COALESCE(subcategory, 'weekly_portion')
WHERE category = 'parasha';
