const { body, param, validationResult } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const rules = {
  name: body('name').trim().isLength({ min: 20, max: 60 })
    .withMessage('Name must be 20-60 characters'),
  email: body('email').trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
  address: body('address').trim().notEmpty().withMessage('Address is required')
    .isLength({ max: 400 }).withMessage('Address must be at most 400 characters'),
  password: (field = 'password') => body(field).matches(PASSWORD_REGEX)
    .withMessage('Password must be 8-16 chars with at least one uppercase letter and one special character'),
};

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  res.status(400).json({
    message: errors.array()[0].msg,
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

const signupRules = [rules.name, rules.email, rules.address, rules.password(), handle];
const loginRules = [rules.email, body('password').notEmpty().withMessage('Password required'), handle];
const passwordRules = [body('currentPassword').notEmpty().withMessage('Current password required'),
  rules.password('newPassword'), handle];
const adminUserRules = [rules.name, rules.email, rules.address, rules.password(),
  body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'), handle];
const storeRules = [
  body('name').trim().notEmpty().withMessage('Store name is required')
    .isLength({ max: 60 }).withMessage('Store name must be at most 60 characters'),
  rules.email, rules.address,
  body('ownerId').optional({ nullable: true, checkFalsy: true }).isInt().withMessage('Invalid owner'),
  handle,
];
const ratingRules = [
  param('id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  handle,
];

module.exports = { signupRules, loginRules, passwordRules, adminUserRules, storeRules, ratingRules };
