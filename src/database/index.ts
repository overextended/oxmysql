import { Connection, createPool, Pool } from 'mysql2/promise';
import { connectionOptions, mysql_transaction_isolation_level, setDebug } from '../config';
import { typeCast } from '../utils/typeCast';

let pool: Pool;
let isServerConnected = false;

export async function waitForConnection() {
  if (!isServerConnected) {
    return await new Promise<boolean>((resolve) => {
      (function wait() {
        if (isServerConnected) {
          return resolve(true);
        }
        setTimeout(wait);
      })();
    });
  }
}

setDebug();

setInterval(() => {
  setDebug();
}, 1000);

setTimeout(async () => {
  const flags: string[] = [];
  flags.push(connectionOptions.database ? 'CONNECT_WITH_DB' : '-CONNECT_WITH_DB');

  pool = createPool({
    connectTimeout: 60000,
    trace: false,
    supportBigNumbers: true,
    ...connectionOptions,
    typeCast,
    namedPlaceholders: false, // we use our own named-placeholders patch, disable mysql2s
    flags: flags,
  });

  pool.on('connection', (connection) => {
    connection.query(mysql_transaction_isolation_level);
  });

  pool.on('acquire', (connection) => {
    connection.query('SET profiling_history_size = 0');
    connection.query('SET profiling = 0');
    connection.query('SET profiling = 1');
    connection.query('SET profiling_history_size = 1000');
  });

  try {
    await pool.query('SELECT DATABASE()');
    console.log(`^2Database server connection established!^0`);
    isServerConnected = true;
  } catch (err) {
    console.error(`^3Unable to establish a connection to the database!\n^3[${err}]^0`);
  }
});

export { pool, isServerConnected };
