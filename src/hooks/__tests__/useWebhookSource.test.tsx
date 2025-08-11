import { describe, it, expect, vi } from 'vitest';

vi.mock('react', () => ({
  useState: (initial: any) => [initial, () => {}],
  useEffect: () => {},
  useCallback: (fn: any) => fn,
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
});
