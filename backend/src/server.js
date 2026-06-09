const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { mongoSanitize } = require('./middleware/sanitize');
const hpp = require('hpp');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const responseTime = require('response-time');

const config = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { performanceMonitor } = require('./middleware/monitor');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const dealerRoutes = require('./routes/dealers');
const customerRoutes = require('./routes/customers');
const blogRoutes = require('./routes/blogs');
const feedbackRoutes = require('./routes/feedback');
const alertRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const importRoutes = require('./routes/importData');
const earningsRoutes = require('./routes/earnings');
const monitoringRoutes = require('./routes/monitoring');
const storeSettingsRoutes = require('./routes/storeSettings');
const fundRequestRoutes = require('./routes/fundRequests');

const app = express();

// Security middleware - Helmet with comprehensive CSP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.cloudinary.com'],
        connectSrc: ["'self'", 'https://api.razorpay.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ["'self'", 'https://api.razorpay.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many API requests, please try again later.' },
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/payments', apiLimiter);

// Compression for API responses
app.use(compression());

// Body parsing with reasonable limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL injection sanitization
app.use(mongoSanitize);

// HTTP Parameter Pollution protection
app.use(hpp());

// Performance monitoring middleware (tracks all API requests)
app.use(performanceMonitor);

// X-Response-Time header
app.use(responseTime());

// HTTP request logging via Morgan with winston stream
app.use(
  morgan(config.nodeEnv === 'development' ? 'dev' : 'combined', {
    stream: logger.stream,
    // Skip logging health check and monitoring endpoints to reduce noise
    skip: (req) => {
      const path = req.originalUrl || req.url;
      return path === '/api/health' || path.startsWith('/api/monitoring');
    },
  })
);

// Static files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check - basic
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Monitoring routes (must be before 404 handler)
app.use('/api/monitoring', monitoringRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/import', importRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/store-settings', storeSettingsRoutes);
app.use('/api/fund-requests', fundRequestRoutes);

// Serve the built React frontend if it exists (regardless of NODE_ENV)
// This ensures the app works even if the env variable isn't picked up
const possiblePaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, './public'),
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    const indexPath = path.join(p, 'index.html');
    if (fs.existsSync(indexPath)) {
      frontendPath = p;
      break;
    }
  }
}

if (frontendPath) {
  console.log(`✓ Serving frontend from: ${frontendPath}`);
  logger.info(`Serving frontend static files from: ${frontendPath}`);

  // Serve static assets with caching
  app.use(express.static(frontendPath, {
    maxAge: config.nodeEnv === 'production' ? '1y' : '0',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));

  // SPA fallback — serve index.html for all non-API, non-upload routes
  app.get('*', (req, res) => {
    if (
      req.path.startsWith('/api/') ||
      req.path.startsWith('/uploads/') ||
      req.path === '/api/health'
    ) {
      return res.status(404).json({ message: 'Route not found.' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.warn('⚠️  No frontend build found. The React app will not be served.');
  logger.warn('No frontend build found. The React app will not be served.');
  logger.warn('Looked in: ' + possiblePaths.join(', '));
  logger.warn('Build the frontend first: cd frontend && npm run build');
}

// Debug endpoint to check file system state on the server (disabled in production for security)
app.get('/api/debug', (req, res) => {
  if (config.nodeEnv === 'production' && req.query.secret !== process.env.DEBUG_SECRET) {
    return res.status(403).json({ message: 'Not available in production. Set DEBUG_SECRET env var and pass ?secret=... to access.' });
  }
  const results = {};
  for (const p of possiblePaths) {
    let dirExists = false;
    let indexExists = false;
    try {
      dirExists = fs.existsSync(p);
      if (dirExists) {
        indexExists = fs.existsSync(path.join(p, 'index.html'));
      }
    } catch (e) {
      dirExists = false;
    }
    results[p] = { dirExists, indexExists };
  }
  let dirList = [];
  try {
    dirList = fs.readdirSync(process.cwd()).slice(0, 30);
  } catch (e) {
    dirList = ['(could not read directory)'];
  }
  res.json({
    nodeEnv: config.nodeEnv,
    cwd: process.cwd(),
    __dirname: __dirname,
    frontendFound: frontendPath,
    pathChecks: results,
    cwdContents: dirList
  });
});

// 404 handler (only reached when frontend isn't found or for non-GET requests)
app.use((req, res) => {
  console.warn(`404 from ${req.method} ${req.originalUrl} (path: ${req.path})`);
  res.status(404).json({
    message: 'Route not found.',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Prandhara ERP Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

startServer().catch(console.error);

module.exports = app;
