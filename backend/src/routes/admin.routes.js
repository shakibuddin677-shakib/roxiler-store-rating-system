const router = require('express').Router();
const c = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const r = require('../validators/rules');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', c.dashboard);

router.post('/users', r.adminCreateUserRules, validate, c.createUser);

router.post('/stores', r.storeRules, validate, c.createStore);

router.get('/users', c.listUsers);

router.get('/stores', c.listStores);

router.get('/users/:id', c.getUser);
router.put('/users/:id', r.adminUpdateUserRules, validate, c.updateUser);
router.delete('/users/:id', c.deleteUser);

router.put('/stores/:id', r.storeRules, validate, c.updateStore);
router.delete('/stores/:id', c.deleteStore);

module.exports = router;