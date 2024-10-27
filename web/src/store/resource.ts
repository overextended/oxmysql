import { writable } from 'svelte/store';

export interface QueryData {
  date: number;
  query: string;
  executionTime: number;
  slow?: boolean;
}

export const queries = writable<QueryData[]>([]);

export const resourceData = writable<{
  resourceQueriesCount: number;
  resourceSlowQueries: number;
  resourceTime: number;
}>({
  resourceQueriesCount: 0,
  resourceSlowQueries: 0,
  resourceTime: 0,
});

export const filterData = writable({ search: '', page: 0 });
