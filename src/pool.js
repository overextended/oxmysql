import { createPool } from 'mysql2/promise';
import { config } from './config';
import { parseTypes } from './parser';

export const pool = createPool({
  host: config.hosts[0].host || 'localhost',
  user: config.username || 'root',
  password: config.password || '',
  database: config.endpoint || 'es_extended',
  charset: 'utf8mb4_unicode_ci',
  ...config.options,
  namedPlaceholders: true,
  typeCast: parseTypes,
});
