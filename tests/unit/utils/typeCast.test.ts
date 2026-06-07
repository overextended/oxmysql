import { describe, test, expect, mock } from 'bun:test';
import { typeCast, typeCastExecute } from 'utils/typeCast';

type FieldOpts = {
  type: string;
  length?: number;
  charset?: number;
  string?: () => string | null;
  buffer?: () => Buffer | null;
};

function field(opts: FieldOpts) {
  return {
    type: opts.type,
    length: opts.length ?? 0,
    charset: opts.charset ?? 33, // utf8 by default
    string: opts.string ?? (() => null),
    buffer: opts.buffer ?? (() => null),
  } as any;
}

const BINARY_CHARSET = 63;

describe('typeCast (text protocol)', () => {
  test('DATETIME/TIMESTAMP become epoch milliseconds', () => {
    const next = mock(() => 'unused');
    const result = typeCast(field({ type: 'DATETIME', string: () => '2024-01-02 03:04:05' }), next);
    expect(result).toBe(new Date('2024-01-02 03:04:05').getTime());
    expect(next).not.toHaveBeenCalled();
  });

  test('a null date returns null', () => {
    expect(typeCast(field({ type: 'TIMESTAMP', string: () => null }), mock(() => 0))).toBeNull();
  });

  test('DATE is anchored to midnight', () => {
    const result = typeCast(field({ type: 'DATE', string: () => '2024-01-02' }), mock(() => 0));
    expect(result).toBe(new Date('2024-01-02 00:00:00').getTime());
  });

  test('TINY(1) maps to a boolean, wider TINY defers to next()', () => {
    expect(typeCast(field({ type: 'TINY', length: 1, string: () => '1' }), mock(() => 0))).toBe(true);
    expect(typeCast(field({ type: 'TINY', length: 1, string: () => '0' }), mock(() => 0))).toBe(false);
    expect(typeCast(field({ type: 'TINY', length: 3, string: () => '7' }), () => 7)).toBe(7);
    expect(typeCast(field({ type: 'TINY', length: 1, string: () => null }), () => null)).toBe(null);
  });

  test('BIT(1) maps to a boolean', () => {
    expect(typeCast(field({ type: 'BIT', length: 1, buffer: () => Buffer.from([1]) }), mock(() => 0))).toBe(true);
    expect(typeCast(field({ type: 'BIT', length: 1, buffer: () => Buffer.from([0]) }), mock(() => 0))).toBe(false);
    expect(typeCast(field({ type: 'BIT', length: 1, buffer: () => null }), () => null)).toBe(null);
  });

  test('a binary BLOB becomes a plain number array', () => {
    const result = typeCast(
      field({ type: 'BLOB', charset: BINARY_CHARSET, buffer: () => Buffer.from([1, 2, 3]) }),
      mock(() => 0)
    );
    expect(result).toEqual([1, 2, 3]);
    expect(Array.isArray(result)).toBe(true);
  });

  test('a NULL binary BLOB returns [null]', () => {
    const result = typeCast(field({ type: 'BLOB', charset: BINARY_CHARSET, buffer: () => null }), mock(() => 0));
    expect(result).toEqual([null]);
  });

  test('a non-binary BLOB (text charset) returns its string', () => {
    const result = typeCast(field({ type: 'BLOB', charset: 33, string: () => 'hello' }), mock(() => 0));
    expect(result).toBe('hello');
  });

  test('unknown types defer to next()', () => {
    const next = mock(() => 'defaulted');
    expect(typeCast(field({ type: 'VARCHAR', string: () => 'x' }), next)).toBe('defaulted');
    expect(next).toHaveBeenCalled();
  });
});

describe('typeCastExecute (binary protocol)', () => {
  test('handles dates like the text caster', () => {
    const result = typeCastExecute(field({ type: 'DATETIME', string: () => '2024-01-02 03:04:05' }), mock(() => 0));
    expect(result).toBe(new Date('2024-01-02 03:04:05').getTime());
  });

  test('defers everything else to next() (does not touch BLOBs)', () => {
    const next = mock(() => 'native');
    expect(typeCastExecute(field({ type: 'BLOB', charset: BINARY_CHARSET }), next)).toBe('native');
    expect(next).toHaveBeenCalled();
  });
});
