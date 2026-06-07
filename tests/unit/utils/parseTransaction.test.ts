import { describe, test, expect } from 'bun:test';
import { parseTransaction } from 'utils/parseTransaction';

describe('parseTransaction', () => {
  test('throws when queries is not an array', () => {
    expect(() => parseTransaction('nope' as any, [])).toThrow('Transaction queries must be array');
  });

  test('parses the [query, params][] tuple form', () => {
    const result = parseTransaction(
      [
        ['INSERT INTO t (a) VALUES (?)', ['x']],
        ['UPDATE t SET a = ? WHERE id = ?', ['y', 1]],
      ] as any,
      []
    );
    expect(result).toEqual([
      { query: 'INSERT INTO t (a) VALUES (?)', params: ['x'] },
      { query: 'UPDATE t SET a = ? WHERE id = ?', params: ['y', 1] },
    ]);
  });

  test('rejects a tuple whose params are not an object/array', () => {
    expect(() => parseTransaction([['SELECT ?', 5]] as any, [])).toThrow(
      'Transaction parameters must be array or object'
    );
  });

  test('parses the {query, values} object form', () => {
    const result = parseTransaction([{ query: 'SELECT ?', values: [1] }] as any, []);
    expect(result).toEqual([{ query: 'SELECT ?', params: [1] }]);
  });

  test('parses the {query, parameters} object form', () => {
    const result = parseTransaction([{ query: 'SELECT ?', parameters: [2] }] as any, []);
    expect(result).toEqual([{ query: 'SELECT ?', params: [2] }]);
  });

  test('applies shared parameters across plain string queries', () => {
    const result = parseTransaction(['SELECT ?', 'SELECT ?'] as any, [9]);
    expect(result).toEqual([
      { query: 'SELECT ?', params: [9] },
      { query: 'SELECT ?', params: [9] },
    ]);
  });

  test('does NOT mutate the caller-supplied shared parameters array', () => {
    const shared = [1];
    parseTransaction(['SELECT ?, ?', 'SELECT ?'] as any, shared);
    expect(shared).toEqual([1]);
  });

  test('shared parameters with differing placeholder counts do not throw based on order', () => {
    expect(() => parseTransaction(['SELECT ?, ?, ?', 'SELECT ?'] as any, [1])).not.toThrow();
  });
});
