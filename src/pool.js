import { createPool } from 'mysql2/promise';
import { config } from './config';
import { parseTypes } from './parser';

export const pool = createPool({
  host: config.hosts[0].host || 'localhost',
  port: config.hosts[0].port || 3306,
  user: config.username || 'root',
  password: config.password || '',
  database: config.endpoint || 'es_extended',
  charset: 'utf8mb4_unicode_ci',
  ...config.options,
  namedPlaceholders: true,
  typeCast: parseTypes,
});
