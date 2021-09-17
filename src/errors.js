class FormatError extends Error {
  constructor(message, query, parameters) {
    super(message);
    if (parameters) this.sql = `${query} ${JSON.stringify(parameters)}`;
    else this.sql = query;
  }
}

export { FormatError };
