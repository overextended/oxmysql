# Fetch
Execute a query and returns the results of all rows and columns.

### Usage
```lua
exports.oxmysql:fetch(query, {}, function(result)
  print(result[1]['column1'], result[1]['column2'], result[2]['column1'], result[2]['column2'])
end)
print('I will be printed before query result')
```
```lua
local result = exports.oxmysql:fetchSync(query, {})
print(result[1]['column1'], result[1]['column2'], result[2]['column1'], result[2]['column2'])
```
