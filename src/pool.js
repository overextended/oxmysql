import { createPool } from 'mysql2/promise';
import { parseTypes } from './parser';
import { ConnectionStringParser } from 'connection-string-parser';

const connectionString = GetConvar('mysql_connection_string', '');

if (connectionString === '') {
  throw new Error(`Set up mysql_connection_string in server.cfg`);
}

const parseSemiColons = () => {
  const parts = connectionString.split(';');
  if (parseTypes.length === 1) {
    throw new Error(
      `Set up mysql_connection_string in correct format - 'username=root;password=password;database=db;host=127.0.0.1'`
    );
  }
  return parts.reduce((connectionInfo, parameter) => {
    const [key, value] = parameter.split('=');
    connectionInfo[key] = value;
    return connectionInfo;
  }, {});
};

const createConnection = () => {
  if (connectionString.includes('database=')) {
    const options = parseSemiColons();

    return createPool({
      host: options.host || 'localhost',
      port: options.port || 3306,
      user: options.username || options.user || options.userid || 'root',
      password: options.password || options.pass || '',
      database: options.endpoint || options.database || 'es_extended',
      charset: 'utf8mb4_unicode_ci',
      connectTimeout: 30000,
      ...options.options,
      namedPlaceholders: true,
      typeCast: parseTypes,
    });
  } else {
    const options = new ConnectionStringParser({
      scheme: 'mysql',
      hosts: [],
    }).parse(connectionString);

    if (Object.keys(options).length === 0) {
      throw new Error(`Set up mysql_connection_string in correct format - 'mysql://user:password@host/database'`);
    }

    return createPool({
      host: options.hosts[0].host || 'localhost',
      port: options.hosts[0].port || 3306,
      user: options.username || 'root',
      password: options.password || '',
      database: options.endpoint || 'es_extended',
      charset: 'utf8mb4_unicode_ci',
      connectTimeout: 30000,
      ...options.options,
      namedPlaceholders: true,
      typeCast: parseTypes,
    });
  }
};

export const pool = createConnection();
