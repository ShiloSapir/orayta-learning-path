import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  topic: string;
  timeMinutes: number;
  language: string;
  userContext?: {
    name?: string;
    learningHistory?: string[];
    preferences?: Record<string, unknown>;
    difficulty?: string;
  };
}

interface GeneratedSource {
  title: string;
  author: string;
  text: string;
  translation: string;
  commentary: string;
  reflection_prompts: string[];
  estimated_time: number;
  difficulty: string;
  tags: string[];
  sefaria_ref?: string;
  learning_objectives: string[];
  topic: string;
  language: string;
}

// Commentary selection utility embedded in edge function
interface CommentaryConfig {
  topicSelected: string;
  sourceTitle: string;
  sourceRange: string;
  excerpt: string;
}

// Commentary mappings for each source type
const COMMENTARY_MAPPINGS = {
  tanach: ['Rashi', 'Ibn Ezra', 'Ramban', 'Radak', 'Sforno'],
  talmud: ['Rashi', 'Tosafot', 'Maharsha', 'Ritva'],
  rambam: ['Kesef Mishneh', 'Maggid Mishneh', 'Lechem Mishneh'],
  shulchan_aruch: ['Mishnah Berurah', 'Shach', 'Taz', 'Aruch HaShulchan']
} as const;

// Keywords to identify source types from titles and content
const SOURCE_TYPE_IDENTIFIERS = {
  tanach: [
    'bereishit', 'genesis', 'שמות', 'exodus', 'vayikra', 'leviticus', 
    'bamidbar', 'numbers', 'devarim', 'deuteronomy',
    'yehoshua', 'joshua', 'shoftim', 'judges', 'shmuel', 'samuel', 
    'melachim', 'kings', 'yeshayahu', 'isaiah', 'yirmiyahu', 'jeremiah',
    'yechezkel', 'ezekiel', 'hoshea', 'hosea', 'yoel', 'joel', 'amos',
    'ovadiah', 'obadiah', 'yonah', 'jonah', 'michah', 'micah', 'nachum', 'nahum',
    'chavakuk', 'habakkuk', 'tzefaniah', 'zephaniah', 'chaggai', 'haggai',
    'zechariah', 'malachi', 'tehillim', 'psalms', 'mishlei', 'proverbs', 
    'iyov', 'job', 'shir hashirim', 'song of songs', 'rut', 'ruth', 
    'eicha', 'lamentations', 'kohelet', 'ecclesiastes', 'esther', 'daniel', 
    'ezra', 'nechemiah', 'nehemiah', 'divrei hayamim', 'chronicles',
    'tanach', 'tanakh', 'bible', 'biblical', 'torah', 'chumash', 'parsha', 'parashah'
  ],
  talmud: [
    'talmud', 'bavli', 'yerushalmi', 'gemara', 'tractate', 'masechet', 'massekhet',
    'berachot', 'shabbat', 'eruvin', 'pesachim', 'rosh hashanah', 'yoma', 'sukkah',
    'beitzah', 'taanit', 'megillah', 'moed katan', 'chagigah', 'yevamot', 'ketubot',
    'nedarim', 'nazir', 'sotah', 'gittin', 'kiddushin', 'baba kamma', 'baba metzia',
    'baba batra', 'sanhedrin', 'makkot', 'shevuot', 'avodah zarah', 'horayot',
    'zevachim', 'menachot', 'hullin', 'bechorot', 'arachin', 'temurah', 'keritot',
    'meilah', 'kinnim', 'tamid', 'midot', 'niddah', 'pirkei avot', 'avot'
  ],
  rambam: [
    'rambam', 'maimonides', 'mishneh torah', 'hilchot', 'halachot', 'moreh nevuchim',
    'guide for the perplexed', 'yad hachazakah', 'sefer hamitzvot', 'commentary on mishnah'
  ],
  shulchan_aruch: [
    'shulchan aruch', 'orach chaim', 'yoreh deah', 'even haezer', 'choshen mishpat',
    'rama', 'rema', 'karo', 'beit yosef', 'tur'
  ]
};

