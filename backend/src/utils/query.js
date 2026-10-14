// Builds safe WHERE / ORDER BY clauses (column names are whitelisted, values parameterised)
function buildFilters(query, columnMap, exactCols = []) {
  const clauses = [];
  const values = [];
  for (const [param, column] of Object.entries(columnMap)) {
    const v = query[param];
    if (v === undefined || v === '') continue;
    values.push(exactCols.includes(param) ? v : `%${v}%`);
    clauses.push(exactCols.includes(param)
      ? `${column} = $${values.length}`
      : `${column} ILIKE $${values.length}`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
}

function buildOrder(query, allowed, fallback) {
  const col = allowed[query.sortBy] || allowed[fallback];
  const dir = String(query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${col} ${dir}, 1 ASC`;
}

module.exports = { buildFilters, buildOrder };
