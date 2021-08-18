# Documentation

## Introduction

oxmysql is a database wrapper for FiveM utilising [node-mysql2](https://github.com/sidorares/node-mysql2) offering improved performance and security.

### Comparison

TODO

### Query cache

Every executed query is being prepared and stored into cache for faster performance using prepared statements. These statements are also being sanitized from vulnerable SQL injection and accepts two types of parameters:

```lua
...'SELECT * FROM `users` WHERE `identifier` = ? AND `group` = ?',
{ playerIdentifier, playerGroup } ...
```

```lua
...'SELECT * FROM `users` WHERE `identifier` = :id AND `group` = :group',
{ id = playerIdentifier, group = playerGroup }
```
