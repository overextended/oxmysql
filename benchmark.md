Some hideous benchmarking commands and their results.

## Lua
`Low: 0.3569ms | High: 13.2664ms | Avg: 0.45843701ms | Total: 4584.3701ms (10000 queries)`
```lua
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
`Low: 0.3462ms | High: 13.4404ms | Avg: 0.43639137999999783ms | Total: 4363.913799999978ms (10000 queries)`
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
