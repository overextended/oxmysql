# Documentation

## Introduction

oxmysql is a database wrapper for FiveM utilising [node-mysql2](https://github.com/sidorares/node-mysql2) offering improved performance and security. 

### Query cache

Every executed query is being prepared and stored into cache for faster performance when using prepared statements. These statements are also being sanitized from vulnerable SQL injection.

The following syntaxes are all supported.

```lua
'SELECT * FROM `users` WHERE `identifier` = ? AND `group` = ?', { playerIdentifier, playerGroup }
'SELECT * FROM `users` WHERE ?? = ? AND ?? = ?', {'identifier', playerIdentifier, 'group', playerGroup}
'SELECT * FROM `users` WHERE identifier = :identifier', {identifier=playerIdentifier}
'SELECT * FROM `users` WHERE identifier = @identifier', {['@identifier']=playerIdentifier}
```

### Installation

* Download `oxmysql.zip` from https://github.com/overextended/oxmysql/releases/latest
* Extract `oxmysql` to your resources folder
* Add `ensure oxmysql` before your resources in `server.cfg`

### Configuration

```
set mysql_connection_string "mysql://user:password@host/database?charset=utf8mb4"
set mysql_slow_query_warning 100
```
