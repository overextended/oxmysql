---
title: scalar
---
Returns the first column for a single row.

!!! info "Example"
	=== "Lua"

		**Callback**
		```lua
		-- Alias: exports.oxmysql:scalar
		-- Alias: MySQL.Async.fetchScalar

		MySQL.scalar('SELECT firstname FROM users WHERE identifier = ?', {playerIdentifier}, function(firstname)
			print(firstname)
		end)
		```
		**Promise**
		```lua
		-- Alias: exports.oxmysql:scalar_async
		-- Alias: MySQL.Sync.fetchScalar

		CreateThread(function()
			local firstname = MySQL.scalar.await('SELECT firstname FROM users WHERE identifier = ?', {playerIdentifier})
			print(firstname)
		end)
		```

	=== "JavaScript"

		**Callback**
		```js
		exports.oxmysql.scalar('SELECT firstname FROM users WHERE identifier = ?', [playerIdentifier], function(firstname) {
		    console.log(firstname)
		})
		```
		**Promise**
		```js
		(async () => {
		  const firstname = await exports.oxmysql.scalar_async('SELECT firstname FROM users WHERE identifier = ?', [playerIdentifier]) {
		    console.log(firstname)
		})()
		```