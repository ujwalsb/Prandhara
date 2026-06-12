# 🧪 Complete Testing Guide - Local & Production

## Part 1: Local Testing (Development)

### Setup (First Time Only)

```bash
# Clone/navigate to project
cd "C:\Users\ujwal\Desktop\pran shop 1"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

**Expected Output**:
```
✓ Server running on port 5000
✓ MongoDB connected
✓ Ready to handle requests
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

**Expected Output**:
```
✓ Ready in 100ms

VITE v5.4.21 ready in 105 ms

➜  Local:   http://localhost:5173/
```

### Browser: Test Registration

1. **Open**: http://localhost:5173
2. **Click**: "Sign up" link
3. **Fill Form**:
   ```
   Name: John Doe
   Email: john.doe@test.com
   Password: SecurePass123!
   Confirm: SecurePass123!
   ```
4. **Click**: "Create Account"

**Expected Result**: 
- ✅ Registration succeeds
- ✅ Redirected to home page
- ✅ Logged in as "John Doe"

**If Error**:
1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for error message like:
   - "Email already registered"
   - "Password must be at least 6 characters"
   - etc.

### Browser: Test Login

1. **Click**: Profile → Logout (to logout current user)
2. **Go to**: Login page
3. **Fill Form**:
   ```
   Email: john.doe@test.com
   Password: SecurePass123!
   ```
4. **Click**: "Sign In"

**Expected Result**:
- ✅ Login succeeds
- ✅ Redirected to home page
- ✅ Logged in as "John Doe"

### Browser: Test Invalid Credentials

1. **Click**: Logout
2. **Try Login** with:
   ```
   Email: john.doe@test.com
   Password: WrongPassword
   ```
3. **Click**: "Sign In"

**Expected Result**:
- ✅ Error shown: "Invalid email or password"

### Check Backend Logs

In Terminal 1 (backend):
```
✓ User registered successfully { userId: 63f7..., email: john.doe@test.com }
✓ User logged in successfully { userId: 63f7..., email: john.doe@test.com }
✓ Login attempt with incorrect password { email: john.doe@test.com }
```

### Check Frontend Console

In Browser Console (F12):
```
Registration successful ✓
Login successful ✓
Login error: Invalid email or password
```

---

## Part 2: Running Automated Tests

### Run All Auth Tests

```bash
cd backend
npm test -- tests/auth.test.js
```

**Expected Output**:
```
PASS  tests/auth.test.js
  Authentication Flow Tests
    POST /api/auth/register
      ✓ Should register a new user (45ms)
      ✓ Should not register with duplicate email (30ms)
      ✓ Should validate required fields (20ms)
      ✓ Should validate email format (15ms)
      ✓ Should enforce minimum password length (20ms)
    POST /api/auth/login
      ✓ Should login successfully (40ms)
      ✓ Should reject invalid email (25ms)
      ✓ Should reject incorrect password (30ms)
      ✓ Should validate email format (15ms)
      ✓ Should require password (10ms)
    POST /api/auth/refresh-token
      ✓ Should generate new token (35ms)
      ✓ Should reject invalid refresh token (20ms)
      ✓ Should require refresh token (10ms)
    GET /api/auth/me
      ✓ Should get user profile (30ms)
      ✓ Should reject request without token (15ms)
      ✓ Should reject invalid token (10ms)
    POST /api/auth/logout
      ✓ Should logout successfully (25ms)
    Edge Cases & Security
      ✓ Should handle rate limiting (100ms)
      ✓ Should hash passwords securely (20ms)
      ✓ Should not expose password (15ms)
      ✓ Should validate CSRF headers (10ms)

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
```

### Run Specific Test

```bash
# Just registration tests
npm test -- tests/auth.test.js -t "register"

# Just login tests
npm test -- tests/auth.test.js -t "login"

# Just security tests
npm test -- tests/auth.test.js -t "Security"
```

---

## Part 3: Manual API Testing

### Test 1: Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@test.com",
    "password": "SecurePass456!"
  }'
```

**Expected Response**:
```json
{
  "message": "User registered successfully. Please verify your email.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "63f7d1a4b1c2d3e4f5g6h7i8",
    "name": "Jane Smith",
    "email": "jane.smith@test.com",
    "role": "user",
    "isVerified": false
  }
}
```

### Test 2: Duplicate Email (Should Fail)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Jane",
    "email": "jane.smith@test.com",
    "password": "DifferentPass123!"
  }'
```

**Expected Response**:
```json
{
  "message": "Email already registered."
}
```

### Test 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@test.com",
    "password": "SecurePass456!"
  }'
```

**Expected Response**:
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "63f7d1a4b1c2d3e4f5g6h7i8",
    "name": "Jane Smith",
    "email": "jane.smith@test.com",
    "role": "user",
    "isVerified": false
  }
}
```

### Test 4: Wrong Password (Should Fail)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@test.com",
    "password": "WrongPassword"
  }'
