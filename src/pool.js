import { createPool } from 'mysql2/promise';
import { parseTypes } from './parser';

const connectionString = GetConvar('mysql_connection_string', '');

if (connectionString === '') {
  throw new Error(`Set up mysql_connection_string in server.cfg`);
}

const dbOptions = (() => {
  if (connectionString.includes('mysql://')) return { uri: connectionString };
  const options = connectionString
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

  return options;
})();

const createConnection = () => {
  return createPool({
    ...dbOptions,
    namedPlaceholders: true,
    typeCast: parseTypes,
  });
};

export const pool = createConnection();
