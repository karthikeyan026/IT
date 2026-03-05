-- IT Tech Arena AI - Supabase Schema Migration
-- Execute this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students Table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reg_no VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
  login_time TIMESTAMP DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  technical_score DECIMAL(10,2) DEFAULT 0.00,
  aptitude_score DECIMAL(10,2) DEFAULT 0.00,
  overall_score DECIMAL(10,2) DEFAULT 0.00,
  total_time INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event Status (Control rounds from Admin Dashboard)
CREATE TABLE public.event_status (
  id INT PRIMARY KEY DEFAULT 1,
  current_round VARCHAR(50) DEFAULT 'LOBBY' CHECK (current_round IN ('LOBBY', 'TECHNICAL', 'APTITUDE', 'ENDED')),
  is_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default event status
INSERT INTO public.event_status (id, current_round, is_locked) VALUES (1, 'LOBBY', FALSE) ON CONFLICT (id) DO NOTHING;

-- Questions Table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_name VARCHAR(50) NOT NULL CHECK (round_name IN ('TECHNICAL', 'APTITUDE')),
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  options JSONB DEFAULT NULL,
  correct_answer TEXT DEFAULT NULL,
  test_cases JSONB DEFAULT NULL,
  points DECIMAL(10,2) DEFAULT 10.00,
  time_limit INT DEFAULT 60,
  order_index INT DEFAULT 0,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT,
  score DECIMAL(10,2) DEFAULT 0.00,
  time_taken INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EVALUATED', 'FLAGGED')),
  ai_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Violations Table (Tab Switch Detection)
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN ('TAB_SWITCH', 'BLUR', 'MINIMIZE')),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Plagiarism Logs Table
CREATE TABLE public.plagiarism_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student1_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student2_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5,2) NOT NULL,
  action_taken BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Round Results Table (Track round qualifiers)
CREATE TABLE public.round_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  round_name VARCHAR(50) NOT NULL CHECK (round_name IN ('TECHNICAL', 'APTITUDE')),
  score DECIMAL(10,2) DEFAULT 0.00,
  rank_pos INT DEFAULT NULL,
  is_qualified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student Activity (For Admin Dashboard Live Tracking)
CREATE TABLE public.student_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  current_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  current_round VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard View (Materialized view for performance)
CREATE VIEW public.leaderboard AS
SELECT
  s.id,
  s.reg_no,
  s.name,
  s.aptitude_score,
  s.technical_score,
  s.overall_score,
  ROW_NUMBER() OVER (ORDER BY s.overall_score DESC) AS rank
FROM public.students s
ORDER BY s.overall_score DESC;

-- Create Indexes for Performance
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_submissions_question_id ON public.submissions(question_id);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at);
CREATE INDEX idx_violations_student_id ON public.violations(student_id);
CREATE INDEX idx_violations_timestamp ON public.violations(timestamp);
CREATE INDEX idx_questions_round_name ON public.questions(round_name);
CREATE INDEX idx_plagiarism_logs_created_at ON public.plagiarism_logs(created_at);
CREATE INDEX idx_round_results_student_id ON public.round_results(student_id);
CREATE INDEX idx_round_results_round_name ON public.round_results(round_name);

-- Enable Row Level Security (RLS) for Students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anyone to read students data (needed for custom auth without Supabase Auth)
CREATE POLICY "Anyone can read students" ON public.students
FOR SELECT USING (true);

-- RLS Policy: Allow inserts for new student logins (unauthenticated, for initial access)
CREATE POLICY "Enable inserts for student login" ON public.students
FOR INSERT WITH CHECK (true);

-- RLS Policy: Allow anyone to update students (needed for login time, scores, etc.)
CREATE POLICY "Anyone can update students" ON public.students
FOR UPDATE USING (true);

-- Enable subscriptions on tables
GRANT EXECUTE ON FUNCTION pg_stat_statements_reset to anon;

-- Ensure public access to required tables for the app
GRANT SELECT ON public.students TO anon;
GRANT INSERT ON public.students TO anon;
GRANT UPDATE ON public.students TO anon;
GRANT SELECT ON public.questions TO anon;
GRANT SELECT ON public.submissions TO anon;
GRANT INSERT ON public.submissions TO anon;
GRANT SELECT ON public.violations TO anon;
GRANT INSERT ON public.violations TO anon;
GRANT SELECT ON public.plagiarism_logs TO anon;
GRANT INSERT ON public.plagiarism_logs TO anon;
GRANT SELECT ON public.round_results TO anon;
GRANT INSERT ON public.round_results TO anon;
GRANT UPDATE ON public.round_results TO anon;
GRANT SELECT ON public.student_activity TO anon;
GRANT INSERT ON public.student_activity TO anon;
GRANT UPDATE ON public.student_activity TO anon;
GRANT SELECT ON public.event_status TO anon;
GRANT UPDATE ON public.event_status TO anon;
GRANT SELECT ON public.leaderboard TO anon;
