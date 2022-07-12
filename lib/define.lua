---@meta
---EmmyLua Annotations / VSCode Lua Language Server
---https://marketplace.visualstudio.com/items?itemName=sumneko.lua


---@param query string
---@param parameters? table | fun(result: number)
---@param cb? fun(affectedRows: number)
function MySQL.update(query, parameters, cb) end
MySQL.Async.execute = MySQL.update

---@param query string
---@param parameters? table
---@return number affectedRows
function MySQL.update.await(query, parameters) end
MySQL.Sync.execute = MySQL.update.await

---@class Result
---@field affectedRows number?
---@field fieldCount number?
---@field info string?
---@field insertId number?
---@field serverStatus number?
---@field warningStatus number?
---@field changedRows number?

---@param query string
---@param parameters? table | fun(result: Result | table<number, table<string, unknown>> | nil)
---@param cb? fun(result: Result | table<number, table<string, unknown>> | nil)
function MySQL.query(query, parameters, cb) end
MySQL.Async.fetchAll = MySQL.query

---@param query string
---@param parameters? table
---@return Result | table<number, table<string, unknown>> | nil result
function MySQL.query.await(query, parameters) end
MySQL.Sync.fetchAll = MySQL.query.await

---@param query string
---@param parameters? table | fun(column: unknown | nil)
---@param cb? fun(column: unknown | nil)
function MySQL.scalar(query, parameters, cb) end
MySQL.Async.fetchScalar = MySQL.scalar

---@param query string
---@param parameters? table
---@return unknown | nil column
function MySQL.scalar.await(query, parameters) end
MySQL.Sync.fetchScalar = MySQL.scalar.await

---@param query string
---@param parameters? table | fun(row: table<string, unknown> | nil)
---@param cb? fun(row: table<string, unknown> | nil)
function MySQL.single(query, parameters, cb) end
MySQL.Async.fetchSingle = MySQL.single

---@param query string
---@param parameters? table
---@return table<string, unknown> | nil row
function MySQL.single.await(query, parameters) end
MySQL.Sync.fetchSingle = MySQL.single.await

---@param query string
---@param parameters? table | fun(insertId: number)
---@param cb? fun(insertId: number)
function MySQL.insert(query, parameters, cb) end
MySQL.Async.insert = MySQL.insert

---@param query string
---@param parameters? table
---@return number insertId
function MySQL.insert.await(query, parameters) end
MySQL.Sync.insert = MySQL.insert.await

---@param queries table
---@param parameters? table | fun(success: boolean)
---@param cb? fun(success: boolean)
function MySQL.transaction(queries, parameters, cb) end
MySQL.Async.transaction = MySQL.transaction

---@param queries table
---@param parameters? table
---@return boolean success
function MySQL.transaction.await(queries, parameters) end
MySQL.Sync.transaction = MySQL.transaction.await

---@param query string
---@param parameters table
---@param cb? fun(result: unknown | nil)
function MySQL.prepare(query, parameters, cb) end
MySQL.Async.prepare = MySQL.prepare

---@param query string
---@param parameters table
---@return unknown | nil result
function MySQL.prepare.await(query, parameters) end
MySQL.Sync.prepare = MySQL.prepare.await
