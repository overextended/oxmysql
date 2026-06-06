import { describe, test, expect, beforeEach } from 'bun:test';
import '../../setup';
import { resetDb, setConnectionFactory, createFakeConnection } from '../../helpers/db';

const { createConnectionPool } = await import('database/pool');
await createConnectionPool();
const { MySql, getConnection } = await import('database/connection');

const asyncDispose = (c: any) => c[Symbol.asyncDispose]();

beforeEach(() => resetDb());

describe('MySql wrapper', () => {
  test('adopts the underlying connection threadId as its id', () => {
    const c = new MySql(createFakeConnection(99) as any);
    expect(c.id).toBe(99);
  });

  test('query() unwraps the [result] tuple and forwards args', async () => {
    const fake = createFakeConnection();
    fake.queue.push([{ id: 1 }]);
    const c = new MySql(fake as any);

    const result = await c.query('SELECT ?', [1]);
    expect(result).toEqual([{ id: 1 }]);
    expect(fake.calls[0]).toEqual({ op: 'query', arg: { sql: 'SELECT ?', values: [1] } });
  });

  test('execute() unwraps the result and passes the binary typeCast', async () => {
    const fake = createFakeConnection();
    fake.queue.push({ affectedRows: 2 });
    const c = new MySql(fake as any);

    const result = await c.execute('UPDATE t SET a = ?', [1]);
    expect(result).toEqual({ affectedRows: 2 });
    expect(fake.calls[0].arg.sql).toBe('UPDATE t SET a = ?');
    expect(typeof fake.calls[0].arg.typeCast).toBe('function');
  });

  test('beginTransaction sets the flag; commit/rollback clear it', async () => {
    const c = new MySql(createFakeConnection() as any);
    await c.beginTransaction();
    expect(c.transaction).toBe(true);
    await c.commit();
    expect(c.transaction).toBeUndefined();

    await c.beginTransaction();
    await c.rollback();
    expect(c.transaction).toBeUndefined();
  });
});

describe('disposal (Symbol.asyncDispose)', () => {
  test('rolls back a still-open transaction, never silently commits, then releases', async () => {
    const fake = createFakeConnection();
    const c = new MySql(fake as any);
    await c.beginTransaction();

    await asyncDispose(c);

    expect(fake.ops()).toEqual(['begin', 'rollback', 'release']);
    expect(fake.ops()).not.toContain('commit');
  });

  test('an explicitly committed transaction is just released', async () => {
    const fake = createFakeConnection();
    const c = new MySql(fake as any);
    await c.beginTransaction();
    await c.commit();

    await asyncDispose(c);

    expect(fake.ops()).toEqual(['begin', 'commit', 'release']);
  });

  test('a non-transactional connection is released without rollback', async () => {
    const fake = createFakeConnection();
    const c = new MySql(fake as any);

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
    const owner = await getConnection(); // registers activeConnections[777]
    await owner!.beginTransaction();

    const borrowed = await getConnection(777);
    expect(borrowed).toBeDefined();

    // queries still work through the borrowed handle
    fake.queue.push([{ ok: 1 }]);
    expect(await borrowed!.query('SELECT 1')).toEqual([{ ok: 1 }]);

    // disposing the borrow must NOT roll back or release the owner's connection
    await asyncDispose(borrowed);
    expect(fake.ops()).not.toContain('rollback');
    expect(fake.ops()).not.toContain('release');
  });
});
