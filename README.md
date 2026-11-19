<div align="center">

# oxmysql

A FiveM resource to communicate with a MySQL database using [node-mysql2](https://github.com/sidorares/node-mysql2).

[![](https://img.shields.io/github/downloads/overextended/oxmysql/total?style=for-the-badge&logo=github)](https://github.com/overextended/oxmysql/releases/latest/download/oxmysql.zip)
[![](https://img.shields.io/github/downloads/overextended/oxmysql/latest/total?style=for-the-badge&logo=github)](https://github.com/overextended/oxmysql/releases/latest/download/oxmysql.zip)
[![](https://img.shields.io/github/v/release/overextended/oxmysql?style=for-the-badge&logo=github)](https://github.com/overextended/oxmysql/releases/latest/)\
[![](https://badges.5metrics.dev/oxmysql/serverRank.svg?style=for-the-badge)](https://5metrics.dev/resource/oxmysql)
[![](https://badges.5metrics.dev/oxmysql/servers.svg?style=for-the-badge)](https://5metrics.dev/resource/oxmysql)
[![](https://badges.5metrics.dev/oxmysql/players.svg?style=for-the-badge)](https://5metrics.dev/resource/oxmysql)

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines and to see our Contributor License Agreement.\
Refer to [NOTICE.md](./NOTICE.md) for additional information and legal notices.

</div>

## 🔗 Links

- 💾 [Download](https://github.com/overextended/oxmysql/releases/latest/download/oxmysql.zip)
  - Download the latest release directly.
- 📚 [Documentation](https://overextended.dev/oxmysql)
  - For installation, setup, and everything else.
- 📦 [npm](https://www.npmjs.com/package/@overextended/oxmysql)
  - Use our npm package for enhanced functionality and TypeScript support.

## ✨ Features

- Support for mysql-async and ghmattimysql syntax.
- Promises / async query handling allowing for non-blocking and awaitable responses.
- Improved performance and stability compared to other options.
- Support for named and unnamed placeholders, improving performance and security.
- Support for URI connection strings and semicolon separated values.
- Improved parameter checking and error handling.

## Lua query builder

Load the imports you need in your resource's `fxmanifest.lua`:

```lua
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    '@oxmysql/lib/Builder.lua',
    'server.lua',
}
```

`Builder` provides SELECT, INSERT, and UPDATE queries and predicate operators. `MySQL` provides the existing raw SQL functions. The imports work independently and can be loaded in either order.

```lua
local users = Builder.table('users')
    :select({ 'id', 'name' })
    :where(Builder.op.eq('active', true))
    :limit(10)
    :get()

local insertId = Builder.table('users'):insert({ name = 'Avery', active = true })

local affectedRows = Builder.table('users')
    :where(Builder.op.eq('id', insertId))
    :update({ active = false })

local count = MySQL.scalar.await('SELECT COUNT(*) FROM users')
```

`insert(rowOrRows, callback?)` accepts a non-empty row map or a dense array of rows with identical column names. `update(values, callback?)` requires a `where` predicate; use `:allowAll():update(values)` to deliberately update every row. Without callbacks, both terminals await internally. Mutation values use the same scalar rules as predicates. Column map keys must be unqualified names. `select()` and `limit()` are unsupported on mutations; `where()` and `allowAll()` are unsupported on inserts.

Existing builder calls must change from `MySQL.table` / `MySQL.op` to `Builder.table` / `Builder.op` and load `@oxmysql/lib/Builder.lua`.

For coding agents, the [oxmysql query builder skill](./skills/oxmysql-query-builder/SKILL.md) covers imports, supported queries, execution behavior, and migration from the earlier `MySQL` builder namespace.

## 🧾 Logging

We have included a module for submitting error logs to [Fivemanage](https://refer.fivemanage.com/overextended), a cloud management service tailored for game servers. Additional logging options and support for other services will be available in the future.

## Lua Language Server

- Install [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) to ease development with annotations, type checking, diagnostics, and more.
- See [ox_types](https://github.com/overextended/ox_types) for our Lua type definitions.
