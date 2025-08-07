import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { selectCommentaries } from '../commentary-selector/index.ts';

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