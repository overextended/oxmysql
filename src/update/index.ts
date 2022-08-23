import fetch from 'node-fetch';
import { resourceName } from '../config';

if (GetConvar('mysql_versioncheck', 'true') === 'true') {
  setTimeout(async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/overextended/oxmysql/releases/latest`);
      if (response.status !== 200) return;

      const release = (await response.json()) as any;
      if (release.prerelease) return;

      const currentVersion = GetResourceMetadata(resourceName, 'version', 0).match(/(\d)\.(\d+\.\d+)/);
      if (!currentVersion) return;

      const latestVersion = release.tag_name.match(/(\d)\.(\d+\.\d+)/);
      if (!latestVersion) return;

      if (currentVersion[0] === latestVersion[0] || parseInt(currentVersion[1]) > parseInt(latestVersion[1]) || parseFloat(currentVersion[2]) > parseFloat(latestVersion[2])) return;

      console.log(
        `^3An update is available for oxmysql (current version: ${currentVersion[0]})\r\n${release.html_url}^0`
      );
    } catch (e) {}
  }, 1000);
}
