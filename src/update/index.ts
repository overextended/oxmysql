import fetch from 'node-fetch';
import { resourceName } from '../config';

if (GetConvar('mysql_versioncheck', 'true') === 'true') {
  setTimeout(async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/overextended/oxmysql/releases/latest`);

      if (response.status !== 200) return;

      const release = (await response.json()) as any;
      if (release.prerelease) return;

      const currentVersion = GetResourceMetadata(resourceName, 'version', 0).match(/(\d)\.(\d+)\.(\d+)/);
      if (!currentVersion) return;

      const latestVersion = release.tag_name.match(/(\d)\.(\d+)\.(\d+)/);
      if (!latestVersion) return;

      if (currentVersion[0] === latestVersion[0]) return;

      const updateMessage =
        currentVersion[3] < latestVersion[3]
          ? 'patch'
          : currentVersion[2] < latestVersion[2]
          ? 'an update'
          : 'a major update';

      console.log(
        `^3There is ${updateMessage} available for oxmysql - please update to the latest release (current version: ${currentVersion[0]})\r\n${release.html_url}^0`
      );
    } catch (e) {}
  }, 1000);
}
