const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { adminUserRules, storeRules } = require('../middleware/validate');
const { buildFilters, buildOrder } = require('../utils/query');

router.use(authenticate, authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT (SELECT COUNT(*) FROM users)::int   AS users,
             (SELECT COUNT(*) FROM stores)::int  AS stores,
             (SELECT COUNT(*) FROM ratings)::int AS ratings`);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// ---- Users ----
router.get('/users', async (req, res, next) => {
  try {
    const { where, values } = buildFilters(req.query,
      { name: 'name', email: 'email', address: 'address', role: 'role' }, ['role']);
    const order = buildOrder(req.query,
      { name: 'name', email: 'email', address: 'address', role: 'role' }, 'name');
    const { rows } = await pool.query(
      `SELECT id, name, email, address, role FROM users ${where} ${order}`, values);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1', [req.params.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'store_owner') {
      const r = await pool.query(
        `SELECT ROUND(AVG(r.rating), 2) AS rating
           FROM stores s JOIN ratings r ON r.store_id = s.id WHERE s.owner_id = $1`, [user.id]);
      user.rating = r.rows[0].rating ? Number(r.rows[0].rating) : 0;
    }
    res.json(user);
  } catch (e) { next(e); }
});

router.post('/users', adminUserRules, async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;
    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rowCount) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, address, role`,
      [name, email, hash, address, role]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// ---- Stores ----
router.get('/stores', async (req, res, next) => {
  try {
    const { where, values } = buildFilters(req.query,
      { name: 's.name', email: 's.email', address: 's.address' });
    const order = buildOrder(req.query,
      { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' }, 'name');
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating), 2), 0)::float AS rating
         FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
         ${where} GROUP BY s.id ${order}`, values);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/stores', storeRules, async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    if (ownerId) {
      const o = await pool.query("SELECT 1 FROM users WHERE id = $1 AND role = 'store_owner'", [ownerId]);
      if (!o.rowCount) return res.status(400).json({ message: 'Owner must be an existing store owner user' });
    }
    const exists = await pool.query('SELECT 1 FROM stores WHERE email = $1', [email]);
    if (exists.rowCount) return res.status(409).json({ message: 'Store email already exists' });
    const { rows } = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, email, address, ownerId || null]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// Store owners available to assign to a store
router.get('/store-owners', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'store_owner' ORDER BY name");
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
