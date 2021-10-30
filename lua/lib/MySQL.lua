-- This file allows simple conversion from MySQL-Async to Oxmysql
-- Replace any references to '@mysql-async' in your resource manifests to use '@oxmysql' instead
-- Store is used for compatibility only

local Ox = exports.oxmysql
local Resource = GetCurrentResourceName()
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

MySQL = { Async = {}, Sync = {} }

---@param query string
---@param parameters? table|function
---@param cb? function
---@return integer result
---returns number of rows updated by the executed query
MySQL.Async.execute = function(query, parameters, cb)
	Ox:update(safeArgs(query, parameters, cb))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return table result
---returns array of matching rows or result data
MySQL.Async.fetchAll = function(query, parameters, cb)
	Ox:execute(safeArgs(query, parameters, cb))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return integer|string
---returns value of the first column of a single row
MySQL.Async.fetchScalar = function(query, parameters, cb)
	Ox:scalar(safeArgs(query, parameters, cb))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return table result
---returns table containing key value pairs
MySQL.Async.fetchSingle = function(query, parameters, cb)
	Ox:single(safeArgs(query, parameters, cb))
end

---@param query string
---@param parameters? table|function
---@param cb? function
---@return table result
---returns the last inserted id
MySQL.Async.insert = function(query, parameters, cb)
	Ox:insert(safeArgs(query, parameters, cb))
end

---@param queries table
---@param parameters? table|function
---@param cb? function
---@return boolean result
---returns true when the transaction has succeeded
MySQL.Async.transaction = function(queries, parameters, cb)
	Ox:transaction(safeArgs(queries, parameters, cb, true))
end

---@param query string
---@param cb? function
---@return integer result
---returns the id used to reference a stored query string
MySQL.Async.store = function(query, cb)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	cb(store)
end

---@param query string
---@param parameters? table|function
---@return integer result
---returns number of rows updated by the executed query
MySQL.Sync.execute = function(query, parameters)
	query, parameters = safeArgs(query, parameters)
	local promise = promise.new()
	Ox:update(query, parameters, function(result)
		promise:resolve(result)
	end, Resource)
	return Citizen.Await(promise)
end

---@param query string
---@param parameters? table|function
---@return table result
---returns array of matching rows or result data
MySQL.Sync.fetchAll = function(query, parameters)
	query, parameters = safeArgs(query, parameters)
	local promise = promise.new()
	Ox:execute(query, parameters, function(result)
		promise:resolve(result)
	end, Resource)
	return Citizen.Await(promise)
end

---@param query string
---@param parameters? table|function
---@return integer|string
---returns value of the first column of a single row
MySQL.Sync.fetchScalar = function(query, parameters)
	query, parameters = safeArgs(query, parameters)
	local promise = promise.new()
	Ox:scalar(query, parameters, function(result)
		promise:resolve(result)
	end, Resource)
	return Citizen.Await(promise)
end

---@param query string
---@param parameters? table|function
---@return table result
---returns table containing key value pairs
MySQL.Sync.fetchSingle = function(query, parameters)
	query, parameters = safeArgs(query, parameters)
	local promise = promise.new()
	Ox:single(query, parameters, function(result)
		promise:resolve(result)
	end, Resource)
	return Citizen.Await(promise)
end

---@param query string
---@param parameters? table|function
---@return table result
---returns the last inserted id
MySQL.Sync.insert = function(query, parameters)
	query, parameters = safeArgs(query, parameters)
	local promise = promise.new()
	Ox:insert(query, parameters, function(result)
		promise:resolve(result)
	end, Resource)
	return Citizen.Await(promise)
end

---@param queries table
---@param parameters? table|function
---@return boolean result
---returns true when the transaction has succeeded
MySQL.Sync.transaction = function(queries, parameters)
	queries, parameters = safeArgs(queries, parameters, true)
	local promise = promise.new()
	Ox:transaction(queries, parameters, function(result)
		promise:resolve(result)
	end, Resource)
	return Citizen.Await(promise)
end

---@param query string
---@return integer result
---returns the id used to reference a stored query string
MySQL.Sync.store = function(query)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	return store
end

MySQL.ready = function(cb)
	CreateThread(function()
		repeat
			Wait(50)
		until GetResourceState('oxmysql') == 'started'
		cb()
	end)
end