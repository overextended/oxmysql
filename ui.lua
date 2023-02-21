TriggerEvent("dw_morecontrols:getControls", function(cb)
    MC = cb
end)

RegisterNetEvent('oxmysql:openUi', function(data)
    if not LocalPlayer.state.isAdmin then
        return false
    end
    
    SendNUIMessage({
        action = 'openUI',
        data = data
    })
    SetNuiFocus(true, true)
    MC.StartFocus(GetCurrentResourceName())
end)

RegisterNUICallback('exit', function(_, cb)
    cb(true)
    SetNuiFocus(false, false)
    MC.EndFocus(GetCurrentResourceName())
end)

RegisterNUICallback('fetchResource', function(data, cb)
    TriggerServerEvent('oxmysql:fetchResource', data)
    cb(true)
end)

RegisterNetEvent('oxmysql:loadResource', function(data)
    SendNUIMessage({
        action = 'loadResource',
        data = data
    })
end)