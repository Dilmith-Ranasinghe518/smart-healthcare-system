const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

// Lightweight auth — decodes JWT only, no DB lookup.
// User data (id, role) is embedded in the token by auth-service.
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded payload so controllers can read role, id, etc.
    req.user = decoded;
    if (decoded.id) req.user._id = decoded.id;
    next();
  } catch (err) {
    return next(new AppError('Not authorized, token invalid or expired', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
