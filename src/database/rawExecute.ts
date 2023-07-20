import { pool } from '.';
import { printError, profileBatchStatements, runProfiler } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';
import { isServerConnected, waitForConnection } from '../database';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean,
  unpack?: boolean
) => {
  if (typeof query !== 'string')
    return printError(
      invokingResource,
      cb,
      isPromise,
      query,
      `Expected query to be a string but received ${typeof query} instead.`
    );

  const type = executeType(query);
  const placeholders = query.split('?').length - 1;
  parameters = parameters ? parseExecute(placeholders, parameters) : [];

  if (!isServerConnected) await waitForConnection();

  scheduleTick();

  const connection = await pool.getConnection();

  try {
    const hasProfiler = await runProfiler(connection, invokingResource);
    const parametersLength = parameters.length == 0 ? 1 : parameters.length;
    const response = [] as any[];

    for (let index = 0; index < parametersLength; index++) {
      const values = parameters[index];

      if (values && placeholders > values.length) {
        for (let i = values.length; i < placeholders; i++) {
          values[i] = null;
        }
      }

      const [result] = await connection.execute(query, values);

      if (cb) {
        if (Array.isArray(result) && result.length > 1) {
          for (const value of result) {
            response.push(parseResponse(type, value));
          }
        } else response.push(parseResponse(type, result));
      }

      if (hasProfiler && ((index > 0 && index % 100 === 0) || index === parametersLength - 1)) {
        await profileBatchStatements(connection, invokingResource, query, parameters, index < 100 ? 0 : index);
      }

      if (index === parametersLength - 1) {
        if (!cb) return;

        try {
          if (response.length === 1) {
            if (unpack && type === null) {
              if (response[0][0] && Object.keys(response[0][0]).length === 1) {
                cb(Object.values(response[0][0])[0]);
              } else cb(response[0][0]);
            } else {
              cb(response[0]);
            }
          } else {
            cb(response);
          }
        } catch (err) {
          if (typeof err === 'string') {
            if (err.includes('SCRIPT ERROR:')) return console.log(err);
            console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
          }
        }
      }
    }
  } catch (err: any) {
    printError(invokingResource, cb, isPromise, query, err.message);

    TriggerEvent('oxmysql:error', {
      query: query,
      parameters: parameters,
      message: err.message,
      err: err,
      resource: invokingResource,
    });
  } finally {
    connection.release();
  }
};
