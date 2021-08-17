---
-- Execute query and fetch affected rows
--
-- @param query tring
-- @param parameters table
--
-- @return table with result
--
local function executeSync(query, parameters)
    local p = promise.new()
    exports['oxmysql']:execute(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end
exports('executeSync', executeSync)

---
-- Execute query and fetch all result
--
-- @param query tring
-- @param parameters table
--
-- @return table with result
--
local function fetchSync(query, parameters)
    local p = promise.new()
    exports['oxmysql']:fetch(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end
exports('fetchSync', fetchSync)

---
-- Execute query and fetch first row
--
-- @param query tring
-- @param parameters table
--
-- @return table with result row
--
local function singleSync(query, parameters)
    local p = promise.new()
    exports['oxmysql']:single(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end
exports('singleSync', singleSync)

---
-- Execute query and fetch first column of first row 
--
-- @param query tring
-- @param parameters table
--
-- @return result
--
local function scalarSync(query, parameters)
    local p = promise.new()
    exports['oxmysql']:scalar(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end
exports('scalarSync', scalarSync)

---
-- Insert data and return inserted id
--
-- @param query tring
-- @param parameters table
--
-- @return insert data result
--
local function insertSync(query, parameters)
    local p = promise.new()
    exports['oxmysql']:insert(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end
exports('insertSync', insertSync)
