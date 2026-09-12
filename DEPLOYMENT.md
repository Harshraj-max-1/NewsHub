# NewsHub — Production Deployment Guide

Follow this guide to deploy NewsHub:
- **Database**: MongoDB Atlas
- **Backend API**: Render
- **Frontend SPA**: Vercel

---

## 🟢 Part 1: Setup MongoDB Atlas (Free Cluster)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign in/register.
2. Click **Create** -> Choose **M0 (Free Tier)** cluster -> Choose AWS (e.g. `ap-south-1` Mumbai or closest region).
3. **Database Access (User)**:
   - Go to **Database Access** -> Click **Add New Database User**.
   - Select **Password** authentication.
   - Enter a username (e.g. `newshub_admin`) and a secure password.
   - Set role to **Read and write to any database**.
4. **Network Access (IP Whitelist)**:
   - Go to **Network Access** -> Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) -> Confirm.
5. **Get Connection String**:
   - Go to **Database** (Deployments) -> Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy your connection string. It will look like:
     ```
     mongodb+srv://newshub_admin:<password>@cluster0.abcde.mongodb.net/newshub?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.

---

## 🟢 Part 2: Deploy Backend to Render

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete newshub platform ready for deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/NewsHub.git
   git push -u origin main
   ```

2. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> **Web Service**.
3. Connect your GitHub repository `NewsHub`.
4. Configure the Web Service settings:
   - **Name**: `newshub-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. **Add Environment Variables** (under *Environment Variables* section):
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | |
   | `PORT` | `10000` | Render standard port |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `your_super_secret_jwt_random_string_2026` | Any long secure string |
   | `JWT_EXPIRES_IN` | `7d` | |
   | `CLIENT_URL` | `https://your-newshub.vercel.app` | (Can be added after Vercel step) |
   | `CACHE_TTL_SECONDS` | `600` | |
   | `GNEWS_API_KEY` | *(Optional)* | For live real-time API streaming |
   | `NEWS_API_KEY` | *(Optional)* | For live real-time API streaming |
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render URL (e.g., `https://newshub-api.onrender.com`).
   - Test by opening: `https://newshub-api.onrender.com/api/health`.

---

## 🟢 Part 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) -> Click **Add New...** -> **Project**.
2. Import your `NewsHub` GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Add Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://newshub-api.onrender.com/api` |

   *(Replace `https://newshub-api.onrender.com` with your actual Render URL from Part 2)*.
5. Click **Deploy**.

---

## 🟢 Part 4: Final Linkage & Verification

1. Once Vercel finishes deploying, copy your live Vercel domain (e.g., `https://newshub.vercel.app`).
2. Go back to Render -> `newshub-api` -> **Environment** -> Update `CLIENT_URL` to `https://newshub.vercel.app`.
3. Open your live Vercel site in your browser:
   - Test registration and onboarding.
   - Test India news and Read-Only Global News mode.
   - Test dark mode and bookmarks.
