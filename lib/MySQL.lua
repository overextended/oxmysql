-- This file allows simple conversion from MySQL-Async to Oxmysql
-- Replace any references to '@mysql-async' in your resource manifests to use '@oxmysql' instead
-- Store is used for compatibility only

local Ox = exports.oxmysql
local Resource = GetCurrentResourceName()
local Store = {}

local function safeArgs(query, parameters, cb)
	if type(query) == 'number' then query = Store[query] end
	assert(type(query) == 'string', ('A string was expected for the query, but instead received %s'):format(query))
	if cb then
		assert(type(cb) == 'function', ('A callback function was expected, but instead received %s'):format(cb))
	end
	local type = parameters and type(parameters)
	if type and type ~= 'table' and type ~= 'function' then
		assert(nil, ('A %s was expected, but instead received %s'):format(cb and 'table' or 'function', parameters))
	end
	return query, parameters, cb
end

MySQL = {
	Async = {
		execute = function(query, parameters, cb)
			Ox:update(safeArgs(query, parameters, cb))
		end,

		fetchAll = function(query, parameters, cb)
			Ox:execute(safeArgs(query, parameters, cb))
		end,

		fetchScalar = function(query, parameters, cb)
			Ox:scalar(safeArgs(query, parameters, cb))
		end,

		fetchSingle = function(query, parameters, cb)
			Ox:single(safeArgs(query, parameters, cb))
		end,

		insert = function(query, parameters, cb)
			Ox:insert(safeArgs(query, parameters, cb))
		end,

		transaction = function(query, parameters, cb)
			Ox:transaction(safeArgs(query, parameters, cb))
		end,

		store = function(query, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local store = #Store+1
			Store[store] = query
			cb(store)
		end,
	},

	Sync = {
		execute = function(query, parameters)
			query, parameters = safeArgs(query, parameters)
			local promise = promise.new()
			Ox:update(query, parameters, function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		fetchAll = function(query, parameters)
			query, parameters = safeArgs(query, parameters)
			local promise = promise.new()
			Ox:execute(query, parameters, function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		fetchScalar = function(query, parameters)
			query, parameters = safeArgs(query, parameters)
			local promise = promise.new()
			Ox:scalar(query, parameters, function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		fetchSingle = function(query, parameters)
			query, parameters = safeArgs(query, parameters)
			local promise = promise.new()
			Ox:single(query, parameters, function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		insert = function(query, parameters)
			query, parameters = safeArgs(query, parameters)
			local promise = promise.new()
			Ox:insert(query, parameters, function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		transaction = function(query, parameters)
			query, parameters = safeArgs(query, parameters)
			local promise = promise.new()
			Ox:transaction(query, parameters, function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		store = function(query, parameters)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local store = #Store+1
			Store[store] = query
			return store
		end,
	},

	ready = function(cb)
		CreateThread(function()
			repeat
				Wait(50)
			until GetResourceState('oxmysql') == 'started'
			cb()
		end)
	end
}
