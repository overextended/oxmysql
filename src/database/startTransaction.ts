import { MySql, getConnection } from './connection';
import { logError } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseArguments } from 'utils/parseArguments';

async function runQuery(conn: MySql | null, sql: string, values: CFXParameters) {
  [sql, values] = parseArguments(sql, values);

  try {
    if (!conn) throw new Error(`Connection used by transaction timed out after 30 seconds.`);

    return await conn.query(sql, values);
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
  using conn: MySql = await getConnection();
  let response: boolean | null = false;
  let closed = false;

  if (!conn) return;

  setTimeout(() => (closed = true), 30000);

  try {
    await conn.beginTransaction();

    const commit = await queries((sql: string, values: CFXParameters) =>
      runQuery(closed ? null : conn, sql, values)
    );

    if (closed) throw new Error(`Transaction has timed out after 30 seconds.`);

    response = commit === false ? false : true;
    
    if (!response) conn.rollback();
  } catch (err: any) {
    conn.rollback();
    logError(invokingResource, cb, isPromise, err);
  } finally {
    closed = true;
  }

  return cb ? cb(response) : response;
};
