import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }));
const version = process.env.TGT_RELEASE_VERSION;

if (version) {
  packageJson.version = version.replace('v', '');
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
}

writeFileSync(
  '.yarn.installed',
  new Date().toLocaleString('en-AU', {
    timeZone: 'UTC',
    timeStyle: 'long',
    dateStyle: 'full',
  })
);

writeFileSync(
  'fxmanifest.lua',
  `fx_version 'cerulean'
game 'common'
use_experimental_fxv2_oal 'yes'
lua54 'yes'
node_version '22'

name '${packageJson.name}'
author '${packageJson.author}'
version '${packageJson.version}'
license '${packageJson.license}'
repository '${packageJson.repository.url}'
description '${packageJson.description}'

dependencies {
    '/server:12913',
}

client_script 'ui.lua'
server_script 'dist/build.js'

files {
	'web/build/index.html',
	'web/build/**/*'
}

ui_page 'web/build/index.html'

provide 'mysql-async'
provide 'ghmattimysql'

convar_category 'OxMySQL' {
	'Configuration',
	{
		{ 'Connection string', 'mysql_connection_string', 'CV_STRING', 'mysql://user:password@localhost/database' },
		{ 'Debug', 'mysql_debug', 'CV_BOOL', 'false' }
	}
}
`
);

build({
  bundle: true,
  entryPoints: [`./src/index.ts`],
  outfile: `dist/build.js`,
  keepNames: true,
  dropLabels: ['DEV'],
  legalComments: 'inline',
  platform: 'node',
  target: ['node22'],
  format: 'cjs',
  logLevel: 'info',
});
