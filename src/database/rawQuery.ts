import { pool } from '.';
import { parseArguments } from '../utils/parseArguments';
import { parseResponse } from '../utils/parseResponse';
import { logQuery } from '../logger';
import type { CFXCallback, CFXParameters } from '../types';
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

  try {
    [query, parameters, cb] = parseArguments(invokingResource, query, parameters, cb);

    const [result, _, executionTime] = await pool.query(query, parameters);

    logQuery(invokingResource, query, executionTime, parameters);

    const response = parseResponse(type, result);

    return cb ? cb(response) : response;
  } catch (e) {
    throw new Error(
      `${invokingResource} was unable to execute a query!\n${(e as Error).message}\n${
        (e as any).sql || `${query} ${JSON.stringify(parameters)}`
      }`
    );
  }
};
