const pool = require('../config/db');
const { buildOrderBy, parseId } = require('../utils/query');

const SORT = {
  name: 'u.name',
  email: 'u.email',
  rating: 'r.rating',
  date: 'r.updated_at'
};

// An owner may be assigned more than one store. The dashboard shows one store at a
// time: ?storeId=<id> picks it, otherwise the first store (by name) is used.
exports.dashboard = async (req, res, next) => {
  try {
    const { sortBy, order, storeId } = req.query;

    const owned = await pool.query(
      `SELECT
         s.id,
         s.name,
         s.address,
         ROUND(AVG(r.rating), 1)::float AS average_rating,
         COUNT(r.id)::int AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.name, s.id`,
      [req.user.id]
    );

    if (!owned.rowCount) {
      return res.status(404).json({ message: 'No store is assigned to this owner' });
    }

    let store = owned.rows[0];
    if (storeId !== undefined) {
      const wanted = parseId(storeId);
      store = owned.rows.find((s) => s.id === wanted);
      if (!store) return res.status(404).json({ message: 'Store not found for this owner' });
    }

    const raters = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         r.rating,
         r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY ${buildOrderBy(SORT, sortBy, order, 'date')}, u.id`,
      [store.id]
    );

    res.json({
      store,
      stores: owned.rows.map(({ id, name }) => ({ id, name })),
      raters: raters.rows
    });
  } catch (err) {
    next(err);
  }
};
