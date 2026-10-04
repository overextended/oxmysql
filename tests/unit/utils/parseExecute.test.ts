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
  test('a sparse flat positional array binds its missing first placeholder as null', () => {
    const parameters = new Array(2);
    parameters[1] = 'citizen-A';

    expect(0 in parameters).toBe(false);
    expect(parseExecute(2, parameters as any)).toEqual([[null, 'citizen-A']]);
  });

  test('an explicit undefined first placeholder becomes null', () => {
    expect(parseExecute(2, [undefined, 'citizen-A'])).toEqual([[null, 'citizen-A']]);
  });

  test('an interior sparse placeholder becomes null without reordering values', () => {
    const parameters = new Array(3);
    parameters[0] = 0;
    parameters[2] = 'citizen-A';

    expect(parseExecute(3, parameters)).toEqual([[0, null, 'citizen-A']]);
  });

  test('explicit null and valid falsey values are preserved', () => {
    expect(parseExecute(2, [null, 'citizen-A'])).toEqual([[null, 'citizen-A']]);
    expect(parseExecute(2, [0, false])).toEqual([[0, false]]);
    expect(parseExecute(2, ['', 'citizen-A'])).toEqual([['', 'citizen-A']]);
  });

  test('short flat and batch rows receive trailing null padding', () => {
    expect(parseExecute(3, [1])).toEqual([[1, null, null]]);
    expect(parseExecute(3, [[1], [2, 3]])).toEqual([
      [1, null, null],
      [2, 3, null],
    ]);
  });

  test('sparse and undefined placeholders in batch rows become null', () => {
    const sparse = new Array(3);
    sparse[1] = false;

    expect(parseExecute(3, [sparse, [0, undefined, '']])).toEqual([
      [null, false, null],
      [0, null, ''],
    ]);
  });

  test('mixed positional-object and array batch rows retain their ordering', () => {
    expect(parseExecute(2, [{ 2: 'citizen-A' }, [0, false]] as any)).toEqual([
      [null, 'citizen-A'],
      [0, false],
    ]);
  });

  test('excess parameters remain available for existing driver error handling', () => {
    expect(parseExecute(2, [1, 2, 3])).toEqual([[1, 2, 3]]);
    expect(parseExecute(1, [1, undefined])).toEqual([[1, undefined]]);
    expect(parseExecute(2, [[0, false, '']])).toEqual([[0, false, '']]);
  });

  test('non-object parameters return an empty array', () => {
    expect(parseExecute(1, null as any)).toEqual([]);
    expect(parseExecute(1, 'nope' as any)).toEqual([]);
  });

  test('array-of-arrays is passed through unchanged', () => {
    expect(
      parseExecute(2, [
        [1, 2],
        [3, 4],
      ]),
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('array-of-objects becomes positional rows with undefined→null', () => {
    expect(parseExecute(2, [{ 1: 'a', 2: 'b' }, { 1: 'c' }] as any)).toEqual([
      ['a', 'b'],
      ['c', null],
    ]);
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