```

**Expected Response** (401):
```json
{
  "message": "Invalid email or password."
}
```

### Test 5: Get User Profile (with Token)

```bash
# Save the token from login response first
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "user": {
    "id": "63f7d1a4b1c2d3e4f5g6h7i8",
    "name": "Jane Smith",
    "email": "jane.smith@test.com",
    "role": "user",
    "isVerified": false,
    "avatar": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Test 6: Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Part 4: Production Testing (Hostinger)

### Prerequisites Checklist
```bash
# ✅ Check backend .env
grep JWT_SECRET backend/.env
grep NODE_ENV backend/.env
grep MONGODB_URI backend/.env

# ✅ Check frontend .env
cat frontend/.env

# ✅ Build frontend
cd frontend && npm run build
ls -la dist/index.html

# ✅ Check dependencies
cd backend && npm list | head -20
```

### Deploy Commands

```bash
# SSH into Hostinger
ssh your_user@your_domain

# Navigate to app directory
cd public_html/prandhara

# Backend setup
cd backend
npm install
npm run build 2>/dev/null || true

# Start with PM2
pm2 start src/server.js --name "prandhara-api" --env NODE_ENV=production
pm2 save

# Navigate to frontend
cd ../frontend

# Build frontend
npm run build

# Verify build
ls -la dist/index.html
```

### Test Health Endpoint

```bash
curl http://your-domain.hostingersite.com/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "mongo": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 125.4,
  "nodeEnv": "production",
  "port": 5000
}
```

### Test Registration (Production)

```bash
curl -X POST http://your-domain.hostingersite.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prod Test User",
    "email": "prodtest@example.com",
    "password": "ProdTest123!"
  }'
```

### Test Login (Production)

```bash
curl -X POST http://your-domain.hostingersite.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prodtest@example.com",
    "password": "ProdTest123!"
  }'
```

### Browser Test (Production)

1. Open: `http://your-domain.hostingersite.com`
2. Click: "Sign up"
3. Fill form and submit
4. Should see: Success or specific error
5. Try login with same credentials

### Check Production Logs

```bash
# View real-time logs
pm2 logs prandhara-api

# View last 100 lines
pm2 logs prandhara-api --lines 100

# Monitor resources
pm2 monit
```

---

## Part 5: Troubleshooting Test Results

### If Registration Fails

**Check 1: JWT_SECRET**
```bash
grep JWT_SECRET backend/.env
# Should output: JWT_SECRET=62d615678e0833f33336ea236fda51ef4fec7459862296ace233076525c24f42
```

**Check 2: Database Connection**
```bash
npm run dev 2>&1 | grep -i "mongo\|error"
```

**Check 3: Backend Logs**
```bash
# Local
npm run dev
# Look for error messages

# Production
pm2 logs prandhara-api
```

**Check 4: Frontend Console**
```
Open: http://localhost:5173 (or your domain)
Press: F12
Go to: Console tab
Try: Register again
Look for: Error message details
```

### If Login Fails

**Check 1: User Exists**
```bash
# From MongoDB Atlas, check if user was created during registration
```

**Check 2: Password Hash**
```
Error usually means:
- User doesn't exist (typo in email)
- Password is wrong
- Password wasn't hashed correctly
```

**Check 3: Token Generation**
```
If JWT_SECRET is missing:
- Token can't be generated
- Login fails with server error 500
```

### If API Can't Be Reached

**Check 1: Backend Running**
```bash
curl http://localhost:5000/api/health
# Should work if backend is running
```

**Check 2: Frontend API URL**
```bash
cat frontend/.env | grep VITE_API_URL
# Should point to your backend
```

**Check 3: CORS**
```
Browser Console → Network tab → API request
Look for: "Access to XMLHttpRequest blocked"
Solution: Check CLIENT_URL in backend/.env
```

---

## Performance Baseline

### Expected Response Times
```
Register:          200-400ms
Login:             150-300ms
Get Profile:       100-200ms
Refresh Token:     100-200ms
```

### Expected Test Run Time
```
Auth test suite:   5-10 seconds
Register test:     1-2 seconds
Login test:        1-2 seconds
```

---

## Success Criteria Checklist

After testing, verify:

```
✅ Registration
  ├─ New user created in database
  ├─ JWT token returned
  ├─ User redirected to home page
  ├─ User shows as logged in
  └─ Email address stored correctly

✅ Login
  ├─ Existing user can login
  ├─ JWT token returned
  ├─ User redirected to home page
  ├─ User shows as logged in
  └─ Sessions work across page reloads

✅ Error Handling
  ├─ Invalid email shows specific error
  ├─ Wrong password shows specific error
  ├─ Duplicate email shows specific error
  ├─ Frontend console shows details
  └─ Server logs capture attempts

✅ Security
  ├─ Passwords are hashed
  ├─ Passwords not exposed in responses
  ├─ Tokens are JWT format
  ├─ Invalid tokens rejected
  └─ Rate limiting works (20 attempts/15min)

✅ Production Readiness
  ├─ Frontend built successfully
  ├─ Backend starts without errors
  ├─ Database connection established
  ├─ Health endpoint responds
  └─ All tests pass
```

---

**Testing Complete! All systems ready for deployment! 🚀**
