RegisterNetEvent('oxmysql:openUi', function(data)
    SendNUIMessage({
        action = 'init',
        data = data
    })
    SendNUIMessage({
        action = 'setVisible',
        data = true
    })
    SetNuiFocus(true, true)
end)

RegisterNUICallback('exit', function(_, cb)
    cb(true)
    SetNuiFocus(false, false)
end)

RegisterNUICallback('fetchResource', function(resource, cb)
    TriggerServerEvent('oxmysql:fetchResource', resource)
    cb(true)
end)

RegisterNetEvent('oxmysql:loadResource', function(data)
    SendNUIMessage({
        action = 'loadResource',
        data = data
    })
end)