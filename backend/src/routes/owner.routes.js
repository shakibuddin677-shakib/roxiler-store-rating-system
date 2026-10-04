const router = require('express').Router();

const c = require('../controllers/owner.controller');

const {
  authenticate,
  authorize
} = require('../middleware/auth');

router.get(
  '/dashboard',
  authenticate,
  authorize('OWNER'),
  c.dashboard
);

module.exports = router;