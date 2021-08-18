# Single
Execute a query and return the results of the first row.

### Usage
```lua
exports.oxmysql:single(query, {}, function(result)
  print(result['column'])
end)
print('I will be printed before query result')
```
```lua
local result = exports.oxmysql:singleSync(query, {})
print(result['column'])
```
