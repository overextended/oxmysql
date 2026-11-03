<div align="center">

# oxpg

A PostgreSQL-backed FiveM database resource based on the oxmysql API.

</div>

## Purpose

oxpg uses PostgreSQL through node-postgres while retaining the oxmysql-compatible Lua exports and MySQL wrapper. It is intended for FiveM servers migrating to PostgreSQL providers such as Neon.

Keep the extracted resource directory named **oxmysql** when replacing an existing oxmysql installation. Existing resources commonly call exports.oxmysql and depend on that resource name.

## Installation

1. Build or download the resource and place it in your FiveM resources directory as oxmysql.
2. Configure a PostgreSQL URL in server.cfg:

   ~~~cfg
   set mysql_connection_string "postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
   ensure oxmysql
   ~~~

3. Start oxmysql before resources that use its exports.

The resource also reads DATABASE_URL and DB_CONNECTION when the FiveM convar is not set. Do not commit database URLs, passwords, or .env files.

For Neon, copy the pooled or direct connection string from the Neon dashboard. Use sslmode=require. A pooled Neon endpoint is normally the better default for serverless connection limits; use the direct endpoint for operations that require a persistent session or unsupported pooler behaviour.

## Compatibility

The public Lua/API surface is retained: query, single, scalar, insert, update, prepare, rawExecute, transaction, startTransaction, async exports, and the mysql-async / ghmattimysql compatibility exports.

The database engine is PostgreSQL, not MySQL. Positional placeholders ? and named placeholders are converted to PostgreSQL $1, $2, and so on. MySQL backtick identifier quotes are converted to PostgreSQL double quotes. INSERT IGNORE is mapped to ON CONFLICT DO NOTHING; ordinary INSERT statements automatically use RETURNING * so the adapter can populate insertId from an id or *_id value.

This is a compatibility adapter, not a complete MySQL-to-PostgreSQL SQL transpiler. Resource SQL using ON DUPLICATE KEY UPDATE, REPLACE INTO, MySQL-specific functions, UNSIGNED, engine/charset clauses, or MySQL-specific schema migrations must be ported to PostgreSQL syntax. PostgreSQL JSONB `?`, `?|`, and `?&` operators conflict with oxmysql's positional `?` convention; use `jsonb_exists()` or `jsonb_exists_any()` instead. For upserts, use ON CONFLICT (your_unique_key) DO UPDATE SET .... PostgreSQL identifiers are case-sensitive when quoted; prefer lowercase snake_case names.

READ UNCOMMITTED is mapped to PostgreSQL READ COMMITTED, because PostgreSQL does not implement dirty reads. Query profiling through MySQL INFORMATION_SCHEMA.PROFILING is unavailable; mysql_debug uses ordinary elapsed-time logging instead.

## Development

- bun install
- bun run test
- bun run build

Use postgres:// or postgresql:// URLs. The mysql_connection_string convar name is intentionally retained for compatibility with existing server.cfg files, but its value must be a PostgreSQL connection string.
