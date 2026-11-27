import type { Knex } from 'knex';
import type { ComparisonOperator, CompiledQuery } from './types';

// Bypass Knex's dialect resolver; only MySQL compilation is needed here.
const MySQLClient: typeof Knex.Client = require('knex/lib/dialects/mysql');
const client = new MySQLClient({
  client: 'mysql',
  // Tokens preserve literal identifier parts, including whitespace and " as ".
  wrapIdentifier: (name, quote, identifiers) => quote(identifiers?.[name] ?? name),
});

const comparisonOperators = {
  eq: '=',
  ne: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'like',
} as const satisfies Record<ComparisonOperator, string>;

// mysql2 also substitutes question marks inside quoted text and comments.
const rawSqlTokens = new RegExp([
  /'(?:\\.|[^'\\])*(?:'|$)|"(?:\\.|[^"\\])*(?:"|$)/.source, // strings
  /`[^`]*(?:`|$)/.source, // quoted identifiers
  /\/\*.*?(?:\*\/|$)|(?:#|--(?=\s))[^\r\n]*/.source, // comments
  /\\?\?+/.source, // placeholders
].join('|'), 'gs');

function record(value: unknown, fields: readonly string[] | null, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`queryBuilder: ${label} must be a plain object.`);

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null)
    throw new Error(`queryBuilder: ${label} must be a plain object.`);

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || (fields && !fields.includes(key)) || !('value' in Object.getOwnPropertyDescriptor(value, key)!))
      throw new Error(`queryBuilder: unsupported ${label} field.`);
  }

  return value as Record<string, unknown>;
}

function array(value: unknown, label: string, allowEmpty = false): unknown[] {
  if (!Array.isArray(value) || (!allowEmpty && !value.length) || Object.keys(value).length !== value.length)
    throw new Error(`queryBuilder: ${label} must be a ${allowEmpty ? '' : 'non-empty '}dense array.`);

  for (let index = 0; index < value.length; index++) {
    if (!Object.hasOwn(value, index)) throw new Error(`queryBuilder: ${label} must be a dense array.`);
  }

  return value;
}

export function compileQuery(input: unknown): CompiledQuery {
  const spec = record(input, null, 'statement');
  const identifiers: Record<string, string> = Object.create(null);
  let nextIdentifier = 0;
  const part = (value: unknown): string => {
    if (typeof value !== 'string' || !value.trim() || /[.*?\u0000-\u001f\u007f]/.test(value))
      throw new Error('queryBuilder: identifier segments must be non-empty and cannot contain dots, wildcards, placeholders, or control characters.');
    const token = `i${String(nextIdentifier++).padStart(10, '0')}`;
    identifiers[token] = value;
    return token;
  };
  const scalar = (value: unknown): string | boolean | number => {
    if (typeof value !== 'string' && typeof value !== 'boolean' && !(typeof value === 'number' && Number.isFinite(value)))
      throw new Error('queryBuilder: values must be non-null strings, booleans, or finite numbers.');
    return value;
  };

  const identifier = (input: unknown): string => {
    const value = record(input, ['kind', 'parts'], 'identifier');
    if (value.kind !== 'identifier') throw new Error('queryBuilder: expected identifier kind.');

    return array(value.parts, 'identifier parts').map(part).join('.');
  };

  const raw = (value: Record<string, unknown>): Knex.Raw => {
    record(value, ['kind', 'sql', 'bindings'], 'raw expression');
    if (typeof value.sql !== 'string' || !value.sql.trim())
      throw new Error('queryBuilder: raw SQL must be a non-empty string.');

    const bindings = Object.hasOwn(value, 'bindings') ? array(value.bindings, 'raw bindings', true) : [];
    const placeholders = (value.sql.match(rawSqlTokens) ?? []).filter((token) => token.includes('?'));
    if (placeholders.some((token) => token !== '?' && token !== '??'))
      throw new Error('queryBuilder: raw placeholders must be unquoted ? or ??. Bind literal question marks as values.');
    if (placeholders.length !== bindings.length)
      throw new Error(`queryBuilder: raw SQL expects ${placeholders.length} bindings, received ${bindings.length}.`);

    const parameters = placeholders.map((placeholder, index) => {
      const binding = bindings[index];
      if (placeholder === '?') return scalar(binding);
      if (typeof binding !== 'string') throw new Error('queryBuilder: ?? requires a column identifier string.');
      return binding.split('.').map(part).join('.');
    });
    return client.raw(value.sql, parameters).queryContext(identifiers);
  };

  const predicateColumn = (input: unknown): Knex.Raw => {
    const value = record(input, null, 'predicate column');
    return value.kind === 'raw' ? raw(value).wrap('(', ')') : client.ref(identifier(value));
  };

  const selection = (input: unknown): string | Knex.Raw => {
    const value = record(input, null, 'selection');
    if (value.kind === 'identifier') return identifier(value);
    if (value.kind === 'raw') return raw(value);

    record(value, ['kind', 'expression', 'alias'], 'aliased selection');
    if (value.kind !== 'alias') throw new Error('queryBuilder: unsupported selection kind.');

    const alias = part(value.alias);
    const expression = record(value.expression, null, 'selection expression');
    if (expression.kind === 'identifier') return client.raw('?? as ??', [identifier(expression), alias]);
    if (expression.kind === 'raw') return client.raw('?? as ??', [raw(expression), alias]);

    record(expression, ['kind', 'name', 'column'], 'selection function');
    if (expression.kind !== 'function' || expression.name !== 'unixTimestamp')
      throw new Error('queryBuilder: unsupported selection function.');

    return client.raw('unix_timestamp(??) as ??', [identifier(expression.column), alias]);
  };

  const predicate = (query: Knex.QueryBuilder, input: unknown, depth = 0, disjunction = false): void => {
    if (depth >= 64) throw new Error('queryBuilder: predicate nesting exceeds 64 levels.');
    const value = record(input, null, 'predicate');
    const where = disjunction ? 'orWhere' : 'where';

    switch (value.kind) {
      case 'raw':
        query[where](raw(value).wrap('(', ')'));
        break;
      case 'comparison': {
        record(value, ['kind', 'operator', 'column', 'value'], 'comparison');
        const { operator } = value;
        if (typeof operator !== 'string' || !Object.hasOwn(comparisonOperators, operator))
          throw new Error('queryBuilder: unsupported comparison operator.');
        if (operator === 'like' && typeof value.value !== 'string')
          throw new Error('queryBuilder: like pattern must be a string.');
        query[where](predicateColumn(value.column), comparisonOperators[operator as ComparisonOperator], scalar(value.value));
        break;
      }
      case 'collection': {
        record(value, ['kind', 'operator', 'column', 'values'], 'collection');
        if (value.operator !== 'inArray') throw new Error('queryBuilder: unsupported collection operator.');
        const column = predicateColumn(value.column);
        const values = array(value.values, 'inArray values', true).map(scalar);
        if (values.length) query[where](column, 'in', values as Knex.Value);
        else query[`${where}Raw`]('1 = 0');
        break;
      }
      case 'null': {
        record(value, ['kind', 'operator', 'column'], 'null predicate');
        if (value.operator !== 'isNull' && value.operator !== 'isNotNull')
          throw new Error('queryBuilder: unsupported null operator.');
        query[where](predicateColumn(value.column), value.operator === 'isNull' ? 'is' : 'is not', null);
        break;
      }
      case 'group': {
        record(value, ['kind', 'operator', 'predicates'], 'group');
        if (value.operator !== 'allOf' && value.operator !== 'anyOf') throw new Error('queryBuilder: unsupported group operator.');
        const children = array(value.predicates, `${value.operator} predicates`);
        const useOr = value.operator === 'anyOf';
        query[where]((group) => {
          group.queryContext(identifiers);
          for (const child of children) predicate(group, child, depth + 1, useOr);
        });
        break;
      }
      default:
        throw new Error('queryBuilder: unsupported predicate kind.');
    }
  };

  const valuesMap = (input: unknown): { values: Record<string, unknown>; keys: string[] } => {
    const values = record(input, null, 'values');
    const keys = Object.keys(values).sort();
    if (!keys.length || keys.length !== Reflect.ownKeys(values).length)
      throw new Error('queryBuilder: values must be a non-empty map with enumerable column names.');
    return { values, keys };
  };

  const query = client.queryBuilder().queryContext(identifiers);
  switch (spec.kind) {
    case 'select': {
      record(spec, ['kind', 'from', 'columns', 'where', 'groupBy', 'orderBy', 'limit'], 'select');
      const columns = spec.columns === '*' ? '*' : array(spec.columns, 'select columns').map(selection);
      query.select(columns).from(identifier(spec.from));
      if (Object.hasOwn(spec, 'where')) predicate(query, spec.where);
      if (Object.hasOwn(spec, 'groupBy')) query.groupBy(array(spec.groupBy, 'groupBy columns').map(identifier));
      if (Object.hasOwn(spec, 'orderBy')) {
        for (const input of array(spec.orderBy, 'orderBy')) {
          const order = record(input, ['column', 'direction'], 'orderBy entry');
          if (order.direction !== 'asc' && order.direction !== 'desc')
            throw new Error('queryBuilder: order direction must be asc or desc.');
          query.orderBy(identifier(order.column), order.direction);
        }
      }
      if (Object.hasOwn(spec, 'limit')) {
        if (typeof spec.limit !== 'number' || !Number.isSafeInteger(spec.limit) || spec.limit < 0)
          throw new Error('queryBuilder: limit must be a non-negative safe integer.');
        query.limit(spec.limit);
      }
      break;
    }
    case 'insert':
    case 'upsert': {
      const isUpsert = spec.kind === 'upsert';
      record(spec, isUpsert ? ['kind', 'into', 'row', 'updateColumns'] : ['kind', 'into', 'rows'], spec.kind);
      const table = identifier(spec.into);
      const rows = isUpsert ? [valuesMap(spec.row)] : array(spec.rows, 'insert rows').map(valuesMap);
      const { keys } = rows[0];
      const columns = keys.map(part);
      query.table(table).insert(rows.map((row) => {
        if (row.keys.length !== keys.length || row.keys.some((key, index) => key !== keys[index]))
          throw new Error('queryBuilder: insert rows must have the same column names.');
        const values: Record<string, unknown> = {};
        for (let i = 0; i < keys.length; i++) values[columns[i]] = scalar(row.values[keys[i]]);
        return values;
      }));
      if (isUpsert) {
        const updates = array(spec.updateColumns, 'upsert update columns').map((column) => {
          if (typeof column !== 'string' || !Object.hasOwn(rows[0].values, column))
            throw new Error('queryBuilder: upsert update columns must be present in the row.');
          return column;
        });
        if (new Set(updates).size !== updates.length)
          throw new Error('queryBuilder: upsert update columns must be unique.');
        query.onConflict().merge(updates.map(part));
      }
      break;
    }
    case 'update':
    case 'delete': {
      const kind = spec.kind;
      const fields = ['kind', 'table', 'where', 'allowAll'];
      if (kind === 'update') fields.push('values');
      record(spec, fields, kind);
      const allowAll = Object.hasOwn(spec, 'allowAll') ? spec.allowAll : false;
      if (typeof allowAll !== 'boolean')
        throw new Error('queryBuilder: allowAll must be a boolean.');
      const hasWhere = Object.hasOwn(spec, 'where');
      if (!hasWhere && !allowAll)
        throw new Error(`queryBuilder: ${kind} requires a predicate or allowAll().`);
      query.table(identifier(spec.table));
      if (kind === 'update') {
        const { values, keys } = valuesMap(spec.values);
        const updates: Record<string, unknown> = {};
        for (const key of keys) updates[part(key)] = scalar(values[key]);
        query.update(updates);
      } else {
        query.delete();
      }
      if (hasWhere) predicate(query, spec.where);
      break;
    }
    default:
      throw new Error('queryBuilder: unsupported statement kind. Expected select, insert, upsert, update, or delete.');
  }

  const { sql, bindings } = query.toSQL();
  return { sql, parameters: bindings as unknown[] };
}
