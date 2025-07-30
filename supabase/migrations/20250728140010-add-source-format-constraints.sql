-- Enforce lowercase slug format for categories and subcategories
ALTER TABLE public.sources
  ADD CONSTRAINT category_slug CHECK (category ~ '^[a-z_]+$');

ALTER TABLE public.sources
  ADD CONSTRAINT subcategory_slug CHECK (subcategory IS NULL OR subcategory ~ '^[a-z_]+$');

-- Ensure key fields are present
ALTER TABLE public.sources
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN title_he SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN start_ref SET NOT NULL,
  ALTER COLUMN end_ref SET NOT NULL,
  ALTER COLUMN reflection_prompt SET NOT NULL,
  ALTER COLUMN reflection_prompt_he SET NOT NULL;
