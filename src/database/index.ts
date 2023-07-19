import { createPool, Pool, RowDataPacket } from 'mysql2/promise';
import { connectionOptions, mysql_transaction_isolation_level, setDebug } from '../config';

let pool: Pool;
let isServerConnected = false;
let dbVersion = '';

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

function setConnectionPool() {
  pool = createPool(connectionOptions);

  pool.on('connection', (connection) => {
    connection.query(mysql_transaction_isolation_level);
  });
}

setInterval(() => {
  setDebug();
}, 1000);

setTimeout(async () => {
  setDebug();
  setConnectionPool();

  try {
    const connection = await pool.getConnection();
    const [result] = await <Promise<RowDataPacket[]>> connection.query('SELECT VERSION() as version')
    dbVersion = `^5[${result[0].version}]`
    connection.release();

    console.log(`${dbVersion} ^2Database server connection established!^0`);
    isServerConnected = true;
  } catch (err: any) {
    console.log(
      `^3Unable to establish a connection to the database (${err.code})!\n^1Error ${err.errno}: ${err.message}^0`
    );
  }
});

export { pool, isServerConnected, dbVersion };
