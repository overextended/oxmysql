import './env';
import { oxmysql as MySQL } from '../lib/MySQL';

/**
 * @todo More elaborate tests.
 * This is currently just lifted from the benchmarking script.
 */

await MySQL.query(`DROP TABLE IF EXISTS oxmysql_test`);

await MySQL.transaction([
  'DROP TABLE IF EXISTS oxmysql_test',
  `CREATE TABLE oxmysql_test (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL DEFAULT '0',
    identifier VARCHAR(50) NOT NULL DEFAULT '0',
    PRIMARY KEY (id))`,
  'TRUNCATE oxmysql_test',
  'ALTER TABLE oxmysql_test AUTO_INCREMENT = 1',
]);

await MySQL.transaction([
  { query: 'INSERT INTO oxmysql_test (identifier) VALUES (?)', values: ['abcdef1'] },
  {
    query: 'UPDATE oxmysql_test SET username = ? WHERE id = LAST_INSERT_ID()',
    values: ['bob1'],
  },
]);

await MySQL.transaction([
  ['INSERT INTO oxmysql_test (identifier) VALUES (?)', ['abcdef2']],
  ['UPDATE oxmysql_test SET username = ? WHERE id = LAST_INSERT_ID()', ['bob2']]
])

await MySQL.transaction([
  'INSERT INTO oxmysql_test (identifier) VALUES ("abcdef3")',
  'UPDATE oxmysql_test SET username = "bob3" WHERE id = LAST_INSERT_ID()',
])

const insertUsers: [string, string[]][] = Array.from(
  { length: 10000 },
  (_, i) => [
    'INSERT INTO oxmysql_test (username, identifier) VALUES (?, ?)',
    [`Testuser_${i + 1}`, `abcdef${i + 1}`],
  ]
);

await MySQL.transaction(insertUsers)

const selectUserIds = Array.from(
  { length: 2500 },
  (_, i) => [`abcdef${(i + 1) * 4}`]
);

await MySQL.prepare('SELECT id FROM oxmysql_test WHERE identifier = ? LIMIT 1', selectUserIds)

const insertId = await MySQL.insert('INSERT INTO oxmysql_test (identifier) VALUES (?)', ['abcdef']);
const update = await MySQL.update('UPDATE oxmysql_test SET username = ? WHERE id = ?', ['bobby', insertId]);
const scalar = await MySQL.scalar('SELECT username FROM oxmysql_test WHERE id = ?', [insertId]);
const single = await MySQL.single('SELECT * FROM oxmysql_test WHERE id = ?', [insertId]);

console.log(insertId, update, scalar, single)