---@param query string
---@param parameters? table|function
---@return integer result
---returns number of rows updated by the executed query
exports('executeSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:execute(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@deprecated true
---@param query string
---@param parameters? table|function
---@return table result
---returns array of matching rows or result data
exports('fetchSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:fetch(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table|function
---@return table result
---returns table containing key value pairs
exports('singleSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:single(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table|function
---@return integer|string
---returns value of the first column of a single row
exports('scalarSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:scalar(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table|function
---@return table result
---returns the last inserted id
exports('insertSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:insert(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table|function
---@return integer result
---returns number of rows updated by the executed query
exports('updateSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:update(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param queries table
---@param parameters? table|function
---@return boolean result
---returns true when the transaction has succeeded
exports('transactionSync', function(queries, parameters)
    local p = promise.new()
    exports['oxmysql']:transaction(queries, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)