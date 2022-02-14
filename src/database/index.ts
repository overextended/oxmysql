import { createPool, QueryError } from 'mysql2/promise';
import { connectionOptions, mysql_transaction_isolation_level } from '../config';
import { typeCast } from '../utils/typeCast';

const pool = createPool({
  connectTimeout: 60000,
  ...connectionOptions,
  typeCast,
});

pool
  .query(mysql_transaction_isolation_level)
  .then(() => console.log(`^2Database server connection established!^0`))
  .catch((e: QueryError) =>
    setInterval(
      () => console.error(`^3Unable to establish a connection to the database! [${e.code}]\n${e.message}^0`),
      5000
    )
  );

export { pool };
