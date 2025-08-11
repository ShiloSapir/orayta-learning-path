import { describe, it, expect } from 'vitest';
import { selectCommentaries, debugSourceTypeIdentification, filterCommentariesByTopic } from './commentarySelector';

interface TestCase {
  name: string;
  config: {
    topicSelected: string;
    sourceTitle: string;
    sourceRange: string;
    excerpt: string;
  };
  expectedCommentaries: string[];
  shouldProvide: boolean;
}

const testCases: TestCase[] = [
  {
    name: 'Tanach - Bereishit',
    config: {
      topicSelected: 'Tanach',
      sourceTitle: 'Bereishit 1:1',
      sourceRange: 'Genesis 1:1-3',
      excerpt: 'In the beginning God created the heaven and the earth'
    },
    expectedCommentaries: ['Rashi', 'Ibn Ezra'],
    shouldProvide: true
  },
  {
    name: 'Tanach - Psalms',
    config: {
      topicSelected: 'Halacha',
      sourceTitle: 'Tehillim 23',
      sourceRange: 'Psalms 23:1-6',
      excerpt: 'The Lord is my shepherd, I shall not want'
    },
    expectedCommentaries: ['Rashi', 'Ibn Ezra'],
    shouldProvide: true
  },
  {
    name: 'Talmud - Berachot',
    config: {
      topicSelected: 'Halacha',
      sourceTitle: 'Berachot 3a',
      sourceRange: 'Tractate Berachot 3a',
      excerpt: 'From when do we recite the Shema in the evening?'
    },
    expectedCommentaries: ['Rashi', 'Tosafot'],
    shouldProvide: true
  },
  {
    name: 'Talmud - Pirkei Avot',
    config: {
      topicSelected: 'Talmud',
      sourceTitle: 'Pirkei Avot 1:1',
      sourceRange: 'Ethics of the Fathers 1:1',
      excerpt: 'Moses received the Torah from Sinai'
    },
    expectedCommentaries: ['Rashi', 'Tosafot'],
    shouldProvide: true
  },
  {
    name: 'Rambam - Mishneh Torah',
    config: {
      topicSelected: 'Halacha',
      sourceTitle: 'Hilchot Deot 1:1',
      sourceRange: 'Laws of Character Traits 1:1',
      excerpt: 'Human temperaments vary from person to person'
    },
    expectedCommentaries: ['Kesef Mishneh', 'Maggid Mishneh'],
    shouldProvide: true
  },
  {
    name: 'Shulchan Aruch - Orach Chaim',
    config: {
      topicSelected: 'Halacha',
      sourceTitle: 'Orach Chaim 1:1',
      sourceRange: 'Code of Jewish Law, Orach Chaim 1:1',
      excerpt: 'A person should strengthen himself like a lion to arise in the morning'
    },
    expectedCommentaries: ['Mishnah Berurah', 'Shach'],
    shouldProvide: true
  },
  {
    name: 'Spiritual Growth - Should be empty',
    config: {
      topicSelected: 'Spiritual Growth',
      sourceTitle: 'Bereishit 1:1',
      sourceRange: 'Genesis 1:1-3',
      excerpt: 'In the beginning God created the heaven and the earth'
    },
    expectedCommentaries: [],
    shouldProvide: false
  },
  {
    name: 'Topic with "spiritual" - Should be empty',
    config: {
      topicSelected: 'Inner spiritual development',
      sourceTitle: 'Talmud Berachot 3a',
      sourceRange: 'Tractate Berachot 3a',
      excerpt: 'From when do we recite the Shema in the evening?'
    },
    expectedCommentaries: [],
    shouldProvide: false
  },
  {
    name: 'Unknown source type',
    config: {
      topicSelected: 'Halacha',
      sourceTitle: 'Random Modern Text',
      sourceRange: 'Modern Philosophy 1:1',
      excerpt: 'This is not a traditional Jewish source'
    },
    expectedCommentaries: [],
    shouldProvide: false
  },
  {
    name: 'Unclear source type',
    config: {
      topicSelected: 'Halacha',
      sourceTitle: 'General Jewish Teaching',
      sourceRange: 'Various Sources',
      excerpt: 'A compilation of various teachings'
    },
    expectedCommentaries: [],
    shouldProvide: false
  }
];

describe('commentarySelector', () => {
  testCases.forEach(({ name, config, expectedCommentaries, shouldProvide }) => {
    it(name, () => {
      const result = debugSourceTypeIdentification(config);
      const commentaries = selectCommentaries(config);
      expect(result.shouldProvide).toBe(shouldProvide);
      expect(commentaries.sort()).toEqual(expectedCommentaries.sort());
    });
  });
});

describe('filterCommentariesByTopic', () => {
  it('removes commentaries for spiritual growth topics', () => {
    const result = filterCommentariesByTopic('Spiritual Growth', ['Rashi', 'Ibn Ezra']);
    expect(result).toEqual([]);
  });

  it('keeps commentaries for other topics', () => {
    const result = filterCommentariesByTopic('Halacha', ['Rashi', 'Ibn Ezra']);
    expect(result).toEqual(['Rashi', 'Ibn Ezra']);
  });
});
