import { mysql_debug, mysql_slow_query_warning, mysql_ui } from '../config';
import type { CFXParameters } from '../types';

interface QueryData {
  date: number;
  query: string;
  executionTime: number;
}

type QueryLog = Record<string, QueryData[]>;

const logStorage: QueryLog = {};

export const logQuery = (invokingResource: string, query: string, executionTime: number, parameters: CFXParameters) => {
  if (executionTime >= mysql_slow_query_warning || mysql_debug)
    console.log(
      `^3[${mysql_debug ? 'DEBUG' : 'WARNING'}] ${invokingResource} took ${executionTime}ms to execute a query!
    ${query} ${JSON.stringify(parameters)}^0`
    );

  if (!mysql_ui) return;

  if (logStorage[invokingResource] === undefined) logStorage[invokingResource] = [];
  logStorage[invokingResource].push({ query, executionTime, date: Date.now() });
};

RegisterCommand(
  'mysql',
  (source: number) => {
    if (!mysql_ui) return;

    let totalQueries: number = 0;
    let totalTime = 0;

    for (const resource in logStorage) {
      const queries = logStorage[resource];

      totalQueries += queries.length;
      totalTime += queries.reduce((totalTime, query) => (totalTime += query.executionTime), 0);
    }

    emitNet(`oxmysql:openUi`, source, {
      resources: Object.keys(logStorage),
      totalQueries,
      totalTime,
    });
  },
  true
);

onNet(`oxmysql:fetchResource`, (data: {resource: string, pageIndex: number}) => {
  if (typeof data.resource !== 'string') return;

  const queries = logStorage[data.resource].slice(data.pageIndex * 12, data.pageIndex + 12)

  const pageCount = Math.ceil(logStorage[data.resource].length / 12)

  if (!queries) return;

  emitNet(`oxmysql:loadResource`, source, {queries, pageCount});
});
