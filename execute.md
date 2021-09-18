# Execute
Execute a query and returns an array of all results. This is synonymous with the deprecated fetch.

### Usage
```lua
exports.oxmysql:execute(query, {}, function(result)
  print(result[1].column1, result[2].column1)
end)

local result = exports.oxmysql:executeSync(query, {})
print(result[1].column1, result[2].column1)
```
```js
exports.oxmysql.execute(query, {}, (result) => {
  console.log(result[1].column1, result[2].column1)
})

const result = await exports.oxmysql.executeSync(query, {})
console.log(result[1].column1, result[2].column1)
```
