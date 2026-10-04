const pool = require('../config/db');
const { buildOrderBy, escapeLike, parseId } = require('../utils/query');

const SORT = { name: 's.name', address: 's.address', rating: 'overall_rating' };

exports.listStores = async (req, res, next) => {
  try {
    const { search, sortBy, order } = req.query;
    const values = [req.user.id];
    let where = '';
    if (search) {
      values.push(`%${escapeLike(search)}%`);
      where = 'WHERE s.name ILIKE $2 OR s.address ILIKE $2';
    }
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.address,
              ROUND(AVG(r.rating), 1)::float AS overall_rating,
              MAX(CASE WHEN r.user_id = $1 THEN r.rating END) AS my_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY ${buildOrderBy(SORT, sortBy, order, 'name')} NULLS LAST, s.id`,
      values
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.rateStore = async (req, res, next) => {
  try {
    const storeId = parseId(req.params.id);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const store = await pool.query('SELECT 1 FROM stores WHERE id = $1', [storeId]);
    if (!store.rowCount) return res.status(404).json({ message: 'Store not found' });

    // UPSERT: insert the first time, update on later submissions
    const { rows } = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()
       RETURNING id, store_id, rating`,
      [req.user.id, storeId, req.body.rating]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};