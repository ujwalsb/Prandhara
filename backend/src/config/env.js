const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

const mongodbUri = (() => {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim()) return uri.trim();
  if (nodeEnv === 'production') {
    console.error('❌ CRITICAL: MONGODB_URI is required in production. Set it in your .env file.');
    process.exit(1);
  }
  console.warn('⚠️  WARNING: MONGODB_URI not set. Using localhost fallback for development only.');
  return 'mongodb://localhost:27017/newshop20123';
})();

const jwtSecret = (() => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret.trim();
  if (nodeEnv === 'production') {
    console.error('❌ CRITICAL: JWT_SECRET is required in production. Set it in your .env file.');
    process.exit(1);
  }
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using random ephemeral secret for development. All sessions will be invalidated on restart.');
  return crypto.randomBytes(64).toString('hex');
})();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
};

module.exports = config;
