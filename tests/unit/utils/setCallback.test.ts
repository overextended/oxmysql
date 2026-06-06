import { describe, test, expect } from 'bun:test';
import { setCallback } from 'utils/setCallback';

describe('setCallback', () => {
  const cb = () => {};

  test('returns the explicit callback when one is provided', () => {
    expect(setCallback([1, 2], cb)).toBe(cb);
  });

  test('falls back to the parameters slot when it holds the callback', () => {
    expect(setCallback(cb)).toBe(cb);
  });

  test('returns undefined when there is no callback anywhere', () => {
    expect(setCallback([1, 2])).toBeUndefined();
    expect(setCallback(undefined, undefined)).toBeUndefined();
  });

  test('a non-function explicit cb is ignored in favour of a function in params', () => {
    expect(setCallback(cb, 'notfn' as any)).toBe(cb);
  });
});