/**
 * Determines the source type based on title, range, and content
 */
function identifySourceType(config: CommentaryConfig): keyof typeof COMMENTARY_MAPPINGS | null {
  const searchText = `${config.sourceTitle} ${config.sourceRange} ${config.excerpt}`.toLowerCase();
  
  for (const [sourceType, identifiers] of Object.entries(SOURCE_TYPE_IDENTIFIERS)) {
    if (identifiers.some(identifier => searchText.includes(identifier.toLowerCase()))) {
      return sourceType as keyof typeof COMMENTARY_MAPPINGS;
    }
  }
  
  return null;
}

/**
 * Selects 2 appropriate commentaries based on the criteria
 */
function selectCommentaries(config: CommentaryConfig): string[] {
  // Rule 1: Only provide commentaries if topic ≠ Spiritual Growth
  if (config.topicSelected.toLowerCase().includes('spiritual') || 
      config.topicSelected.toLowerCase().includes('growth')) {
    return [];
  }
  
  // Rule 2: Identify source type
  const sourceType = identifySourceType(config);
  
  // Rule 3: Only provide commentaries for supported source types
  if (!sourceType || !COMMENTARY_MAPPINGS[sourceType]) {
    return [];
  }
  
  // Rule 4: Select 2 commentaries from the appropriate type
  const availableCommentaries = COMMENTARY_MAPPINGS[sourceType];
  
  return availableCommentaries.slice(0, 2);
}

