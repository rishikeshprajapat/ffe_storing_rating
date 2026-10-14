const router = require('express').Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { buildOrder } = require('../utils/query');

router.use(authenticate, authorize('store_owner'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const stores = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating), 2), 0)::float AS average_rating,
              COUNT(r.id)::int AS total_ratings
         FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id = $1 GROUP BY s.id ORDER BY s.name`, [req.user.id]);

    const order = buildOrder(req.query,
      { name: 'u.name', email: 'u.email', rating: 'r.rating', date: 'r.updated_at' }, 'name');
    const raters = await pool.query(
      `SELECT u.id, u.name, u.email, s.name AS store, r.rating, r.updated_at
         FROM ratings r
         JOIN stores s ON s.id = r.store_id
         JOIN users  u ON u.id = r.user_id
        WHERE s.owner_id = $1 ${order}`, [req.user.id]);

    res.json({ stores: stores.rows, raters: raters.rows });
  } catch (e) { next(e); }
});

module.exports = router;
