---
title: Insert
---
Inserts a new entry into the database and returns the insert id for the row, if valid.

!!! info "Example"
	=== "Lua"
		**Async**
		```lua
		exports.oxmysql:insert('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', {playerIdentifier, firstName, lastName}, function(id)
			if id then
				print(id)
			end
		end)
		```
		**Sync**
		```lua
		local id = exports.oxmysql:insertSync('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', {playerIdentifier, firstName, lastName})
		if id then
			print(id)
		end
		```
	=== "JavaScript"
		**Async**
		```js
		exports.oxmysql.insert('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', [playerIdentifier, firstName, lastName], function(id) {
		  if (id)
		    console.log(id)
		})
		```
		**Sync**
		```js
		const id = exports.oxmysql.insertSync('INSERT INTO users (identifier, firstname, lastname) VALUES (?, ?, ?) ', [playerIdentifier, firstName, lastName]) {
		if (id)
		  console.log(id)
		```