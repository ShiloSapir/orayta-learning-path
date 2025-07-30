import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://lpmtmxzlgbenmsnodalw.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface GenerationRequest {
  topic: string;
  timeMinutes: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'en' | 'he' | 'both';
  count?: number;
}

interface GeneratedSource {
  title: string;
  title_he: string;
  category: string;
  subcategory?: string;
  source_type: string;
  start_ref: string;
  end_ref: string;
  sefaria_link: string;
  text_excerpt: string;
  text_excerpt_he: string;
  reflection_prompt: string;
  reflection_prompt_he: string;
  estimated_time: number;
  min_time: number;
  max_time: number;
  difficulty_level: string;
  learning_objectives: string[];
  prerequisites: string[];
  commentaries: string[];
  language_preference: string;
}

async function validateSefariaLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function generateSourceWithAI(request: GenerationRequest): Promise<GeneratedSource> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const { topic, timeMinutes, difficulty = 'beginner', language = 'both' } = request;

  const prompt = `Generate a Torah study source with the following criteria:
- Topic: ${topic}
- Study time: ${timeMinutes} minutes
- Difficulty: ${difficulty}
- Language preference: ${language}

Please provide a complete Torah source with:
1. Appropriate Torah reference (book, chapter, verse format)
2. Valid Sefaria link (https://www.sefaria.org/...)
3. Text excerpt in both English and Hebrew
4. Reflection prompts in both languages
5. Learning objectives
6. Prerequisites (if any)
7. Relevant commentaries

Ensure the Torah reference is accurate and the Sefaria link follows proper formatting.
Focus on authentic Jewish learning content appropriate for the specified difficulty level.

Return ONLY a JSON object with this exact structure:
{
  "title": "English title",
  "title_he": "Hebrew title",
  "category": "${topic}",
  "subcategory": "specific subcategory",
  "source_type": "text_study",
  "start_ref": "Book Chapter:Verse",
  "end_ref": "Book Chapter:Verse",
  "sefaria_link": "https://www.sefaria.org/...",
  "text_excerpt": "English text excerpt",
  "text_excerpt_he": "Hebrew text excerpt",
  "reflection_prompt": "English reflection prompt",
  "reflection_prompt_he": "Hebrew reflection prompt",
  "estimated_time": ${timeMinutes},
  "min_time": ${Math.max(5, timeMinutes - 5)},
  "max_time": ${timeMinutes + 10},
  "difficulty_level": "${difficulty}",
  "learning_objectives": ["objective1", "objective2"],
  "prerequisites": ["prerequisite1"],
  "commentaries": ["commentary1", "commentary2"],
  "language_preference": "${language}"
}`;

  console.log('Sending request to OpenAI for source generation');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Torah study and Jewish learning. Generate authentic, accurate Torah sources with proper citations and Sefaria links. Always return valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;
  
  console.log('Generated content:', generatedContent);

  try {
    const source = JSON.parse(generatedContent);
    
    // Validate Sefaria link
    const isValidLink = await validateSefariaLink(source.sefaria_link);
    if (!isValidLink) {
      console.warn('Generated Sefaria link validation failed, attempting to fix');
      // Try to construct a better link based on the reference
      const ref = source.start_ref.replace(/\s+/g, '.').replace(':', '.');
      source.sefaria_link = `https://www.sefaria.org/${ref}`;
    }

    return source;
  } catch (parseError) {
    console.error('Failed to parse generated JSON:', parseError);
    throw new Error('Failed to parse AI-generated source content');
  }
}

async function saveGeneratedSource(source: GeneratedSource): Promise<string> {
  if (!supabaseServiceKey) {
    throw new Error('Supabase service key not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('sources')
    .insert({
      ...source,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving source:', error);
    throw new Error(`Failed to save source: ${error.message}`);
  }

  return data.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received generation request:', body);

    // Validate request
    if (!body.topic || !body.timeMinutes) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: topic and timeMinutes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const count = body.count || 1;
    const results = [];

    // Generate sources
    for (let i = 0; i < count; i++) {
      console.log(`Generating source ${i + 1} of ${count}`);
      
      const source = await generateSourceWithAI(body);
      
      // Save to database if requested
      if (body.saveToDatabase !== false) {
        const sourceId = await saveGeneratedSource(source);
        results.push({ ...source, id: sourceId });
        console.log(`Saved source ${i + 1} with ID: ${sourceId}`);
      } else {
        results.push(source);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sources: count === 1 ? results[0] : results,
        count: results.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-source-generator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});