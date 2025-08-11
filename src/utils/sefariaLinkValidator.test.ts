import { describe, it, expect } from 'vitest';
import { isValidSefariaUrl, normalizeSefariaUrl, extractTextReference } from './sefariaLinkValidator';

describe('isValidSefariaUrl', () => {
  it('accepts sefaria.org URLs', () => {
    expect(isValidSefariaUrl('https://www.sefaria.org/Genesis.1')).toBe(true);
  });

  it('accepts sefaria.org.il URLs', () => {
    expect(isValidSefariaUrl('https://www.sefaria.org.il/Genesis.1')).toBe(true);
  });

  it('rejects non-Sefaria URLs', () => {
    expect(isValidSefariaUrl('https://example.com/Genesis.1')).toBe(false);
  });
});

describe('normalizeSefariaUrl', () => {
  it('converts .org.il to canonical .org', () => {
    const input = 'https://www.sefaria.org.il/Genesis.1?lang=he';
    const output = 'https://www.sefaria.org/Genesis.1?lang=he';
    expect(normalizeSefariaUrl(input)).toBe(output);
  });

  it('leaves canonical .org URLs unchanged', () => {
    const url = 'https://www.sefaria.org/Genesis.1';
    expect(normalizeSefariaUrl(url)).toBe(url);
  });

  it('throws on invalid URLs', () => {
    expect(() => normalizeSefariaUrl('https://example.com')).toThrowError('Invalid Sefaria URL');
  });
});

describe('extractTextReference', () => {
  it('extracts reference from canonical URLs', () => {
    const url = 'https://www.sefaria.org/Genesis.1.1-3?lang=he';
    expect(extractTextReference(url)).toBe('Genesis.1.1-3');
  });

  it('normalizes .org.il URLs before extracting', () => {
    const url = 'https://www.sefaria.org.il/Genesis.1.1-3?lang=en';
    expect(extractTextReference(url)).toBe('Genesis.1.1-3');
  });

  it('returns null when no text reference is present', () => {
    const url = 'https://www.sefaria.org/?lang=en';
    expect(extractTextReference(url)).toBeNull();
  });
});

