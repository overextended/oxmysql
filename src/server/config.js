export const resourceName = GetCurrentResourceName();

export const mysql_debug = GetConvar('mysql_debug', 'false') === 'true';
export const mysql_slow_query_warning = GetConvarInt('mysql_slow_query_warning', 200);
export const mysql_connection_string = GetConvar('mysql_connection_string', '');

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

export const typeCast = (field, next) => {
  switch (field.type) {
    case 'DATETIME':
    case 'DATETIME2':
    case 'TIMESTAMP':
    case 'TIMESTAMP2':
    case 'NEWDATE':
    case 'DATE':
      return field.type === 'DATE' ? new Date(field.string() + ' 00:00:00').getTime() : new Date(field.string()).getTime();
    case 'TINY':
      return field.length === 1 ? field.string() === '1' : next();
    case 'BIT':
      return field.buffer()[0] === 1;
    default:
      return next();
  }
};
