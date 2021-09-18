# Update
Execute a query and returns the number of affected rows when updating rows.

### Usage
```lua
exports.oxmysql:update(query, {}, function(affectedRows)
  print('Updated '..affectedRows..' rows')
end)

local affectedRows = exports.oxmysql:updateSync(query, {})
print('Updated '..affectedRows..' rows')
```
```js
exports.oxmysql.update(query, {}, (affectedRows) => {
  console.log(`Updated ${affectedRows} rows`)
})

const affectedRows = await exports.oxmysql.updateSync(query, {})
console.log(`Updated ${affectedRows} rows`)
```
