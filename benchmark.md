Some hideous benchmarking commands and their results. Lua performance falls slightly behind due to overhead from cross-language communication.

## Lua
`Low: 0.2955ms | High: 16.7566ms | Avg: 0.36956378ms | Total: 3695.6378ms (10000 queries)`
```lua
local lmprof = require 'lmprof'
local profiler = lmprof.create("time")
	:set_option("load_stack", true)
	:set_option("mismatch", true)
	:calibrate()

local val = 10000
RegisterCommand('luasync', function()
	local queryTimesLocal = {}
	local result
	for i=1, val do
		profiler:start()
		local r = exports.oxmysql:scalarSync('SELECT * from users')
		queryTimesLocal[#queryTimesLocal+1] = profiler:stop() / 1000000
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


## Javascript
`Low: 0.2831ms | High: 5.1899ms | Avg: 0.3349578800000005ms | Total: 3349.578800000005ms (10000 queries)`
```js
const val = 10000
RegisterCommand('jssync', async() => {
    const queryTimesLocal = [];
    for(let i=0; i < val; i++) {
        const startTime = process.hrtime.bigint()
        const result = await exports.oxmysql.scalarSync('SELECT * from users')
        queryTimesLocal.push(Number(process.hrtime.bigint() - startTime) / 1000000)
        if (i === val) console.log(result)
    }
    const queryMsSum = queryTimesLocal.reduce((a, b) => a + b, 0)
    const queryMsHigh = queryTimesLocal.sort((a, b) => b - a)[0]
    const queryMsLow = queryTimesLocal.sort((a, b) => a - b)[0]
    const averageQueryTime = queryMsSum / queryTimesLocal.length
    console.log('Low: '+ queryMsLow +'ms | High: '+queryMsHigh+'ms | Avg: '+averageQueryTime+'ms | Total: '+queryMsSum+'ms ('+queryTimesLocal.length+' queries)')
})
```
