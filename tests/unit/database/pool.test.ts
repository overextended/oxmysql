import { describe, test, expect, beforeEach, spyOn } from 'bun:test';
import { resetNatives } from '../../setup';
import { resetDb, setPoolCreationError, getConnectionHandler, createFakeConnection } from '../../helpers/db';

const poolModule = await import('database/pool');
await poolModule.createConnectionPool();

beforeEach(() => {
  resetNatives();
  resetDb();
});

describe('createConnectionPool', () => {
  test('establishes the pool and records the server version banner', () => {
    expect(poolModule.pool).toBeDefined();
    expect(poolModule.dbVersion).toContain('8.0.0-test');
  });

  test('sets the configured transaction isolation level on each new connection', async () => {
    await poolModule.createConnectionPool();
    const handler = getConnectionHandler();
    expect(handler).toBeInstanceOf(Function);

    const conn = createFakeConnection();
    handler!(conn as any);
    expect(conn.calls[0].arg.sql).toBe('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  });

  test('logs a diagnostic instead of throwing when the pool cannot be created', async () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    setPoolCreationError(Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' }));

    await poolModule.createConnectionPool(); // must not throw

    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('Unable to establish a connection'))).toBe(true);
    logSpy.mockRestore();
  });
});
