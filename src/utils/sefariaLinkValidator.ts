/**
 * Utility functions for validating and normalizing Sefaria links
 */

/**
 * Validates if a URL is a valid Sefaria link (supports both .org and .org.il)
 */
export function isValidSefariaUrl(url: string): boolean {
  const urlPattern = /^https:\/\/(www\.)?sefaria\.org(\.il)?\/.+/;
  return urlPattern.test(url);
}

/**
 * Normalizes Sefaria URLs to use the canonical .org domain and fix common Rambam formatting issues
 */
export function normalizeSefariaUrl(url: string): string {
  if (!isValidSefariaUrl(url)) {
    throw new Error('Invalid Sefaria URL');
  }
  
  let normalized = url.replace('sefaria.org.il', 'sefaria.org');
  
  // Fix common Rambam URL formatting issues
  // Convert "Mishneh.Torah,.Hilchot" pattern to "Mishneh_Torah,_Hilchot"
  if (normalized.includes('Mishneh')) {
    normalized = normalized.replace(/Mishneh\.Torah\./g, 'Mishneh_Torah,_');
    normalized = normalized.replace(/Mishneh\.Torah%2C\./g, 'Mishneh_Torah%2C_');
    normalized = normalized.replace(/Mishneh\.Torah,\./g, 'Mishneh_Torah,_');
  }
  
  return normalized;
}

/**
 * Extracts the text reference from a Sefaria URL
 */
export function extractTextReference(url: string): string | null {
  const normalizedUrl = normalizeSefariaUrl(url);
  const match = normalizedUrl.match(/sefaria\.org\/([^?]+)/);
  
  if (!match) return null;
  
  return decodeURIComponent(match[1]);
}

/**
 * Validates a Sefaria link by checking the API
 */
export async function validateSefariaLinkApi(url: string): Promise<boolean> {
  try {
    if (!isValidSefariaUrl(url)) return false;
    
    const textRef = extractTextReference(url);
    if (!textRef) return false;
    
    const apiUrl = `https://www.sefaria.org/api/texts/${textRef}`;
    const response = await fetch(apiUrl);
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Builds a proper Sefaria URL from a text reference
 */
export function buildSefariaUrl(textRef: string, options: {
  language?: 'he' | 'en';
  layout?: 'hebrew' | 'english';
  with?: string[];
} = {}): string {
  const baseUrl = 'https://www.sefaria.org';
  
  // Handle Rambam/Mishneh Torah references specially
  // Format: "Mishneh Torah, Hilchot X" should become "Mishneh_Torah%2C_Hilchot_X"
  let processedRef = textRef;
  
  // Replace spaces with underscores for book names, but keep dots for chapter:verse references
  if (textRef.includes('Mishneh Torah')) {
    // Split on the last dot to separate book from chapter/verse
    const lastDotIndex = textRef.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const bookPart = textRef.substring(0, lastDotIndex);
      const chapterPart = textRef.substring(lastDotIndex);
      processedRef = bookPart.replace(/\s+/g, '_') + chapterPart;
    } else {
      processedRef = textRef.replace(/\s+/g, '_');
    }
  } else {
    // For other texts, replace spaces with dots (existing behavior)
    processedRef = textRef.replace(/\s+/g, '.');
  }
  
  const encodedRef = encodeURIComponent(processedRef);
  
  const params = new URLSearchParams();
  if (options.language) params.set('lang', options.language);
  if (options.layout) params.set('layout', options.layout);
  if (options.with?.length) params.set('with', options.with.join(','));
  
  const queryString = params.toString();
  return `${baseUrl}/${encodedRef}${queryString ? '?' + queryString : ''}`;
}