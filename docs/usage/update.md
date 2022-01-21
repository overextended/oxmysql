---
title: update
---
Returns the number of affected rows by the query.

!!! info "Example"
	=== "Lua"

		**Callback**
		```lua
		-- Alias: exports.oxmysql:update
		-- Alias: MySQL.Async.update

		MySQL.Async.update('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier}, function(affectedRows)
			if affectedRows then
				print(affectedRows)
			end
		end)
		```
		**Promise**
		```lua
		-- Alias: exports.oxmysql:update_async
		-- Alias: MySQL.update

		CreateThread(function()
			local affectedRows = MySQL.update.await('UPDATE users SET firstname = ? WHERE identifier = ? ', {newName, playerIdentifier})
			if affectedRows then
				print(affectedRows)
			end
		end)
		```

	=== "JavaScript"

		**Callback**
		```js
		exports.oxmysql.update('UPDATE users SET firstname = ? WHERE identifier = ? ', [newName, playerIdentifier], function(affectedRows) {
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
