# Documentation

## Introduction

oxmysql is a database wrapper for FiveM utilising [node-mysql2](https://github.com/sidorares/node-mysql2) offering improved performance and security.

### Comparison

TODO

### Query cache

Every executed query is being prepared and stored into cache for faster performance using prepared statements. These statements are also being sanitized from vulnerable SQL injection and accepts two types of parameters:

```lua
...'SELECT * FROM `users` WHERE `identifier` = ? AND `group` = ?', { playerIdentifier, playerGroup } ...
```

```lua
...'SELECT * FROM `users` WHERE `identifier` = :id AND `group` = :group', { id = playerIdentifier, group = playerGroup }
```

## Usage

### Execute

Will execute query and returns count of affected rows.

```lua
exports.oxmysql:execute(query, {}, function(affectedRows)

end)
print('I will be printed before query result')

--

local affectedRows = exports.oxmysql:executeSync(query, {})
print('I will be printed after query result')
```

### Insert

Async wrapper

```lua
exports.oxmysql:insert(query, {}, function(insertId)

end)
print('I will be printed before query result')

--

local insertId = exports.oxmysql:insertSync(query, {})
print('I will be printed after query result')
```
### Fetch

```lua
exports.oxmysql:fetch(query, {}, function(result)

end)
print('I will be printed before query result')

--

local result = exports.oxmysql:executeSync(query, {})
print('I will be printed after query result')
```

### Single

```lua
exports.oxmysql:execute(query, {}, function(rowData)

end)
print('I will be printed before query result')

--

local rowData = exports.oxmysql:executeSync(query, {})
print('I will be printed after query result')
```

### Scalar

```lua
exports.oxmysql:execute(query, {}, function(affectedRows)

end)
print('I will be printed before query result')

--

local affectedRows = exports.oxmysql:executeSync(query, {})
print('I will be printed after query result')
```

