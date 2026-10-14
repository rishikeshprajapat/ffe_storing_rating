import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errMsg } from '../api';
import { homeFor, useAuth } from '../AuthContext';
import Field from '../components/Field';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      navigate(homeFor(u.role));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Login</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <Field label="Email">
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="Password">
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Field>
      <button className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      <p className="muted">No account? <Link to="/signup">Sign up</Link></p>
    </form>
  );
}
