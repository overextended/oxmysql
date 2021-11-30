const slowQueryWarning = GetConvarInt('mysql_slow_query_warning', 150);
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
  }
})();

const resourceName = GetCurrentResourceName();

export { slowQueryWarning, debug, isolationLevel, resourceName };
