const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const r = require('../validators/rules');

router.post('/signup', r.signupRules, validate, c.signup);
router.post('/login', r.loginRules, validate, c.login);
router.put('/password', authenticate, r.changePasswordRules, validate, c.changePassword);
router.post('/logout', authenticate, c.logout);

module.exports = router;