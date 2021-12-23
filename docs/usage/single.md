---
title: single
---
Returns the columns for a single row.

!!! info "Example"
	=== "Lua"

		**Callback**
		```lua
		-- Alias: exports.oxmysql:single
		-- Alias: MySQL.Async.fetchSingle

		MySQL.single('SELECT * FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				print(result.identifier, result.firstname, result.lastname)
			end
		end)
		```
		**Promise**
		```lua
		-- Alias: exports.oxmysql:single_async
		-- Alias: MySQL.Sync.fetchSingle

		CreateThread(function()
			local result = MySQL.single.await('SELECT * FROM users WHERE identifier = ?', {playerIdentifier})
			if result then
				print(result.identifier, result.firstname, result.lastname)
			end
		end)
		```

	=== "JavaScript"

		**Callback**
		```js
		exports.oxmysql.single('SELECT * FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
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