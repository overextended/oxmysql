import { createPool, Pool } from 'mysql2';
import { connectionOptions, mysql_transaction_isolation_level } from '../config';
import { typeCast } from '../utils/typeCast';

let pool: Pool;
let serverReady = false;

export async function waitForConnection() {
  if (!serverReady) {
    await new Promise<void>((resolve) => {
      (function wait() {
        if (serverReady) {
          return resolve();
        }
        setTimeout(wait);
      })();
    });
  }
}

setTimeout(() => {
  pool = createPool({
    connectTimeout: 60000,
    trace: false,
    supportBigNumbers: true,
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
