import { describe, it, expect } from 'vitest';
import { formatSourceRange } from '../SourceRecommendationV2';

const baseSource = {
  title: '',
  title_he: '',
  source_range: '',
  excerpt: '',
  commentaries: [] as string[],
  reflection_prompt: '',
  estimated_time: 0,
  sefaria_link: ''
};

describe('formatSourceRange', () => {
  const cases: [string, string][] = [
    ['Genesis 1:1-1:3', 'From Genesis 1:1 to 1:3'],
    ['Genesis 1:1 – 1:3', 'From Genesis 1:1 to 1:3'],
    ['Genesis 1:1, 1:3', 'From Genesis 1:1 to 1:3'],
    ['Genesis 1:1 to 1:3', 'From Genesis 1:1 to 1:3']
  ];

  cases.forEach(([range, expected]) => {
    it(`formats "${range}" correctly`, () => {
      const source = { ...baseSource, source_range: range } as any;
      expect(formatSourceRange(source, 'en')).toBe(expected);
    });
  });
});

