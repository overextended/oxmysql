import { resourceName } from './config';
const https = require('https');

setTimeout(() => {
  https
    .request(
      {
        hostname: 'raw.githubusercontent.com',
        port: 443,
        path: '/overextended/oxmysql/main/lua/fxmanifest.lua',
        method: 'GET',
      },
      (res) => {
        if (res.statusCode === 200) {
          res.on('data', (data) => {
            let currentVersion = GetResourceMetadata(resourceName, 'version', 0).match(/(\d)\.(\d+)\.(\d+)/);
            let latestVersion = data.toString().match(/(\d)\.(\d+)\.(\d+)/);
            if (currentVersion[0] !== latestVersion[0]) {
              let update;

              if (currentVersion[1] < latestVersion[1]) update = 'a major update';
              else if (currentVersion[2] < latestVersion[2]) update = 'an update';
              else if (currentVersion[3] < latestVersion[3]) update = 'a patch';

              console.log(
                `^3There is ${update} available for oxmysql - please update to the latest release (current version: ${currentVersion[0]})\r\nhttps://github.com/overextended/oxmysql/releases/download/v${latestVersion[0]}/oxmysql-v${latestVersion[0]}.zip^0`
              );
            }
          });
        }
      }
    )
    .end();
}, 1000);
