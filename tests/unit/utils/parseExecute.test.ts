import { describe, test, expect } from 'bun:test';
import { executeType, parseExecute, parseValues } from 'utils/parseExecute';

describe('executeType', () => {
  test('maps INSERT/UPDATE/DELETE to insert/update/update', () => {
    expect(executeType('INSERT INTO t VALUES (?)')).toBe('insert');
    expect(executeType('UPDATE t SET a = ?')).toBe('update');
    expect(executeType('DELETE FROM t WHERE id = ?')).toBe('update');
  });

  test('returns null for SELECT and other verbs', () => {
    expect(executeType('SELECT * FROM t')).toBeNull();
    expect(executeType('REPLACE INTO t VALUES (?)')).toBeNull();
  });

  test('is case-sensitive (lowercase verbs are not recognised)', () => {
    expect(executeType('insert into t values (?)')).toBeNull();
  });

  test('does not crash on a single-word query with no space', () => {
    expect(executeType('INSERT')).toBeNull();
  });

  test('throws on a non-string query', () => {
    expect(() => executeType(42 as any)).toThrow('Expected query to be a string but received number');
  });
});

describe('parseExecute', () => {
  test('non-object parameters return an empty array', () => {
    expect(parseExecute(1, null as any)).toEqual([]);
    expect(parseExecute(1, 'nope' as any)).toEqual([]);
  });

  test('array-of-arrays is passed through unchanged', () => {
    expect(parseExecute(2, [[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
  });

  test('array-of-objects becomes positional rows with undefined→null', () => {
    expect(parseExecute(2, [{ 1: 'a', 2: 'b' }, { 1: 'c' }] as any)).toEqual([['a', 'b'], ['c', null]]);
  });

  test('a flat scalar array is wrapped into a single batch row', () => {
    expect(parseExecute(2, [1, 2])).toEqual([[1, 2]]);
  });

  test('a single positional object is normalised then wrapped', () => {
    expect(parseExecute(2, { 1: 'a', 2: 'b' } as any)).toEqual([['a', 'b']]);
  });
});

describe('parseValues', () => {
  test('object parameters become a positional array', () => {
    expect(parseValues(2, { 1: 'a', 2: 'b' } as any)).toEqual(['a', 'b']);
  });

  test('a short array is padded with null starting at its own length', () => {
    // the correct padding pattern, unlike parseArguments
    expect(parseValues(3, [1])).toEqual([1, null, null]);
  });

  test('an array at/over the placeholder count is left intact', () => {
    expect(parseValues(2, [1, 2, 3])).toEqual([1, 2, 3]);
  });
});
