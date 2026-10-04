const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { buildOrderBy, buildFilters, parseId } = require('../utils/query');
const USER_SORT = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role'
};

exports.listUsers = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy,
      order
    } = req.query;

    // Validate role filter
    if (role && !['ADMIN', 'USER', 'OWNER'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role filter'
      });
    }

    // Build WHERE conditions safely
    const { where, values } = buildFilters([
      { column: 'u.name', value: name },
      { column: 'u.email', value: email },
      { column: 'u.address', value: address },
      { column: 'u.role::text', value: role, exact: true }
    ]);

    const { rows } = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.address,
         u.role
       FROM users u
       ${where}
       ORDER BY ${buildOrderBy(USER_SORT, sortBy, order, 'name')}, u.id`,
      values
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const STORE_SORT = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  owner: 'o.name',
  rating: 'rating'
};

exports.listStores = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      sortBy,
      order
    } = req.query;

    const { where, values } = buildFilters([
      { column: 's.name', value: name },
      { column: 's.email', value: email },
      { column: 's.address', value: address }
    ]);

    const { rows } = await pool.query(
      `SELECT
         s.id,
         s.name,
         s.email,
         s.address,
         s.owner_id,
         o.name AS owner_name,
         ROUND(AVG(r.rating), 1)::float AS rating
       FROM stores s
       LEFT JOIN users o ON o.id = s.owner_id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${where}
       GROUP BY s.id, o.name
       ORDER BY ${buildOrderBy(STORE_SORT, sortBy, order, 'name')} NULLS LAST, s.id`,
      values
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    // Validate ID
    if (!id) {
      return res.status(400).json({
        message: 'Invalid user id'
      });
    }

    // Get user
    const { rows } = await pool.query(
      `SELECT id, name, email, address, role
       FROM users
       WHERE id = $1`,
      [id]
    );

    const user = rows[0];

    // User doesn't exist
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // If user is OWNER, calculate average rating
    if (user.role === 'OWNER') {
      const avg = await pool.query(
        `SELECT ROUND(AVG(r.rating), 1)::float AS rating
         FROM ratings r
         JOIN stores s ON s.id = r.store_id
         WHERE s.owner_id = $1`,
        [user.id]
      );

      user.rating = avg.rows[0].rating;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS total_users,
        (SELECT COUNT(*) FROM stores)::int AS total_stores,
        (SELECT COUNT(*) FROM ratings)::int AS total_ratings,
        (SELECT COUNT(*) FROM users WHERE role = 'ADMIN')::int AS total_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'OWNER')::int AS total_owners,
        (SELECT COUNT(*) FROM users WHERE role = 'USER')::int AS total_normal_users
    `);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, hash, address || null, role]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    next(err);
  }
};
exports.createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (ownerId) {
      const owner = await pool.query(
        `SELECT 1 FROM users WHERE id = $1 AND role = 'OWNER'`,
        [ownerId]
      );

      if (!owner.rowCount) {
        return res.status(400).json({
          message: 'ownerId must belong to a Store Owner user'
        });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address || null, ownerId || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        message: 'Store email already exists'
      });
    }

    next(err);
  }
};

// ---------- Edit / delete ----------

exports.updateUser = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user id' });

    const { name, email, address, password, role } = req.body;

    // An admin cannot demote themselves (avoids locking everyone out of admin).
    if (id === req.user.id && role !== 'ADMIN') {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const hash = password ? await bcrypt.hash(password, 10) : null;
    const { rows } = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, address = $3, role = $4,
           password_hash = COALESCE($5, password_hash)
       WHERE id = $6
       RETURNING id, name, email, address, role`,
      [name, email, address || null, role, hash, id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    // No longer an OWNER -> their stores become unassigned.
    if (role !== 'OWNER') await pool.query('UPDATE stores SET owner_id = NULL WHERE owner_id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email already registered' });
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user id' });
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    // Their ratings are removed (ON DELETE CASCADE); stores they owned become unassigned.
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

exports.updateStore = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid store id' });

    const { name, email, address, ownerId } = req.body;
    if (ownerId) {
      const owner = await pool.query(`SELECT 1 FROM users WHERE id = $1 AND role = 'OWNER'`, [ownerId]);
      if (!owner.rowCount) {
        return res.status(400).json({ message: 'ownerId must belong to a Store Owner user' });
      }
    }

    const { rows } = await pool.query(
      `UPDATE stores SET name = $1, email = $2, address = $3, owner_id = $4
       WHERE id = $5 RETURNING *`,
      [name, email, address || null, ownerId || null, id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Store not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Store email already exists' });
    next(err);
  }
};

exports.deleteStore = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid store id' });
    const { rowCount } = await pool.query('DELETE FROM stores WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted' });
  } catch (err) { next(err); }
};
