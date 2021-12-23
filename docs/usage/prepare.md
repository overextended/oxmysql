---
title: prepare
---
The only function that provides true [prepared statements](https://github.com/sidorares/node-mysql2#using-prepared-statements), granting native protection and query planning by MySQL.  
Prepare can be used to execute frequently called queries faster and accepts multiple sets of parameters to be used with a single query.  

- Date will not return the datestring commonly used in FiveM
- TINYINT 1 and BIT will not return a boolean
- You can only use `?` value placeholders, `??` column placeholders and named placeholders will throw an error  

When using SELECT, the return value will match `fetchAll, fetchSingle, or fetchScalar` depending on the number of columns and rows selected.

!!! info "Example"
	=== "Lua"

		**Callback**
		```lua
		-- Alias: exports.oxmysql:prepare
		-- Alias: MySQL.Async.prepare

		MySQL.prepare('SELECT * FROM users WHERE identifier = ?', {playerIdentifier}, function(result)
			if result then
				for _, v in pairs(result) do
					print(v.identifier, v.firstname, v.lastname)
				end
			end
		end)
		```
		**Promise**
		```lua
		-- Alias: exports.oxmysql:prepare_async
		-- Alias: MySQL.Sync.prepare

		
		CreateThread(function()
			local result = MySQL.prepare.await('SELECT * FROM users WHERE identifier = ?', {playerIdentifier})
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
		exports.oxmysql.prepare('SELECT * FROM users WHERE identifier = ?', [playerIdentifier], function(result) {
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
		  const result = await exports.oxmysql.prepare_async('SELECT * FROM users WHERE identifier = ?', [playerIdentifier]) {
		  if (result) {
		    result.forEach((v) => {
		      console.log(v.identifier, v.firstname, v.lastname)
		    })
		  }
		})()
		```

As mentioned above, you can utilise an array of parameters for a transaction-like query without the rollback; reducing the number of exports being performed reduces strain on the server. Included below is some examples of using prepare in ESX Legacy.

```lua
ESX.SavePlayer = function(xPlayer, cb)
	MySQL.Async.prepare("UPDATE `users` SET `accounts` = ?, `job` = ?, `job_grade` = ?, `group` = ?, `position` = ?, `inventory` = ? WHERE `identifier` = ?", {{
		json.encode(xPlayer.getAccounts(true)),
		xPlayer.job.name,
		xPlayer.job.grade,
		xPlayer.group,
		json.encode(xPlayer.getCoords()),
		json.encode(xPlayer.getInventory(true)),
		xPlayer.identifier
	}}, function(affectedRows)
		if affectedRows == 1 then
			print(('[^2INFO^7] Saved player ^5"%s^7"'):format(xPlayer.name))
		end
		if cb then cb() end
	end)
end

ESX.SavePlayers = function(cb)
	local xPlayers = ESX.GetExtendedPlayers()
	local count = #xPlayers
	if count > 0 then
		local parameters = {}
		for i=1, count do
			local xPlayer = xPlayers[i]
			parameters[#parameters+1] = {
				json.encode(xPlayer.getAccounts(true)),
				xPlayer.job.name,
				xPlayer.job.grade,
				xPlayer.group,
				json.encode(xPlayer.getCoords()),
				json.encode(xPlayer.getInventory(true)),
				xPlayer.identifier
			}
		end
		MySQL.Async.prepare("UPDATE `users` SET `accounts` = ?, `job` = ?, `job_grade` = ?, `group` = ?, `position` = ?, `inventory` = ? WHERE `identifier` = ?", parameters,
		function(results)
			if results then
				if type(cb) == 'function' then cb() else print(('[^2INFO^7] Saved %s %s'):format(count, count > 1 and 'players' or 'player') end
			end
		end)
	end
end
```