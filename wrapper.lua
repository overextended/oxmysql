-- @retval	Fetch all query results
exports('executeSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:execute(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

-- @retval	Fetch all query results (leftover for compatibility, same as execute)
exports('fetchSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:fetch(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

-- @retval	Returns the first row
exports('singleSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:single(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

-- @retval	Returns a single result from a column
exports('scalarSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:scalar(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

-- @retval	Returns the id of the newly inserted row
exports('insertSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:insert(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

-- @retval	Number of affected rows
exports('updateSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:update(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

-- @retval	Returns true/false when the given queries are executed
exports('transactionSync', function(queries, parameters)
    local p = promise.new()
    exports['oxmysql']:transaction(queries, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)