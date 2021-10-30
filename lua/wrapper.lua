local oxmysql = exports.oxmysql

CreateThread(function()
    Wait(1000)
    local resource = GetCurrentResourceName()
    local url = GetResourceMetadata(resource, 'url', 0)
    local version = GetResourceMetadata(resource, 'version', 0)

    PerformHttpRequest(('%s/main/lua/fxmanifest.lua'):format(url:gsub('github.com', 'raw.githubusercontent.com')), function(error, response)
        if error == 200 then
            local latest = response:match('%d%.%d+%.%d+')
            if version ~= latest then
                local curMajor, curMinor = string.strsplit('.', version)
                local newMajor, newMinor =  string.strsplit('.', response:match('%d%.%d+%.%d+'))
                local link = ('%s/releases/download/v%s/oxmysql-v%s.zip'):format(url, latest, latest)

                if tonumber(curMajor) < tonumber(newMajor) then
                    latest = 'A major update'
                elseif tonumber(curMinor) < tonumber(newMinor) then
                    latest = 'An update'
                else
                    latest = 'A patch'
                end

                print(('^3%s is available for oxmysql - please update to the latest release (current version: %s)\n   ^3- %s^0'):format(latest, version, link))
            end
        end
    end, 'GET')
end)

---@param query string
---@param parameters? table
---@return integer result
---returns array of matching rows or result data
exports('executeSync', function(query, parameters)
    local p = promise.new()
    oxmysql:execute(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table
---@return table result
---returns array of matching rows or result data
exports('fetchSync', function(query, parameters)
    local p = promise.new()
    oxmysql:fetch(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table
---@return table result
---returns table containing key value pairs
exports('singleSync', function(query, parameters)
    local p = promise.new()
    oxmysql:single(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table
---@return integer|string
---returns value of the first column of a single row
exports('scalarSync', function(query, parameters)
    local p = promise.new()
    oxmysql:scalar(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table
---@return table result
---returns the last inserted id
exports('insertSync', function(query, parameters)
    local p = promise.new()
    oxmysql:insert(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters? table
---@return integer result
---returns number of rows updated by the executed query
exports('updateSync', function(query, parameters)
    local p = promise.new()
    oxmysql:update(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param queries table
---@param parameters? table
---@return boolean result
---returns true when the transaction has succeeded
exports('transactionSync', function(queries, parameters)
    local p = promise.new()
    oxmysql:transaction(queries, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)

---@param query string
---@param parameters table
---@return any result
---supports SELECT, INSERT, UPDATE, and DELETE
---
---return value is based on the number of results and the type of query used
exports('prepareSync', function(query, parameters)
    local p = promise.new()
    oxmysql:prepare(query, parameters, function(result)
        p:resolve(result)
    end, GetInvokingResource())
    return Citizen.Await(p)
end)