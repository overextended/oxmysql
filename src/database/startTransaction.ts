import { getPoolConnection } from './connection';
import { logError } from '../logger';
import { CFXCallback, CFXParameters } from '../types';

export const startTransaction = async (
  invokingResource: string,
  queries: (...args: any[]) => Promise<boolean>,
  cb?: CFXCallback,
  isPromise?: boolean
) => {
  const conn = await getPoolConnection();

  if (!conn) return;

  let response = false;

  try {
    await conn.beginTransaction();

    const commit = await queries({
      query: (sql: string, values: CFXParameters) => {
        return conn.query(sql, values);
      },
      execute: (sql: string, values: CFXParameters) => {
        return conn.execute(sql, values);
      },
    });

    response = commit === false ? false : true;
    response ? conn.commit() : conn.rollback();
  } catch (err: any) {
    conn.rollback();
    logError(invokingResource, cb, isPromise, err);
  } finally {
    conn.release();
  }

  return cb ? cb(response) : response;
};
