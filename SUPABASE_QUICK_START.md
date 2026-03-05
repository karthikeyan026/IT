# Supabase Migration Quick Start (30 Minutes)

Get your IT Tech Arena AI app running on Supabase + Netlify in 30 minutes!

## ⏰ Timeline

- Steps 1-3: 5 minutes
- Steps 4-5: 10 minutes
- Steps 6-7: 10 minutes
- Testing: 5 minutes

## Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign up (if needed)
3. Click **New Project**
4. Choose region closest to you
5. ⏳ Wait 5-10 minutes for project to initialize

## Step 2: Get Your Credentials (1 min)

Once project is ready:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

💾 Save these - you'll need them in Step 4

## Step 3: Create Database Schema (2 min)

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy [SUPABASE_SCHEMA_MIGRATION.sql](./SUPABASE_SCHEMA_MIGRATION.sql)
4. Paste into SQL editor
5. Click **Run**
6. ✅ Wait for "Success"

## Step 4: Configure Frontend (3 min)

In `client/` folder, create `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace values from Step 2

## Step 5: Install Dependencies (5 min)

```bash
cd client
npm install
```

## Step 6: Test Locally (5 min)

```bash
npm run dev
```

1. Open http://localhost:5173
2. Try login:
   - **Name**: Test Student
   - **Register Number**: TEST001
3. ✅ If login works, move to Step 7

## Step 7: Deploy to Netlify (10 min)

**Option A: GitHub + Netlify (Recommended)**

```bash
# Push to GitHub
git init
git add .
git commit -m "Supabase migration"
git remote add origin https://github.com/YOUR_USERNAME/it-tech-arena-ai.git
git push origin main
```

Then:
1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** → **Import existing project**
3. Select your GitHub repo
4. Click **Deploy site**
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. ✅ Site is live!

**Option B: Netlify Drop (Instant)**

```bash
npm run build
```

Then drag `client/dist` folder to [Netlify Drop](https://app.netlify.com/drop)

## What's Different?

### ✅ Removed
- Express.js server
- Socket.io (replaced by Supabase Realtime)
- Custom database management

### ✨ Added
- Supabase PostgreSQL database
- Supabase Real-time subscriptions
- Netlify hosting
- Simplified architecture

## Next Steps

1. ✅ This Quick Start
2. 📖 Read [SUPABASE_ENVIRONMENT_SETUP.md](./SUPABASE_ENVIRONMENT_SETUP.md) for detailed configuration
3. 🔄 Update components using [COMPONENT_MIGRATION_GUIDE.md](./COMPONENT_MIGRATION_GUIDE.md)
4. 📊 Manage system with [ADMIN_OPERATIONS_GUIDE.md](./ADMIN_OPERATIONS_GUIDE.md)
5. ✔️ Use [SUPABASE_MIGRATION_CHECKLIST.md](./SUPABASE_MIGRATION_CHECKLIST.md) for complete reference

## Troubleshooting

**"VITE_SUPABASE_URL not defined"**
- Make sure `.env` is in `client/` folder (not root)
- Restart dev server

**"Connection refused"**
- Check internet connection
- Verify Supabase project is active
- Check URL in `.env`

**"Questions not showing"**
- Import questions into Supabase (see Step 3 of detailed guide)
- Check round_name is exactly 'APTITUDE' or 'TECHNICAL'

**Real-time updates not working**
- In Supabase, go to **Realtime** → **Replication**
- Enable for all tables

## Cost?

**FREE!**

- Supabase: 500 MB database + 100+ concurrent users
- Netlify: Unlimited bandw idth (within reason)
- No server costs ✨

## Need Help?

1. Check detailed setup guide: [SUPABASE_ENVIRONMENT_SETUP.md](./SUPABASE_ENVIRONMENT_SETUP.md)
2. Check component migration guide: [COMPONENT_MIGRATION_GUIDE.md](./COMPONENT_MIGRATION_GUIDE.md)
3. Check admin guide: [ADMIN_OPERATIONS_GUIDE.md](./ADMIN_OPERATIONS_GUIDE.md)
4. Visit [Supabase Docs](https://supabase.com/docs)

---

That's it! Your app is now running on Supabase + Netlify. No backend server needed. 🚀

Happy competing! 🎉
