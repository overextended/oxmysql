export const resourceName = GetCurrentResourceName();
export const mysql_connection_string = GetConvar('mysql_connection_string', '');
export let mysql_ui = GetConvar('mysql_ui', 'false') === 'true';
export let mysql_slow_query_warning = GetConvarInt('mysql_slow_query_warning', 200);
export let mysql_debug: boolean | string[];

function setDebug() {
  try {
    const debug = GetConvar('mysql_debug', 'false');
    mysql_debug = debug === 'false' ? false : JSON.parse(debug);
  } catch (e) {
    mysql_debug = true;
  }
}

setDebug();

setInterval(() => {
  setDebug();
  mysql_ui = GetConvar('mysql_ui', 'false') === 'true';
  mysql_slow_query_warning = GetConvarInt('mysql_slow_query_warning', 200);
}, 1000);

export const mysql_transaction_isolation_level = (() => {
  const query = 'SET TRANSACTION ISOLATION LEVEL';
  switch (GetConvarInt('mysql_transaction_isolation_level', 2)) {
    case 1:
      return `${query} REPEATABLE READ`;
    case 2:
      return `${query} READ COMMITTED`;
    case 3:
      return `${query} READ UNCOMMITTED`;
    case 4:
      return `${query} SERIALIZABLE`;
    default:
      return `${query} READ COMMITTED`;
  }
})();

const parseUri = (connectionString: string) => {
  const splitMatchGroups = connectionString.match(
    new RegExp(
      '^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([\\w\\d\\-\\u0100-\\uffff.%]*)(?::([0-9]+))?)?([^?#]+)?(?:\\?([^#]*))?$'
    )
  ) as RegExpMatchArray;

  if (!splitMatchGroups) throw new Error(`mysql_connection_string structure was invalid (${connectionString})`);

  const authTarget = splitMatchGroups[2] ? splitMatchGroups[2].split(':') : [];

  const options = {
    user: authTarget[0] || undefined,
    password: authTarget[1] || undefined,
    host: splitMatchGroups[3],
    port: parseInt(splitMatchGroups[4]),
    database: splitMatchGroups[5].replace(/^\/+/, ''),
    ...(splitMatchGroups[6] &&
      splitMatchGroups[6].split('&').reduce<Record<string, string>>((connectionInfo, parameter) => {
        const [key, value] = parameter.split('=');
        connectionInfo[key] = value;
        return connectionInfo;
      }, {})),
  };

  return options;
};

export const connectionOptions = (() => {
  const options: Record<string, any> = mysql_connection_string.includes('mysql://')
    ? parseUri(mysql_connection_string)
    : mysql_connection_string
        .replace(/(?:host(?:name)|ip|server|data\s?source|addr(?:ess)?)=/gi, 'host=')
        .replace(/(?:user\s?(?:id|name)?|uid)=/gi, 'user=')
        .replace(/(?:pwd|pass)=/gi, 'password=')
        .replace(/(?:db)=/gi, 'database=')
        .split(';')
        .reduce<Record<string, string>>((connectionInfo, parameter) => {
          const [key, value] = parameter.split('=');
          connectionInfo[key] = value;
          return connectionInfo;
        }, {});

  options.namedPlaceholders = options.namedPlaceholders === 'false' ? false : true;

  for (const key in ['dateStrings', 'flags', 'ssl']) {
    const value = options[key];

    if (typeof value === 'string') {
      try {
        options[key] = JSON.parse(value);
      } catch {}
    }
  }

  return options;
})();

RegisterCommand(
  'oxmysql_debug',
  (source: number, args: string[]) => {
    if (source !== 0) return console.log('^3This command can only be run server side^0');
    switch (args[0]) {
      case 'add':
        if (!Array.isArray(mysql_debug)) mysql_debug = [];
        mysql_debug.push(args[1]);
        SetConvar('mysql_debug', JSON.stringify(mysql_debug))
        return console.log(`^3Added ${args[1]} to mysql_debug^0`);

      case 'remove':
        if (Array.isArray(mysql_debug)) {
          const index = mysql_debug.indexOf(args[1]);
          if (index === -1) return;
          mysql_debug.splice(index, 1);
          if (mysql_debug.length === 0) mysql_debug = false;
          SetConvar('mysql_debug', JSON.stringify(mysql_debug) || 'false')
          return console.log(`^3Removed ${args[1]} from mysql_debug^0`);
        }

      default:
        return console.log(`^3Usage: oxmysql add|remove <resource>^0`);
    }
  },
  true
);
