import { ConnectionStringParser } from 'connection-string-parser';
import versionCheck from 'github-version-checker';
import currentVersion from '../package.json';

const connectionString = GetConvar('mysql_connection_string', '');

if (connectionString === '') throw new Error(`Set up mysql_connection_string in server.cfg`);

const config = new ConnectionStringParser({
  scheme: 'mysql',
  hosts: [],
}).parse(connectionString);

if (Object.keys(config).length === 0)
  throw new Error(`Set up mysql_connection_string in correct format - 'mysql://user:password@host/database'`);

const slowQueryWarning = GetConvarInt('mysql_slow_query_warning', 100);
const debug = GetConvar('mysql_debug', 'false') === 'true';

const isolationLevel = (() => {
  switch (GetConvarInt('mysql_transaction_isolation_level', 2)) {
    case 1:
      return 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ';
    case 2:
      return 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED';
    case 3:
      return 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED';
    case 4:
      return 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE';
    default:
      return 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED';
  };
})();

const resourceName = GetCurrentResourceName() || 'oxmysql';

export { config, slowQueryWarning, debug, isolationLevel, resourceName };

setImmediate(async () => {
  const versionCheckConfig = {
    repo: 'oxmysql',
    owner: 'overextended',
    currentVersion: currentVersion.version,
    latest: true
  };

  try {
    const update = await versionCheck(versionCheckConfig);
    if (update) {
      console.log(`^3Your version of oxmysql is outdated (v${versionCheckConfig.currentVersion})! Please update to the latest version (${update.name}) here: \nhttps://github.com/overextended/oxmysql/releases/latest`);
    }
  } catch (e) {
    console.log(`^3Could not fetch updates for oxmysql!^0\n${e}`);
  }
});