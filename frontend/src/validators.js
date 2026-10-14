export const validators = {
  name: (v) => (v.length < 20 || v.length > 60 ? 'Name must be 20-60 characters' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email'),
  address: (v) => (!v ? 'Address is required' : v.length > 400 ? 'Max 400 characters' : ''),
  password: (v) =>
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(v)
      ? ''
      : 'Password: 8-16 chars, one uppercase letter and one special character',
};

export function validate(values, fields) {
  const errors = {};
  fields.forEach((f) => {
    const msg = validators[f](values[f] || '');
    if (msg) errors[f] = msg;
  });
  return errors;
}
