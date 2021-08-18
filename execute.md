# Execute
Execute a query and returns the number of affected rows.

## Usage
```lua
exports.oxmysql:execute(query, {}, function(affectedRows)
  print('Updated '..affectedRows..' rows')
end)
print('I will be printed before query result')
```
```lua
local affectedRows = exports.oxmysql:executeSync(query, {})
print('Updated '..affectedRows..' rows')
```
