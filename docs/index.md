---
title: Getting Started
---

## Installation
- Download the [latest build](https://github.com/overextended/oxmysql/releases/latest) of oxmysql (not the source code).
- Extract the contents of the archive to your resources folder.
- Start the resource near the top of your resources in your `server.cfg`.
- If you have a lot of streamed assets, load them first to prevent timing out the connection.


## Configuration
You can change the configuration settings by using convars inside your `server.cfg`.
Reference the following for an idea of how to set your connection options.
You must include one of the following lines, adjusted for your connection and database settings.
```
set mysql_connection_string "mysql://root:12345@localhost/es_extended?charset=utf8mb4"
set mysql_connection_string "user=root;database=es_extended;password=12345;charset=utf8mb4"
```
Certain special characters are reserved or blocked and may cause issues when used in your password.  
You can also add the following convars if you require extra information when testing queries.
```
set mysql_slow_query_warning 150
set mysql_debug true
```
For more optional settings (such as multiple statements) you can reference [pool.d.ts](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Pool.d.ts#L10) and [connection.d.ts](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts#L8).


## Benchmark
```
Lua:	Low: 0.2167ms | Avg: 0.28788843ms |	Total: 2878.8843ms (10000 queries)
JS:		Low: 0.2098ms | Avg: 0.29384436ms |	Total: 2938.4436ms (10000 queries)
```
These benchmarks await the previous response rather than occuring asynchronously, and measure the total time spent executing the export.  
The `MySQL.Sync.prepare` function calls `exports.oxmysql:execute_async`, as used in the JS sample.

#### Lua (5.4)
```lua
local val = 10000
RegisterCommand('luasync', function()
    local queryTimesLocal = {}
    local result
    local r = MySQL.Sync.prepare('SELECT identifier from users WHERE lastname = ?', {'Linden'})
    for i=1, val do
        local time = os.nanotime()
        local r = MySQL.Sync.prepare('SELECT identifier from users WHERE lastname = ?', {'Linden'})
        queryTimesLocal[#queryTimesLocal+1] = (os.nanotime() - time) / 1000000
        if i==1 then result = r end
    end
    local queryMsLow, queryMsSum = 1000, 0
    for _, v in pairs(queryTimesLocal) do
        queryMsSum = queryMsSum + v
    end
    for _, v in pairs(queryTimesLocal) do
        if v < queryMsLow then queryMsLow = v end
    end
    local averageQueryTime = queryMsSum / #queryTimesLocal
    print(json.encode(result))
    print('Low: '.. queryMsLow ..'ms | Avg: '..averageQueryTime..'ms | Total: '..queryMsSum..'ms ('..#queryTimesLocal..' queries)')
end)

```

#### JavaScript
```js
const val = 10000
RegisterCommand('jssync', async() => {
    const queryTimesLocal = [];
    let result
    for(let i=0; i < val; i++) {
        const startTime = process.hrtime()
        const r = await exports.oxmysql.execute_async('SELECT identifier from users WHERE lastname = ?', ['Linden'])
        queryTimesLocal.push(process.hrtime(startTime)[1] / 1000000)
        if (i === 0) result = r
    }
    const queryMsSum = queryTimesLocal.reduce((a, b) => a + b, 0)
    const queryMsLow = queryTimesLocal.sort((a, b) => a - b)[0]
    const averageQueryTime = queryMsSum / queryTimesLocal.length
    console.log(result)
    console.log('Low: '+ queryMsLow +'ms | Avg: '+averageQueryTime+'ms | Total: '+queryMsSum+'ms ('+queryTimesLocal.length+' queries)')
})
```