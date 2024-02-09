import { getPoolConnection } from './connection';
import { logError } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { rawQuery } from './rawQuery';
import { rawExecute } from './rawExecute';

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
    const connectionId = (conn as any).connection.connectionId;
    await conn.beginTransaction();

    const commit = await queries({
      query: (sql: string, values: CFXParameters) => {
        return rawQuery(null, invokingResource, sql, values, undefined, isPromise, connectionId);
      },
      execute: (sql: string, values: CFXParameters) => {
        return rawExecute(invokingResource, sql, values, undefined, isPromise, connectionId);
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
