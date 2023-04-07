import { mysql_debug, mysql_slow_query_warning, mysql_ui } from '../config';
import type { CFXParameters } from '../types';

interface QueryData {
  date: number;
  query: string;
  executionTime: number;
  slow?: boolean;
}

type QueryLog = Record<string, QueryData[]>;

const logStorage: QueryLog = {};

export const logQuery = (invokingResource: string, query: string, executionTime: number, parameters: CFXParameters) => {
  if (mysql_debug && Array.isArray(mysql_debug)) {
    if (mysql_debug.includes(invokingResource)) {
      console.log(
        `^3[DEBUG] ${invokingResource} took ${executionTime}ms to execute a query!
      ${query} ${JSON.stringify(parameters)}^0`
      );
    }
  } else if (mysql_debug || executionTime >= mysql_slow_query_warning)
    console.log(
      `^3[${mysql_debug ? 'DEBUG' : 'WARNING'}] ${invokingResource} took ${executionTime}ms to execute a query!
    ${query} ${JSON.stringify(parameters)}^0`
    );

  if (!mysql_ui) return;

  if (logStorage[invokingResource] === undefined) logStorage[invokingResource] = [];
  logStorage[invokingResource].push({
    query,
    executionTime,
    date: Date.now(),
    slow: executionTime >= mysql_slow_query_warning ? true : undefined,
  });
};

RegisterCommand(
  'mysql',
  (source: number) => {
    if (!mysql_ui) return;

    if (source < 1) {
      // source is 0 when received from the server
      console.log('^3This command cannot run server side^0');
      return;
    }

    let totalQueries: number = 0;
    let totalTime = 0;
    let slowQueries = 0;
    let chartData: { labels: string[]; data: { queries: number; time: number }[] } = { labels: [], data: [] };

    for (const resource in logStorage) {
      const queries = logStorage[resource];
      let totalResourceTime = 0;

      totalQueries += queries.length;
      totalTime += queries.reduce((totalTime, query) => (totalTime += query.executionTime), 0);
      slowQueries += queries.reduce((slowQueries, query) => (slowQueries += query.slow ? 1 : 0), 0);
      totalResourceTime += queries.reduce((totalResourceTime, query) => (totalResourceTime += query.executionTime), 0);
      chartData.labels.push(resource);
      chartData.data.push({ queries: queries.length, time: totalResourceTime });
    }

    emitNet(`oxmysql:openUi`, source, {
      resources: Object.keys(logStorage),
      totalQueries,
      slowQueries,
      totalTime,
      chartData,
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
    const resourceLog = logStorage[data.resource];

    const sort = data.sortBy && data.sortBy.length > 0 ? data.sortBy[0] : false;

    const startRow = data.pageIndex * 10;
    const endRow = startRow + 10;
    const queries = sort
      ? sortQueries(logStorage[data.resource], sort).slice(startRow, endRow)
      : logStorage[data.resource].slice(startRow, endRow);
    const pageCount = Math.ceil(resourceLog.length / 10);

    if (!queries) return;

    let resourceTime = 0;
    let resourceSlowQueries = 0;
    const resourceQueriesCount = resourceLog.length;

    for (let i = 0; i < resourceQueriesCount; i++) {
      const query = resourceLog[i];

      resourceTime += query.executionTime;
      if (query.slow) resourceSlowQueries += 1;
    }

    emitNet(`oxmysql:loadResource`, source, {
      queries,
      pageCount,
      resourceQueriesCount,
      resourceSlowQueries,
      resourceTime,
    });
  }
);
