import { describe, test, expect, beforeEach, spyOn, afterEach } from 'bun:test';
import { resetNatives, setConvar } from '../../setup';
import { resetDb, setConnectionFactory, createFakeConnection, type FakeConnection } from '../../helpers/db';
import * as config from 'config';

const { createConnectionPool } = await import('database/pool');
await createConnectionPool();
const { rawTransaction } = await import('database/rawTransaction');

let conn: FakeConnection;

beforeEach(() => {
  resetNatives();
  setConvar('mysql_debug', 'false');
  config.setDebug();
  resetDb();
  conn = createFakeConnection();
  setConnectionFactory(() => conn);
});

describe('rawTransaction', () => {
  test('begins, runs every query, commits, then releases — in order', async () => {
    let res: unknown;
    await rawTransaction('res', ['INSERT INTO t VALUES (1)', 'UPDATE t SET a = 1'], [], (r) => (res = r));
    expect(res).toBe(true);
    expect(conn.ops()).toEqual(['begin', 'query', 'query', 'commit', 'release']);
  });

  test('rolls back and reports failure when a statement throws', async () => {
    const errSpy = spyOn(console, 'error').mockImplementation(() => {});
    conn.failOn.query = new Error('constraint violation');

    let res: unknown;
    await rawTransaction('res', ['INSERT INTO t VALUES (1)'], [], (r) => (res = r));

    expect(res).toBe(false);
    expect(conn.ops()).toContain('rollback');
    expect(conn.ops()).not.toContain('commit');
    errSpy.mockRestore();
  });

  test('swallows a rollback failure while handling a statement error', async () => {
    spyOn(console, 'error').mockImplementation(() => {});
    conn.failOn.query = new Error('q fail');
    conn.failOn.rollback = new Error('rollback fail');
    let res: unknown;
    await rawTransaction('res', ['INSERT INTO t VALUES (1)'], [], (r) => (res = r));
    expect(res).toBe(false);
  });

  test('emits oxmysql:transaction-error with a non-empty query detail (transactionError returns its string)', async () => {
    spyOn(console, 'error').mockImplementation(() => {});
    const events: any[] = [];
    (globalThis as any).TriggerEvent = (name: string, payload: any) => events.push({ name, payload });
    conn.failOn.query = new Error('boom');

    await rawTransaction('res', ['INSERT INTO t (a) VALUES (?)'], [9], () => {});

    const event = events.find((e) => e.name === 'oxmysql:transaction-error');
    expect(event).toBeDefined();
    expect(typeof event.payload.query).toBe('string');
    expect(event.payload.query).toContain('INSERT INTO t (a) VALUES (?)');
  });
});
