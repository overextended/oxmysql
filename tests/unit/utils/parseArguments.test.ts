import { describe, test, expect } from 'bun:test';
import { parseArguments } from 'utils/parseArguments';

describe('parseArguments', () => {
  test('throws on a non-string query', () => {
    expect(() => parseArguments(123 as any, [])).toThrow('Expected query to be a string but received number');
  });

  describe('placeholder counting', () => {
    test('counts value placeholders', () => {
      expect(parseArguments('SELECT ?, ?', [1, 2])[1]).toEqual([1, 2]);
    });

    test('counts an identifier placeholder (??)', () => {
      // `??` is a single identifier placeholder consuming one parameter.
      const [, params] = parseArguments('SELECT * FROM ??', ['users']);
      expect(params).toEqual(['users']);
    });

    test('no placeholders leaves an empty array untouched', () => {
      expect(parseArguments('SELECT 1', [])).toEqual(['SELECT 1', []]);
    });
  });

  describe('array parameters', () => {
    test('exact count passes through unchanged', () => {
      expect(parseArguments('SELECT ?, ?', [1, 2])[1]).toEqual([1, 2]);
    });

    test('empty array is filled with nulls to the placeholder count', () => {
      expect(parseArguments('SELECT ?, ?', [])[1]).toEqual([null, null]);
    });

    test('too few parameters are padded with null at the correct indices', () => {
      const [, params] = parseArguments('SELECT ?, ?, ?', ['a']);
      expect(params).toEqual(['a', null, null]);
      expect((params as unknown[]).length).toBe(3);
    });

    test('too many parameters throw with the expected/received counts', () => {
      expect(() => parseArguments('SELECT ?', [1, 2])).toThrow('Expected 1 parameters, but received 2.');
    });
  });

  describe('numeric-keyed object parameters (no named conversion)', () => {
    test('maps 1-based keys to positional values', () => {
      // no :/@ in the query, so the 1-indexed object branch runs (no named conversion)
      const [, params] = parseArguments('SELECT ?, ?', { 1: 'a', 2: 'b' } as any);
      expect(params).toEqual(['a', 'b']);
    });

    test('missing keys coalesce to null', () => {
      const [, params] = parseArguments('SELECT ?, ?', { 1: 'a' } as any);
      expect(params).toEqual(['a', null]);
    });
  });
});
