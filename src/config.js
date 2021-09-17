import { ConnectionStringParser } from 'connection-string-parser';

const connectionString = GetConvar('mysql_connection_string', '');

if (connectionString === '') throw new Error(`Set up mysql_connection_string in server.cfg`);

const config = new ConnectionStringParser({
  scheme: 'mysql',
  hosts: [],
}).parse(connectionString);

if (Object.keys(config).length === 0)
  throw new Error(`Set up mysql_connection_string in correct format - 'mysql://user:password@host/database'`);

const slowQueryWarning = GetConvarInt('mysql_slow_query_warning', 100);
const debug = GetConvar('mysql_debug', 'false') === 'true';

export { config, slowQueryWarning, debug };
