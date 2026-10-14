const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { signupRules, loginRules, passwordRules } = require('../middleware/validate');

const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name },
  process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

// Public signup => always a normal user
router.post('/signup', signupRules, async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rowCount) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1,$2,$3,$4,'user') RETURNING id, name, email, role`,
      [name, email, hash, address]);
    res.status(201).json({ token: sign(rows[0]), user: rows[0] });
  } catch (e) { next(e); }
});

router.post('/login', loginRules, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/password', authenticate, passwordRules, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
});

module.exports = router;
