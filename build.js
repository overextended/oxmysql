const { build } = require('esbuild');

build({
  entryPoints: ['./src/index.ts'],
  outfile: 'dist/build.js',
  bundle: true,
  platform: 'node',
  logLevel: 'info',
});
