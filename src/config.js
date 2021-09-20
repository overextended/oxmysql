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

let isolationLevel;
switch (GetConvarInt('mysql_transaction_isolation_level', 2)) {
  case 1:
    isolationLevel = 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ';
    break;
  case 2:
    isolationLevel = 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED';
    break;
  case 3:
    isolationLevel = 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED';
    break;
  case 4:
    isolationLevel = 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE';
    break;
  default:
    break;
};

const resourceName = GetCurrentResourceName() || 'oxmysql';

export { config, slowQueryWarning, debug, isolationLevel, resourceName };
