---
title: Single
---
Returns the columns for a single row.

!!! info "Example"
	=== "Lua
		=== "Async"
		```lua
		exports.oxmysql:single('SELECT * FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				print(result.identifier, result.firstname, result.lastname)
			end
		end)
		```
		=== "Sync"
		```lua
		local result = exports.oxmysql:singleSync('SELECT * FROM users WHERE identifier = ?', {playerIdentifier})
		if result then
			print(result.identifier, result.firstname, result.lastname)
		end
		```
	=== "JavaScript
		=== "Async"
		```js
		exports.oxmysql.single('SELECT * FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
		  if (result)
		    console.log(result.identifier, result.firstname, result.lastname)
		})
		```
		=== "Sync"
		```js
		const result = exports.oxmysql.singleSync('SELECT * FROM users WHERE identifier = ?', [playerIdentifier]) {
		if (result)
		  console.log(result.identifier, result.firstname, result.lastname)
		```