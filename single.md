# Single
Execute a query and return the results of the first row.

### Usage
```lua
exports.oxmysql:single(query, {}, function(result)
  print(result.column1, result.column2)
end)

local result = exports.oxmysql:singleSync(query, {})
print(result.column1, result.column2)
```
```js
exports.oxmysql.single(query, {}, (result) => {
  console.log(result.column1, result.column2)
})

const result = await exports.oxmysql.singleSync(query, {})
console.log(result.column1, result.column2)
```
