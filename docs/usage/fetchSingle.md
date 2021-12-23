---
title: fetchSingle
---
Returns the columns for a single row.

!!! info "Example"
	=== "Lua"
		**Callback**
		```lua
		MySQL.Async.fetchSingle('SELECT * FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				print(result.identifier, result.firstname, result.lastname)
			end
		end)
		```
		**Promise**
		```lua
		CreateThread(function()
			local result = MySQL.Sync.fetchSingle('SELECT * FROM users WHERE identifier = ?', {playerIdentifier})
			if result then
				print(result.identifier, result.firstname, result.lastname)
			end
		end)
		```
	=== "JavaScript"
		**Callback**
		```js
		exports.oxmysql.single_callback('SELECT * FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
		  if (result)
		    console.log(result.identifier, result.firstname, result.lastname)
		})
		```
		**Promise**
		```js
		setImmediate(async () => {
		  const result = await exports.oxmysql.single_async('SELECT * FROM users WHERE identifier = ?', [playerIdentifier]) {
		  if (result)
		    console.log(result.identifier, result.firstname, result.lastname)
		})
		```