import { createPool } from 'mysql2/promise';
import { parseTypes } from './parser';

const connectionString = GetConvar('mysql_connection_string', '');

if (connectionString === '') {
  throw new Error(`Set up mysql_connection_string in server.cfg`);
}

const dbOptions = (() => {
  const options = connectionString.includes('mysql://')
    ? { uri: connectionString }
    : connectionString
        .replace(/(?:host(?:name)|ip|server|data\s?source|addr(?:ess)?)=/gi, 'host=')
        .replace(/(?:user\s?(?:id|name)?|uid)=/gi, 'user=')
        .replace(/(?:pwd|pass)=/gi, 'password=')
        .replace(/(?:db)=/gi, 'database=')
        .split(';')
        .reduce((connectionInfo, parameter) => {
          const [key, value] = parameter.split('=');
          connectionInfo[key] = value;
          return connectionInfo;
        }, {});

  options.typeCast = parseTypes;
  options.namedPlaceholders = true;

  // increase the default timeout for slow servers
  options.connectTimeout = options.connectTimeout || 60000;

  // disabled to prevent SQL injection
  options.multipleStatements = options.multipleStatements || false;

  return options;
})();

export const pool = createPool(dbOptions);
