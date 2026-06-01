const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateSlug = (text) => {
  const slugify = require('slugify');
  return slugify(text, { lower: true, strict: true });
};

const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateResetToken,
  generateSlug,
  paginate,
};
