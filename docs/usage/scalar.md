---
title: Scalar
---
Returns the first column for a single row.

!!! info "Example"
	=== "Lua"
		**Async**
		```lua
		exports.oxmysql:scalar('SELECT firstname FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				print(result.firstname)
			end
		end)
		```
		**Sync**
		```lua
		CreateThread(function()
			local result = exports.oxmysql:scalarSync('SELECT firstname FROM users WHERE identifier = ?', {playerIdentifier})
			if result then
				print(result.firstname)
			end
		end)
		```
	=== "JavaScript"
		**Async**
		```js
		exports.oxmysql.scalar('SELECT firstname FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
		  if (result)
		    console.log(result.firstname)
		})
		```
		**Sync**
		```js
		setImmediate(async () => {
		  const result = await exports.oxmysql.scalarSync('SELECT firstname FROM users WHERE identifier = ?', [playerIdentifier]) {
		  if (result)
		    console.log(result.firstname)
		})
		```