MySQL = {
    Async = {},
    Sync = {},
}

local function safeCallback(query, callback)
	if callback then
		assert(type(callback) == 'function', query..' \nCallback must be a function type!')
	end
	return callback
end

local function safeParameters(params)
    if nil == params then
        return {}
    end

    assert(type(params) == "table", "A table is expected")
    assert(params[1] == nil, "Parameters should not be an array, but a map (key / value pair) instead")

    if next(params) == nil then
        return {}
    end

    return params
end

local function safeQuery(query)
	assert(type(query) == 'string', 'Query must be a string type!')
	assert(query ~= '', 'Query must be a non-empty string!')

	return query
end

function MySQL.ready(callback)
    Citizen.CreateThread(function ()
        while GetResourceState('oxmysql') ~= 'started' do
            Citizen.Wait(0)
        end
		callback()
    end)
end

------------
--- Sync ---
------------

function MySQL.Sync.execute(query, params) -- Execute query and fetch affected rows
	local p = promise.new()
    exports['oxmysql']:execute(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return table with result
end

function MySQL.Sync.fetchAll(query, params) -- Execute query and fetch all result
    local p = promise.new()
    exports['oxmysql']:fetch(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return table with result
end

function MySQL.Sync.insert(query, params) -- Insert data and return inserted id
    local p = promise.new()
    exports['oxmysql']:insert(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return insert data result
end

function MySQL.Sync.single(query, params) -- Execute query and fetch first row
    local p = promise.new()
    exports['oxmysql']:single(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return table with result row
end

function MySQL.Sync.fetchScalar(query, params) -- Execute query and fetch first column of first row 
    local p = promise.new()
    exports['oxmysql']:scalar(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return result
end

function MySQL.Sync.update(query, params) -- Update data and return affected rows
    local p = promise.new()
    exports['oxmysql']:update(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return number affected rows
end

function MySQL.Sync.transaction(query, params) -- Execute a transaction and return boolean depending on success
    local p = promise.new()
    exports['oxmysql']:transaction(safeQuery(query), safeParameters(params), function(result)
        p:resolve(result)
    end, GetCurrentResourceName())
    return Citizen.Await(p) -- return boolean
end

------------
-- Async --
------------

function MySQL.Async.execute(query, params, callback)
    exports['oxmysql']:execute(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end

function MySQL.Async.fetchAll(query, params, callback)
    exports['oxmysql']:fetch(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end

function MySQL.Async.insert(query, params, callback)
    exports['oxmysql']:insert(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end

function MySQL.Async.single(query, params, callback)
    exports['oxmysql']:single(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end

function MySQL.Async.fetchScalar(query, params, callback)
    exports['oxmysql']:scalar(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end

function MySQL.Async.update(query, params, callback)
    exports['oxmysql']:update(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end

function MySQL.Async.transaction(query, params, callback)
    exports['oxmysql']:transaction(safeQuery(query), safeParameters(params), function(affectedRows)
		if callback ~= nil then
			safeCallback(callback(affectedRows))
		end
	end, GetCurrentResourceName())
end
