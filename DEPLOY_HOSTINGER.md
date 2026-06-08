# 🚀 Deploying Prandhara ERP on Hostinger (Business/Cloud hPanel)

> This guide is for **Hostinger Business or Cloud hosting** with the **hPanel control panel**.
> For Hostinger VPS, follow the Docker deployment guide instead.

## Overview

Hostinger's Business/Cloud plans support **Node.js applications** via the hPanel dashboard.
Since your Hostinger plan serves both the frontend and backend from a **single Node.js process**,
the Express backend has been modified to **serve the React frontend's built files** automatically when `NODE_ENV=production`.

---

## 📋 Prerequisites

1. **Hostinger Business or Cloud hosting** plan with hPanel access
2. **MongoDB Atlas** account (free tier) — [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **GitHub** account (for auto-deployment)
4. Your domain pointed to Hostinger (optional, but recommended)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a **free M0 cluster**
3. Under **Database Access**, create a database user (username + password)
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your database user credentials
   - Add `/prandhara` after `.net` to specify the database name

---

## 🚀 Step 2: Deploy on Hostinger hPanel

### 2.1 Create a Node.js Web App

1. Log into **hPanel** → [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Websites** → **Manage** next to your domain
3. Scroll down to **Node.js** section or search for "Node.js" in the sidebar
4. Click **Create a Node.js Web App**

### 2.2 Configure the App

Configure these settings in the Node.js setup wizard:

| Setting | Value |
|---|---|
| **Node.js Version** | **20.x** or **22.x** (LTS) |
| **Application mode** | **Development** (initially, for testing) |
| **Application root** | `/` (keep as is) |
| **Entry file** | `backend/src/server.js` |
| **Build command** | `cd frontend && npm install && npm run build` |
| **Start command** | `cd backend && npm start` |
| **Output directory** | `frontend/dist` |

### 2.3 Connect with GitHub (Recommended)

1. In the Node.js setup, choose **Import Git Repository**
2. Authorize Hostinger to access your GitHub account
3. Select your repository and branch (`main`)
4. Enable **Auto Deploy** so changes push automatically

### 2.4 Set Environment Variables

In the **Environment Variables** section of the Node.js dashboard, add these:

| Variable | Value | Required |
|---|---|---|
| `NODE_ENV` | `production` | ✅ Yes |
| `MONGODB_URI` | `mongodb+srv://...` (your Atlas URL) | ✅ Yes |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | ✅ Yes |
| `PORT` | `5000` | ⬜ (Hostinger auto-assigns) |
| `CLIENT_URL` | `https://yourdomain.com` | ⬜ (for email links) |
| `EMAIL_HOST` | `smtp.gmail.com` | ⬜ (for emails) |
| `EMAIL_USER` | `your-email@gmail.com` | ⬜ |
| `EMAIL_PASS` | `your-app-password` | ⬜ |
| `JWT_EXPIRES_IN` | `7d` | ⬜ |

### 2.5 Deploy

1. Click **Deploy**
2. Hostinger will:
   - Clone your repository
   - Install backend dependencies (`cd backend && npm install`)
   - Build the frontend (`cd frontend && npm install && npm run build`)
   - Start the server (`cd backend && npm start`)
3. Wait for the deployment to finish (2-5 minutes)

### 2.6 Verify

Visit your domain. You should see the Prandhara ERP login page.
API health check: `https://yourdomain.com/api/health`

---

## 🔄 Updating After Changes

### Option A: GitHub Auto-Deploy
If you enabled **Auto Deploy**, just push to your GitHub repository:
```bash
git add .
git commit -m "your changes"
git push
```
Hostinger automatically redeploys.

### Option B: Manual Redeploy
1. Go to hPanel → Websites → Node.js
2. Click the **Redeploy** button

---

## 🛠️ Local Setup for Development

If you want to make changes locally:

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd prandhara

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Create .env file (copy from .env.example)
cp ../.env.example ../.env
# Edit .env: set NODE_ENV=development, MONGODB_URI for local MongoDB

# 5. Start backend (in one terminal)
cd backend
npm run dev

# 6. Start frontend (in another terminal)
cd frontend
npm run dev
```

---

## 🔧 Troubleshooting

### 403 Forbidden / White Screen
**Cause:** The backend is not serving the frontend build.
**Fix:** 
- Ensure `NODE_ENV=production` is set in Environment Variables
- Check the **Deployment Logs** in hPanel for build errors
- Redeploy after fixing

### "Cannot GET /" (Blank Page)
**Cause:** Frontend `dist/` folder not found.
**Fix:**
- Check that the build command runs successfully: `cd frontend && npm install && npm run build`
- Verify the output directory is `frontend/dist`

### API Returns 404
**Cause:** API routes not matching.
**Fix:** Ensure API calls use `/api/` prefix (already configured).

### MongoDB Connection Error
**Cause:** Wrong MONGODB_URI or network issue.
**Fix:**
- Verify the Atlas connection string in hPanel environment variables
- Add `0.0.0.0/0` to MongoDB Atlas Network Access whitelist

### Deployment Failed
**Cause:** Missing `package-lock.json` or dependency issues.
**Fix:**
- Run `npm install` locally and commit the `package-lock.json`
- Check that both `backend/package.json` and `frontend/package.json` exist

### Need More Help?
- Hostinger Node.js docs: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- MongoDB Atlas docs: https://www.mongodb.com/docs/atlas/

---

## ✅ Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] MongoDB Atlas IP whitelist set to `0.0.0.0/0`
- [ ] GitHub repository connected to Hostinger
- [ ] Environment variables set in hPanel
- [ ] `NODE_ENV=production` configured
- [ ] First deployment completed without errors
- [ ] Login page loads on your domain
- [ ] Health check: `https://yourdomain.com/api/health` returns `{"status":"ok"}`
