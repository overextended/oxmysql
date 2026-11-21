export interface Identifier {
  readonly kind: 'identifier';
  readonly parts: readonly string[];
}

export interface RawExpression {
  readonly kind: 'raw';
  readonly sql: string;
  readonly bindings?: readonly (string | number | boolean)[];
}

export type ColumnExpression = Identifier | RawExpression;

export type SelectionExpression =
  | ColumnExpression
  | { readonly kind: 'function'; readonly name: 'unixTimestamp'; readonly column: Identifier };

export type Selection =
  | ColumnExpression
  | { readonly kind: 'alias'; readonly expression: SelectionExpression; readonly alias: string };

export interface OrderSpec {
  readonly column: Identifier;
  readonly direction: 'asc' | 'desc';
}

export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like';

export type Predicate =
  | RawExpression
  | { readonly kind: 'comparison'; readonly operator: ComparisonOperator; readonly column: ColumnExpression; readonly value: unknown }
  | { readonly kind: 'collection'; readonly operator: 'inArray'; readonly column: ColumnExpression; readonly values: readonly unknown[] }
  | { readonly kind: 'null'; readonly operator: 'isNull' | 'isNotNull'; readonly column: ColumnExpression }
  | { readonly kind: 'group'; readonly operator: 'allOf' | 'anyOf'; readonly predicates: readonly Predicate[] };

export interface SelectSpec {
  readonly kind: 'select';
  readonly from: Identifier;
  readonly columns: readonly Selection[] | '*';
  readonly where?: Predicate;
  readonly orderBy?: readonly OrderSpec[];
  readonly limit?: number;
}

export interface InsertSpec {
  readonly kind: 'insert';
  readonly into: Identifier;
  readonly rows: readonly Readonly<Record<string, unknown>>[];
}

export interface UpdateSpec {
  readonly kind: 'update';
  readonly table: Identifier;
  readonly values: Readonly<Record<string, unknown>>;
  readonly where?: Predicate;
  readonly allowAll?: boolean;
}

export interface DeleteSpec {
  readonly kind: 'delete';
  readonly table: Identifier;
  readonly where?: Predicate;
  readonly allowAll?: boolean;
}

export type QuerySpec = SelectSpec | InsertSpec | UpdateSpec | DeleteSpec;
export type BuilderResultMode = 'query' | 'single' | 'insert' | 'update' | 'delete';

export interface CompiledQuery {
  sql: string;
  parameters: unknown[];
}
