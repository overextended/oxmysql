import { getPoolConnection } from './connection';
import { logError } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { setCallback } from '../utils/setCallback';

export const startTransaction = async (
  invokingResource: string,
  queries: (...args: any[]) => Promise<boolean>,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean
) => {
  cb = setCallback(parameters, cb);

  const conn = await getPoolConnection();

  if (!conn) return;

  let response = false;

  try {
    await conn.beginTransaction();

    const commit = await queries({
      query: async (sql: string, values?: CFXParameters) => {
        const [rows] = await conn.query(sql, values);
        return rows;
      },
    });

    response = !!commit;

    response ? conn.commit() : conn.rollback();
  } catch (err: any) {
    conn.rollback();
    logError(invokingResource, cb, isPromise, err);
  } finally {
    conn.release();
  }

  return cb ? cb(response) : response;
};
