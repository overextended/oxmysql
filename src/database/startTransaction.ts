import { getPoolConnection } from './connection';
import { logError } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseArguments } from 'utils/parseArguments';
import { PoolConnection } from 'mysql2/promise';

async function runQuery(conn: PoolConnection | null, sql: string, values: CFXParameters) {
  [sql, values] = parseArguments(sql, values);

  try {
    if (!conn) throw new Error(`Connection used by transaction timed out after 30 seconds.`);

    const [rows] = await conn.query(sql, values);
    return rows;
  } catch (err: any) {
    throw new Error(`Query: ${sql}\n${JSON.stringify(values)}\n${err.message}`);
  }
}

export const startTransaction = async (
  invokingResource: string,
  queries: (...args: any[]) => Promise<boolean>,
  cb?: CFXCallback,
  isPromise?: boolean
) => {
  let conn: PoolConnection | null = await getPoolConnection();
  let response: boolean | null = false;

  if (!conn) return;

  setTimeout(() => (response = null), 30000);

  try {
    await conn.beginTransaction();

    const commit = await queries((sql: string, values: CFXParameters) =>
      runQuery(response === null ? null : conn, sql, values)
    );

    if (response === null) throw new Error(`Transaction has timed out after 30 seconds.`);

    response = commit === false ? false : true;
    response ? conn.commit() : conn.rollback();
  } catch (err: any) {
    conn.rollback();
    logError(invokingResource, cb, isPromise, err);
  } finally {
    conn.release();
    conn = null;
  }

  return cb ? cb(response) : response;
};
