import { useState, useEffect, useCallback } from 'react';
import { selectCommentaries, shouldProvideCommentaries } from '@/utils/commentarySelector';

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

  const parseWebhookResponse = useCallback((responseText: string, preferredLang: string): WebhookSource => {
    // Extract information from the formatted Make response
    // Handle both old and new formats (English + Hebrew labels)
    // Titles (English/Hebrew labels in both languages)
    const titleEngMatch = responseText.match(/(?:^|\n)\s*English:\s*(.+?)(?:\n|$)/);
    const titleHebLabelMatch = responseText.match(/(?:^|\n)\s*Hebrew:\s*(.+?)(?:\n|$)/);
    const titleEngHeMatch = responseText.match(/(?:^|\n)\s*אנגלית\s*:\s*(.+?)(?:\n|$)/);
    const titleHebHeMatch = responseText.match(/(?:^|\n)\s*עברית\s*:\s*(.+?)(?:\n|$)/);

    // Source range (support bold and plain, English + Hebrew) and explicit From/To pairs
    const rangeEngMatch = responseText.match(/\*\*\s*Source Range\s*\*\*\s*[:：\-–—]?\s*(?:\r?\n\s*)?(.+?)(?:\n|$)/i)
      || responseText.match(/(?:^|\n)\s*(?:[*•\-]\s*)?Source Range\s*[:：\-–—]?\s*(?:\r?\n\s*)?(.+?)(?:\n|$)/i);
    const rangeHebMatch = responseText.match(/\*\*\s*(?:טווח מקור|מראה מקום|מ.*?עד)\s*\*\*\s*[:：\-–—]?\s*(?:\r?\n\s*)?([\s\S]*?)(?=\n\s*\*\*|\n\s*(?:פירושים|שאלה|זמן)|$)/i)
      || responseText.match(/(?:^|\n)\s*(?:[*•\-]\s*)?(?:טווח מקור|מראה מקום|מ.*?עד)\s*[:：\-–—]?\s*(?:\r?\n\s*)?([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:פירושים|שאלה|זמן)|$)/i);

    // Optional explicit From/To lines (English + Hebrew)
    const fromEng = responseText.match(/(?:^|\n)\s*(?:\*\*)?\s*From\s*(?:\*\*)?\s*[:：\-–—]?\s*(.+?)(?:\n|$)/i)?.[1]?.trim();
    const toEng = responseText.match(/(?:^|\n)\s*(?:\*\*)?\s*To\s*(?:\*\*)?\s*[:：\-–—]?\s*(.+?)(?:\n|$)/i)?.[1]?.trim();
    const fromHeb = responseText.match(/(?:^|\n)\s*(?:\*\*)?\s*מ\s*(?:\*\*)?\s*[:：\-–—]?\s*(.+?)(?:\n|$)/)?.[1]?.trim();
    const toHeb = responseText.match(/(?:^|\n)\s*(?:\*\*)?\s*עד\s*(?:\*\*)?\s*[:：\-–—]?\s*(.+?)(?:\n|$)/)?.[1]?.trim();

    // Excerpt (support bold and plain, flexible boundary to next heading)
    const excerptEngMatch = (
      responseText.match(/\*\*\s*(?:Brief\s+Excerpt|Excerpt|Summary|Key\s+Quote|Short\s+Quote|Quote)\s*\*\*\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית)\b|$)/i)
      || responseText.match(/(?:^|\n)\s*(?:[#>*•\-]+\s*)?(?:Brief\s+Excerpt|Excerpt|Summary|Key\s+Quote|Short\s+Quote|Quote)\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית)\b|$)/i)
    );
    const excerptHebMatch = (
      responseText.match(/\*\*\s*(?:ציטוט קצר|קטע קצר|תמצית(?: המקור)?|ציטוט|ציטוט מרכזי|ציטוט מפתח|קטע מקור)\s*\*\*\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית|Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English)\b|$)/i)
      || responseText.match(/(?:^|\n)\s*(?:[#>*•\-]+\s*)?(?:ציטוט קצר|קטע קצר|תמצית(?: המקור)?|ציטוט|ציטוט מרכזי|ציטוט מפתח|קטע מקור)\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית|Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English)\b|$)/i)
    );

    // Reflection prompt (support bold and plain, flexible boundary)
    const reflectionEngMatch = (
      responseText.match(/\*\*\s*(?:Reflection Prompt|Reflection Questions?|Guiding Questions?|Discussion Questions?|Question|Prompt)\s*\*\*\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|Brief Excerpt|Excerpt|Summary|Key\s+Quote|Short\s+Quote|Quote|שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית)\b|$)/i)
      || responseText.match(/(?:^|\n)\s*(?:[*•\-]\s*)?(?:Reflection Prompt|Reflection Questions?|Guiding Questions?|Discussion Questions?|Question|Prompt)\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|Brief Excerpt|Excerpt|Summary|Key\s+Quote|Short\s+Quote|Quote|שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית)\b|$)/i)
    );
    const reflectionHebMatch = (
      responseText.match(/\*\*\s*(?:שאלה ל?(?:הרהור|דיון)|שאלת ל?(?:הרהור|דיון)|שאלות ל?(?:הרהור|דיון)|הרהור|מחשבה|שאלה|דיון|שאלת עיון|שאלה לעיון)\s*\*\*\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית|Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|ציטוט קצר|קטע קצר|תמצית(?: המקור)?|ציטוט|ציטוט מרכזי|ציטוט מפתח|קטע מקור)\b|$)/i)
      || responseText.match(/(?:^|\n)\s*(?:[*•\-]\s*)?(?:שאלה ל?(?:הרהור|דיון)|שאלת ל?(?:הרהור|דיון)|שאלות ל?(?:הרהור|דיון)|הרהור|מחשבה|שאלה|דיון|שאלת עיון|שאלה לעיון)\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית|Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|ציטוט קצר|קטע קצר|תמצית(?: המקור)?|ציטוט|ציטוט מרכזי|ציטוט מפתח|קטע מקור)\b|$)/i)
    );

    // Estimated time (support bold and plain, English + Hebrew)
    const timeEngMatch = responseText.match(/\*\*\s*Estimated Time\s*\*\*\s*[:：\-–—]?\s*(?:\r?\n\s*)?(\d+)/i)
      || responseText.match(/(?:^|\n)\s*(?:[*•\-]\s*)?Estimated Time\s*[:：\-–—]?\s*(?:\r?\n\s*)?(\d+)/i);
    const timeHebMatch = responseText.match(/\*\*\s*זמן משוער\s*\*\*\s*[:：\-–—]?\s*(?:\r?\n\s*)?(\d+)/i)
      || responseText.match(/(?:^|\n)\s*(?:[*•\-]\s*)?זמן משוער\s*[:：\-–—]?\s*(?:\r?\n\s*)?(\d+)/i);
    
    // Look for Sefaria links - handle multiple formats (support Hebrew "Working Link")
    const markdownLinkMatch = responseText.match(/\[.*?\]\((https:\/\/(?:www\.)?sefaria(?:library)?\.org\/[^)]+)\)/);
    const plainLinkMatch = responseText.match(/(https:\/\/(?:www\.)?sefaria(?:library)?\.org\/[^\s\)]+)/);
    const workingLinkMatch = responseText.match(/\*\*(?:Working Link[^:]*|קישור(?: עובד)?):\*\*\s*(?:\[.*?\]\()?(https:\/\/[^\s\)]+)/);
    
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

    // Extract commentaries with flexible section detection and splitting (English + Hebrew)
    const commentarySectionRegexes = [
      /\*\*\s*(?:Recommended\s+)?Commentaries(?:\s*\([^)]*\))?\s*\*\*\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*\*\*|\n\s*(?:[*•\-]\s*)?(?:Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית)\b|$)/i,
      /(?:^|\n)\s*(?:[*•\-]\s*)?(?:Recommended\s+)?Commentaries(?:\s*\([^)]*\))?\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English|שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית)\b|$)/i,
      /\*\*\s*(?:(?:שני|שתי|שתיים|2)\s+)?(?:פירושים מומלצים|מפרשים מומלצים|פרשנים מומלצים|פירושים)\s*\*\*\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית|Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English)\b|$)/i,
      /(?:^|\n)\s*(?:[*•\-]\s*)?(?:(?:שני|שתי|שתיים|2)\s+)?(?:פירושים מומלצים|מפרשים מומלצים|פרשנים מומלצים|פירושים)\s*[:：\-–—]?\s*([\s\S]*?)(?=\n\s*(?:\*\*\s*)?(?:שאלה(?:ות)? ל?(?:הרהור|דיון)|הרהור|זמן משוער|ספאריה|קישור(?: עובד)?|טווח מקור|כותרת|עברית|אנגלית|Reflection Prompt|Reflection Questions?|Estimated Time|Sefaria|Working Link|Source Range|Title|Hebrew|English)\b|$)/i
    ];
    let commentariesText = '';
    for (const r of commentarySectionRegexes) {
      const m = responseText.match(r);
      if (m?.[1]) { commentariesText = m[1]; break; }
    }
    const commentaries = (commentariesText || '')
      .replace(/\r/g, '\n')
      // Ensure numbered items split into separate lines: 1., 2., etc.
      .replace(/(\d+\.)\s+/g, '\n$1 ')
      .replace(/\*+/g, '')
      .replace(/_+/g, '')
      .replace(/`+/g, '')
      .split(/\r?\n|•|;|—|–/)
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => {
        // Support formats like: "1. **Rashi:** ...", "- **R**ashi: ...", "* Tosafot ...", "Ramban — ..."
        const m = l.match(/^(?:\*|-|\d+\.)?\s*([^:\n]+?)(?:\s*\([^)]*\))?\s*:?.*/);
        let name = m ? m[1] : '';
        name = name
          .replace(/[*_`~]/g, '')
          .replace(/^\s*[•\-–—]\s*/, '')
          .replace(/\s*[-–—:]\s*$/, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
        return name;
      })
      .filter(c => c.length > 2);

    const sanitizeField = (raw: string) => {
      if (!raw) return '';
      let s = raw
        // Strip Markdown links but keep the link text
        .replace(/\[([^\]]+)\]\((?:https?:\/\/)[^)]+\)/g, '$1')
        // Remove any bare URLs
        .replace(/https?:\/\/[^\s)]+/g, '')
        // Remove lines that look like link metadata (Working Link, Source Link, Link)
        .replace(/(?:^|\n)\s*\*\*?\s*(?:Working Link|Source Link|Link|קישור(?: עובד)?)\s*:?\.*.*$/gim, '')
        // Strip any stray HTML tags
        .replace(/<[^>]+>/g, '')
        // Normalize whitespace
        .replace(/\s{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      return s;
    };

    const englishTitleRaw = titleEngMatch?.[1] || titleEngHeMatch?.[1];
    const hebrewTitleRaw = titleHebLabelMatch?.[1] || titleHebHeMatch?.[1];

    let sourceRange = (preferredLang === 'he'
      ? (rangeHebMatch?.[1] || rangeEngMatch?.[1])
      : (rangeEngMatch?.[1] || rangeHebMatch?.[1]))?.trim() || '';

    // Prefer explicit From/To if provided by webhook
    const fromPref = preferredLang === 'he' ? (fromHeb || fromEng) : (fromEng || fromHeb);
    const toPref = preferredLang === 'he' ? (toHeb || toEng) : (toEng || toHeb);

    let finalRange = sourceRange;
    if (fromPref && toPref) {
      finalRange = `${fromPref} ${preferredLang === 'he' ? 'עד' : 'to'} ${toPref}`.trim();
    }

    // Fallback: derive range from Sefaria link if still missing
    if (!finalRange && extractedLink) {
      const m = extractedLink.match(/sefaria\.org\/([^?\#]+)/);
      if (m?.[1]) {
        let ref = decodeURIComponent(m[1])
          .replace(/^texts\//i, '')
          .replace(/_/g, ' ')
          .trim();
        // Only main ref segment
        ref = ref.split(/[?\#]/)[0];
        finalRange = ref;
      }
    }
    // Compute title with fallback to finalRange when explicit title missing (handles Hebrew)
    const baseTitle = (englishTitleRaw || hebrewTitleRaw || '').replace(/\*/g, '').trim();
    const title = baseTitle || finalRange || (preferredLang === 'he' ? 'מקור תורני' : 'Torah Source');
    const titleHe = (hebrewTitleRaw || '').replace(/\*/g, '').trim() || finalRange || 'מקור תורני';

    const rawExcerptHe = excerptHebMatch?.[1]?.trim();
    const rawExcerptEn = excerptEngMatch?.[1]?.trim();
    const rawExcerpt = preferredLang === 'he' ? (rawExcerptHe || rawExcerptEn) : (rawExcerptEn || rawExcerptHe);
    let excerpt = sanitizeField(rawExcerpt || '');

    // Heuristic fallback: pick the first non-heading, non-link paragraph
    if (!excerpt) {
      const paragraphs = responseText
        .replace(/\r/g, '\n')
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 40)
        .filter(p => !/https?:\/\//i.test(p))
        .filter(p => !/(?:^|\n)\s*\*\*?\s*(?:Working Link|Source Link|Sefaria|Link|קישור(?: עובד)?)/i.test(p))
        .filter(p => !new RegExp(
          '^(?:[#>*•\\-]+\\s*)?(?:' +
          '(?:Recommended\\s+)?Commentaries|פירושים מומלצים|מפרשים מומלצים|פרשנים מומלצים|' +
          'Brief\\s+Excerpt|Excerpt|Summary|Key\\s+Quote|Short\\s+Quote|Quote|' +
          'Reflection Prompt|Reflection Questions?|' +
          'שאלה|שאלות|הרהור|דיון|' +
          'Source Range|טווח מקור|מראה מקום' +
          ')', 'i'
        ).test(p));
      if (paragraphs.length > 0) {
        excerpt = sanitizeField(paragraphs[0]);
      }
    }

    const rawReflectionHe = reflectionHebMatch?.[1]?.trim();
    const rawReflectionEn = reflectionEngMatch?.[1]?.trim();
    let reflection = sanitizeField((preferredLang === 'he' ? (rawReflectionHe || rawReflectionEn) : (rawReflectionEn || rawReflectionHe)) || '');

    // Heuristic fallback: first question-like line
    if (!reflection) {
      const qMatch = responseText.match(/(?:^|\n)\s*(?:[#>*•\-\d\.]+\s*)?(.+?\?)\s*(?:\n|$)/m);
      if (qMatch?.[1]) {
        reflection = sanitizeField(qMatch[1]);
      }
    }

    // Use webhook-provided recommended commentaries (take up to two), with smart fallback
    let finalCommentaries = commentaries.slice(0, 2);
    if (finalCommentaries.length === 0) {
      const config = { topicSelected, sourceTitle: title, sourceRange: finalRange, excerpt };
      if (shouldProvideCommentaries(config)) {
        finalCommentaries = selectCommentaries(config).slice(0, 2);
      }
    }

    const timeStr = preferredLang === 'he' ? (timeHebMatch?.[1] || timeEngMatch?.[1]) : (timeEngMatch?.[1] || timeHebMatch?.[1]);

    // Diagnostics for Hebrew parsing
    if (preferredLang === 'he' && (excerpt.length === 0 || reflection.length === 0 || finalCommentaries.length === 0)) {
      const snippet = responseText.slice(0, 600);
      console.debug('Hebrew webhook parse diagnostics', {
        hasExcerpt: excerpt.length > 0,
        hasReflection: reflection.length > 0,
        commentaryCount: finalCommentaries.length,
        snippet
      });
    }

    return {
      title,
      title_he: titleHe,
      source_range: finalRange,
      excerpt,
      commentaries: finalCommentaries,
      reflection_prompt: reflection,
      estimated_time: timeStr ? parseInt(timeStr) : timeSelected,
      sefaria_link: extractedLink,
    };
  }, [timeSelected, topicSelected, language]);

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
      const parsedSource = parseWebhookResponse(responseText, language);
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