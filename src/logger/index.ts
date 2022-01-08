import { mysql_debug, mysql_slow_query_warning, mysql_ui } from '../config';
import type { CFXParameters } from '../types';

interface QueryData {
  date: number;
  query: string;
  executionTime: number;
}

type QueryLog = Record<string, QueryData[]>;

const logStorage: QueryLog = {
  dunak: [
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 7.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 1.32234 },
    { date: Date.now(), query: 'SELECT * FROM linden', executionTime: 3.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 5.32234 },
    { date: Date.now(), query: 'SELECT * FROM leah', executionTime: 4.32234 },
    { date: Date.now(), query: 'SELECT * FROM liz', executionTime: 14.32234 },
    { date: Date.now(), query: 'SELECT * FROM dunak', executionTime: 27.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 0.32234 },
    { date: Date.now(), query: 'SELECT * FROM luke', executionTime: 3.32234 },
  ],
};

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

const sortQueries = (queries: QueryData[], sort: { id: 'query' | 'executionTime'; desc: boolean }) => {
  const sortedQueries = [...queries].sort((a, b) => {
    switch (sort.id) {
      case 'query':
        return a.query > b.query ? 1 : -1;
      case 'executionTime':
        return a.executionTime - b.executionTime;
      default:
        return 0;
    }
  });

  return sort.desc ? sortedQueries.reverse() : sortedQueries;
};

onNet(
  `oxmysql:fetchResource`,
  (data: { resource: string; pageIndex: number; sortBy?: { id: 'query' | 'executionTime'; desc: boolean }[] }) => {
    if (typeof data.resource !== 'string') return;

    const sort = data.sortBy ? data.sortBy[0] : false;

    const startRow = data.pageIndex * 12;
    const endRow = startRow + 12;
    const queries = sort
      ? sortQueries(logStorage[data.resource], sort).slice(startRow, endRow)
      : logStorage[data.resource].slice(startRow, endRow);
    const pageCount = Math.ceil(logStorage[data.resource].length / 12);

    if (!queries) return;

    emitNet(`oxmysql:loadResource`, source, { queries, pageCount });
  }
);
