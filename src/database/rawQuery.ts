import { pool, serverReady, waitForConnection } from '.';
import { parseArguments } from '../utils/parseArguments';
import { parseResponse } from '../utils/parseResponse';
import { logQuery } from '../logger';
import type { CFXCallback, CFXParameters } from '../types';
import type { QueryType } from '../types';
import { scheduleTick } from '../utils/scheduleTick';

export const rawQuery = (
  type: QueryType,
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  throwError?: boolean
) => {
  if (typeof query !== 'string')
    throw new Error(
      `${invokingResource} was unable to execute a query!\nExpected query to be a string but received ${typeof query} instead.`
    );

  [query, parameters, cb] = parseArguments(invokingResource, query, parameters, cb);
  scheduleTick();

  return new Promise(async (resolve, reject) => {
    if (!serverReady) await waitForConnection();

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
