function tprint(tbl, indent)
    if not indent then
        indent = 0
    end
    for k, v in pairs(tbl) do
        formatting = string.rep("  ", indent) .. k .. ": "
        if type(v) == "table" then
            print(formatting)
            tprint(v, indent + 1)
        elseif type(v) == 'boolean' then
            print(formatting .. tostring(v))
        else
            print(formatting .. v)
        end
    end
end

exports('executeSync', function(query, parameters)
    local p = promise.new()
    exports['oxmysql']:execute(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end)

exports('executeSync2', function(query, parameters)
    local p = promise.new()
    exports['mysql-async']:mysql_fetch_all(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end)

exports('executeSync3', function(query, parameters)
    local p = promise.new()
    exports['ghmattimysql']:execute(query, parameters, function(result)
        p:resolve(result)
    end)
    return Citizen.Await(p)
end)

RegisterCommand("mysql2", function()
    local time = os.clock()
    exports.oxmysql:executeSync('SELECT * FROM user_inventory');
    print('[Sync] mysql2: ' .. ((os.clock() - time) * 1000) .. 'ms')
end)

RegisterCommand('mysql-async', function()
    local time = os.clock()
    exports.oxmysql:executeSync2('SELECT * FROM user_inventory');
    print('[Sync] mysql-async: ' .. ((os.clock() - time) * 1000) .. 'ms')
end)

RegisterCommand("ghmat", function()
    local time = os.clock()
    exports.oxmysql:executeSync3('SELECT * FROM user_inventory');
    print('[Sync] ghmattimysql: ' .. ((os.clock() - time) * 1000) .. 'ms')
end)

local measure = function(query, params)
    print('------- ' .. query .. ' --------')
    local time = os.clock()
    exports.oxmysql:executeSync(query, params);
    print('[Sync] mysql2: ' .. ((os.clock() - time) * 1000) .. 'ms')
    time = os.clock()
    exports.oxmysql:executeSync2(query, params);
    print('[Sync] mysql-async: ' .. ((os.clock() - time) * 1000) .. 'ms')
    time = os.clock()
    exports.oxmysql:executeSync3(query, params);
    print('[Sync] ghmattimysql: ' .. ((os.clock() - time) * 1000) .. 'ms')
end

RegisterCommand("test", function()
    measure('SELECT 1')
end)
