import { test, expect } from 'bun:test';
import '../setup';

/**
 * End-to-end integration test against a REAL MySQL server.
 * Opt-in: skipped unless `DB_CONNECTION` is set.
 */
const DB = process.env.DB_CONNECTION;

test.skipIf(!DB)('full CRUD + transaction + prepare round-trip', async () => {
  (globalThis as any).exports = { oxmysql: (await import('../../src')).default };
  const { oxmysql: MySQL } = await import('../../lib/MySQL');

  await MySQL.awaitConnection();

  await MySQL.query(`DROP TABLE IF EXISTS oxmysql_test`);

  await MySQL.transaction([
    `CREATE TABLE oxmysql_test (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL DEFAULT '0',
      identifier VARCHAR(50) NOT NULL DEFAULT '0',
      PRIMARY KEY (id))`,
    'TRUNCATE oxmysql_test',
    'ALTER TABLE oxmysql_test AUTO_INCREMENT = 1',
  ]);

  const ok = await MySQL.transaction([
    { query: 'INSERT INTO oxmysql_test (identifier) VALUES (?)', values: ['abcdef1'] },
    { query: 'UPDATE oxmysql_test SET username = ? WHERE id = LAST_INSERT_ID()', values: ['bob1'] },
  ]);
  expect(ok).toBe(true);

  const insertId = await MySQL.insert('INSERT INTO oxmysql_test (identifier) VALUES (?)', ['abcdef']);
  expect(typeof insertId).toBe('number');

  const update = await MySQL.update('UPDATE oxmysql_test SET username = ? WHERE id = ?', ['bobby', insertId]);
  expect(update).toBe(1);

  const scalar = await MySQL.scalar('SELECT username FROM oxmysql_test WHERE id = ?', [insertId]);
  expect(scalar).toBe('bobby');

  const single = await MySQL.single<{ id: number; username: string }>(
    'SELECT * FROM oxmysql_test WHERE id = ?',
    [insertId]
  );
  expect(single.id).toBe(insertId);
});
