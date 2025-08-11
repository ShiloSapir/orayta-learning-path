/**
 * Test cases for commentary selection logic
 * This can be used to validate the commentary selection works as expected
 */

import { selectCommentaries, debugSourceTypeIdentification } from './commentarySelector';

// Test cases
export const testCases = [
  // Should provide commentaries - Tanach sources
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

  // Should provide commentaries - Talmud sources
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

  // Should provide commentaries - Rambam sources
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

  // Should provide commentaries - Shulchan Aruch sources
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

  // Should NOT provide commentaries - Spiritual Growth topic
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

  // Should NOT provide commentaries - Unknown source types
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

  // Should NOT provide commentaries - Mixed or unclear sources
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

/**
 * Structure of a single test result.
 */
interface TestResult {
  name: string;
  passed: boolean;
  expected: {
    shouldProvide: boolean;
    commentaries: string[];
  };
  actual: {
    shouldProvide: boolean;
    commentaries: string[];
    sourceType: string;
  };
}

/**
 * Run all tests and return results
 */
export function runCommentaryTests(): {
  passed: number;
  failed: number;
  results: TestResult[];
} {
  let passed = 0;
  let failed = 0;
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const result = debugSourceTypeIdentification(testCase.config);
    const actualCommentaries = selectCommentaries(testCase.config);
    
    const testPassed = 
      result.shouldProvide === testCase.shouldProvide &&
      JSON.stringify(actualCommentaries.sort()) === JSON.stringify(testCase.expectedCommentaries.sort());

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }

    results.push({
      name: testCase.name,
      passed: testPassed,
      expected: {
        shouldProvide: testCase.shouldProvide,
        commentaries: testCase.expectedCommentaries
      },
      actual: {
        shouldProvide: result.shouldProvide,
        commentaries: actualCommentaries,
        sourceType: result.sourceType
      }
    });
  }

  return { passed, failed, results };
}

/**
 * Utility function to print test results (for console debugging)
 */
export function printTestResults() {
  const { passed, failed, results } = runCommentaryTests();
  
  console.log(`\n=== Commentary Selection Test Results ===`);
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  console.log(`\nDetailed Results:`);
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.passed) {
      console.log(`   Expected: ${JSON.stringify(result.expected)}`);
      console.log(`   Actual: ${JSON.stringify(result.actual)}`);
    }
  });
  
  return { passed, failed };
}