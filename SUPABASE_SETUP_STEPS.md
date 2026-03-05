# Supabase Setup - Step by Step Guide

## Your Database Already Has Tables!

Since the tables already exist, you only need to:

### Step 1: Fix RLS Policies (IMPORTANT!)
Go to Supabase SQL Editor and run **FIX_RLS_POLICIES.sql**

This will allow your custom authentication to work properly.

```sql
-- Copy and paste from FIX_RLS_POLICIES.sql
-- This fixes the "row-level security policy" error
```

### Step 2: Add Students and Admins
Run **INSERT_STUDENTS_ADMINS.sql**

This adds:
- 2 Admins (KARTHIKEYAN, ESWARI)
- 68 Students from your PDF

```sql
-- Copy and paste from INSERT_STUDENTS_ADMINS.sql
```

### Step 3: Test Login

**Test as Admin:**
- Register Number: `621323205024`
- Name: `KARTHIKEYAN`

OR

- Register Number: `621323205015`
- Name: `ESWARI`

**Test as Student:**
- Register Number: `621324205001`
- Name: `ABINIVESH K`

---

## If You Need to Start Fresh (Optional)

If you want to recreate everything from scratch:

### Option A: Drop All Tables First
```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS public.student_activity CASCADE;
DROP TABLE IF EXISTS public.round_results CASCADE;
DROP TABLE IF EXISTS public.plagiarism_logs CASCADE;
DROP TABLE IF EXISTS public.violations CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.event_status CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP VIEW IF EXISTS public.leaderboard CASCADE;
```

Then run the full **SUPABASE_SCHEMA_MIGRATION.sql** (now updated with IF NOT EXISTS).

---

## Troubleshooting

**Error: "row violates row-level security policy"**
→ Run FIX_RLS_POLICIES.sql

**Error: "relation already exists"**
→ Tables already created, skip to Step 2

**Login not working**
→ Make sure you ran FIX_RLS_POLICIES.sql
→ Check name is EXACT (including uppercase)
→ Check register number is correct

**No admins/students in database**
→ Run INSERT_STUDENTS_ADMINS.sql
