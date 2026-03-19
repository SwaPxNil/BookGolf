const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify2FA,
  refreshToken,
  getUserProfile,
} = require('../controllers/authController');
const validate = require('../middlewares/validator');
const { authenticate } = require('../middlewares/auth');
const {
  registerSchema,
  loginSchema,
  verify2FASchema,
  refreshTokenSchema,
} = require('../utils/validators/user.validator');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-2fa', validate(verify2FASchema), verify2FA);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.route('/me').get(authenticate, getUserProfile);

module.exports = router;
