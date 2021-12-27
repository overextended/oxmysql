fx_version 'cerulean'
game 'common'

name 'oxmysql'
description 'Database wrapper for FiveM utilising node-mysql2 offering improved performance and security.'
version '1.9.0'
url 'https://github.com/overextended/oxmysql'
author 'overextended'

dependencies {
	'/server:5104',
}

client_script 'ui.lua'
server_script 'dist/build.js'

files {
	'ui/public/index.html',
	'ui/public/**/*'
}

ui_page 'src/ui/public/index.html'

provide 'mysql-async'
