import type { PoolConfig } from './database/driver';

export const mysql_connection_string =
  GetConvar('mysql_connection_string', '') ||
  process.env.DATABASE_URL ||
  process.env.DB_CONNECTION ||
  'postgresql://postgres@localhost/postgres';
export let mysql_ui = GetConvar('mysql_ui', 'false') === 'true';
export let mysql_slow_query_warning = GetConvarInt('mysql_slow_query_warning', 200);
export let mysql_debug: boolean | string[] = false;
export let mysql_log_size = 0;

export function setDebug() {
  mysql_ui = GetConvar('mysql_ui', 'false') === 'true';
  mysql_slow_query_warning = GetConvarInt('mysql_slow_query_warning', 200);
  try {
    const debug = GetConvar('mysql_debug', 'false');
    mysql_debug = debug === 'false' ? false : JSON.parse(debug);
  } catch {
    mysql_debug = true;
  }
  mysql_log_size = mysql_debug ? 10000 : GetConvarInt('mysql_log_size', 100);
}

export function getIsolationLevelStatement(level: number) {
  const query = 'SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL';
  switch (level) {
    case 1: return query + ' REPEATABLE READ';
    case 4: return query + ' SERIALIZABLE';
    case 2:
    case 3:
    default: return query + ' READ COMMITTED';
  }
}

export const mysql_transaction_isolation_level = getIsolationLevelStatement(
  GetConvarInt('mysql_transaction_isolation_level', 2),
);
export let convertNamedPlaceholders: null | ((query: string, parameters: Record<string, any>) => [string, any[]]);

function parseKeyValueString(connectionString: string) {
  return connectionString.split(';').reduce<Record<string, string>>((connectionInfo, parameter) => {
    const separator = parameter.indexOf('=');
    if (separator === -1) return connectionInfo;
    const key = parameter.slice(0, separator).trim();
    const value = parameter.slice(separator + 1).trim();
    if (key) connectionInfo[key] = value;
    return connectionInfo;
  }, {});
}

export function getConnectionOptions(connectionString: string = mysql_connection_string): PoolConfig {
  if (/^mysql:\/\//i.test(connectionString)) throw new Error('oxpg requires a PostgreSQL URL (postgres:// or postgresql://); mysql:// connections cannot be used.');
  const isPostgresUri = /^postgres(?:ql)?:\/\//i.test(connectionString);
  const rawOptions: Record<string, any> = isPostgresUri ? { connectionString } : parseKeyValueString(connectionString);
  const options: Record<string, any> = {};
  const aliases: Record<string, string> = {
    hostname: 'host', ip: 'host', server: 'host', datasource: 'host', addr: 'host', address: 'host',
    uid: 'user', userid: 'user', username: 'user', pwd: 'password', pass: 'password', db: 'database',
    connectionlimit: 'max', connecttimeout: 'connectionTimeoutMillis', connectiontimeout: 'connectionTimeoutMillis',
  };

  for (const [key, value] of Object.entries(rawOptions)) {
    const normalized = key.toLowerCase().replace(/[\s_-]+/g, '');
    options[aliases[normalized] || key] = value;
  }

  convertNamedPlaceholders = options.namedPlaceholders === 'false' ? null : require('named-placeholders')();
  let ssl = options.ssl;
  if (typeof ssl === 'string') {
    if (ssl.toLowerCase() === 'true') ssl = true;
    else if (ssl.toLowerCase() === 'false') ssl = false;
    else {
      try { ssl = JSON.parse(ssl); }
      catch (error) { console.log('^3Failed to parse PostgreSQL ssl configuration (' + error + ')!^0'); }
    }
  }

  const config: Record<string, unknown> = { connectionTimeoutMillis: 60000, max: 10 };
  const supportedOptions = [
    'connectionString', 'host', 'port', 'database', 'user', 'password', 'ssl', 'max', 'min',
    'idleTimeoutMillis', 'connectionTimeoutMillis', 'application_name', 'allowExitOnIdle', 'keepAlive',
    'keepAliveInitialDelayMillis',
  ];
  for (const key of supportedOptions) if (options[key] !== undefined) config[key] = options[key];
  if (config.port !== undefined) config.port = Number(config.port);
  if (config.max !== undefined) config.max = Number(config.max);
  if (config.min !== undefined) config.min = Number(config.min);
  if (config.idleTimeoutMillis !== undefined) config.idleTimeoutMillis = Number(config.idleTimeoutMillis);
  if (config.connectionTimeoutMillis !== undefined) config.connectionTimeoutMillis = Number(config.connectionTimeoutMillis);
  if (ssl !== undefined) config.ssl = ssl;
  return config as PoolConfig;
}

RegisterCommand(
  'oxmysql_debug',
  (source: number, args: string[]) => {
    if (source !== 0) return console.log('^3This command can only be run server side^0');
    switch (args[0]) {
      case 'add':
        if (!Array.isArray(mysql_debug)) mysql_debug = [];
        mysql_debug.push(args[1]);
        SetConvar('mysql_debug', JSON.stringify(mysql_debug));
        return console.log('^3Added ' + args[1] + ' to mysql_debug^0');
      case 'remove':
        if (Array.isArray(mysql_debug)) {
          const index = mysql_debug.indexOf(args[1]);
          if (index === -1) return;
          mysql_debug.splice(index, 1);
          if (mysql_debug.length === 0) mysql_debug = false;
          SetConvar('mysql_debug', JSON.stringify(mysql_debug));
          return console.log('^3Removed ' + args[1] + ' from mysql_debug^0');
        }
      default:
        return console.log('^3Usage: oxmysql add|remove <resource>^0');
    }
  },
  true,
);
