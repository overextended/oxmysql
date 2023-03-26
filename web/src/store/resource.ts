import { derived, writable } from 'svelte/store';

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

export const tablePage = writable(0);

let timer: NodeJS.Timer;
export const debouncedTablePage = derived(tablePage, ($tablePage, set) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    set($tablePage);
  }, 300);
});
