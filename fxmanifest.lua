fx_version 'cerulean'
game 'gta5'

name 'oxmysql'
description 'Database wrapper for FiveM utilising node-mysql2 offering improved performance and security.'
version '0.1.0'
url 'https://github.com/overextended/oxmysql'
author 'overextended'

server_scripts {'oxmysql.js', 'wrapper.lua'}
server_only 'true'

provide 'mysql-async' -- alternative version for old mysql-async, also prevents from running old script