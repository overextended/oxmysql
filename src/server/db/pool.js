import { createPool } from 'mysql2/promise';
import { mysql_connection_string, mysql_transaction_isolation_level, typeCast } from '../config.js';

const connectionString = (() => {
  if (mysql_connection_string === '') throw new Error(`^1Missing mysql_connection_string in server.cfg! Refer to the documentation^0`);

  if (mysql_connection_string.includes('mysql://')) return { uri: mysql_connection_string };

  const options = mysql_connection_string
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

const pool = createPool({
  typeCast: typeCast,
  connectTimeout: 60000,
  ...connectionString,
});

pool
  .query(mysql_transaction_isolation_level)
  .then(() => {
    console.log(`^2Database server connection established!^0`);
  })
  .catch((err) => {
    console.error(`^3Unable to establish a connection to the database! [${err.code}]\n${err.message}^0`);
  });

export default pool;
