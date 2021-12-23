---
title: fetchAll
---
Generic function that can be utilised for any query.  
When selecting data it will return all matching rows and columns, otherwise it will return field data such as insertid, affectedRows, etc.

!!! info "Example"
	=== "Lua"
		**Callback**
		```lua
		MySQL.Async.fetchAll('SELECT * FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				for _, v in pairs(result) do
					print(v.identifier, v.firstname, v.lastname)
				end
			end
		end)
		```
		**Promise**
		```lua
		CreateThread(function()
			local result = MySQL.Sync.fetchAll('SELECT * FROM users WHERE identifier = ?', {playerIdentifier})
			if result then
				for _, v in pairs(result) do
					print(v.identifier, v.firstname, v.lastname)
				end
			end
		end)
		```

	=== "JavaScript"
		**Callback**
		```js
		exports.oxmysql.query_callback('SELECT * FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
		  if (result) {
		    result.forEach((v) => {
		      console.log(v.identifier, v.firstname, v.lastname)
			})
		  }
		})
		```
		**Promise**
		```js
		(async () => {
		  const result = await exports.oxmysql.query_async('SELECT * FROM users WHERE identifier = ?', [playerIdentifier]) {
		  if (result) {
		    result.forEach((v) => {
		      console.log(v.identifier, v.firstname, v.lastname)
		    })
		  }
		})()
		```