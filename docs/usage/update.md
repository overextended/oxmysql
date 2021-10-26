---
title: Update
---
Updates an entry in the database and returns the number of affected rows.

!!! info "Example"
	=== "Lua"
		**Async**
		```lua
		exports.oxmysql:update('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier}, function(affectedRows)
			if affectedRows then
				print(affectedRows)
			end
		end)
		```
		**Sync**
		```lua
		CreateThread(function()
			local id = exports.oxmysql:updateSync('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier})
			if affectedRows then
				print(affectedRows)
			end
		end)
		```
	=== "JavaScript"
		**Async**
		```js
		exports.oxmysql.update('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier], function(affectedRows) {
		  if (affectedRows)
		    console.log(affectedRows)
		})
		```
		**Sync**
		```js
		setImmediate(async () => {
		  const id = exports.oxmysql.updateSync('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier]) {
		  if (affectedRows)
		    console.log(affectedRows)
		})
		```