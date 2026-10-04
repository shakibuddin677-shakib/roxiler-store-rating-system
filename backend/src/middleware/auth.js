const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Authentication: who are you?
// The token proves identity, but the role is re-read from the database so a deleted
// user or a changed role takes effect immediately instead of when the token expires.
exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const { rows } = await pool.query('SELECT id, role FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = { id: rows[0].id, role: rows[0].role };
    next();
  } catch (err) {
    next(err);
  }
};

// Authorization: are you allowed to do this?
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have access to this resource' });
  }
  next();
};
