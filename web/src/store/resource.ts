import { writable } from 'svelte/store';

export interface QueryData {
  date: number;
  query: string;
  executionTime: number;
  slow?: boolean;
}

export const queries = writable<QueryData[]>([]);
