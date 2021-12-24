-- lib/MySQL.lua provides complete compatibility for resources designed for mysql-async
-- As of v2.0.0 this is the preferred method of interacting with oxmysql
-- * You can use mysql-async syntax or oxmysql syntax (refer to issue #77 or line 118)
-- * Using this lib provides minor improvements to performance and helps debug poor queries
-- * If using mysql-async syntax, a resource is not explicity bound to using oxmysql

-- todo: new annotations; need to see if I can get it working with metatables, otherwise it'll need stubs

local MySQL = {}
MySQL.Async = {}
MySQL.Sync = {}
local Store = {}
local type = type

function MySQL.ready(cb)
	CreateThread(function()
		repeat
			Wait(50)
		until GetResourceState('oxmysql') == 'started'
		cb()
	end)
end

function MySQL.Async.store(query, cb)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	cb(store)
end

function MySQL.Sync.store(query)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	return store
end

local function safeArgs(query, parameters, cb, transaction)
	if type(query) == 'number' then query = Store[query] end
	if transaction then
		assert(type(query) == 'table', ('Transaction query expects a table, received %s'):format(query))
	else
		assert(type(query) == 'string', ('Query expects a string, received %s'):format(query))
	end
	if cb then
		assert(type(cb) == 'function', ('Callback expects a function, received %s'):format(cb))
	end
	local type = parameters and type(parameters)
	if type and type ~= 'table' and type ~= 'function' then
		assert(nil, ('Parameters expected table or function, received %s'):format(parameters))
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

setmetatable(MySQL, {
	__index = function(self, method)
		local state = GetResourceState('oxmysql')
		if state == 'started' or state == 'starting' then
			self[method] = setmetatable({}, {
				__call = function(_, query, parameters, cb)
					return oxmysql[method](nil, safeArgs(query, parameters, cb, method == 'transaction'))
				end,
				__index = function(_, await)
					assert(await == 'await', ('unable to index MySQL.%s.%s, expected .await'):format(method, await))
					self[method].await = function(query, parameters)
						return Await(oxmysql[method], safeArgs(query, parameters, nil, method == 'transaction'))
					end
					return self[method].await
				end
			})
			return self[method]
		else
			error(('^1oxmysql resource state is %s - unable to trigger exports.oxmysql:%s^0'):format(state, method), 0)
		end
	end
})

local alias = {
	fetchAll = 'query',
	fetchScalar = 'scalar',
	fetchSingle = 'single',
	insert = 'insert',
	execute = 'update',
	transaction = 'transaction',
	prepare = 'prepare'
}

local mt = {
	__index = function(self, key)
		if alias[key] then
			MySQL.Async[key] = MySQL[alias[key]]
			MySQL.Sync[key] = MySQL[alias[key]].await
			alias[key] = nil
			return self[key]
		end
	end
}

setmetatable(MySQL.Async, mt)
setmetatable(MySQL.Sync, mt)

--[[
exports.oxmysql:query (previously exports.oxmysql:execute)
MySQL.Async.fetchAll = MySQL.query
MySQL.Sync.fetchAll = MySQL.query.await


exports.oxmysql:scalar
MySQL.Async.fetchScalar = MySQL.scalar
MySQL.Sync.fetchScalar = MySQL.scalar.await


exports.oxmysql:single
MySQL.Async.fetchSingle = MySQL.single
MySQL.Sync.fetchSingle = MySQL.single.await


exports.oxmysql:insert
MySQL.Async.insert = MySQL.insert
MySQL.Sync.insert = MySQL.insert.await


exports.oxmysql:update
MySQL.Async.execute = MySQL.update
MySQL.Sync.execute = MySQL.update.await


exports.oxmysql:transaction
MySQL.Async.transaction = MySQL.transaction
MySQL.Sync.transaction = MySQL.transaction.await


exports.oxmysql:prepare
MySQL.Async.prepare = MySQL.prepare
MySQL.Sync.prepare = MySQL.prepare.await
--]]

_ENV.MySQL = MySQL
