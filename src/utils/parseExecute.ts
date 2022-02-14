export const parseExecute = (query: string) => {
  switch (query.replace(/\s.*/, '')) {
    case 'SELECT':
      return 'execute';
    case 'INSERT':
      return 'insert';
    case 'UPDATE':
      return 'update';
    case 'DELETE':
      return 'update';
    default:
      return false;
  }
};
