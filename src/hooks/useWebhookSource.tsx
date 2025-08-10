import { useState, useEffect, useCallback } from 'react';


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

  const parseWebhookResponse = useCallback((responseText: string): WebhookSource => {
    // Extract information from the formatted Make response
    // Handle both old and new formats
    const titleEngMatch = responseText.match(/English:\s*(.+?)(?:\n|$)/);
    const titleHebrewMatch = responseText.match(/Hebrew:\s*(.+?)(?:\n|$)/);
    const rangeMatch = responseText.match(/\*\*Source Range:\*\*\s*(.+?)(?:\n|$)/);
    const excerptMatch = responseText.match(/\*\*Brief Excerpt:\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const excerptHebrewMatch = responseText.match(/\*\*Brief Excerpt \(Hebrew\):\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const commentariesMatch = responseText.match(/\*\*(?:\d+\s*)?Recommended Commentaries:\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const reflectionMatch = responseText.match(/\*\*Reflection Prompt:\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const reflectionHebrewMatch = responseText.match(/\*\*Reflection Prompt \(Hebrew\):\*\*\s*([\s\S]*?)(?:\n\*\*|$)/);
    const timeMatch = responseText.match(/\*\*Estimated Time:\*\*\s*(\d+)/);
    
    // Look for Sefaria links - handle multiple formats
    const markdownLinkMatch = responseText.match(/\[.*?\]\((https:\/\/(?:www\.)?sefaria(?:library)?\.org\/[^)]+)\)/);
    const plainLinkMatch = responseText.match(/(https:\/\/(?:www\.)?sefaria(?:library)?\.org\/[^\s\)]+)/);
    const workingLinkMatch = responseText.match(/\*\*Working Link[^:]*:\*\*\s*(?:\[.*?\]\()?(https:\/\/[^\s\)]+)/);
    
    let extractedLink = markdownLinkMatch?.[1] || workingLinkMatch?.[1] || plainLinkMatch?.[1] || '';
    
    // Clean and fix the link
    if (extractedLink) {
      extractedLink = extractedLink
        .replace(/\)$/, '') // Remove trailing parenthesis
        .replace(/sefarialibrary\.org/, 'sefaria.org') // Fix domain
        .replace(/%2C/g, ',') // Fix URL encoding
        .replace(/texts\//, '') // Remove 'texts/' path if present
        .replace(/MishnahPirkeiAvot/, 'Mishnah_Peah') // Fix path issues
        .trim();
        
      // Ensure proper Sefaria URL format
      if (!extractedLink.includes('sefaria.org')) {
        extractedLink = '';
      }
    }

    // Extract commentaries
    const commentariesText = commentariesMatch?.[1] || '';
    const commentaries = commentariesText
      .split(/\d+\.\s*/)
      .slice(1) // Remove first empty element
      .map(c => c.split(':')[0].replace(/\*\*/g, '').trim())
      .filter(c => c.length > 0);

    const title = titleEngMatch?.[1]?.replace(/\*/g, '').trim() || 'Torah Source';
    const sourceRange = rangeMatch?.[1]?.trim() || '';
    const excerpt = excerptMatch?.[1]?.trim() || '';
    
    // Use webhook-provided recommended commentaries (take up to two)
    const finalCommentaries = commentaries.slice(0, 2);

    return {
      title,
      title_he: titleHebrewMatch?.[1]?.replace(/\*/g, '').trim() || 'מקור תורני',
      source_range: sourceRange,
      excerpt,
      excerpt_he: excerptHebrewMatch?.[1]?.trim(),
      commentaries: finalCommentaries,
      reflection_prompt: reflectionMatch?.[1]?.trim() || '',
      reflection_prompt_he: reflectionHebrewMatch?.[1]?.trim(),
      estimated_time: timeMatch?.[1] ? parseInt(timeMatch[1]) : timeSelected,
      sefaria_link: extractedLink,
    };
  }, [timeSelected, topicSelected]);

  const fetchWebhookSource = useCallback(async () => {
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
  }, [timeSelected, topicSelected, language, parseWebhookResponse]);

  useEffect(() => {
    if (timeSelected && topicSelected && language) {
      fetchWebhookSource();
    }
  }, [timeSelected, topicSelected, language, fetchWebhookSource]);

  return {
    source,
    loading,
    error,
    refetch: fetchWebhookSource
  };
};