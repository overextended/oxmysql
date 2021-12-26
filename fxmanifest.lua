fx_version 'cerulean'
game 'common'

name 'oxmysql'
description 'Database wrapper for FiveM utilising node-mysql2 offering improved performance and security.'
version '1.9.0'
url 'https://github.com/overextended/oxmysql'
author 'overextended'

ui_page 'src/ui/public/index.html'

dependencies {
	'/server:5104',
}

server_scripts {
	'dist/build.js',
}

files {
	'src/ui/public/index.html',
	'src/ui/public/**/*'
}

provide 'mysql-async'
