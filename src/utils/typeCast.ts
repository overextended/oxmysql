import type { TypeCastField, TypeCastNext } from 'mysql2/promise';

const BINARY_CHARSET = 63;

interface Field extends TypeCastField {
  charset: number;
}

/**
 * node-mysql2 v3.9.0 introduced (breaking) typecasting for execute methods.
 */
export function typeCastExecute(field: Field, next: TypeCastNext) {
  return next();
}

/**
 * mysql-async compatible typecasting.
 */
export function typeCast(field: Field, next: TypeCastNext) {
  switch (field.type) {
    case 'DATETIME':
    case 'DATETIME2':
    case 'TIMESTAMP':
    case 'TIMESTAMP2':
    case 'NEWDATE':
      return new Date(field.string() || '').getTime();
    case 'DATE':
      return new Date(field.string() + ' 00:00:00').getTime();
    case 'TINY':
      return field.length === 1 ? field.string() === '1' : next();
    case 'BIT':
      return field.length === 1 ? field.buffer()?.[0] === 1 : field.buffer()?.[0];
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
