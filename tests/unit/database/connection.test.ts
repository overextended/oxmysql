import { describe, test, expect, beforeEach } from 'bun:test';
import '../../setup';
import { resetDb, setConnectionFactory, createFakeConnection } from '../../helpers/db';

const { createConnectionPool } = await import('database/pool');
await createConnectionPool();
const { MySql, getConnection } = await import('database/connection');

const asyncDispose = (c: any) => c[Symbol.asyncDispose]();

beforeEach(() => resetDb());

describe('MySql wrapper', () => {
  test('adopts the PostgreSQL backend process id as its id', async () => {
    setConnectionFactory(() => createFakeConnection(99));
    const c = await getConnection();
    expect(c!.id).toBe(99);
  });

  test('query() unwraps the driver tuple and translates positional placeholders', async () => {
    const fake = createFakeConnection();
    fake.queue.push([{ id: 1 }]);
    setConnectionFactory(() => fake);
    const c = await getConnection();
    const result = await c!.query('SELECT ? AS id', [1]);
    expect(result).toEqual([{ id: 1 }]);
    const call = fake.calls.find((entry) => entry.arg?.sql?.includes('SELECT'));
    expect(call?.arg).toEqual({ sql: 'SELECT $1 AS id', values: [1] });
  });

  test('execute() unwraps the PostgreSQL result metadata', async () => {
    const fake = createFakeConnection();
    fake.queue.push({ affectedRows: 2 });
    setConnectionFactory(() => fake);
    const c = await getConnection();
    const result = await c!.execute('UPDATE t SET a = ?', [1]);
    expect(result).toMatchObject({ affectedRows: 2 });
    const call = fake.calls.find((entry) => entry.arg?.sql?.includes('UPDATE'));
    expect(call?.arg).toEqual({ sql: 'UPDATE t SET a = $1', values: [1] });
  });

  test('beginTransaction sets the flag; commit/rollback clear it', async () => {
    setConnectionFactory(() => createFakeConnection());
    const c = await getConnection();
    await c!.beginTransaction();
    expect(c!.transaction).toBe(true);
    await c!.commit();
    expect(c!.transaction).toBeUndefined();
    await c!.beginTransaction();
    await c!.rollback();
    expect(c!.transaction).toBeUndefined();
  });
});

describe('disposal (Symbol.asyncDispose)', () => {
  test('rolls back a still-open transaction, never silently commits, then releases', async () => {
    const fake = createFakeConnection();
    setConnectionFactory(() => fake);
    const c = await getConnection();
    await c!.beginTransaction();
    await asyncDispose(c);
    expect(fake.ops()).toEqual(['begin', 'rollback', 'release']);
    expect(fake.ops()).not.toContain('commit');
  });

  test('an explicitly committed transaction is just released', async () => {
    const fake = createFakeConnection();
    setConnectionFactory(() => fake);
    const c = await getConnection();
    await c!.beginTransaction();
    await c!.commit();
    await asyncDispose(c);
    expect(fake.ops()).toEqual(['begin', 'commit', 'release']);
  });

  test('a non-transactional connection is released without rollback', async () => {
    const fake = createFakeConnection();
    setConnectionFactory(() => fake);
    const c = await getConnection();
    await asyncDispose(c);
    expect(fake.ops()).toEqual(['release']);
  });
});

describe('getConnection', () => {
  test('wraps a freshly leased pool connection', async () => {
    setConnectionFactory(() => createFakeConnection(123));
    const conn = await getConnection();
    expect(conn).toBeInstanceOf(MySql);
    expect(conn!.id).toBe(123);
  });

  test('returns a non-owning handle for an existing connection id', async () => {
    const fake = createFakeConnection(777);
    setConnectionFactory(() => fake);
    const owner = await getConnection();
    await owner!.beginTransaction();

    const borrowed = await getConnection(777);
    expect(borrowed).toBeDefined();
    fake.queue.push([{ ok: 1 }]);
    expect(await borrowed!.query('SELECT 1')).toEqual([{ ok: 1 }]);

    await asyncDispose(borrowed);
    expect(fake.ops()).not.toContain('rollback');
    expect(fake.ops()).not.toContain('release');
  });
});
