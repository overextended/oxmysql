import type { Knex } from 'knex';
import type { CompiledQuery } from './types';

// Bypass Knex's dialect resolver; only MySQL compilation is needed here.
const MySQLClient: typeof Knex.Client = require('knex/lib/dialects/mysql');
const client = new MySQLClient({
  client: 'mysql',
  // Tokens preserve literal identifier parts, including whitespace and " as ".
  wrapIdentifier: (name, quote, identifiers) => quote(identifiers?.[name] ?? name),
});

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

  const selection = (input: unknown): string | Knex.Raw => {
    const value = record(input, ['kind', 'parts', 'expression', 'alias'], 'selection');
    if (value.kind === 'identifier') return identifier(value);

    record(value, ['kind', 'expression', 'alias'], 'aliased selection');
    if (value.kind !== 'alias') throw new Error('queryBuilder: unsupported selection kind.');

    const alias = part(value.alias);
    const expression = record(value.expression, ['kind', 'parts', 'name', 'column'], 'selection expression');
    if (expression.kind === 'identifier') return client.raw('?? as ??', [identifier(expression), alias]);

    record(expression, ['kind', 'name', 'column'], 'selection function');
    if (expression.kind !== 'function' || expression.name !== 'unixTimestamp')
      throw new Error('queryBuilder: unsupported selection function.');

    return client.raw('unix_timestamp(??) as ??', [identifier(expression.column), alias]);
  };

  const predicate = (query: Knex.QueryBuilder, input: unknown, depth = 0): void => {
    if (depth >= 64) throw new Error('queryBuilder: predicate nesting exceeds 64 levels.');
    const value = record(input, ['kind', 'operator', 'column', 'value', 'values', 'predicates'], 'predicate');

    switch (value.kind) {
      case 'comparison': {
        record(value, ['kind', 'operator', 'column', 'value'], 'comparison');
        if (value.operator !== 'eq') throw new Error('queryBuilder: unsupported comparison operator.');
        query.where(identifier(value.column), '=', scalar(value.value));
        break;
      }
      case 'collection': {
        record(value, ['kind', 'operator', 'column', 'values'], 'collection');
        if (value.operator !== 'inArray') throw new Error('queryBuilder: unsupported collection operator.');
        const column = identifier(value.column);
        const values = array(value.values, 'inArray values', true).map(scalar);
        if (values.length) query.whereIn(column, values);
        else query.whereRaw('1 = 0');
        break;
      }
      case 'group': {
        record(value, ['kind', 'operator', 'predicates'], 'group');
        if (value.operator !== 'allOf') throw new Error('queryBuilder: unsupported group operator.');
        const children = array(value.predicates, 'allOf predicates');
        query.where((group) => {
          group.queryContext(identifiers);
          for (const child of children) predicate(group, child, depth + 1);
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
      record(spec, ['kind', 'from', 'columns', 'where', 'orderBy', 'limit'], 'select');
      const columns = spec.columns === '*' ? '*' : array(spec.columns, 'select columns').map(selection);
      query.select(columns).from(identifier(spec.from));
      if (Object.hasOwn(spec, 'where')) predicate(query, spec.where);
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
    case 'insert': {
      record(spec, ['kind', 'into', 'rows'], 'insert');
      const table = identifier(spec.into);
      const rows = array(spec.rows, 'insert rows').map(valuesMap);
      const { keys } = rows[0];
      const columns = keys.map(part);
      query.table(table).insert(rows.map((row) => {
        if (row.keys.length !== keys.length || row.keys.some((key, index) => key !== keys[index]))
          throw new Error('queryBuilder: insert rows must have the same column names.');
        const values: Record<string, unknown> = {};
        for (let i = 0; i < keys.length; i++) values[columns[i]] = scalar(row.values[keys[i]]);
        return values;
      }));
      break;
    }
    case 'update': {
      record(spec, ['kind', 'table', 'values', 'where', 'allowAll'], 'update');
      if (Object.hasOwn(spec, 'allowAll') && typeof spec.allowAll !== 'boolean')
        throw new Error('queryBuilder: allowAll must be a boolean.');
      if (!Object.hasOwn(spec, 'where') && spec.allowAll !== true)
        throw new Error('queryBuilder: update requires a predicate or allowAll().');
      const table = identifier(spec.table);
      const { values, keys } = valuesMap(spec.values);
      const updates: Record<string, unknown> = {};
      for (const key of keys) updates[part(key)] = scalar(values[key]);
      query.table(table).update(updates);
      if (Object.hasOwn(spec, 'where')) predicate(query, spec.where);
      break;
    }
    default:
      throw new Error('queryBuilder: unsupported statement kind; expected select, insert, or update.');
  }

  const { sql, bindings } = query.toSQL();
  return { sql, parameters: bindings as unknown[] };
}
