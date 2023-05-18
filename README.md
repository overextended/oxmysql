# oxmysql

A FiveM resource to communicate with a MySQL database using [node-mysql2](https://github.com/sidorares/node-mysql2).

## 📚 Documentation

https://overextended.github.io/docs/oxmysql/

## 💾 Download

https://github.com/overextended/oxmysql/releases/latest/download/oxmysql.zip

![](https://img.shields.io/github/downloads/overextended/oxmysql/total?logo=github)
![](https://img.shields.io/github/downloads/overextended/oxmysql/latest/total?logo=github)

## ✨ Features

- Support for mysql-async and ghmattimysql syntax.
- Promises / async query handling allowing for non-blocking and awaitable responses.
- Improved performance and stability compared to other options.
- Support for named and unnamed placeholders, improving performance and security.
- Support for URI connection strings and semicolon separated values.
- Improved parameter checking and error handling.

## npm Package

https://www.npmjs.com/package/@overextended/oxmysql

## Lua Language Server

- Install [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) to ease development with annotations, type checking, diagnostics, and more.
- Install [cfxlua-vscode](https://marketplace.visualstudio.com/items?itemName=overextended.cfxlua-vscode) to add natives and cfxlua runtime declarations to LLS.
- You can load oxmysql into your global development environment by modifying workspace/user settings "Lua.workspace.library" with the resource path.
  - e.g. "c:\\fxserver\\resources\\oxmysql\\lib\\define.lua"
