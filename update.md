# Update
Execute a query and returns the number of affected rows.

### Usage
```lua
exports.oxmysql:update(query, {}, function(affectedRows)
  print('Updated '..affectedRows..' rows')
end)
print('I will be printed before query result')
```
```lua
local affectedRows = exports.oxmysql:updateSync(query, {})
print('Updated '..affectedRows..' rows')
```
