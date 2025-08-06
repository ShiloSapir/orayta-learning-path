import { useState, useEffect } from 'react';

export interface WebhookSource {
  title: string;
  title_he: string;
  source_range: string;
  excerpt: string;
  excerpt_he?: string;
  commentaries: string[];
  reflection_prompt: string;
  reflection_prompt_he?: string;
  estimated_time: number;
  sefaria_link: string;
}

export const useWebhookSource = (timeSelected: number, topicSelected: string, language: string) => {
  const [source, setSource] = useState<WebhookSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhookSource = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://hook.eu2.make.com/yph8frq3ykdvsqjjbz0zxym2ihrjnv1j', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time_selected: timeSelected,
          topic_selected: topicSelected,
          language_selected: language,
          user_id: crypto.randomUUID(), // Generate a random ID for webhook tracking
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch source from webhook');
      }

      const responseText = await response.text();
      
      // Parse the formatted response from Make
      const parsedSource = parseWebhookResponse(responseText);
      setSource(parsedSource);
      
    } catch (err) {
      console.error('Webhook fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const parseWebhookResponse = (responseText: string): WebhookSource => {
    // Extract information from the formatted Make response
    const titleEnglishMatch = responseText.match(/\*\s*\*\*English:\*\*\s*(.+?)(?:\n|$)/);
    const titleHebrewMatch = responseText.match(/\*\s*\*\*Hebrew:\*\*\s*(.+?)(?:\n|$)/);
    const rangeMatch = responseText.match(/\*\*Source Range:\*\*\s*(.+?)(?:\n|$)/);
    const excerptMatch = responseText.match(/\*\*Brief Excerpt:\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const commentariesMatch = responseText.match(/\*\*2 Recommended Commentaries:\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const reflectionMatch = responseText.match(/\*\*Reflection Prompt:\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const timeMatch = responseText.match(/\*\*Estimated Time:\*\*\s*(\d+)/);
    const linkMatch = responseText.match(/\*\*Link to the source on Sefaria:\*\*\s*(https:\/\/[^\s]+)/);

    // Extract commentaries from numbered list
    const commentariesText = commentariesMatch?.[1] || '';
    const commentaries: string[] = [];
    
    // Look for numbered commentaries (1. **Name:** description)
    const commentaryMatches = commentariesText.matchAll(/\d+\.\s*\*\*([^:*]+):\*\*/g);
    for (const match of commentaryMatches) {
      if (match[1]) {
        commentaries.push(match[1].trim());
      }
    }

    // Clean up extracted text by removing markdown formatting
    const cleanText = (text: string | undefined) => text?.replace(/\*\*/g, '').replace(/\*/g, '').trim() || '';

    return {
      title: cleanText(titleEnglishMatch?.[1]) || 'Torah Source',
      title_he: cleanText(titleHebrewMatch?.[1]) || 'מקור תורני',
      source_range: cleanText(rangeMatch?.[1]) || '',
      excerpt: cleanText(excerptMatch?.[1]) || '',
      commentaries: commentaries.length > 0 ? commentaries : ['Rashi', 'Ramban'],
      reflection_prompt: cleanText(reflectionMatch?.[1]) || '',
      estimated_time: timeMatch?.[1] ? parseInt(timeMatch[1]) : timeSelected,
      sefaria_link: linkMatch?.[1] || '',
    };
  };

  useEffect(() => {
    if (timeSelected && topicSelected && language) {
      fetchWebhookSource();
    }
  }, [timeSelected, topicSelected, language]);

  return {
    source,
    loading,
    error,
    refetch: fetchWebhookSource
  };
};