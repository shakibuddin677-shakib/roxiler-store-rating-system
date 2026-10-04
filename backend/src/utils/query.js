// Sorting: user input only SELECTS a column from a whitelist, it is never pasted into SQL.
exports.buildOrderBy = (columnMap, sortBy, order, defaultKey) => {
  const column = columnMap[sortBy] || columnMap[defaultKey];
  const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${column} ${direction}`;
};

// Filtering: values are always parameterized ($1, $2 ...).
exports.buildFilters = (filters) => {
  const clauses = [];
  const values = [];
  filters.forEach(({ column, value, exact }) => {
    if (value === undefined || value === '') return;
    values.push(exact ? value : `%${exports.escapeLike(value)}%`);
    clauses.push(`${column} ${exact ? '=' : 'ILIKE'} $${values.length}`);
  });
  return { where: clauses.length ? 'WHERE ' + clauses.join(' AND ') : '', values };
};

// Escape %, _ and \ so user input is matched literally inside ILIKE patterns.
exports.escapeLike = (v) => String(v).replace(/[\\%_]/g, '\\$&');

// Parse a route id into a valid Postgres INT (1..2^31-1); returns null if invalid.
exports.parseId = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 2147483647 ? n : null;
};
