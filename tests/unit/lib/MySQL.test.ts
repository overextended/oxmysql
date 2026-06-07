import { describe, test, expect, beforeEach } from 'bun:test';
import '../../setup';

// Fake server-side export surface: records the last dispatched call and
// resolves/rejects via the injected callback.
let lastCall: { name: string; query: unknown; params: unknown; resource: unknown } | null = null;
let nextResult: unknown = 'RESULT';
let nextError: string | undefined;

function method(name: string) {
  return (query: unknown, params: unknown, cb: any, resource: unknown) => {
    lastCall = { name, query, params, resource };
    if (typeof cb === 'function') cb(nextError ? null : nextResult, nextError);
  };
}

(globalThis as any).exports = {
  oxmysql: {
    query: method('query'),
    single: method('single'),
    scalar: method('scalar'),
    update: method('update'),
    insert: method('insert'),
    prepare: method('prepare'),
    rawExecute: method('rawExecute'),
    transaction: method('transaction'),
    isReady: () => true,
    awaitConnection: async () => true,
    startTransaction: (cb: unknown, resource: unknown) => {
      lastCall = { name: 'startTransaction', query: cb, params: undefined, resource };
      return Promise.resolve(true);
    },
  },
};

// import after wiring exports: lib binds exp = global.exports.oxmysql at load
const { oxmysql } = await import('../../../lib/MySQL');

beforeEach(() => {
  lastCall = null;
  nextResult = 'RESULT';
  nextError = undefined;
});

describe('store', () => {
  test('accepts a string and returns a usable 0-based reference', async () => {
    const ref = oxmysql.store('SELECT 1');
    expect(typeof ref).toBe('number');

    await oxmysql.query(ref as any);
    expect(lastCall?.query).toBe('SELECT 1');
  });

  test('throws when given a non-string', () => {
    expect(() => oxmysql.store(5 as any)).toThrow('Query expects a string');
  });
});

describe('argument validation (safeArgs)', () => {
  test('rejects a non-string, non-number query', () => {
    expect(oxmysql.query({} as any)).rejects.toThrow('First argument expected string');
  });

  test('rejects an out-of-range query-store reference', () => {
    expect(oxmysql.query(9999 as any)).rejects.toThrow('invalid query store reference');
  });

  test('rejects parameters that are neither object nor function', () => {
    expect(oxmysql.query('SELECT 1', 'bad' as any)).rejects.toThrow('Second argument expected object or function');
  });

  test('a function in the params slot is treated as the callback', async () => {
    let received: unknown;
    await oxmysql.query('SELECT 1', (r) => (received = r));
    expect(lastCall?.query).toBe('SELECT 1');
    expect(lastCall?.params).toBeUndefined();
    expect(received).toBe('RESULT');
  });

  test('transaction requires an object/array first argument', () => {
    expect(oxmysql.transaction('nope' as any)).rejects.toThrow('First argument expected object');
  });
});

describe('dispatch & promise behaviour', () => {
  test('each method calls the matching server export', async () => {
    await oxmysql.single('q', [1]);
    expect(lastCall?.name).toBe('single');
    await oxmysql.insert('q', [1]);
    expect(lastCall?.name).toBe('insert');
    await oxmysql.transaction([['q', [1]]] as any);
    expect(lastCall?.name).toBe('transaction');
  });

  test('resolves with the server result', async () => {
    nextResult = 123;
    await expect(oxmysql.scalar('q', [1])).resolves.toBe(123);
  });

  test('rejects when the server returns an error', async () => {
    nextError = 'boom';
    await expect(oxmysql.update('q', [1])).rejects.toBe('boom');
  });

  test('prepare and rawExecute dispatch to their server exports', async () => {
    await oxmysql.prepare('q', [1]);
    expect(lastCall?.name).toBe('prepare');
    await oxmysql.rawExecute('q', [1]);
    expect(lastCall?.name).toBe('rawExecute');
  });

  test('passthrough exports (isReady/awaitConnection/startTransaction)', async () => {
    expect(oxmysql.isReady()).toBe(true);
    await expect(oxmysql.awaitConnection()).resolves.toBe(true);
    const fn = async () => true;
    await oxmysql.startTransaction(fn);
    expect(lastCall?.name).toBe('startTransaction');
    expect(lastCall?.query).toBe(fn);
  });
});

describe('ready', () => {
  test('invokes the callback once the resource is started', async () => {
    await new Promise<void>((resolve) => oxmysql.ready(() => resolve()));
  });
});
