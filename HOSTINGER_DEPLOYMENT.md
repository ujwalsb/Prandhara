# Prandhara - Hostinger Deployment Guide

## Overview
This is a full-stack MERN application with separate backend and frontend. For Hostinger deployment, you need to build the frontend and serve both from the same backend server.

## Prerequisites
- Node.js 18+ installed on Hostinger
- MongoDB connection (Atlas cloud recommended)
- Git (for cloning the repository)

## Deployment Steps

### 1. Clone and Setup Backend

```bash
# SSH into your Hostinger server
cd ~/public_html  # or your preferred directory
git clone <your-repo-url> prandhara
cd prandhara/backend

# Install dependencies
npm install

# Create/Update .env file with production values
cp .env.example .env
# Edit .env with your production settings
```

### 2. Configure .env for Production

**Backend/.env** - MUST have these values:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_generated_secret_key  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRES_IN=7d
CLIENT_URL=http://magenta-antelope-459444.hostingersite.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### 3. Build Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

### 4. Verify Frontend Build

The backend will automatically serve the frontend from `frontend/dist` if it exists.

To verify: `ls -la ../frontend/dist/` should show `index.html` and other built files.

### 5. Start Backend with PM2 (for persistent running)

```bash
# Install PM2 globally on server
npm install -g pm2

# Navigate to backend
cd ~/public_html/prandhara/backend

# Start the backend
pm2 start src/server.js --name "prandhara-backend" --env NODE_ENV=production

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Configure Reverse Proxy (if using Nginx)

If your Hostinger uses Nginx, configure it to proxy requests to Node.js:

```nginx
upstream nodejs {
    server localhost:5000;
}

server {
    server_name magenta-antelope-459444.hostingersite.com;
    
    location / {
        proxy_pass http://nodejs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. Verify Deployment

1. Check Backend is running:
   ```bash
   pm2 status
   ```

2. Test API endpoints:
   ```bash
   curl http://magenta-antelope-459444.hostingersite.com/api/health
   ```

3. Check Frontend is served:
   Open http://magenta-antelope-459444.hostingersite.com in browser

## Common Issues & Solutions

### Issue: "Login failed" / "Register failed"

**Cause**: JWT_SECRET not set in .env

**Solution**:
1. Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add it to backend/.env: `JWT_SECRET=<generated_secret>`
3. Restart backend: `pm2 restart prandhara-backend`

### Issue: CORS Error - "Access to XMLHttpRequest blocked"

**Cause**: CLIENT_URL in .env doesn't match frontend URL

**Solution**:
1. Update `CLIENT_URL` in backend/.env to match your domain
2. Restart backend: `pm2 restart prandhara-backend`

### Issue: Frontend shows blank page

**Cause**: Frontend not built or dist folder not found

**Solution**:
1. Rebuild frontend: `cd frontend && npm run build`
2. Verify dist exists: `ls -la frontend/dist/index.html`
3. Restart backend: `pm2 restart prandhara-backend`

### Issue: Database connection error

**Cause**: MongoDB URI invalid or network access not allowed

**Solution**:
1. Verify MongoDB Atlas allows your server IP
2. Test URI: `node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✓ Connected')).catch(e => console.log('✗', e.message))"`
3. Add credentials correctly in .env

### Issue: API requests showing 404

**Cause**: Backend not properly proxied or API routes not registered

**Solution**:
1. Check health endpoint: `curl http://domain/api/health`
2. View backend logs: `pm2 logs prandhara-backend`
3. Check backend is running: `pm2 status`

## Environment Variables Checklist

- [ ] NODE_ENV=production
- [ ] PORT=5000 (or configured port)
- [ ] MONGODB_URI set correctly
- [ ] JWT_SECRET set (32+ characters)
- [ ] CLIENT_URL matches your domain
- [ ] EMAIL credentials configured (for verification emails)
- [ ] Frontend built (npm run build)
- [ ] frontend/dist/index.html exists

## Monitoring & Maintenance

### View Logs
```bash
pm2 logs prandhara-backend
pm2 logs prandhara-backend --lines 100  # Last 100 lines
```

### Restart Backend
```bash
pm2 restart prandhara-backend
```

### Stop/Start
```bash
pm2 stop prandhara-backend
pm2 start prandhara-backend
```

### Check Server Resources
```bash
pm2 monit  # Real-time resource monitoring
```

## SSL/HTTPS Configuration

If using Hostinger's SSL (Let's Encrypt), Nginx should handle it automatically. Verify with:
```bash
curl -I https://your-domain.com
```

## Support for Debugging

Enable debug logs in development:
```bash
NODE_ENV=development pm2 start src/server.js
```

Access debug info at: `http://domain/api/debug?secret=your_debug_secret`

---

**Last Updated**: 2024
**Status**: Ready for production deployment
