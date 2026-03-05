-- Database Schema for IT Tech Arena AI - UPGRADED VERSION
-- Target: MySQL 8.0+
-- Supports: Technical Round, Aptitude Round, Tab Detection, Plagiarism Detection, Live Monitoring

CREATE DATABASE IF NOT EXISTS it_tech_arena;
USE it_tech_arena;

-- Students Table (Login with Name + Register Number)
CREATE TABLE IF NOT EXISTS Students (
    id VARCHAR(50) PRIMARY KEY,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    technical_score DECIMAL(10,2) DEFAULT 0.00,
    aptitude_score DECIMAL(10,2) DEFAULT 0.00,
    overall_score DECIMAL(10,2) DEFAULT 0.00,
    total_time INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Status (Control rounds from Admin Dashboard)
CREATE TABLE IF NOT EXISTS EventStatus (
    id INT PRIMARY KEY DEFAULT 1,
    current_round VARCHAR(50) DEFAULT 'LOBBY', -- LOBBY, TECHNICAL, APTITUDE, ENDED
    is_locked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT IGNORE INTO EventStatus (id, current_round, is_locked) VALUES (1, 'LOBBY', FALSE);

-- Questions Table
CREATE TABLE IF NOT EXISTS Questions (
    id VARCHAR(50) PRIMARY KEY,
    round_name VARCHAR(50) NOT NULL, -- TECHNICAL, APTITUDE
    type VARCHAR(50) NOT NULL, -- DRAG_DROP, SYNTAX, PSEUDOCODE, OUTPUT, PROGRAMMING, MCQ
    content TEXT NOT NULL,
    options JSON DEFAULT NULL,
    correct_answer TEXT DEFAULT NULL,
    test_cases JSON DEFAULT NULL,
    points DECIMAL(10,2) DEFAULT 10.00,
    time_limit INT DEFAULT 300, -- seconds
    order_index INT DEFAULT 0
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS Submissions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    answer TEXT,
    score DECIMAL(10,2) DEFAULT 0.00,
    time_taken INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, EVALUATED, FLAGGED
    ai_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(id) ON DELETE CASCADE
);

-- Violations Table (Tab Switch Detection)
CREATE TABLE IF NOT EXISTS Violations (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    violation_type VARCHAR(50) NOT NULL, -- TAB_SWITCH, BLUR, MINIMIZE
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE
);

-- Plagiarism Logs Table
CREATE TABLE IF NOT EXISTS PlagiarismLogs (
    id VARCHAR(50) PRIMARY KEY,
    student1_id VARCHAR(50) NOT NULL,
    student2_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    similarity_score DECIMAL(5,2) NOT NULL,
    action_taken BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student1_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (student2_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(id) ON DELETE CASCADE
);

-- Round Results Table (Track Round 1 qualifiers for Top 5)
CREATE TABLE IF NOT EXISTS RoundResults (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    round_name VARCHAR(50) NOT NULL, -- TECHNICAL, APTITUDE
    score DECIMAL(10,2) DEFAULT 0.00,
    rank_pos INT DEFAULT NULL,
    is_qualified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE
);

-- Student Activity (For Admin Dashboard Live Tracking)
CREATE TABLE IF NOT EXISTS StudentActivity (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    current_question_id VARCHAR(50),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (current_question_id) REFERENCES Questions(id) ON DELETE SET NULL
);

-- Admin Users
CREATE TABLE IF NOT EXISTS Admins (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT IGNORE INTO Admins (id, username, password_hash) 
VALUES ('admin-1', 'admin', '$2b$10$8y7KDklGe6K9JN.gKx7MXO6Dz4z7yH.8ZcQP1P7.kJkY4KY5K5K5K');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_overall_leaderboard ON Students (overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_technical_score ON Students (technical_score DESC);
CREATE INDEX IF NOT EXISTS idx_aptitude_score ON Students (aptitude_score DESC);
CREATE INDEX IF NOT EXISTS idx_violations ON Violations (student_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_plagiarism ON PlagiarismLogs (similarity_score DESC);
