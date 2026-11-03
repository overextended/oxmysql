import { describe, test, expect } from 'bun:test';
import { countPlaceholders, translateSql } from 'database/driver';

describe('PostgreSQL SQL adapter', () => {
  test('counts placeholders while ignoring question marks in literals and comments', () => {
    expect(countPlaceholders("SELECT '?' AS literal, ? AS value -- ?\n/* ? */")).toBe(1);
  });

  test('counts identifier placeholders for argument validation, then rejects them during translation', () => {
    expect(countPlaceholders('SELECT * FROM ??')).toBe(1);
    expect(() => translateSql('SELECT * FROM ??', ['users'])).toThrow('identifier placeholders');
  });

  test('converts placeholders without changing question marks inside literals or comments', () => {
    const result = translateSql("SELECT '?' AS literal, ? AS value -- ?\n", [12]);
    expect(result.sql).toBe("SELECT '?' AS literal, $1 AS value -- ?\n");
    expect(result.values).toEqual([12]);
  });

  test('converts MySQL identifier quotes', () => {
    const backtick = String.fromCharCode(96);
    const result = translateSql('SELECT * FROM ' + backtick + 'users' + backtick + ' WHERE id = ?', [5]);
    expect(result.sql).toBe('SELECT * FROM "users" WHERE id = $1');
  });

  test('maps INSERT IGNORE and returns the generated row', () => {
    const backtick = String.fromCharCode(96);
    const result = translateSql('INSERT IGNORE INTO ' + backtick + 'users' + backtick + ' (name) VALUES (?)', ['sam']);
    expect(result.sql).toBe('INSERT INTO "users" (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *');
  });

  test('adds RETURNING to ordinary inserts so insertId can be recovered', () => {
    const result = translateSql('INSERT INTO players (name) VALUES (?)', ['sam']);
    expect(result.sql).toBe('INSERT INTO players (name) VALUES ($1) RETURNING *');
  });

  test('does not add RETURNING twice', () => {
    const result = translateSql('INSERT INTO players (name) VALUES (?) RETURNING id', ['sam']);
    expect(result.sql).toBe('INSERT INTO players (name) VALUES ($1) RETURNING id');
  });

  test('rejects MySQL duplicate-key syntax instead of sending invalid SQL', () => {
    expect(() => translateSql('INSERT INTO t (id) VALUES (?) ON DUPLICATE KEY UPDATE id = VALUES(id)', [1]))
      .toThrow('ON DUPLICATE KEY UPDATE');
  });

  test('rejects a placeholder count mismatch', () => {
    expect(() => translateSql('SELECT ?', [])).toThrow('placeholder count mismatch');
  });

  test('converts PostgreSQL dollar-quoted function bodies without changing their placeholders', () => {
    const sql = 'SELECT $$ ? literal $$ AS body, ? AS value';
    const result = translateSql(sql, [9]);
    expect(result.sql).toBe('SELECT $$ ? literal $$ AS body, $1 AS value');
  });
});
