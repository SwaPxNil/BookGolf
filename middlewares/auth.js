const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, msg: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await User.findById(decoded.id);

    if (!req.user || req.user.status === 'INACTIVE') {
      return res.status(401).json({ success: false, msg: 'Not authorized to access this route' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Not authorized to access this route' });
  }
};

// Optionally attach user if token is present, but do not fail missing token
exports.optionalAuthenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (req.user && req.user.status === 'INACTIVE') {
      req.user = undefined;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth routes.
  }

  return next();
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, msg: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};
