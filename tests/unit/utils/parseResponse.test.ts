import { describe, test, expect } from 'bun:test';
import { parseResponse } from '../../../src/utils/parseResponse';

describe('parseResponse', () => {
  test('insert returns insertId', () => {
    expect(parseResponse('insert', { insertId: 42, affectedRows: 1 } as any)).toBe(42);
  });

  test('update returns affectedRows', () => {
    expect(parseResponse('update', { insertId: 0, affectedRows: 7 } as any)).toBe(7);
  });

  test('single returns the first row, or null when empty', () => {
    const row = { id: 1 };
    expect(parseResponse('single', [row] as any)).toBe(row);
    expect(parseResponse('single', [] as any)).toBeNull();
  });

  test('scalar returns the first column of the first row', () => {
    expect(parseResponse('scalar', [{ username: 'bob', age: 9 }] as any)).toBe('bob');
    expect(parseResponse('scalar', [] as any)).toBeNull();
  });

  test('scalar preserves a falsy-but-present value (nullish ?? does not clobber 0)', () => {
    expect(parseResponse('scalar', [{ count: 0 }] as any)).toBe(0);
    expect(parseResponse('scalar', [{ flag: false }] as any)).toBe(false);
    expect(parseResponse('scalar', [{ name: '' }] as any)).toBe('');
  });

  test('default type passes the raw result through, null-safe', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(parseResponse(null as any, rows as any)).toBe(rows);
    expect(parseResponse(null as any, undefined as any)).toBeNull();
  });
});
