---
title: Update
---
Updates an entry in the database and returns the number of affected rows.

!!! info "Example"
	=== "Lua
		=== "Async"
		```lua
		exports.oxmysql:insert('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier}, function(affectedRows)
			if affectedRows then
				print(affectedRows)
			end
		end)
		```
		=== "Sync"
		```lua
		local id = exports.oxmysql:insertSync('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier})
		if affectedRows then
			print(affectedRows)
		end
		```
	=== "JavaScript
		=== "Async"
		```js
		exports.oxmysql.insert('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier], function(affectedRows) {
		  if (affectedRows)
		    console.log(affectedRows)
		})
		```
		=== "Sync"
		```js
		const id = exports.oxmysql.insertSync('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier]) {
		if (affectedRows)
		  console.log(affectedRows)
		```