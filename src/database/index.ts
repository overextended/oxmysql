import { createPool, QueryError, Pool } from 'mysql2/promise';
import { connectionOptions, mysql_transaction_isolation_level } from '../config';
import { typeCast } from '../utils/typeCast';

let pool: Pool;
let serverReady = false;

setTimeout(() => {
  pool = createPool({
    connectTimeout: 60000,
    ...connectionOptions,
    typeCast,
  });

  pool
    .query(mysql_transaction_isolation_level)
    .then(() => {
      console.log(`^2Database server connection established!^0`);
      serverReady = true;
    })
    .catch((e: QueryError) =>
      console.error(`^3Unable to establish a connection to the database! [${e.code}]\n${e.message}^0`)
    );
});

export { pool, serverReady };