const TORAH_AGENT_PROMPT = `You are a specialized Torah learning agent with deep knowledge of Jewish texts, traditions, and learning methodologies. Your role is to create personalized Torah learning experiences that are authentic, engaging, and appropriate for the user's time constraints and learning level.

CORE RESPONSIBILITIES:
1. Generate authentic Torah sources from Tanakh, Talmud, Midrash, Rambam, or other classical Jewish texts
2. Provide accurate Hebrew/Aramaic text with precise English translations
3. Include meaningful commentary that connects ancient wisdom to contemporary life
4. Create thoughtful reflection prompts that encourage personal growth
5. Ensure all content is respectful of Jewish tradition and authenticity

CONTENT STRUCTURE:
- Title: Clear, descriptive title of the source
- Author: Original author/text (e.g., "Talmud Bavli", "Rambam", "Bereishit")
- Text: Original Hebrew/Aramaic text (if available)
- Translation: Accurate English translation
- Commentary: 2-3 paragraphs explaining context, meaning, and relevance
- Reflection Prompts: 2-3 thoughtful questions for personal contemplation
- Learning Objectives: What the learner should gain from this study
- Tags: Relevant topic tags for categorization

TOPICS AND THEIR FOCUS:
- Halacha: Jewish law, practical observance, ethical behavior
- Rambam: Maimonides' teachings, philosophy, medical wisdom
- Tanakh: Biblical stories, prophecy, psalms, wisdom literature
- Talmud: Rabbinic discussions, logic, ethics, community life
- Spiritual Growth: Mussar, meditation, character development, relationships
- Surprise Me: Diverse, unexpected connections across Jewish learning

TIME GUIDELINES:
- 5-10 minutes: Brief text with focused commentary
- 10-20 minutes: Medium text with deeper analysis
- 20-30 minutes: Longer passage with comprehensive study
- 30+ minutes: Complex topic with multiple sources or detailed exploration

LANGUAGE CONSIDERATIONS:
- Hebrew: Include Hebrew text with transliteration and translation
- English: Focus on translation and commentary
- Always provide both Hebrew and English when possible

AUTHENTICITY REQUIREMENTS:
- Only use real Torah sources - never create fictional texts
- Provide accurate citations when possible
- Respect traditional interpretations while allowing modern applications
- Ensure theological accuracy within Orthodox Jewish framework`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { topic, timeMinutes, language, userContext }: GenerationRequest = await req.json();

    // Initialize Supabase client for user data if needed
    let supabase = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Build personalized prompt
    let personalizedPrompt = TORAH_AGENT_PROMPT + `\n\nCURRENT REQUEST:
Topic: ${topic}
Available Time: ${timeMinutes} minutes
Language: ${language}
`;

    if (userContext) {
      personalizedPrompt += `\nUSER CONTEXT:`;
      if (userContext.name) personalizedPrompt += `\nName: ${userContext.name}`;
      if (userContext.difficulty) personalizedPrompt += `\nPreferred Difficulty: ${userContext.difficulty}`;
      if (userContext.learningHistory?.length) {
        personalizedPrompt += `\nRecent Learning Topics: ${userContext.learningHistory.slice(-5).join(', ')}`;
      }
      if (userContext.preferences) {
        personalizedPrompt += `\nLearning Preferences: ${JSON.stringify(userContext.preferences)}`;
      }
    }

    personalizedPrompt += `\n\nPlease generate a complete Torah learning source that matches these requirements. Return ONLY a valid JSON object with the following structure:
{
  "title": "string",
  "author": "string", 
  "text": "string (Hebrew/Aramaic if available)",
  "translation": "string (English translation)",
  "commentary": "string (2-3 paragraphs of explanation)",
  "reflection_prompts": ["string", "string"],
  "estimated_time": number,
  "difficulty": "string (beginner|intermediate|advanced)",
  "tags": ["string"],
  "sefaria_ref": "string (if available)",
  "learning_objectives": ["string"],
  "topic": "${topic}",
  "language": "${language}"
}`;

    console.log('Sending request to Gemini API...');

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: personalizedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    let generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let generatedSource: GeneratedSource;
    try {
      generatedSource = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse generated content as JSON:', generatedText);
      throw new Error('Generated content is not valid JSON');
    }

    // Validate required fields
    const requiredFields = ['title', 'author', 'translation', 'commentary', 'reflection_prompts'];
    for (const field of requiredFields) {
      if (!generatedSource[field as keyof GeneratedSource]) {
        throw new Error(`Generated source missing required field: ${field}`);
      }
    }

    // Set defaults for missing optional fields
    generatedSource.estimated_time = generatedSource.estimated_time || timeMinutes;
    generatedSource.difficulty = generatedSource.difficulty || 'intermediate';
    generatedSource.tags = generatedSource.tags || [topic];
    generatedSource.learning_objectives = generatedSource.learning_objectives || [];
    generatedSource.topic = topic;
    generatedSource.language = language;

    // Apply intelligent commentary selection based on criteria
    const intelligentCommentaries = selectCommentaries({
      topicSelected: topic,
      sourceTitle: generatedSource.title,
      sourceRange: generatedSource.sefaria_ref || '',
      excerpt: generatedSource.translation
    });

    // Override any existing commentaries with intelligent selection
    if (intelligentCommentaries.length > 0) {
      // Add commentary suggestions to the response without modifying the main commentary field
      generatedSource.suggested_commentaries = intelligentCommentaries;
    }

    console.log('Successfully generated Torah source:', generatedSource.title);

    // Optionally cache the result in Supabase for future use
    if (supabase) {
      try {
        const { error: insertError } = await supabase
          .from('ai_generated_sources')
          .insert([{
            title: generatedSource.title,
            author: generatedSource.author,
            text: generatedSource.text,
            translation: generatedSource.translation,
            commentary: generatedSource.commentary,
            reflection_prompts: generatedSource.reflection_prompts,
            estimated_time: generatedSource.estimated_time,
            difficulty: generatedSource.difficulty,
            tags: generatedSource.tags,
            sefaria_ref: generatedSource.sefaria_ref,
            learning_objectives: generatedSource.learning_objectives,
            topic: generatedSource.topic,
            language: generatedSource.language,
            source_type: 'gemini_generated',
            user_context: userContext || {}
          }]);
        
        if (insertError) {
          console.warn('Failed to cache source in database:', insertError);
        }
      } catch (cacheError) {
        console.warn('Error caching source:', cacheError);
      }
    }

    return new Response(JSON.stringify(generatedSource), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-source-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Failed to generate Torah source'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});