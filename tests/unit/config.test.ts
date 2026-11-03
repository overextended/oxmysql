import { describe, test, expect, beforeEach, spyOn, afterEach } from 'bun:test';
import { resetNatives, setConvar, getCommand } from '../setup';
import * as config from 'config';

beforeEach(() => resetNatives());

describe('getIsolationLevelStatement', () => {
  test('maps PostgreSQL isolation levels', () => {
    expect(config.getIsolationLevelStatement(1)).toBe('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    expect(config.getIsolationLevelStatement(2)).toBe('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED');
    expect(config.getIsolationLevelStatement(3)).toBe('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED');
    expect(config.getIsolationLevelStatement(4)).toBe('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE');
  });
  test('falls back to READ COMMITTED for unknown levels', () => {
    expect(config.getIsolationLevelStatement(99)).toBe('SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED');
  });
});

describe('getConnectionOptions', () => {
  test('accepts a PostgreSQL URI without exposing credentials as separate log fields', () => {
    const uri = 'postgresql://user:pass@db.host:5432/mydb?sslmode=require';
    expect(config.getConnectionOptions(uri)).toMatchObject({
      connectionString: uri,
      connectionTimeoutMillis: 60000,
      max: 10,
    });
  });
  test('accepts postgres:// URIs', () => {
    const uri = 'postgres://localhost/mydb';
    expect(config.getConnectionOptions(uri).connectionString).toBe(uri);
  });
  test('normalises key-value aliases (server/uid/pwd/db) to PostgreSQL options', () => {
    expect(config.getConnectionOptions('server=127.0.0.1;uid=root;pwd=secret;db=app')).toMatchObject({
      host: '127.0.0.1',
      user: 'root',
      password: 'secret',
      database: 'app',
    });
  });
  test('applies safe pool defaults', () => {
    expect(config.getConnectionOptions('host=localhost;database=app')).toMatchObject({
      connectionTimeoutMillis: 60000,
      max: 10,
    });
  });
  test('parses pool options', () => {
    expect(config.getConnectionOptions('host=h;max=20;connectionTimeoutMillis=30000')).toMatchObject({
      host: 'h',
      max: 20,
      connectionTimeoutMillis: 30000,
    });
  });
  test('JSON-parses ssl string properties', () => {
    expect(config.getConnectionOptions('host=h;ssl={"rejectUnauthorized":false}').ssl).toEqual({
      rejectUnauthorized: false,
    });
  });
  test('logs but does not throw on malformed ssl JSON', () => {
    const log = spyOn(console, 'log').mockImplementation(() => {});
    const opts = config.getConnectionOptions('host=h;ssl={bad json');
    expect(opts.ssl).toBe('{bad json');
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
  test('disables our placeholder converter when namedPlaceholders=false', () => {
    config.getConnectionOptions('host=h;database=db;namedPlaceholders=false');
    expect(config.convertNamedPlaceholders).toBeNull();
    config.getConnectionOptions('postgresql://localhost/db');
    expect(typeof config.convertNamedPlaceholders).toBe('function');
  });
});

describe('setDebug', () => {
  afterEach(() => spyOn(console, 'log').mockRestore());
  test('disables debug and uses the configured log size when mysql_debug=false', () => {
    setConvar('mysql_debug', 'false');
    setConvar('mysql_log_size', '250');
    config.setDebug();
    expect(config.mysql_debug).toBe(false);
    expect(config.mysql_log_size).toBe(250);
  });
  test('parses a JSON array of resources and forces a large log size', () => {
    setConvar('mysql_debug', '["resA","resB"]');
    config.setDebug();
    expect(config.mysql_debug).toEqual(['resA', 'resB']);
    expect(config.mysql_log_size).toBe(10000);
  });
  test('falls back to debug=true on malformed JSON', () => {
    setConvar('mysql_debug', 'not-json');
    config.setDebug();
    expect(config.mysql_debug).toBe(true);
  });
  test('reads ui and slow-query convars', () => {
    setConvar('mysql_ui', 'true');
    setConvar('mysql_slow_query_warning', '500');
    config.setDebug();
    expect(config.mysql_ui).toBe(true);
    expect(config.mysql_slow_query_warning).toBe(500);
  });
});

describe('oxmysql_debug command', () => {
  afterEach(() => spyOn(console, 'log').mockRestore());
  test('add then remove a resource toggles the debug list', () => {
    spyOn(console, 'log').mockImplementation(() => {});
    const handler = getCommand('oxmysql_debug')!;
    handler(0, ['add', 'my-resource']);
    expect(Array.isArray(config.mysql_debug) && config.mysql_debug.includes('my-resource')).toBe(true);
    handler(0, ['remove', 'my-resource']);
    expect(Array.isArray(config.mysql_debug) ? config.mysql_debug.includes('my-resource') : false).toBe(false);
  });
  test('refuses to run client-side (source !== 0)', () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    getCommand('oxmysql_debug')!(5, ['add', 'x']);
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes('can only be run server side'))).toBe(true);
  });
});
