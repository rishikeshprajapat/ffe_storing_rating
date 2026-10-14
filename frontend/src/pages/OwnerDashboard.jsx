import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import SortableTable, { nextSort } from '../components/SortableTable';
import { StarDisplay } from '../components/Stars';

export default function OwnerDashboard() {
  const [data, setData] = useState({ stores: [], raters: [] });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setData((await api.get('/owner/dashboard', { params: sort })).data); }
    catch (e) { setError(errMsg(e)); }
  }, [sort]);
  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'name', label: 'User', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'store', label: 'Store' },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => `${r.rating} / 5` },
    { key: 'date', label: 'Updated', sortable: true, render: (r) => new Date(r.updated_at).toLocaleDateString() },
  ];

  return (
    <>
      <h2>Store Owner Dashboard</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {data.stores.length === 0 && !error && <p className="muted">No store is assigned to your account yet.</p>}
      <div className="stats">
        {data.stores.map((s) => (
          <div className="card stat" key={s.id}>
            <h3>{s.name}</h3>
            <p className="muted">{s.address}</p>
            <div className="big"><StarDisplay value={s.average_rating} /></div>
            <small>{s.total_ratings} rating(s)</small>
          </div>
        ))}
      </div>
      <h3>Users who rated your store</h3>
      <SortableTable columns={columns} rows={data.raters} sort={sort} onSort={(k) => setSort(nextSort(sort, k))} empty="No ratings yet" />
    </>
  );
}
