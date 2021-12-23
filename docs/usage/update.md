---
title: update
---
Returns the number of affected rows when executing an UPDATE or DELETE query.

!!! info "Example"
	=== "Lua"
		**Callback**
		```lua
		MySQL.Async.update('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier}, function(affectedRows)
			if affectedRows then
				print(affectedRows)
			end
		end)
		```
		**Promise**
		```lua
		CreateThread(function()
			local id = MySQL.Sync.update('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier})
			if affectedRows then
				print(affectedRows)
			end
		end)
		```
	=== "JavaScript"
		**Callback**
		```js
		exports.oxmysql.update_callback('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier], function(affectedRows) {
		  if (affectedRows)
		    console.log(affectedRows)
		})
		```
		**Promise**
		```js
		setImmediate(async () => {
		  const id = exports.oxmysql.update_async('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier]) {
		  if (affectedRows)
		    console.log(affectedRows)
		})
		```