-- Quick Fix: Drop old restrictive RLS policies and create permissive ones
-- Run this in Supabase SQL Editor if you already ran the old schema

-- Drop old policies
DROP POLICY IF EXISTS "Students can read own data" ON public.students;
DROP POLICY IF EXISTS "Students can update own scores" ON public.students;
DROP POLICY IF EXISTS "Enable inserts for student login" ON public.students;

-- Create new permissive policies for custom authentication
CREATE POLICY "Anyone can read students" ON public.students
FOR SELECT USING (true);

CREATE POLICY "Enable inserts for student login" ON public.students
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update students" ON public.students
FOR UPDATE USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'students';
