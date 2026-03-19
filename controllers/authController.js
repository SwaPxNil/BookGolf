const User = require('../models/User');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../utils/auth');
const { generateSecret, verifyToken: verify2FAToken, sendTwoFactorEmail } = require('../utils/twoFactorAuth');
const { v4: uuidv4 } = require('uuid');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists',
      });
    }

    const password_hash = await hashPassword(password);

    const user = await User.create({
      full_name,
      email,
      password_hash,
      role,
    });

    // Generate 2FA secret
    const secret = generateSecret();
    user.two_factor_secret = secret;
    await user.save();

    // Generate OTP
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.two_factor_code = token;
    user.two_factor_code_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // 🔐 Try sending email, but DO NOT fail registration
    try {
      await sendTwoFactorEmail(user.email, token);
    } catch (emailError) {
      console.error('2FA email failed:', emailError.message);
    }

    // Generate temp token for 2FA verification
    const tempToken = generateToken({ id: user._id, type: 'TEMP' }, process.env.JWT_SECRET, '10m');

    return res.status(201).json({
      success: true,
      msg: 'User registered. Please verify your 2FA code.',
      temp_token: tempToken
    });

  } catch (err) {
    next(err);
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password_hash');
    if (!user) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    
    // Generate temp token for 2FA verification
    const tempToken = generateToken({ id: user._id, type: 'TEMP' }, process.env.JWT_SECRET, '10m');
    
    //Generate 2FA Secret
    const secret = generateSecret();
    user.two_factor_secret = secret;
    await user.save();

    // Generate OTP
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.two_factor_code = token;
    user.two_factor_code_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    try {
      await sendTwoFactorEmail(user.email, token);
    } catch (emailError) {
      console.error('2FA email failed:', emailError.message);
    }
    res.status(200).json({
      success: true,
      msg: 'Please verify your 2FA code.',
      temp_token: tempToken
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 2FA
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res, next) => {
    const { temp_token, two_factor_code } = req.body;

    if (!temp_token || !two_factor_code) {
        return res.status(400).json({ success: false, msg: 'Please provide temp_token and 2FA code' });
    }

    try {
        const decoded = verifyToken(temp_token, process.env.JWT_SECRET);
        if (!decoded || decoded.type !== 'TEMP') {
            return res.status(401).json({ success: false, msg: 'Invalid or expired temp token' });
        }

        const user = await User.findById(decoded.id).select('+two_factor_secret +two_factor_code +two_factor_code_expires');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        if (user.two_factor_code !== two_factor_code || user.two_factor_code_expires < Date.now()) {
            return res.status(401).json({ success: false, msg: 'Invalid or expired 2FA code' });
        }

        user.is_2fa_verified = true;
        user.two_factor_code = undefined;
        user.two_factor_code_expires = undefined;
        await user.save();

        // Generate access and refresh tokens
        const accessToken = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRATION);
        const refreshToken = generateToken({ id: user._id }, process.env.JWT_SECRET, process.env.JWT_REFRESH_TOKEN_EXPIRATION);

        res.status(200).json({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ success: false, msg: 'Please provide a refresh token' });
    }

    try {
        const decoded = verifyToken(refresh_token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ success: false, msg: 'Invalid or expired refresh token' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const accessToken = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRATION);
        
        res.status(200).json({
            success: true,
            access_token: accessToken,
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash -two_factor_secret -two_factor_code');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
