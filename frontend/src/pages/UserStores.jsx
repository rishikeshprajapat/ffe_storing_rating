import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import SortableTable, { nextSort } from '../components/SortableTable';
import { StarDisplay, StarInput } from '../components/Stars';

export default function UserStores() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [pending, setPending] = useState({}); // storeId -> selected rating
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/stores', { params: { ...search, ...sort } });
      setRows(data);
    } catch (e) { setMsg({ type: 'error', text: errMsg(e) }); }
  }, [search, sort]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const save = async (store) => {
    const rating = pending[store.id];
    if (!rating) return;
    try {
      await api.put(`/stores/${store.id}/rating`, { rating });
      setPending((p) => { const n = { ...p }; delete n[store.id]; return n; });
      setMsg({ type: 'success', text: `Rating saved for ${store.name}` });
      load();
    } catch (e) { setMsg({ type: 'error', text: errMsg(e) }); }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall Rating', sortable: true, render: (r) => <StarDisplay value={r.overall_rating} /> },
    { key: 'myRating', label: 'Your Rating', sortable: true, render: (r) => (r.my_rating ? `${r.my_rating} / 5` : <span className="muted">Not rated</span>) },
    {
      key: 'action', label: 'Rate / Modify',
      render: (r) => (
        <div className="rate-cell">
          <StarInput value={pending[r.id] ?? r.my_rating} onChange={(n) => setPending({ ...pending, [r.id]: n })} />
          <button className="btn btn-sm" disabled={!pending[r.id]} onClick={() => save(r)}>
            {r.my_rating ? 'Modify' : 'Submit'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <h2>Stores</h2>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="filters">
        <input placeholder="Search by name" value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        <input placeholder="Search by address" value={search.address} onChange={(e) => setSearch({ ...search, address: e.target.value })} />
      </div>
      <SortableTable columns={columns} rows={rows} sort={sort} onSort={(k) => setSort(nextSort(sort, k))} />
    </>
  );
}
