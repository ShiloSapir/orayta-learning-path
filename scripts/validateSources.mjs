import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false }
});

(async () => {
  const { data, error } = await supabase
    .from('sources')
    .select('*');

  if (error) {
    console.error('Error fetching sources:', error.message);
    process.exit(1);
  }

  const issues = [];
  const slugPattern = /^[a-z_]+$/;

  for (const source of data) {
    const missing = [];
    if (!source.title) missing.push('title');
    if (!source.title_he) missing.push('title_he');
    if (!source.category) missing.push('category');
    if (!source.start_ref) missing.push('start_ref');
    if (!source.end_ref) missing.push('end_ref');
    if (!source.sefaria_link) missing.push('sefaria_link');
    if (!source.reflection_prompt) missing.push('reflection_prompt');
    if (!source.reflection_prompt_he) missing.push('reflection_prompt_he');

    if (missing.length) {
      issues.push({ id: source.id, missing });
    }

    if (source.category && !slugPattern.test(source.category)) {
      issues.push({ id: source.id, invalidCategory: source.category });
    }

    if (source.subcategory && !slugPattern.test(source.subcategory)) {
      issues.push({ id: source.id, invalidSubcategory: source.subcategory });
    }
  }

  if (issues.length) {
    console.table(issues);
    console.error(`Found ${issues.length} sources with issues`);
    process.exitCode = 1;
  } else {
    console.log('All sources look good!');
  }
})();
