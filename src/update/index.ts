import fetch from 'node-fetch';
import { resourceName } from '../config';

setTimeout(async () => {
  const response = await fetch(`https://raw.githubusercontent.com/overextended/oxmysql/main/lua/fxmanifest.lua`);

  if (response.status !== 200) return;

  const manifest = await response.text();

  const currentVersion = GetResourceMetadata(resourceName, 'version', 0).match(/(\d)\.(\d+)\.(\d+)/);
  if (!currentVersion) return;

  const latestVersion = manifest.match(/(\d)\.(\d+)\.(\d+)/);
  if (!latestVersion) return;

  if (currentVersion[0] === latestVersion[0]) return;

  const updateMessage =
    currentVersion[3] < latestVersion[3]
      ? 'patch'
      : currentVersion[2] < latestVersion[2]
      ? 'an update'
      : 'a major update';

  console.log(
    `^3There is ${updateMessage} available for oxmysql - please update to the latest release (current version: ${currentVersion[0]})\r\nhttps://github.com/overextended/oxmysql/releases/download/v${latestVersion[0]}/oxmysql-v${latestVersion[0]}.zip^0`
  );
}, 1000);
