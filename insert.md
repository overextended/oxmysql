# Insert
Execute a query and returns the AUTO_INCREMENT id, if it is defined.

### Usage
```lua
exports.oxmysql:insert(query, {}, function(insertId)
  print('Inserted new row with id '..insertId)
end)
print('I will be printed before query result')
```
```lua
local insertId = exports.oxmysql:insertSync(query, {})
print('Inserted new row with id '..insertId)
```
