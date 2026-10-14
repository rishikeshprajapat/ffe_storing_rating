import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errMsg } from '../api';
import { homeFor, useAuth } from '../AuthContext';
import Field from '../components/Field';
import { validate } from '../validators';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate(form, ['name', 'email', 'address', 'password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const u = await signup(form);
      navigate(homeFor(u.role));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h2>Create account</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <Field label="Full name (20-60 characters)" error={errors.name}>
        <input value={form.name} onChange={set('name')} maxLength={60} />
      </Field>
      <Field label="Email" error={errors.email}>
        <input type="email" value={form.email} onChange={set('email')} />
      </Field>
      <Field label="Address (max 400 characters)" error={errors.address}>
        <textarea rows={3} value={form.address} onChange={set('address')} maxLength={400} />
      </Field>
      <Field label="Password" error={errors.password}>
        <input type="password" value={form.password} onChange={set('password')} maxLength={16} />
      </Field>
      <button className="btn">Sign up</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
