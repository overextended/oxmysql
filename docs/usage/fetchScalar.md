---
title: fetchScalar
---
Returns the first column for a single row.

!!! info "Example"
	=== "Lua"
		**Callback**
		```lua
		MySQL.Async.fetchScalar('SELECT firstname FROM users WHERE identifier = ?', {playerIdentifier}, function(firstname)
			print(firstname)
		end)
		```
		**Promise**
		```lua
		CreateThread(function()
			local firstname = MySQL.Async.fetchScalar('SELECT firstname FROM users WHERE identifier = ?', {playerIdentifier})
			print(firstname)
		end)
		```

	=== "JavaScript"
		**Callback**
		```js
		exports.oxmysql.scalar_callback('SELECT firstname FROM users WHERE identifier = ?', [playerIdentifier], function(firstname) {
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