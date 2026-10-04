const router = require('express').Router();

const c = require('../controllers/store.controller');

const {
  authenticate,
  authorize
} = require('../middleware/auth');

const validate = require('../middleware/validate');

const {
  ratingRules
} = require('../validators/rules');

router.use(authenticate, authorize('USER'));

router.get('/', c.listStores);

router.post(
  '/:id/rating',
  ratingRules,
  validate,
  c.rateStore
);

module.exports = router;