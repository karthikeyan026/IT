# Supabase Migration - Environment Setup Guide

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up for a free account
3. Create a new project:
   - Click "New Project"
   - Choose your region (closest to your users)
   - Wait for the project to initialize (5-10 minutes)

## Step 2: Get Your Credentials

Once your Supabase project is created:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon Public Key** (VITE_SUPABASE_ANON_KEY)

## Step 3: Set Up Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `SUPABASE_SCHEMA_MIGRATION.sql` file
4. Paste it into the SQL editor
5. Click **Run** to create all tables and views
6. Wait for completion (you should see "Success" message)

## Step 4: Import Student Data (Optional)

If you have an existing student list in CSV format:

1. Go to **Table Editor** in Supabase
2. Click on the **students** table
3. Click **Import data** (top right)
4. Upload your CSV file with columns: `reg_no`, `name`
5. Click **Import**

Alternatively, use the provided Node.js script from the old backend to export students and import them via SQL.

## Step 5: Configure Frontend Environment Variables

In the `client` directory, create a `.env` file:

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual credentials from Step 2.

## Step 6: Install Dependencies

In the `client` directory:

```bash
npm install
```

This will install the Supabase client and other dependencies.

## Step 7: Test the Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. Try logging in with a test student account:
   - **Name**: Test Student
   - **Register Number**: TEST001

4. If login works, you're connected to Supabase! ✅

## Step 8: Upload Question Data

You have two options:

### Option A: Manual Upload via SQL Editor

1. In Supabase **SQL Editor**, create a new query
2. Use INSERT statements to add your questions:

```sql
INSERT INTO public.questions 
  (round_name, type, content, options, correct_answer, points, time_limit, order_index)
VALUES 
  ('APTITUDE', 'MCQ', 'What is 2+2?', '{"options": ["3", "4", "5"]}', '4', 5, 60, 1),
  ('APTITUDE', 'MCQ', 'What is the capital of France?', '{"options": ["London", "Paris", "Berlin"]}', 'Paris', 5, 60, 2);
```

### Option B: Seed API Endpoint

If you kept the API running temporarily:

```bash
curl -X POST http://localhost:5000/api/questions/seed/aptitude
curl -X POST http://localhost:5000/api/questions/seed/technical
```

### Option C: Direct Data Import

If you have a CSV of questions, import directly to Supabase via the Table Editor.

## Step 9: Enable Realtime Subscriptions (Important!)

In Supabase:

1. Go to **Realtime** section in left sidebar
2. Click **Replication** 
3. Enable replication for these tables:
   - ✅ students
   - ✅ event_status
   - ✅ submissions
   - ✅ violations
   - ✅ plagiarism_logs
   - ✅ student_activity

This enables real-time updates in your app.

## Step 10: Storage Setup (For Question Images)

If you're storing question images:

1. In Supabase, go to **Storage**
2. Click **Create a new bucket**
3. Name it: `question-assets`
4. Make it **Public** (so images can be accessed from frontend)
5. Upload your question images through the Supabase UI

## Step 11: Row Level Security (RLS)

The schema migration already includes basic RLS policies. If you need to modify permissions:

1. Go to **Authentication** → **Policies**
2. Modify the RLS policies as needed

For now, the default policies allow:
- Students to read their own data
- Admins to read all data
- Public inserts for new student logins

## Troubleshooting

### "VITE_SUPABASE_URL not defined"
- Make sure `.env` file is in the `client` directory (not at root)
- Restart the dev server after adding `.env`

### "Connection refused"
- Check your internet connection
- Verify the Supabase project URL is correct
- Ensure the project is not paused (check Supabase dashboard)

### "Auth error: Invalid API key"
- Double-check the ANON_KEY value - it's case sensitive
- Make sure you're using the **Anon** key, not the **Service Role** key

### Real-time updates not working
- Make sure you enabled Realtime for the required tables
- Check browser console for any websocket errors

### Questions not showing up after seeding
- Verify you inserted questions with the correct `round_name` ('TECHNICAL' or 'APTITUDE')
- Check the Questions table in Supabase Table Editor

## Next Steps

1. Configure Netlify deployment (see NETLIFY_DEPLOYMENT.md)
2. Update component files to use new Supabase services
3. Test with multiple students simultaneously
4. Monitor Supabase dashboard for usage and performance

## Supabase Limits (Free Tier)

- **Database**: 500 MB
- **File Storage**: 1 GB
- **Realtime**: 200 concurrent connections per project
- **Auth Users**: Unlimited

For more details, visit: https://supabase.com/pricing
