fx_version 'cerulean'
game 'common'

name 'oxmysql'
description 'Database wrapper for FiveM utilising node-mysql2 offering improved performance and security.'
version '1.8.7'
url 'https://github.com/overextended/oxmysql'
author 'overextended'
use_fxv2_oal 'yes'
lua54 'yes'

--dependencies {
--	'/server:4837',  Disabled until the heat death of the universe (or recommended artifact updates)
--}

server_scripts {
	'oxmysql.js',
	'wrapper.lua'
}

provide 'mysql-async'
