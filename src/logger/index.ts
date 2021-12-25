import { mysql_debug, mysql_slow_query_warning, mysql_ui } from '../config';
import type { CFXParameters } from '../types';

type QueryLog = {
  [invokingResource: string]: {
    date: number;
    query: string;
    executionTime: number;
  }[];
};

const logStorage: QueryLog = {};

export const logQuery = (invokingResource: string, query: string, executionTime: number, parameters: CFXParameters) => {
  if (executionTime >= mysql_slow_query_warning || mysql_debug)
    console.log(
      `^3[${mysql_debug ? 'DEBUG' : 'WARNING'}] ${invokingResource} took ${executionTime}ms to execute a query!
    ${query} ${JSON.stringify(parameters)}^0`
    );

  if (!mysql_ui) return;

  logStorage[invokingResource].push({ query, executionTime, date: Date.now() });
};

RegisterCommand(
  'mysql',
  () => {
    if (!mysql_ui) return;

    emitNet(`oxmysql:openUi`, logStorage);
  },
  true
);
