import { createPool, Pool } from 'mysql2';
import { mysql_connection_string, mysql_transaction_isolation_level } from '../config';
import { typeCast } from '../utils/typeCast';

export const parseUri = (connectionString: string) => {
  const splitMatchGroups = connectionString.match(
    new RegExp(
      '^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([\\w\\d\\-\\u0100-\\uffff.%]*)(?::([0-9]+))?)?([^?#]+)?(?:\\?([^#]*))?$'
    )
  ) as RegExpMatchArray;

  if (!splitMatchGroups) throw new Error(`mysql_connection_string structure was invalid (${connectionString})`);

  const authTarget = splitMatchGroups[2] ? splitMatchGroups[2].split(':') : [];

  const options = {
    user: authTarget[0] || undefined,
    password: authTarget[1] || undefined,
    host: splitMatchGroups[3],
    port: parseInt(splitMatchGroups[4]),
    database: splitMatchGroups[5].replace(/^\/+/, ''),
    ...(splitMatchGroups[6] &&
      splitMatchGroups[6].split('&').reduce<Record<string, string>>((connectionInfo, parameter) => {
        const [key, value] = parameter.split('=');
        connectionInfo[key] = value;
        return connectionInfo;
      }, {})),
  };

  return options;
};

const connectionOptions = (() => {
  const options = mysql_connection_string.includes('mysql://')
    ? parseUri(mysql_connection_string)
    : mysql_connection_string
        .replace(/(?:host(?:name)|ip|server|data\s?source|addr(?:ess)?)=/gi, 'host=')
        .replace(/(?:user\s?(?:id|name)?|uid)=/gi, 'user=')
        .replace(/(?:pwd|pass)=/gi, 'password=')
        .replace(/(?:db)=/gi, 'database=')
        .split(';')
        .reduce<Record<string, string>>((connectionInfo, parameter) => {
          const [key, value] = parameter.split('=');
          connectionInfo[key] = value;
          return connectionInfo;
        }, {});

  return options;
})();

let pool: Pool;
let serverReady = false;

setTimeout(() => {
  pool = createPool({
    connectTimeout: 60000,
    trace: false,
    ...connectionOptions,
    typeCast,
  });

  pool.query(mysql_transaction_isolation_level, (err) => {
    if (err) return console.error(`^3Unable to establish a connection to the database!\n^3[${err}]^0`);
    console.log(`^2Database server connection established!^0`);
    serverReady = true;
  });
});

export { pool, serverReady };
