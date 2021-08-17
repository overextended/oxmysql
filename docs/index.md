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
For more optional settings (such as multiple statements) you can reference [pool.d.ts](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Pool.d.ts#L10) and [connection.d.ts](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts#L8).

You can also add the following convars if you require extra information when testing queries.
```
set mysql_slow_query_warning 100
set mysql_debug true
```


## Sync vs. async
Asychronous behaviour does not _truly_ exist in any of the scripting runtimes utilised, with tasks being performed in a queue each tick. 
Two variants of exports are provided for users, and their names describe their behaviour as part of the active "thread" being executed.  

The following export is "asynchronous" and will execute in order, however the result will be delayed until a result is returned rather than pausing execution of following code.
```lua
	print('This print will display first')
	exports.oxmysql:scalar('SELECT group FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
		print('Group: '..result)
	end)
	print('This print will display second')
```

Conversely, the following export will halt the active thread and wait for it to resolve before continuing.  
Furthermore, the result will be returned inline (left-hand assignment) rather than being locally scoped to the callback function.
```lua
	print('This print will display first')
	local result = exports.oxmysql:scalarSync('SELECT group FROM users WHERE identifier = ?', {playerIdentifier})
	print('Group: '..result)
	print('This print will display third')
```


## Benchmark
```
Lua:	Low: 0.2955ms | High: 16.7566ms	| Avg: 0.36956378ms |	Total: 3695.6378ms (10000 queries)
JS:		Low: 0.2831ms | High: 5.1899ms	| Avg: 0.33495788ms |	Total: 3349.5788ms (10000 queries)
```
These benchmark _exports_ rather than actual query speed, resulting in extra delays due to serialisation and overhead. Lua generally falls _slightly_ behind, but the amount is negligible. Furthermore we utilise the _sync_ variants for this, so a query will only execute once the previous one has returned.

Feel free to run your own tests.
#### Lua (5.4)
```lua
local val = 10000
RegisterCommand('luasync', function()
	local queryTimesLocal = {}
	local result
	for i=1, val do
		local time = os.nanotime()
		local r = exports.oxmysql:scalarSync('SELECT * from users')
		queryTimesLocal[#queryTimesLocal+1] = (os.nanotime() - time) / 1000000
		if i==1 then result = r end
	end
	local queryMsLow, queryMsHigh, queryMsSum = 1000, 0, 0
	for _, v in pairs(queryTimesLocal) do
		queryMsSum = queryMsSum + v
	end
	for _, v in pairs(queryTimesLocal) do
		if v > queryMsHigh then queryMsHigh = v end
	end
	for _, v in pairs(queryTimesLocal) do
		if v < queryMsLow then queryMsLow = v end
	end
	local averageQueryTime = queryMsSum / #queryTimesLocal
	print(json.encode(result))
	print('Low: '.. queryMsLow ..'ms | High: '..queryMsHigh..'ms | Avg: '..averageQueryTime..'ms | Total: '..queryMsSum..'ms ('..#queryTimesLocal..' queries)')
end)
```

####
```js
const val = 10000
RegisterCommand('jssync', async() => {
    const queryTimesLocal = [];
	let result
    for(let i=0; i < val; i++) {
        const startTime = process.hrtime.bigint()
        const r = await exports.oxmysql.scalarSync('SELECT * from users')
        queryTimesLocal.push(Number(process.hrtime.bigint() - startTime) / 1000000)
        if (i === 0) result = 1
    }
    const queryMsSum = queryTimesLocal.reduce((a, b) => a + b, 0)
    const queryMsHigh = queryTimesLocal.sort((a, b) => b - a)[0]
    const queryMsLow = queryTimesLocal.sort((a, b) => a - b)[0]
    const averageQueryTime = queryMsSum / queryTimesLocal.length
	console.log(result)
    console.log('Low: '+ queryMsLow +'ms | High: '+queryMsHigh+'ms | Avg: '+averageQueryTime+'ms | Total: '+queryMsSum+'ms ('+queryTimesLocal.length+' queries)')
})
```