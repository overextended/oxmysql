export const resourceName = GetCurrentResourceName();
export const mysql_ui = GetConvar('mysql_ui', 'false') === 'true';
export const mysql_slow_query_warning = GetConvarInt('mysql_slow_query_warning', 200);
export const mysql_connection_string = GetConvar('mysql_connection_string', '');
export let mysql_debug: boolean | string[];

try {
  const debug = GetConvar('mysql_debug', 'false');
  mysql_debug = debug === 'false' ? false : JSON.parse(debug);
} catch (e) {
  mysql_debug = true;
}

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

RegisterCommand(
  'oxmysql_debug',
  (source: number, args: string[]) => {
    if (source !== 0) return console.log('^3This command can only be run server side^0');
    switch (args[0]) {
      case 'add':
        if (!Array.isArray(mysql_debug)) mysql_debug = [];
        mysql_debug.push(args[1]);
        return console.log(`^3Added ${args[1]} to mysql_debug^0`);

      case 'remove':
        if (Array.isArray(mysql_debug)) {
          const index = mysql_debug.indexOf(args[1]);
          if (index === -1) return;
          mysql_debug.splice(index, 1);
          if (mysql_debug.length === 0) mysql_debug = false;
          return console.log(`^3Removed ${args[1]} from mysql_debug^0`);
        }

      default:
        return console.log(`^3Usage: oxmysql add|remove <resource>^0`);
    }
  },
  true
);
