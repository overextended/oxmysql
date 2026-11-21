export interface Identifier {
  readonly kind: 'identifier';
  readonly parts: readonly string[];
}

export type SelectionExpression =
  | Identifier
  | { readonly kind: 'function'; readonly name: 'unixTimestamp'; readonly column: Identifier };

export type Selection =
  | Identifier
  | { readonly kind: 'alias'; readonly expression: SelectionExpression; readonly alias: string };

export interface OrderSpec {
  readonly column: Identifier;
  readonly direction: 'asc' | 'desc';
}

export type Predicate =
  | { readonly kind: 'comparison'; readonly operator: 'eq'; readonly column: Identifier; readonly value: unknown }
  | { readonly kind: 'collection'; readonly operator: 'inArray'; readonly column: Identifier; readonly values: readonly unknown[] }
  | { readonly kind: 'group'; readonly operator: 'allOf'; readonly predicates: readonly Predicate[] };

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

export type QuerySpec = SelectSpec | InsertSpec | UpdateSpec;
export type BuilderResultMode = 'query' | 'single' | 'insert' | 'update';

export interface CompiledQuery {
  sql: string;
  parameters: unknown[];
}
