---
title: Execute
---
Generic function that can be utilised for any query, synonymous with fetch.
When selecting data it will return all matching rows and columns, otherwise it will return field data such as insertid, affectedRows, etc.

!!! info "Example"
	=== "Lua"
		**Async**
		```lua
		exports.oxmysql:execute('SELECT * FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				for _, v in pairs(result) do
					print(v.identifier, v.firstname, v.lastname)
				end
			end
		end)
		```
		**Sync**
		```lua
		local result = exports.oxmysql:executeSync('SELECT * FROM users WHERE identifier = ?', {playerIdentifier})
		if result then
			for _, v in pairs(result) do
				print(v.identifier, v.firstname, v.lastname)
			end
		end
		```
	=== "JavaScript"
		**Async**
		```js
		exports.oxmysql.execute('SELECT * FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
		  if (result) {
		    result.forEach((v) => {
		      console.log(v.identifier, v.firstname, v.lastname)
			})
		  }
		})
		```
		**Sync**
		```js
		const result = exports.oxmysql.executeSync('SELECT * FROM users WHERE identifier = ?', [playerIdentifier]) {
		if (result) {
		  result.forEach((v) => {
		    console.log(v.identifier, v.firstname, v.lastname)
		  })
		}
		```