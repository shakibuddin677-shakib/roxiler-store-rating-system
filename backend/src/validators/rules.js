const { body } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const nameRule = body('name').trim()
  .isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters');

const emailRule = body('email').trim().toLowerCase()
  .isEmail().withMessage('Enter a valid email');

const addressRule = body('address').optional({ nullable: true }).trim()
  .isLength({ max: 400 }).withMessage('Address can be at most 400 characters');

const passwordRule = (field = 'password') => body(field)
  .matches(PASSWORD_REGEX)
  .withMessage('Password must be 8-16 chars with at least one uppercase letter and one special character');

exports.signupRules = [nameRule, emailRule, addressRule, passwordRule()];

exports.loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required'),
];

exports.changePasswordRules = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  passwordRule('newPassword'),
];

exports.adminCreateUserRules = [
  nameRule, emailRule, addressRule, passwordRule(),
  body('role').isIn(['ADMIN', 'USER', 'OWNER']).withMessage('Invalid role'),
];

// Editing: password is optional (blank = keep the current one).
exports.adminUpdateUserRules = [
  nameRule, emailRule, addressRule,
  body('password').optional({ values: 'falsy' }).matches(PASSWORD_REGEX)
    .withMessage('Password must be 8-16 chars with at least one uppercase letter and one special character'),
  body('role').isIn(['ADMIN', 'USER', 'OWNER']).withMessage('Invalid role'),
];

exports.storeRules = [
  nameRule, emailRule, addressRule,
  body('ownerId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid owner'),
];

exports.ratingRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
];