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
  cb?: CFXCallback
) => {
  await scheduleTick();
  [query, parameters, cb] = parseArguments(invokingResource, query, parameters, cb);

  return await new Promise((resolve, reject) => {
    //@ts-expect-error todo: patch type with executionTime
    pool.query(query, parameters, (err, result, _, executionTime) => {
      if (err) return reject(err);

      logQuery(invokingResource, query, executionTime, parameters);
      resolve(cb ? cb(parseResponse(type, result)) : null);
    });
  }).catch((err) => {
    throw new Error(
      `${invokingResource} was unable to execute a query!\n${err.message}\n${`${query} ${JSON.stringify(parameters)}`}`
    );
  });
};
