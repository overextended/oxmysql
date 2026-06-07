import { describe, test, expect } from 'bun:test';
import { sleep } from 'utils/sleep';

describe('sleep', () => {
  test('resolves after the requested delay', async () => {
    const start = performance.now();
    await sleep(20);
    expect(performance.now() - start).toBeGreaterThanOrEqual(15);
  });
});
