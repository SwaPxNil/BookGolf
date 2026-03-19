const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify2FA,
  resend2FA,
  refreshToken,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const validate = require('../middlewares/validator');
const { uploadSingleImage } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');
const {
  registerSchema,
  loginSchema,
  verify2FASchema,
  resend2FASchema,
  refreshTokenSchema,
  updateProfileSchema,
} = require('../utils/validators/user.validator');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-2fa', validate(verify2FASchema), verify2FA);
router.post('/resend-2fa', validate(resend2FASchema), resend2FA);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router
  .route('/me')
  .get(authenticate, getUserProfile)
  .put(authenticate, uploadSingleImage('image'), validate(updateProfileSchema), updateUserProfile);

module.exports = router;
