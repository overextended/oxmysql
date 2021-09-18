# Scalar
Execute a query and return the result of the first row and column.

### Usage
```lua
exports.oxmysql:scalar(query, {}, function(result)
  print(result)
end)

local result = exports.oxmysql:scalarSync(query, {})
print(result)
```
```js
exports.oxmysql.scalar(query, {}, (result) => {
  console.log(result)
})

const result = await exports.oxmysql.scalarSync(query, {})
console.log(result)
```
