import { describe, test, expect, beforeEach, spyOn, afterEach } from 'bun:test';
import { resetNatives, setConvar, getCommand } from '../setup';
import * as config from 'config';

beforeEach(() => resetNatives());

describe('getIsolationLevelStatement', () => {
  test('maps each level to its SQL statement', () => {
    expect(config.getIsolationLevelStatement(1)).toBe('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    expect(config.getIsolationLevelStatement(2)).toBe('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    expect(config.getIsolationLevelStatement(3)).toBe('SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED');
    expect(config.getIsolationLevelStatement(4)).toBe('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
  });

  test('falls back to READ COMMITTED for unknown levels', () => {
    expect(config.getIsolationLevelStatement(99)).toBe('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  });
});

describe('getConnectionOptions', () => {
  test('parses a full mysql:// URI', () => {
    const opts = config.getConnectionOptions('mysql://user:pass@db.host:3306/mydb?charset=utf8mb4') as any;
    expect(opts).toMatchObject({
      user: 'user',
      password: 'pass',
      host: 'db.host',
      port: 3306,
      database: 'mydb',
      charset: 'utf8mb4',
    });
  });

  test('parses a URI without credentials', () => {
    const opts = config.getConnectionOptions('mysql://localhost/mydb') as any;
    expect(opts.user).toBeUndefined();
    expect(opts.password).toBeUndefined();
    expect(opts.host).toBe('localhost');
    expect(opts.database).toBe('mydb');
  });

  test('normalises key-value aliases (server/uid/pwd/db) to canonical keys', () => {
    const opts = config.getConnectionOptions('server=127.0.0.1;uid=root;pwd=secret;db=app') as any;
    expect(opts).toMatchObject({ host: '127.0.0.1', user: 'root', password: 'secret', database: 'app' });
  });

  test('applies the documented default options', () => {
    const opts = config.getConnectionOptions('mysql://localhost/db') as any;
    expect(opts).toMatchObject({
      connectTimeout: 60000,
      trace: false,
      supportBigNumbers: true,
      jsonStrings: true,
      namedPlaceholders: false,
    });
    expect(typeof opts.typeCast).toBe('function');
  });

  test('adds CONNECT_WITH_DB when a database is set, negated otherwise', () => {
    expect((config.getConnectionOptions('mysql://localhost/db') as any).flags).toContain('CONNECT_WITH_DB');
    expect((config.getConnectionOptions('host=localhost') as any).flags).toContain('-CONNECT_WITH_DB');
  });

  test('JSON-parses ssl/flags string properties', () => {
    const opts = config.getConnectionOptions('host=h;database=db;ssl={"rejectUnauthorized":false}') as any;
    expect(opts.ssl).toEqual({ rejectUnauthorized: false });
  });

  test('logs but does not throw on malformed ssl JSON', () => {
    const log = spyOn(console, 'log').mockImplementation(() => {});
    const opts = config.getConnectionOptions('host=h;ssl={bad json') as any;
    expect(opts.ssl).toBe('{bad json'); // left as the raw string
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  test('disables our placeholder converter when namedPlaceholders=false', () => {
    config.getConnectionOptions('host=h;database=db;namedPlaceholders=false');
    expect(config.convertNamedPlaceholders).toBeNull();

    config.getConnectionOptions('mysql://localhost/db');
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
