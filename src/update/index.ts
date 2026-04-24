import fetch from 'node-fetch';

(() => {
  if (GetConvarInt('mysql_versioncheck', 1) === 0) return;

  const resourceName = GetCurrentResourceName();
  const currentVersion = GetResourceMetadata(resourceName, 'version', 0)?.match(/(\d+)\.(\d+)\.(\d+)/);

  if (!currentVersion) return;

  setTimeout(async () => {
    const response = await fetch(`https://api.github.com/repos/overextended/oxmysql/releases/latest`).catch((err) => {
      console.warn(`Failed to retrieve latest version of oxmysql (${err.code}).`);
    });

    if (response?.status !== 200) return;

    const release = (await response.json()) as any;
    if (release.prerelease) return;

    const latestVersion = release.tag_name.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!latestVersion || latestVersion[0] === currentVersion[0]) return;

    for (let i = 1; i < currentVersion.length; i++) {
      const current = parseInt(currentVersion[i]);
      const latest = parseInt(latestVersion[i]);

      if (current !== latest) {
        if (current < latest)
          return console.log(
            `^3An update is available for ${resourceName} (current version: ${currentVersion[0]})\r\n${release.html_url}^0`
          );
        else break;
      }
    }
  }, 1000);
})();
