# Insert
Execute a query and returns the AUTO_INCREMENT id, if valid.

### Usage
```lua
exports.oxmysql:insert(query, {}, function(insertId)
  print('Inserted new row with id '..insertId)
end)

local insertId = exports.oxmysql:insertSync(query, {})
print('Inserted new row with id '..insertId)
```
```js
exports.oxmysql.insert(query, {}, (insertId) => {
  console.log(`Inserted new row with id ${insertId}`)
})

const insertId = await exports.oxmysql.insertSync(query, {})
console.log(`Inserted new row with id ${insertId}`)
```
