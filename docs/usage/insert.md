---
title: insert
---
Inserts a new entry into the database and returns the insert id for the row, if valid.

!!! info "Example"
	=== "Lua"
		**Callback**
		```lua
		MySQL.Async.insert('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', {playerIdentifier, firstName, lastName}, function(id)
			print(id)
		end)
		```
		**Promise**
		```lua
		CreateThread(function()
			local id = MySQL.Sync.insert('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', {playerIdentifier, firstName, lastName})
			print(id)
		end)
		```

	=== "JavaScript"
		**Callback**
		```js
		exports.oxmysql.insert_callback('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', [playerIdentifier, firstName, lastName], function(id) {
		  console.log(id)
		})
		```
		**Promise**
		```js
		(async () => {
		  const id = exports.oxmysql.insert_async('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', [playerIdentifier, firstName, lastName]) {
		  console.log(id)
		})()
		```