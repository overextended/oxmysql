# Execute
Execute a query and returns an array of all results. This is synonymous with the deprecated fetch.

### Usage
```lua
exports.oxmysql:execute(query, {}, function(result)
  print(result[1]['column1'], result[1]['column2'], result[2]['column1'], result[2]['column2'])
end)
print('I will be printed before query result')
```
```lua
local result = exports.oxmysql:executeSync(query, {})
print(result[1]['column1'], result[1]['column2'], result[2]['column1'], result[2]['column2'])
```
