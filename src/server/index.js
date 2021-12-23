import sql_execute from './db/execute.js';
import sql_query from './db/query.js';
import sql_transaction from './db/transaction.js';
require('./versioncheck.js');
require('./deprecated.js');

global.exports('query', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_query('', invokingResource, query, parameters, cb);
});

global.exports('query_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_query('', invokingResource, query, parameters);
});

global.exports('single', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_query('single', invokingResource, query, parameters, cb);
});

global.exports('single_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_query('single', invokingResource, query, parameters);
});

global.exports('scalar', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_query('scalar', invokingResource, query, parameters, cb);
});

global.exports('scalar_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_query('scalar', invokingResource, query, parameters);
});

global.exports('update', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_query('update', invokingResource, query, parameters, cb);
});

global.exports('update_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_query('update', invokingResource, query, parameters);
});

global.exports('insert', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_query('insert', invokingResource, query, parameters, cb);
});

global.exports('insert_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_query('insert', invokingResource, query, parameters);
});

global.exports('transaction', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_transaction(invokingResource, query, parameters, cb);
});

global.exports('transaction_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_transaction(invokingResource, query, parameters);
});

global.exports('prepare', (query, parameters, cb, invokingResource = GetInvokingResource()) => {
  sql_execute(invokingResource, query, parameters, cb);
});

global.exports('prepare_async', (query, parameters, invokingResource = GetInvokingResource()) => {
  return sql_execute(invokingResource, query, parameters);
});
