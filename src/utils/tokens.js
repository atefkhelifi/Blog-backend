const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
};
