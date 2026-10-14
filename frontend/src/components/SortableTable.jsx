// columns: [{ key, label, sortable?, render?(row) }]; sorting is performed by the API.
export default function SortableTable({ columns, rows, sort, onSort, onRowClick, empty = 'No records found' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={c.sortable ? 'sortable' : ''}
                onClick={() => c.sortable && onSort(c.key)}
              >
                {c.label}
                {c.sortable && sort.sortBy === c.key && (sort.order === 'asc' ? ' ▲' : ' ▼')}
                {c.sortable && sort.sortBy !== c.key && <span className="muted"> ↕</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="center muted">{empty}</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick?.(r)}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const nextSort = (sort, key) =>
  sort.sortBy === key
    ? { sortBy: key, order: sort.order === 'asc' ? 'desc' : 'asc' }
    : { sortBy: key, order: 'asc' };
