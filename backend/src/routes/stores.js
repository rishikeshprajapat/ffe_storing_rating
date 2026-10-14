const router = require('express').Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingRules } = require('../middleware/validate');
const { buildFilters, buildOrder } = require('../utils/query');

router.use(authenticate, authorize('user'));

// List stores with overall rating + the current user's rating
router.get('/', async (req, res, next) => {
  try {
    const { where, values } = buildFilters(req.query, { name: 's.name', address: 's.address' });
    values.push(req.user.id);
    const order = buildOrder(req.query,
      { name: 's.name', address: 's.address', rating: 'overall_rating',
        myRating: 'my_rating' }, 'name');
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating), 2), 0)::float AS overall_rating,
              MAX(CASE WHEN r.user_id = $${values.length} THEN r.rating END) AS my_rating
         FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
         ${where} GROUP BY s.id ${order}`, values);
    res.json(rows);
  } catch (e) { next(e); }
});

// Submit or modify rating (upsert)
router.put('/:id/rating', ratingRules, async (req, res, next) => {
  try {
    const store = await pool.query('SELECT 1 FROM stores WHERE id = $1', [req.params.id]);
    if (!store.rowCount) return res.status(404).json({ message: 'Store not found' });
    const { rows } = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
       RETURNING rating`, [req.user.id, req.params.id, req.body.rating]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

module.exports = router;
