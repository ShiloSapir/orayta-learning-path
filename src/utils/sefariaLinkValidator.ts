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
 * Normalizes Sefaria URLs to use the canonical .org domain
 */
export function normalizeSefariaUrl(url: string): string {
  if (!isValidSefariaUrl(url)) {
    throw new Error('Invalid Sefaria URL');
  }
  
  return url.replace('sefaria.org.il', 'sefaria.org');
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
  const encodedRef = encodeURIComponent(textRef.replace(/\s+/g, '.'));
  
  const params = new URLSearchParams();
  if (options.language) params.set('lang', options.language);
  if (options.layout) params.set('layout', options.layout);
  if (options.with?.length) params.set('with', options.with.join(','));
  
  const queryString = params.toString();
  return `${baseUrl}/${encodedRef}${queryString ? '?' + queryString : ''}`;
}