const jwt = require('jsonwebtoken');
const db = require('../db');

function getUserFromToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = db
      .prepare('SELECT id, name, email, role, is_blocked FROM users WHERE id = ?')
      .get(payload.id);

    if (!user || user.is_blocked) return null;
    return user;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Login required' });
  req.user = user;
  next();
}

function optionalAuth(req, res, next) {
  req.user = getUserFromToken(req);
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
