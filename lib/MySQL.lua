-- lib/MySQL.lua provides complete compatibility for resources using mysql-async functions
-- As of v2.0.0 this is the preferred method of interacting with oxmysql
-- * Though some function names are not 100% accurate, mysql-async provides a "standard" (for better or worse)
-- * Using this lib provides minor improvements to performance and helps debug poor queries
-- * Resources are not bound to using oxmysql where the user may prefer another option (compatibility libraries are common)

local Store = {}

local function safeArgs(query, parameters, cb, transaction)
	if type(query) == 'number' then query = Store[query] end
	if transaction then
		assert(type(query) == 'table', ('A table was expected for the transaction, but instead received %s'):format(query))
	else
		assert(type(query) == 'string', ('A string was expected for the query, but instead received %s'):format(query))
	end
	if cb then
		assert(type(cb) == 'function', ('A callback function was expected, but instead received %s'):format(cb))
	end
	local type = parameters and type(parameters)
	if type and type ~= 'table' and type ~= 'function' then
		assert(nil, ('A %s was expected, but instead received %s'):format(cb and 'table' or 'function', parameters))
	end
	return query, parameters, cb
end

local promise = promise
local oxmysql = exports.oxmysql
local GetCurrentResourceName = GetCurrentResourceName()
local Citizen_Await = Citizen.Await

local function Await(fn, query, parameters)
	local p = promise.new()
	fn(nil, query, parameters, function(result)
		p:resolve(result)
	end, GetCurrentResourceName)
	return Citizen_Await(p)
end

local MySQL = {}
--- Results will be returned to a callback function without halting the execution of the current thread.
MySQL.Async = {}
--- The current thread will yield until the query has resolved, returning results to a variable.
MySQL.Sync = {}

---@param query string
---@param cb? function
---@return number result
--- returns the id used to reference a stored query string
function MySQL.Async.store(query, cb)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	cb(store)
end

---@param query string
---@return number result
--- returns the id used to reference a stored query string
function MySQL.Sync.store(query)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	return store
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return number result
--- returns number of affected rows
function MySQL.Async.execute(query, parameters, cb)
	query, parameters, cb = safeArgs(query, parameters, cb)
	oxmysql:update_callback(query, parameters, cb, GetCurrentResourceName)
end

---@param query string
---@param parameters? table
---@return number result
--- returns number of affected rows
function MySQL.Sync.execute(query, parameters)
	return Await(oxmysql.update_callback, safeArgs(query, parameters))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return table result
--- returns array of matching rows or result data
function MySQL.Async.fetchAll(query, parameters, cb)
	query, parameters, cb = safeArgs(query, parameters, cb)
	oxmysql:query_callback(query, parameters, cb, GetCurrentResourceName)
end

---@param query string
---@param parameters? table
---@return table result
--- returns array of matching rows or result data
function MySQL.Sync.fetchAll(query, parameters)
	return Await(oxmysql.query_callback, safeArgs(query, parameters))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return any result
--- returns value of the first column of a single row
function MySQL.Async.fetchScalar(query, parameters, cb)
	query, parameters, cb = safeArgs(query, parameters, cb)
	oxmysql:scalar_callback(query, parameters, cb, GetCurrentResourceName)
end

---@param query string
---@param parameters? table
---@return any result
--- returns value of the first column of a single row
function MySQL.Sync.fetchScalar(query, parameters)
	return Await(oxmysql.scalar_callback, safeArgs(query, parameters))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return table result
--- returns table containing key value pairs
function MySQL.Async.fetchSingle(query, parameters, cb)
	query, parameters, cb = safeArgs(query, parameters, cb)
	oxmysql:single_callback(query, parameters, cb, GetCurrentResourceName)
end

---@param query string
---@param parameters? table
---@return table result
--- returns table containing key value pairs
function MySQL.Sync.fetchSingle(query, parameters)
	return Await(oxmysql.single_callback, safeArgs(query, parameters))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return number result
--- returns the insert id of the executed query
function MySQL.Async.insert(query, parameters, cb)
	query, parameters, cb = safeArgs(query, parameters, cb)
	oxmysql:insert_callback(query, parameters, cb, GetCurrentResourceName)
end

---@param query string
---@param parameters? table
---@return number result
--- returns the insert id of the executed query
function MySQL.Sync.insert(query, parameters)
	return Await(oxmysql.insert_callback, safeArgs(query, parameters))
end

---@param queries table
---@param parameters? table|function
---@param cb? function
---@return boolean result
--- returns true when the transaction has succeeded
function MySQL.Async.transaction(queries, parameters, cb)
	queries, parameters, cb = safeArgs(queries, parameters, cb, true)
	oxmysql:transaction_callback(queries, parameters, cb, GetCurrentResourceName)
end

---@param queries table
---@param parameters? table
---@return boolean result
--- returns true when the transaction has succeeded
function MySQL.Sync.transaction(queries, parameters)
	return Await(oxmysql.transaction_callback, safeArgs(queries, parameters, false, true))
end

---@param query string
---@param parameters table
---@param cb? function
---@return any result
--- Utilises a separate function to execute queries more efficiently. The return type will differ based on the query submitted.  
--- Parameters can be a single table containing placeholders (perform one query) or contain multiple tables with a set of placeholders, i.e
--- ```lua
--- MySQL.Async.prepare('SELECT * FROM users WHERE firstname = ?', {{'Dunak'}, {'Linden'}, {'Luke'}})
--- MySQL.Async.prepare('SELECT * FROM users WHERE firstname = ?', {'Linden'})
--- ````
--- When selecting a single row the result will match fetchSingle, or a single column will match fetchScalar.
function MySQL.Async.prepare(query, parameters, cb)
	oxmysql:execute_callback(query, parameters, cb, GetCurrentResourceName)
end

---@param query string
---@param parameters table
---@return any result
--- Utilises a separate function to execute queries more efficiently. The return type will differ based on the query submitted.  
--- Parameters can be a single table containing placeholders (perform one query) or contain multiple tables with a set of placeholders, i.e
--- ```lua
--- MySQL.Sync.prepare('SELECT * FROM users WHERE firstname = ?', {{'Dunak'}, {'Linden'}, {'Luke'}})
--- MySQL.Sync.prepare('SELECT * FROM users WHERE firstname = ?', {'Linden'})
--- ````
--- When selecting a single row the result will match fetchSingle, or a single column will match fetchScalar.
function MySQL.Sync.prepare(query, parameters)
	return Await(oxmysql.execute_callback, safeArgs(query, parameters))
end

function MySQL.ready(cb)
	CreateThread(function()
		repeat
			Wait(50)
		until GetResourceState('oxmysql') == 'started'
		cb()
	end)
end

_ENV.MySQL = MySQL
