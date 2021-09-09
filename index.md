# Documentation

## Introduction

oxmysql is a database wrapper for FiveM utilising [node-mysql2](https://github.com/sidorares/node-mysql2) offering improved performance and security.

### Query cache

Every executed query is being prepared and stored into cache for faster performance using prepared statements. These statements are also being sanitized from vulnerable SQL injection

```lua
'SELECT * FROM `users` WHERE `identifier` = ? AND `group` = ?', { playerIdentifier, playerGroup }
```

### Installation

* Download `oxmysql.zip` from https://github.com/overextended/oxmysql/releases/latest
* Put `oxmysql` in the `resources` folder
* Configure  in `server.cfg`
* Put `ensure oxmysql` before your resources

### Configuration

```
set mysql_connection_string "mysql://user:password@host/database?charset=utf8mb4"
set mysql_slow_query_warning 100
```
