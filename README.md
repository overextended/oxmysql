# oxmysql

A FiveM resource to communicate with a MySQL database using [node-mysql2](https://github.com/sidorares/node-mysql2).

![](https://img.shields.io/github/downloads/overextended/oxmysql/total?logo=github)
![](https://img.shields.io/github/downloads/overextended/oxmysql/latest/total?logo=github)
![](https://img.shields.io/github/contributors/overextended/oxmysql?logo=github)
![](https://img.shields.io/github/v/release/overextended/oxmysql?logo=github) 

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

## 🧾 Logging

We have included a module for submitting error logs to [Fivemanage](https://fivemanage.com/?ref=overextended), a cloud management service tailored for game servers. Additional logging options and support for other services will be available in the future.

## Lua Language Server

- Install [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) to ease development with annotations, type checking, diagnostics, and more.
- See [ox_types](https://github.com/overextended/ox_types) for our Lua type definitions.