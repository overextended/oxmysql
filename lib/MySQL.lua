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
	local queryType = type(query)

	if queryType == 'number' then
		query = Store[query]
	elseif transaction then
		if queryType ~= 'table' then
			error(("First argument expected table, received '%s'"):format(query))
		end
	elseif queryType ~= 'string' then
		error(("First argument expected string, received '%s'"):format(query))
	end

	if parameters then
		local paramType = type(parameters)

		if paramType ~= 'table' and paramType ~= 'function' then
			error(("Second argument expected table or function, received '%s'"):format(parameters))
		end

		if paramType == 'function' or parameters.__cfx_functionReference then
			cb = parameters
			parameters = nil
		end
	end

	if cb and parameters then
		local cbType = type(cb)

		if cbType ~= 'function' and (cbType == 'table' and not cb.__cfx_functionReference) then
			error(("Third argument expected function, received '%s'"):format(cb))
		end
	end

	return query, parameters, cb
end

local promise = promise
local oxmysql = exports.oxmysql
local Await = Citizen.Await
local GetCurrentResourceName = GetCurrentResourceName()

local function await(fn, query, parameters)
	local p = promise.new()
	fn(nil, query, parameters, function(result, error)
		if error then
			return p:reject(error)
		end

		p:resolve(result)
	end, GetCurrentResourceName, true)
	return Await(p)
end

setmetatable(MySQL, {
	__index = function(self, method)
		local state = GetResourceState('oxmysql')
		if state == 'started' or state == 'starting' then
			self[method] = setmetatable({}, {

				__call = function(_, query, parameters, cb)
					query, parameters, cb = safeArgs(query, parameters, cb, method == 'transaction')
					return oxmysql[method](nil, query, parameters, cb, GetCurrentResourceName, false)
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
