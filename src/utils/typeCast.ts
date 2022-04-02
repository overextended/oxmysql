import { FieldPacket } from 'mysql2';

const BINARY_CHARSET = 63;

type Field = {
  type: string;
  length: number;
  packet: FieldPacket;
  charset: number;
  string: () => string;
  buffer: () => number[];
};

export const typeCast = (field: Field, next: () => void) => {
  switch (field.type) {
    case 'DATETIME':
    case 'DATETIME2':
    case 'TIMESTAMP':
    case 'TIMESTAMP2':
    case 'NEWDATE':
      return new Date(field.string()).getTime();
    case 'DATE':
      return new Date(field.string() + ' 00:00:00').getTime();
    case 'TINY':
      return field.length === 1 ? field.string() === '1' : next();
    case 'BIT':
      return field.length === 1 ? field.buffer()[0] === 1 : field.buffer()[0];
    case 'TINY_BLOB':
    case 'MEDIUM_BLOB':
    case 'LONG_BLOB':
    case 'BLOB':
      if (field.charset === BINARY_CHARSET) {
        const value = field.buffer();
		if (value === null) return [value]
        return [...value];
      }
      return field.string();
    default:
      return next();
  }
};
