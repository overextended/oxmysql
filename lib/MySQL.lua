_G.MySQL = {
    Sync = {},
    Async = {},
}

--
-- Replace old queries with the new query syntax
-- Ex: "SELECT * FROM `table` WHERE `column` = @something"
-- Will be: "SELECT * FROM `table` WHERE `column` = ?"
--
-- @param query
-- @param parameters for query
--
-- @return string The query updated
-- @return table The query parameters as list and not key-value
--
local function safeQueryAndParams(query, params)
    local q = query
    local prms = {}
    for column, value in pairs(params) do
        q = q:gsub(column, '?', 1):gsub('@'..column, '?', 1)
        table.insert(prms, value)
    end
    return q, prms
end

---
-- Execute a query with no result required, sync version
--
-- @param query
-- @param params
--
-- @return table with results
--
function MySQL.Sync.execute(query, params)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local p = promise.new()
    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:execute(query, params, function(retval)
        p:resolve(retval)
    end)
    return Citizen.Await(p)
end
---
-- Execute a query and fetch all results in an sync way
--
-- @param query
-- @param params
--
-- @return table Query results
--
function MySQL.Sync.fetchAll(query, params)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local p = promise.new()
    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:fetch(query, params, function(retval)
        p:resolve(retval)
    end)
    return Citizen.Await(p)
end

---
-- Execute a query and fetch the first column of the first row, sync version
-- Useful for count function by example
--
-- @param query
-- @param params
--
-- @return mixed Value of the first column in the first row
--
function MySQL.Sync.fetchScalar(query, params)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local p = promise.new()
    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:scalar(query, params, function(retval)
        p:resolve(retval)
    end)
    return Citizen.Await(p)
end

---
-- Execute a query and retrieve the last id insert, sync version
--
-- @param query
-- @param params
--
-- @return mixed Value of the last insert id
--
function MySQL.Sync.insert(query, params)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local p = promise.new()
    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:insert(query, params, function(retval)
        p:resolve(retval)
    end)
    return Citizen.Await(p)
end

---
-- Execute a List of querys and returns bool true when all are executed successfully
--
-- @param querys
-- @param params
--
-- @return bool if the transaction was successful
--
function MySQL.Sync.transaction(querys, params)
    error 'Transactions not allowed'
end

---
-- Execute a query with no result required, async version
--
-- @param query
-- @param params
-- @param func(int)
--
function MySQL.Async.execute(query, params, func)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:execute(query, params, func)
end

---
-- Execute a query and fetch all results in an async way
--
-- @param query
-- @param params
-- @param func(table)
--
function MySQL.Async.fetchAll(query, params, func)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:fetch(query, params, func)
end

---
-- Execute a query and fetch the first column of the first row, async version
-- Useful for count function by example
--
-- @param query
-- @param params
-- @param func(mixed)
--
function MySQL.Async.fetchScalar(query, params, func)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:scalar(query, params, func)
end

---
-- Execute a query and retrieve the last id insert, async version
--
-- @param query
-- @param params
-- @param func(string)
--
function MySQL.Async.insert(query, params, func)
    assert(type(query) == "string", "The SQL Query must be a string")
    assert(type(params) == "table" or params == nil, "The SQL Params must be a table")

    local query, params = safeQueryAndParams(query, params or {})
    exports['oxmysql']:insert(query, params, func)
end

---
-- Execute a List of querys and returns bool true when all are executed successfully
--
-- @param querys
-- @param params
-- @param func(bool)
--
function MySQL.Async.transaction(querys, params, func)
    error 'Transactions not allowed'
end

function MySQL.ready(callback)
    CreateThread(function()
        -- wait resource started
        while GetResourceState('oxmysql') ~= 'started' do Wait(0) end
        -- wait database connection
        while not exports['oxmysql']:ready() do Wait(50) end
        callback()
    end)
end