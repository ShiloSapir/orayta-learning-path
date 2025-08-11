import { describe, it, expect, vi } from 'vitest';

vi.mock('react', () => ({
  useState: (initial: unknown) => [initial, () => {}],
  useEffect: () => {},
  useCallback: (fn: unknown) => fn,
}));

import { useWebhookSource } from '../useWebhookSource';

describe('parseWebhookResponse', () => {
  it('uses the exact source range provided in the webhook payload', () => {
    const { parseWebhookResponse } = useWebhookSource(5, 'topic', 'en');

    const sampleResponse = `
English: Sample Title
**Source Range**: Genesis 1:1-2
From: Genesis 1:1
To: Genesis 1:2

**Brief Excerpt**: In the beginning...
**Reflection Prompt**: What does this teach us?
**Estimated Time**: 5
**Sefaria**: https://www.sefaria.org/Genesis.1.1-5
`;

    const parsed = parseWebhookResponse(sampleResponse, 'en');
    // Even with explicit From/To lines present, the original Source Range should be preserved
    expect(parsed.source_range).toBe('Genesis 1:1-2');
  });

  it('constructs range from explicit From/To lines when Source Range is absent', () => {
    const { parseWebhookResponse } = useWebhookSource(5, 'topic', 'en');

    const sampleResponse = `
English: Sample Title
- From: Genesis 1:1
- To: Genesis 1:2

**Brief Excerpt**: In the beginning...
**Reflection Prompt**: What does this teach us?
**Estimated Time**: 5
**Sefaria**: https://www.sefaria.org/Genesis.1.1-2
`;

    const parsed = parseWebhookResponse(sampleResponse, 'en');
    expect(parsed.source_range).toBe('Genesis 1:1 to Genesis 1:2');
  });

  it('parses suggested source and range lines', () => {
    const { parseWebhookResponse } = useWebhookSource(5, 'topic', 'en');

    const sampleResponse = `
Suggested Source: Pirkei Avot 1:1
Suggested Range: Pirkei Avot 1:1-2

**Brief Excerpt**: Example...
**Reflection Prompt**: Think about it
**Estimated Time**: 5
**Sefaria**: https://www.sefaria.org/Pirkei_Avot.1.1-2
`;

    const parsed = parseWebhookResponse(sampleResponse, 'en');
    expect(parsed.title).toBe('Pirkei Avot 1:1');
    expect(parsed.source_range).toBe('Pirkei Avot 1:1-2');
  });


  it('derives full range from sefaria link when range is missing', () => {
    const { parseWebhookResponse } = useWebhookSource(5, 'topic', 'en');

    const sampleResponse = `
Suggested Source: Genesis 1

**Brief Excerpt**: In the beginning...
**Reflection Prompt**: What does this teach us?
**Estimated Time**: 5
**Sefaria**: https://www.sefaria.org/Genesis.1.1-2.3
`;

    const parsed = parseWebhookResponse(sampleResponse, 'en');
    expect(parsed.source_range).toBe('Genesis 1:1-2:3');
  });
=======

});
