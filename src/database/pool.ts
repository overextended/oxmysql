import { getConnectionOptions, mysql_transaction_isolation_level } from 'config';
import { createPool, type Pool, type RowDataPacket } from './driver';

export let pool: Pool;
export let dbVersion = '';

export async function createConnectionPool() {
  const config = getConnectionOptions();

  try {
    const dbPool = createPool(config);

    dbPool.on('connection', (connection) => {
      void connection.query(mysql_transaction_isolation_level).catch((error) => {
        console.warn('Unable to configure PostgreSQL transaction isolation: ' + error);
      });
    });

    const [result] = await dbPool.query('SELECT version() AS version');
    const rows = result as RowDataPacket[];
    dbVersion = '^5[' + (rows[0]?.version ?? 'PostgreSQL') + ']';

    console.log(dbVersion + ' ^2Database server connection established!^0');
    pool = dbPool;
  } catch (err: any) {
    const message = err?.message ?? String(err);
    console.log(
      '^3Unable to establish a PostgreSQL database connection (' +
        (err?.code ?? 'UNKNOWN') +
        ')!\n^1Error: ' +
        message +
        '^0',
    );

    // Never print a raw connection string: it may contain the database password.
    const safeConfig: Record<string, unknown> = { ...config };
    if (typeof safeConfig.password === 'string') safeConfig.password = '******';
    if (typeof safeConfig.connectionString === 'string') {
      safeConfig.connectionString = safeConfig.connectionString.replace(/(postgres(?:ql)?:\/\/[^:/@]+:)[^@]+@/i, '$1******@');
    }
    console.log(safeConfig);
  }
}
