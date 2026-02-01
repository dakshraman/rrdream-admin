const jwt = require('jsonwebtoken');

exports.verifyLogin = (req, res, next) => {
  const token = req.cookies.auth_token; // req.cookies must be populated

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};