import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Field from '../components/Field';
import SortableTable, { nextSort } from '../components/SortableTable';
import { validate } from '../validators';

const ROLE_LABEL = { admin: 'Admin', user: 'Normal User', store_owner: 'Store Owner' };

function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setStats(r.data)); }, []);
  if (!stats) return <p>Loading…</p>;
  return (
    <div className="stats">
      <div className="card stat"><h3>Total Users</h3><div className="big">{stats.users}</div></div>
      <div className="card stat"><h3>Total Stores</h3><div className="big">{stats.stores}</div></div>
      <div className="card stat"><h3>Total Ratings</h3><div className="big">{stats.ratings}</div></div>
    </div>
  );
}

function UsersList() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/users', { params: { ...filters, ...sort } });
    setRows(data);
  }, [filters, sort]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const open = async (r) => setDetail((await api.get(`/admin/users/${r.id}`)).data);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => ROLE_LABEL[r.role] },
  ];
  const f = (k) => ({ value: filters[k], onChange: (e) => setFilters({ ...filters, [k]: e.target.value }) });

  return (
    <>
      <div className="filters">
        <input placeholder="Filter by name" {...f('name')} />
        <input placeholder="Filter by email" {...f('email')} />
        <input placeholder="Filter by address" {...f('address')} />
        <select {...f('role')}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <SortableTable columns={columns} rows={rows} sort={sort} onSort={(k) => setSort(nextSort(sort, k))} onRowClick={open} />
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h3>User details</h3>
            <p><b>Name:</b> {detail.name}</p>
            <p><b>Email:</b> {detail.email}</p>
            <p><b>Address:</b> {detail.address}</p>
            <p><b>Role:</b> {ROLE_LABEL[detail.role]}</p>
            {detail.role === 'store_owner' && <p><b>Store Rating:</b> {detail.rating} / 5</p>}
            <button className="btn" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

function StoresList() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/stores', { params: { ...filters, ...sort } });
    setRows(data);
  }, [filters, sort]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => `${r.rating} / 5` },
  ];
  const f = (k) => ({ value: filters[k], onChange: (e) => setFilters({ ...filters, [k]: e.target.value }) });

  return (
    <>
      <div className="filters">
        <input placeholder="Filter by name" {...f('name')} />
        <input placeholder="Filter by email" {...f('email')} />
        <input placeholder="Filter by address" {...f('address')} />
      </div>
      <SortableTable columns={columns} rows={rows} sort={sort} onSort={(k) => setSort(nextSort(sort, k))} />
    </>
  );
}

function AddUser() {
  const empty = { name: '', email: '', address: '', password: '', role: 'user' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['name', 'email', 'address', 'password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/users', form);
      setMsg({ type: 'success', text: 'User created' });
      setForm(empty);
    } catch (err) { setMsg({ type: 'error', text: errMsg(err) }); }
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h3>Add user</h3>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <Field label="Name (20-60 characters)" error={errors.name}><input value={form.name} maxLength={60} onChange={set('name')} /></Field>
      <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
      <Field label="Address" error={errors.address}><textarea rows={3} value={form.address} maxLength={400} onChange={set('address')} /></Field>
      <Field label="Password" error={errors.password}><input type="password" maxLength={16} value={form.password} onChange={set('password')} /></Field>
      <Field label="Role">
        <select value={form.role} onChange={set('role')}>
          {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <button className="btn">Create user</button>
    </form>
  );
}

function AddStore() {
  const empty = { name: '', email: '', address: '', ownerId: '' };
  const [form, setForm] = useState(empty);
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { api.get('/admin/store-owners').then((r) => setOwners(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['email', 'address']);
    if (!form.name.trim() || form.name.length > 60) errs.name = 'Store name is required (max 60 characters)';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      setMsg({ type: 'success', text: 'Store created' });
      setForm(empty);
    } catch (err) { setMsg({ type: 'error', text: errMsg(err) }); }
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h3>Add store</h3>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <Field label="Store name" error={errors.name}><input value={form.name} maxLength={60} onChange={set('name')} /></Field>
      <Field label="Store email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
      <Field label="Address" error={errors.address}><textarea rows={3} value={form.address} maxLength={400} onChange={set('address')} /></Field>
      <Field label="Owner (store owner users only)">
        <select value={form.ownerId} onChange={set('ownerId')}>
          <option value="">— No owner —</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
        </select>
      </Field>
      <button className="btn">Create store</button>
    </form>
  );
}

const TABS = { Overview, Users: UsersList, Stores: StoresList, 'Add User': AddUser, 'Add Store': AddStore };

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const Active = TABS[tab];
  return (
    <>
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        {Object.keys(TABS).map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <Active key={tab} />
    </>
  );
}
