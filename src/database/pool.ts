import { getConnectionOptions, mysql_transaction_isolation_level } from 'config';
import { createPool } from 'mysql2/promise';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { getConnection } from './connection';

export let pool: Pool;
export let dbVersion = '';

export async function createConnectionPool() {
  const config = getConnectionOptions();

  try {
    const dbPool = createPool(config);

    dbPool.on('connection', (connection) => {
      connection.query(mysql_transaction_isolation_level);
    });

    const [result] = (await dbPool.query('SELECT VERSION() as version')) as RowDataPacket[];
    dbVersion = `^5[${result[0].version}]`;

    console.log(`${dbVersion} ^2Database server connection established!^0`);

    if (config.multipleStatements) {
      console.warn(`multipleStatements is enabled. Used incorrectly, this option may cause SQL injection.`);
    }

    pool = dbPool;
  } catch (err: any) {
    const message = err.message.includes('auth_gssapi_client')
      ? `Requested authentication using unknown plugin auth_gssapi_client.`
      : err.message;

    console.log(
      `^3Unable to establish a connection to the database (${err.code})!\n^1Error${
        err.errno ? ` ${err.errno}` : ''
      }: ${message}^0`
    );

    console.log(`See https://github.com/overextended/oxmysql/issues/154 for more information.`);

    if (config.password) config.password = '******';

    console.log(config);
  }
}
