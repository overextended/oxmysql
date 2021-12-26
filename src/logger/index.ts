import { mysql_debug, mysql_slow_query_warning, mysql_ui } from '../config';
import type { CFXParameters } from '../types';

interface QueryData {
  date: number;
  query: string;
  executionTime: number
}

type QueryLog = {
  [invokingResource: string]: QueryData[];
};

const logStorage: QueryLog = {};

export const logQuery = (invokingResource: string, query: string, executionTime: number, parameters: CFXParameters) => {
  if (executionTime >= mysql_slow_query_warning || mysql_debug)
    console.log(
      `^3[${mysql_debug ? 'DEBUG' : 'WARNING'}] ${invokingResource} took ${executionTime}ms to execute a query!
    ${query} ${JSON.stringify(parameters)}^0`
    );

  if (!mysql_ui) return;

  if (logStorage[invokingResource] === undefined) logStorage[invokingResource] = []
  logStorage[invokingResource].push({ query, executionTime, date: Date.now() });

};

RegisterCommand(
  'mysql',
  (source: number) => {
    if (!mysql_ui) return;

    emitNet(`oxmysql:openUi`, source, logStorage);
  },
  true
);
