type Field = {
  type: string;
  length: number;
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
    case 'DATE':
      return field.type === 'DATE' ? new Date(field.string() + ' 00:00:00').getTime() : new Date(field.string()).getTime();
    case 'TINY':
      return field.length === 1 ? field.string() === '1' : next();
    case 'BIT':
      return field.buffer()[0] === 1;
    default:
      return next();
  }
};
