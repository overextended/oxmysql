import { pool } from '.';
import { parseArguments } from '../utils/parseArguments';
import { parseResponse } from '../utils/parseResponse';
import { logQuery } from '../logger';
import type { CFXCallback, CFXParameters, QueryResponse } from '../types';
import type { QueryType } from '../types';
import { scheduleTick } from '../utils/scheduleTick';

export const rawQuery = async (
  type: QueryType,
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  throwError?: boolean
) => {
  await scheduleTick();
  [query, parameters, cb] = parseArguments(invokingResource, query, parameters, cb);

  return await new Promise((resolve, reject) => {
    //@ts-expect-error todo: patch type with executionTime
    pool.query(query, parameters, (err, result, _, executionTime) => {
      if (err) return reject(err);

      logQuery(invokingResource, query, executionTime, parameters);
      resolve(cb ? parseResponse(type, result) : null);
    });
  })
    .then(async (result) => {
      if (cb)
        try {
          await cb(result);
        } catch (err) {
          if (typeof err === 'string') {
            if (err.includes('SCRIPT ERROR:')) return console.log(err);
            console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
          }
        }
    })
    .catch((err) => {
      const error = `${invokingResource} was unable to execute a query!\n${err.message}\n${`${query} ${JSON.stringify(
        parameters
      )}`}`;

      TriggerEvent('oxmysql:error', {
        query: query,
        parameters: parameters,
        message: err.message,
        err: err,
        resource: invokingResource,
      });

      if (cb && throwError) return cb(null, error);
      throw new Error(error);
    });
};
