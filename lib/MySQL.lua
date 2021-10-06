-- This file allows simple conversion from MySQL-Async to Oxmysql
-- Replace any references to '@mysql-async' in your resource manifests to use '@oxmysql' instead
-- Store is used for compatibility only

local Ox = exports.oxmysql
local Resource = GetCurrentResourceName()

local function safeParameters(parameters)
	if not parameters or next(parameters) == nil then
		return {[''] = ''}
	end
	assert(type(parameters) == 'table', 'Parameters must be a table')
    return parameters
end
local Store = {}

MySQL = {
	Async = {
		execute = function(query, parameters, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			Ox:update(query, safeParameters(parameters), cb)
		end,

		fetchAll = function(query, parameters, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			Ox:execute(query, safeParameters(parameters), cb)
		end,

		fetchScalar = function(query, parameters, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			Ox:scalar(query, safeParameters(parameters), cb)
		end,

		fetchSingle = function(query, parameters, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			Ox:single(query, safeParameters(parameters), cb)
		end,

		insert = function(query, parameters, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			Ox:insert(query, safeParameters(parameters), cb)
		end,

		transaction = function(query, parameters, cb)
			assert(type(query) == 'string', 'The SQL Query must be a string')
			Ox:transaction(query, safeParameters(parameters), cb)
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
			if type(query) == 'number' then
				query = Store[query]
			end
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local promise = promise.new()
			Ox:update(query, safeParameters(parameters), function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		fetchAll = function(query, parameters)
			if type(query) == 'number' then
				query = Store[query]
			end
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local promise = promise.new()
			Ox:execute(query, safeParameters(parameters), function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		fetchScalar = function(query, parameters)
			if type(query) == 'number' then
				query = Store[query]
			end
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local promise = promise.new()
			Ox:scalar(query, safeParameters(parameters), function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		fetchSingle = function(query, parameters)
			if type(query) == 'number' then
				query = Store[query]
			end
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local promise = promise.new()
			Ox:scalar(query, safeParameters(parameters), function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		insert = function(query, parameters)
			if type(query) == 'number' then
				query = Store[query]
			end
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local promise = promise.new()
			Ox:scalar(query, safeParameters(parameters), function(result)
				promise:resolve(result)
			end, Resource)
			return Citizen.Await(promise)
		end,

		transaction = function(query, parameters)
			if type(query) == 'number' then
				query = Store[query]
			end
			assert(type(query) == 'string', 'The SQL Query must be a string')
			local promise = promise.new()
			Ox:scalar(query, safeParameters(parameters), function(result)
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