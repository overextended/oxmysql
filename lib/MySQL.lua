local Store = {}

local function addStore(query, cb)
	assert(type(query) == 'string', 'The SQL Query must be a string')
	local store = #Store+1
	Store[store] = query
	if cb then cb(store) else return store end
end

local MySQL = {
	Sync = { store = addStore },
	Async = { store = addStore },

	ready = function(cb)
		CreateThread(function()
			repeat
				Wait(50)
			until GetResourceState('oxmysql') == 'started'
			cb()
		end)
	end
}

local type = type

local function safeArgs(query, parameters, cb, transaction)
	if type(query) == 'number' then query = Store[query] end

	if transaction then
		assert(type(query) == 'table', ('Transaction query expects a table, received %s'):format(query))
	else
		assert(type(query) == 'string', ('Query expects a string, received %s'):format(query))
	end

	if parameters then
		local type = type(parameters)
		if type ~= 'table' and type ~= 'function' then
			error(('Parameters expected table or function, received %s'):format(parameters))
		end
	end

	if cb then
		local type = type(cb)
		if type ~= 'function' and (type == 'table' and not cb.__cfx_functionReference) then
			error(('Callback expects a function, received %s'):format(cb))
		end
	end

	return query, parameters, cb
end

local oxmysql = exports.oxmysql
local GetCurrentResourceName = GetCurrentResourceName()

local function await(fn, query, parameters)
	local co = coroutine.running()
	fn(nil, query, parameters, function(result)
		return coroutine.resume(co, result)
	end, GetCurrentResourceName)
	return coroutine.yield()
end

setmetatable(MySQL, {
	__index = function(self, method)
		local state = GetResourceState('oxmysql')
		if state == 'started' or state == 'starting' then
			self[method] = setmetatable({}, {

				__call = function(_, query, parameters, cb)
					return oxmysql[method](nil, safeArgs(query, parameters, cb, method == 'transaction'))
				end,

				__index = function(_, index)
					assert(index == 'await', ('unable to index MySQL.%s.%s, expected .await'):format(method, index))
					self[method].await = function(query, parameters)
						return await(oxmysql[method], safeArgs(query, parameters, nil, method == 'transaction'))
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

local alias_mt = {
	__index = function(self, key)
		if alias[key] then
			MySQL.Async[key] = MySQL[alias[key]]
			MySQL.Sync[key] = MySQL[alias[key]].await
			alias[key] = nil
			return self[key]
		end
	end
}

setmetatable(MySQL.Async, alias_mt)
setmetatable(MySQL.Sync, alias_mt)

_ENV.MySQL = MySQL

