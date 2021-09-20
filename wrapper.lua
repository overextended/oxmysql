---
-- Execute unprepared query and fetch result
--
-- @param query string
-- @param parameters table
--
-- @return table with result | false
--
exports('executeSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:execute(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---
-- Execute query and fetch all result
--
-- @param query string
-- @param parameters table
--
-- @return table with result
--
exports('fetchSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:fetch(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---
-- Execute query and fetch first row
--
-- @param query string
-- @param parameters table
--
-- @return table with result row
--
exports('singleSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:single(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---
-- Execute query and fetch first column of first row 
--
-- @param query string
-- @param parameters table
--
-- @return result
--
exports('scalarSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:scalar(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---
-- Insert data and return inserted id
--
-- @param query string
-- @param parameters table
--
-- @return insert data result
--
exports('insertSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:insert(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---
-- Update data and return affected rows
--
-- @param query string
-- @param parameters table
--
-- @return number affected rows
--
exports('updateSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:update(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---
-- Execute a transaction and return boolean depending on success
--
-- @param queries table
-- @param parameters table
--
-- @return boolean
--
exports('transactionSync', function(queries, parameters)
    local p = promise.new()
    exports['oxmysql']:transaction(queries, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)