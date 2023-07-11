import { createPool, Pool } from 'mysql2/promise';
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
  pool = createPool({
    connectTimeout: 60000,
    trace: false,
    supportBigNumbers: true,
    ...connectionOptions,
    typeCast,
    namedPlaceholders: false, // we use our own named-placeholders patch, disable mysql2s
  });

  const connection = await pool.getConnection();

  try {
    connection.query(mysql_transaction_isolation_level);
    console.log(`^2Database server connection established!^0`);
    isServerConnected = true;
  } catch (err) {
    console.error(`^3Unable to establish a connection to the database!\n^3[${err}]^0`);
  }

  connection.release()
});

export { pool, isServerConnected };
