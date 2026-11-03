/**
 * Legacy MySQL value-casting helpers retained for compatibility with code that imports
 * this internal utility. The PostgreSQL driver does not use mysql2 field type callbacks.
 */
type TypeCastField = {
  type: string;
  length: number;
  charset: number;
  string: () => string | null;
  buffer: () => Buffer | null;
};
type TypeCastNext = () => unknown;

const BINARY_CHARSET = 63;

export function typeCastExecute(field: TypeCastField, next: TypeCastNext) {
  switch (field.type) {
    case 'DATETIME':
    case 'DATETIME2':
    case 'TIMESTAMP':
    case 'TIMESTAMP2':
    case 'NEWDATE': {
      const value = field.string();
      return value ? new Date(value).getTime() : null;
    }
    case 'DATE': {
      const value = field.string();
      return value ? new Date(value + ' 00:00:00').getTime() : null;
    }
    default:
      return next();
  }
}

/** mysql-async-compatible legacy type conversion. */
export function typeCast(field: TypeCastField, next: TypeCastNext) {
  switch (field.type) {
    case 'DATETIME':
    case 'DATETIME2':
    case 'TIMESTAMP':
    case 'TIMESTAMP2':
    case 'NEWDATE': {
      const value = field.string();
      return value ? new Date(value).getTime() : null;
    }
    case 'DATE': {
      const value = field.string();
      return value ? new Date(value + ' 00:00:00').getTime() : null;
    }
    case 'TINY': {
      if (field.length !== 1) return next();
      const value = field.string();
      return value === null ? null : value === '1';
    }
    case 'BIT': {
      const buffer = field.buffer();
      if (!buffer) return null;
      return buffer.length === 1 ? buffer[0] === 1 : buffer[0];
    }
    case 'TINY_BLOB':
    case 'MEDIUM_BLOB':
    case 'LONG_BLOB':
    case 'BLOB':
      if (field.charset === BINARY_CHARSET) {
        const value = field.buffer();
        if (value === null) return [value];
        return [...value];
      }
      return field.string();
    default:
      return next();
  }
}
