# Netlify Deployment Guide

## Overview

This guide shows how to deploy the IT Tech Arena AI frontend to Netlify with Supabase as the backend.

## Prerequisites

- ✅ Supabase project created and configured (see SUPABASE_ENVIRONMENT_SETUP.md)
- ✅ GitHub account (for GitHub integration)
- ✅ Netlify account (free at netlify.com)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd c:\Users\KARTHIK\OneDrive\Desktop\IT\IT_Tech_Arena_AI
git init
git add .
git commit -m "Initial commit: Supabase migration"
```

### 1.2 Create .gitignore

Make sure your `.gitignore` includes:

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vscode/
```

### 1.3 Ensure .env is NOT committed

Add this to `.gitignore` if not already there:

```
.env
.env.*
```

## Step 2: Push to GitHub

1. Create a new repository on GitHub: https://github.com/new
2. Name it: `it-tech-arena-ai` (or your preference)
3. Push your local code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/it-tech-arena-ai.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

### Method A: GitHub Integration (Recommended)

1. Go to [Netlify](https://netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Click **GitHub** and authorize Netlify
4. Select your repository: `it-tech-arena-ai`
5. Click **Deploy site**

### Method B: Manual Deployment (Quick Testing)

1. Build locally:
   ```bash
   cd client
   npm run build
   ```

2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag & drop the `client/dist` folder
4. Your site is live instantly!

## Step 4: Configure Environment Variables on Netlify

If using GitHub integration:

1. Go to your Netlify site dashboard
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Click **Edit variables**
4. Add your Supabase credentials:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` |

5. Click **Save**
6. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Deploy site**

## Step 5: Configure Build Settings

On Netlify dashboard:

1. **Site settings** → **Build & deploy** → **Build settings**
2. Set these values:

   | Setting | Value |
   |---------|-------|
   | **Build command** | `cd client && npm run build` |
   | **Publish directory** | `client/dist` |
   | **Functions directory** | (leave empty) |

3. Click **Save**

## Step 6: Set Up Custom Domain (Optional)

1. Click **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `ittech-arena.com`)
4. Follow Netlify's DNS setup instructions

## Step 7: Verify Deployment

1. Visit your Netlify URL
2. Try logging in with a test account
3. If login works, your deployment is successful! ✅

## Step 8: Production Checklist

Before going live:

- [ ] Test login functionality
- [ ] Test question display
- [ ] Test answer submission
- [ ] Test real-time leaderboard updates
- [ ] Test admin dashboard
- [ ] Test with multiple students simultaneously
- [ ] Verify Supabase realtime is enabled
- [ ] Set up custom domain (if needed)
- [ ] Enable SSL/HTTPS (automatic on Netlify)

## Monitoring & Maintenance

### View Logs

1. Click **Deploys** tab
2. Click on a deployment
3. Click **Deploy log** to see build and runtime errors

### Check Supabase Usage

1. Go to Supabase dashboard
2. Click **Accounts** → **Project settings** → **Usage**
3. Monitor database storage, API calls, and storage

### Performance

1. Netlify provides real-time analytics
2. Click **Analytics** on your site dashboard
3. Monitor page load times and traffic

## Continuous Deployment

After each git push to main:

1. Netlify automatically builds and deploys
2. You'll see the new deployment in the **Deploys** tab
3. Previous versions are kept for rollback

### Rollback to Previous Version

If something breaks:

1. Click **Deploys** tab
2. Find the previous successful deployment
3. Click it → **Publish deploy** to rollback

## CI/CD Without GitHub

If you're not using GitHub:

1. Use **Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

2. Or use manual file upload:
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Upload the `client/dist` folder

## Troubleshooting

### Build Fails with "VITE_SUPABASE_URL not defined"

**Solution**: Set environment variables on Netlify (Step 4)

### Blank Page After Deploy

**Causes**:
- JavaScript error (check browser console)
- Missing environment variables
- Incorrect build path

**Fix**:
1. Check build log: **Deploys** → **Deploy log**
2. Verify environment variables are set
3. Try rebuilding: **Deploys** → **Trigger deploy**

### CORS Errors

**Cause**: Frontend and Supabase URLs might have different origins

**Fix**: 
1. Supabase automatically enables CORS for Netlify domains
2. If you have custom domain, ensure it matches in Supabase JWT settings

### Can't Connect to Supabase

**Possible Causes**:
- Wrong API key
- Supabase project is paused
- Network connectivity

**Fix**:
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
2. Check Supabase dashboard (green status icon visible?)
3. Restart Netlify build

## Advanced: Webhook Deployments

Trigger builds when Supabase data changes:

1. Get your Netlify **Build hook** URL:
   - **Site settings** → **Build & deploy** → **Build hooks**
   - Click **Add build hook** → Create one
   - Copy the URL

2. Send POST request when needed:
   ```bash
   curl -X POST <NETLIFY_BUILD_HOOK_URL>
   ```

3. This will automatically rebuild and redeploy

## Next Steps

1. ✅ Deployment complete
2. Test with all user roles (student, admin)
3. Monitor Supabase database for performance
4. Set up email notifications for errors (optional)
5. Create post-deployment test plan

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev

## Cost Breakdown (Monthly)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Netlify** | 100 GB bandwidth | Includes unlimited builds |
| **Supabase** | 200 API calls/second | Scales automatically |
| **Domain** | ~$12/year | (Optional) |

For 100+ students, your cost is basically free! 🎉
