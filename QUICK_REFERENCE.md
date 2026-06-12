# QUICK REFERENCE - Login/Register Issues Fixed

## 🔴 Main Issues Found
1. **JWT_SECRET missing** → Auth tokens failed
2. **Frontend API URL not set** → Frontend couldn't reach backend
3. **No error logging** → Couldn't debug issues
4. **CORS not configured** → Deployment would fail

## 🟢 All Issues Fixed

### Issue #1: Missing JWT_SECRET ✅
```
❌ BEFORE: backend/.env had NO JWT_SECRET
✅ AFTER:  JWT_SECRET=62d615678e0833f33336ea236fda51ef4fec7459862296ace233076525c24f42
           JWT_EXPIRES_IN=7d
           NODE_ENV=production
```

### Issue #2: Frontend API URL ✅
```
❌ BEFORE: No .env file, VITE_API_URL undefined
✅ AFTER:  Created frontend/.env with VITE_API_URL=https://backend-url/api
           Created frontend/.env.example template
           Updated api/client.js to use it correctly
```

### Issue #3: Error Logging ✅
```
❌ BEFORE: "Login failed" - no details
✅ AFTER:  Frontend shows: "Invalid email or password" (exact error)
           Server logs all attempts with timestamps
           Console shows full error objects for debugging
```

### Issue #4: CORS Configuration ✅
```
✅ CLIENT_URL configured in backend/.env
✅ Backend accepts requests from frontend domain
✅ CORS headers properly configured
```

---

## 📋 Files to Know

### Backend Configuration
```
backend/.env                    ← UPDATE THIS for production
backend/.env.example           ← Template (copy this structure)
```

### Frontend Configuration
```
frontend/.env                  ← UPDATE THIS for production
frontend/.env.example          ← Template
```

### Deployment Guides
```
HOSTINGER_DEPLOYMENT.md        ← Step-by-step Hostinger setup
LOGIN_REGISTER_TROUBLESHOOTING.md ← Detailed troubleshooting
FIXES_SUMMARY.md               ← What was fixed and why
```

### Tests
```
backend/tests/auth.test.js     ← Run to verify auth works
```

---

## 🧪 Quick Test (Local)

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Should see: "✓ Server running on port 5000"
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
# Should see: "✓ Ready in 100ms"
```

### Browser
1. Open: http://localhost:5173
2. Click "Sign up"
3. Fill in form:
   - Name: Test User
   - Email: test@test.com
   - Password: Test123456
4. Click "Create Account"
5. Should see success (or specific error in console)

### Check Errors (F12 Console)
```javascript
// You should see:
"Registration successful" or specific error like:
"Email already registered"
"Password must be at least 6 characters"
etc.
```

---

## 🌐 Hostinger Deployment

### Before Deploy - Checklist
- [ ] Backend .env has JWT_SECRET (run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Backend .env has NODE_ENV=production
- [ ] Backend .env has MONGODB_URI from MongoDB Atlas
- [ ] Backend .env has CLIENT_URL=http://magenta-antelope-459444.hostingersite.com
- [ ] Frontend .env has VITE_API_URL=http://magenta-antelope-459444.hostingersite.com/api
- [ ] Frontend built: `npm run build`
- [ ] frontend/dist/index.html exists

### Deploy Commands
```bash
# SSH into Hostinger
ssh user@hostinger

# Navigate to app
cd public_html/prandhara/

# Backend setup
cd backend
npm install
NODE_ENV=production node src/server.js

# Or with PM2 (recommended)
pm2 start src/server.js --name "api" --env NODE_ENV=production
pm2 save
```

### Test on Hostinger
```bash
# Check health
curl http://magenta-antelope-459444.hostingersite.com/api/health

# Should return: {"status":"ok","mongo":"connected"...}
```

---

## 🔍 Debugging Errors

### Error: "Login failed"
1. Open DevTools: Press F12
2. Go to Console tab
3. Try login again
4. Look for message like "Invalid email or password"
5. If not helpful, check server logs: `pm2 logs`

### Error: "Register failed"
1. Same as above
2. Look for specific message like "Email already registered"

### Error: "Cannot reach API"
1. Check frontend .env VITE_API_URL is correct
2. Check backend is running: `pm2 status`
3. Test API directly: `curl http://domain/api/health`
4. Check CORS: Look for "Access to XMLHttpRequest blocked"

### Error: "Database connection error"
1. Check MongoDB Atlas has your IP whitelisted
2. Verify MONGODB_URI in .env is correct
3. Test connection: 
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ Connected'))
  .catch(e => console.log('✗', e.message));
"
```

---

## 📊 Architecture After Fixes

```
┌─────────────────────────────────┐
│    Frontend (React)             │
│  localhost:5173 or hostinger    │
│                                 │
│  ✅ Loads .env → VITE_API_URL  │
│  ✅ Sends requests to Backend   │
│  ✅ Shows detailed errors       │
└────────────┬────────────────────┘
             │
             │ /api/auth/register
             │ /api/auth/login
             │ (with JWT)
             │
┌────────────▼────────────────────┐
│    Backend (Node.js)            │
│  localhost:5000 or hostinger    │
│                                 │
│  ✅ JWT_SECRET configured      │
│  ✅ Validates credentials      │
│  ✅ Generates JWT tokens       │
│  ✅ Logs all attempts          │
│  ✅ Returns clear errors       │
└────────────┬────────────────────┘
             │
             │ Query user
             │ Hash password
             │ Verify credentials
             │
┌────────────▼────────────────────┐
│   MongoDB Database              │
│   Atlas Cluster                 │
│                                 │
│  ✅ Stores users securely      │
│  ✅ Password hashed with bcrypt│
└─────────────────────────────────┘
```

---

## 📞 If Issues Persist

### Step 1: Check Logs
```bash
# Frontend (browser console)
F12 → Console tab

# Backend
pm2 logs prandhara-backend

# Or raw terminal
npm run dev
```

### Step 2: Check Configuration
```bash
# Backend .env
grep -E "JWT_SECRET|NODE_ENV|MONGODB_URI|CLIENT_URL" backend/.env

# Frontend .env
cat frontend/.env
```

### Step 3: Run Tests
```bash
cd backend
npm test -- tests/auth.test.js
```

### Step 4: Manual API Test
```bash
# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123456"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123456"}'
```

---

## ✨ Summary

| What | Status | Notes |
|------|--------|-------|
| JWT Authentication | ✅ Fixed | Secret configured, tokens work |
| Frontend-Backend Connection | ✅ Fixed | API URL configured, cors working |
| Error Messages | ✅ Fixed | Detailed messages in console |
| Server Logging | ✅ Fixed | All attempts logged |
| Tests | ✅ Added | Comprehensive auth tests |
| Deployment Guide | ✅ Created | Step-by-step instructions |
| Documentation | ✅ Complete | All files documented |

**Ready to Deploy! 🚀**

---

**Quick Commands Reference**:
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Build frontend
npm run build

# Start backend (dev)
npm run dev

# Start backend (prod with PM2)
pm2 start src/server.js --name api

# Check status
pm2 status

# View logs
pm2 logs

# Test health
curl http://localhost:5000/api/health
```
