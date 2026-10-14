import { useState } from 'react';
import api, { errMsg } from '../api';
import Field from '../components/Field';
import { validate } from '../validators';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate({ password: form.newPassword }, ['password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.put('/auth/password', form);
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h2>Update password</h2>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <Field label="Current password">
        <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      </Field>
      <Field label="New password" error={errors.password}>
        <input type="password" maxLength={16} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      </Field>
      <button className="btn">Update password</button>
    </form>
  );
}
