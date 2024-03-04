import { getPoolConnection } from './connection';
import { logError } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseArguments } from 'utils/parseArguments';

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

    const commit = await queries(async (sql: string, values: CFXParameters) => {
      [sql, values] = parseArguments(sql, values);
      const [rows] = await conn.query(sql, values);
      return rows;
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
