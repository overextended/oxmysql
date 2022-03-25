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

  pool.query(query, parameters, (err, result, _, executionTime) => {
    logQuery(invokingResource, query, executionTime, parameters);
    if (err)
      throw new Error(
        `${invokingResource} was unable to execute a query!\n${err.message}\n${`${query} ${JSON.stringify(
          parameters
        )}`}`
      );

    if (cb) {
      cb(parseResponse(type, result));
    }
  });
};
