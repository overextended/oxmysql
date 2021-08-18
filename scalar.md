# Scalar
Execute a query and return the result of the first row and column.

### Usage
```lua
exports.oxmysql:scalar(query, {}, function(result)
  print(result)
end)
print('I will be printed before query result')
```
```lua
local result = exports.oxmysql:scalarSync(query, {})
print(result)
```
