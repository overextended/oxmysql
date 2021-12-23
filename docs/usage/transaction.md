---
title: transaction
---
todo - update formatting and information


# Transactions
A transaction executes multiple queries and commits them only if all succeed. If one fails, none of the queries are committed. The return value is a `boolean`, which is the result of the transaction.

## Specific Format
When using the `Specific` format you must pass one parameter to the oxmysql export. In this case, the `queries` parameter contains your queries and the SQL variables unique to each query.

This is useful for transactions where the queries do not share many SQL variables.

### Usage
Lua
```lua
local queries = {
    { query = 'INSERT INTO `test` (id) VALUES (:someid)', values = { ['someid'] = 1 } },
    { query = 'INSERT INTO `test` (id) VALUES (:someid)', values = { ['someid'] = 2 } }
} -- NOTE, the 'values' tables can be named 'parameters' here for MySQL-Async compatibility.

-- Async
exports.oxmysql:transaction(queries, function(result) 
    print(result) 
end)

-- Sync
local result = exports.oxmysql:transactionSync(queries)
print(result)
```

JavaScript
```js
const queries = [
    { query = 'INSERT INTO `test` (id) VALUES (:someid)', values = { someid = 1 } },
    { query = 'INSERT INTO `test` (id) VALUES (:someid)', values = { someid = 2 } }
] // NOTE, the 'values' objects can be named 'parameters' here for MySQL-Async compatibility.

// Async
exports.oxmysql.transaction(queries, (result) => {
    console.log(result)
})

// Sync
const result = await exports.oxmysql.transactionSync(queries)
console.log(result)
```

### Shared Format
When using the `Shared` format you must pass two parameters to the oxmysql export. The `queries` and the `parameters` those queries will use.  
This is useful if your queries use the same SQL variables.

Lua
```lua
local queries = {
    'INSERT INTO `test` (id, name) VALUES (:someid, :somename)',
    'SET `name` = :newname IN `test` WHERE `id` = :someid'
}

local parameters = { ['someid'] = 2, ['somename'] = 'John Doe', ['newname'] = 'John Notdoe' }

-- Async
exports.oxmysql:transaction(queries, parameters, function(result) 
    print(result) 
end)

-- Sync
local result = exports.oxmysql:transactionSync(queries, parameters)
print(result)
```

JavaScript
```js
const queries = [
    'INSERT INTO `test` (id, name) VALUES (:someid, :somename)',
    'SET `name` = :newname IN `test` WHERE `id` = :someid'
]

const parameters = { someid = 2, somename = 'John Doe', newname = 'John Notdoe' }

// Async
exports.oxmysql.transaction(queries, parameters, (result) => {
    console.log(result)
})

// Sync
const result = await exports.oxmysql.transactionSync(queries, parameters)
console.log(result)
```

## Transaction Isolation Level

This can be set through the convar `mysql_transaction_isolation_level` which should be an integer ranging from `1-4`. The default convar value set by oxmysql is `2`.


| Convar Value | Result           |
| -------------- | ------------------ |
| 1            | Repeatable Read  |
| 2            | Read Committed   |
| 3            | Read Uncommitted |
| 4            | Serializable     |
