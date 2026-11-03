const oversizedResultSet = GetConvarInt('mysql_resultset_warning', 1000);

export default function (invokingResource: string, query: string, rows: unknown) {
  const length = Array.isArray(rows) ? rows.length : 0;
  if (length < oversizedResultSet) return;

  console.warn(`${invokingResource} executed a query with an oversized result set (${length} results)!\n${query}`);
}
