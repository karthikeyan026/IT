# Admin Operations Guide - Supabase Edition

This guide explains how to perform common admin tasks using Supabase (without the Node.js backend).

## Table of Contents

1. [Managing Students](#managing-students)
2. [Managing Questions](#managing-questions)
3. [Monitoring Competition](#monitoring-competition)
4. [Handling Violations](#handling-violations)
5. [Managing Results](#managing-results)
6. [Direct Database Access](#direct-database-access)

## Managing Students

### Add a Single Student

**Option A: Using Supabase Table Editor (UI)**

1. Go to Supabase Dashboard
2. Click **Table Editor** → **students**
3. Click the **+** button (Insert new row)
4. Fill in:
   - `reg_no`: "IT-2026-001"
   - `name`: "John Doe"
   - `role`: "STUDENT"
5. Click **Save**

**Option B: Using SQL**

```sql
INSERT INTO students (reg_no, name, role)
VALUES ('IT-2026-001', 'John Doe', 'STUDENT');
```

### Bulk Import Students from CSV

1. Get your CSV file with columns: `reg_no`, `name`
2. In Supabase:
   - **Table Editor** → **students**
   - Click **...** → **Import data**
   - Upload CSV
   - Click **Import**

### Set a Student as Admin

```sql
UPDATE students
SET role = 'ADMIN'
WHERE reg_no = 'IT-2026-ADMIN';
```

Or use Table Editor:
1. Click on the student row
2. Change `role` to `ADMIN`
3. Click **Save**

### View All Online Students

```sql
SELECT id, name, reg_no, is_online, login_time
FROM students
WHERE is_online = TRUE
ORDER BY login_time DESC;
```

### Reset Student Scores

```sql
UPDATE students
SET technical_score = 0,
    aptitude_score = 0,
    overall_score = 0
WHERE id = 'STUDENT_ID';
```

Reset ALL students:

```sql
UPDATE students
SET technical_score = 0,
    aptitude_score = 0,
    overall_score = 0;
```

### Delete a Student and Their Data

```sql
DELETE FROM students
WHERE reg_no = 'IT-2026-001';
```

(This cascades to delete submissions, violations, etc.)

## Managing Questions

### Add a Single MCQ Question (Aptitude Round)

**Using SQL:**

```sql
INSERT INTO questions (
  round_name, type, content, options, correct_answer, 
  points, time_limit, order_index
)
VALUES (
  'APTITUDE',
  'MCQ',
  'What is the capital of France?',
  '{"options": ["London", "Paris", "Berlin"]}',
  'Paris',
  5,
  60,
  1
);
```

**Using Table Editor:**
1. **Table Editor** → **questions**
2. Click **+**
3. Fill in:
   - `round_name`: "APTITUDE"
   - `type`: "MCQ"
   - `content`: "Your question text"
   - `options`: `{"options": ["A", "B", "C"]}`
   - `correct_answer`: "B"
   - `points`: 5
   - `time_limit`: 60

### Add Technical Round Question

```sql
INSERT INTO questions (
  round_name, type, content, points, time_limit, order_index
)
VALUES (
  'TECHNICAL',
  'CODING',
  'Write a function to reverse an array',
  20,
  300,
  1
);
```

### Update a Question

```sql
UPDATE questions
SET content = 'Updated question text',
    correct_answer = 'NEW_ANSWER'
WHERE id = 'QUESTION_ID';
```

### Delete a Question

```sql
DELETE FROM questions
WHERE id = 'QUESTION_ID';
```

### View All Questions for a Round

```sql
SELECT * FROM questions
WHERE round_name = 'APTITUDE'
ORDER BY order_index;
```

## Monitoring Competition

### View Live Leaderboard

```sql
SELECT * FROM leaderboard
ORDER BY rank;
```

Or use the **RealTimeLeaderboard** component in the app.

### Check Student Submissions

```sql
SELECT 
  s.id,
  st.name,
  q.content,
  s.answer,
  s.score,
  s.time_taken,
  s.created_at
FROM submissions s
JOIN students st ON s.student_id = st.id
JOIN questions q ON s.question_id = q.id
WHERE st.reg_no = 'IT-2026-001'
ORDER BY s.created_at;
```

### Check Specific Question Answers

```sql
SELECT 
  st.name,
  st.reg_no,
  s.answer,
  s.score,
  s.time_taken
FROM submissions s
JOIN students st ON s.student_id = st.id
WHERE s.question_id = 'QUESTION_ID'
ORDER BY s.created_at;
```

### Current Round Status

```sql
SELECT current_round, is_locked, updated_at
FROM event_status;
```

## Handling Violations

### View All Violations

```sql
SELECT 
  v.id,
  st.name,
  st.reg_no,
  v.violation_type,
  v.timestamp
FROM violations v
JOIN students st ON v.student_id = st.id
ORDER BY v.timestamp DESC;
```

### Violations by Student

```sql
SELECT 
  st.name,
  st.reg_no,
  COUNT(*) as violation_count,
  MAX(v.timestamp) as last_violation
FROM violations v
JOIN students st ON v.student_id = st.id
GROUP BY st.id, st.name, st.reg_no
HAVING COUNT(*) >= 3
ORDER BY violation_count DESC;
```

### Delete a False Violation

```sql
DELETE FROM violations
WHERE id = 'VIOLATION_ID';
```

## Plagiarism Detection

### View All Plagiarism Cases

```sql
SELECT 
  pl.similarity_score,
  st1.name as student1,
  st2.name as student2,
  q.content as question,
  pl.created_at
FROM plagiarism_logs pl
JOIN students st1 ON pl.student1_id = st1.id
JOIN students st2 ON pl.student2_id = st2.id
JOIN questions q ON pl.question_id = q.id
WHERE pl.similarity_score > 85
ORDER BY pl.similarity_score DESC;
```

### Mark Plagiarism Case as Handled

```sql
UPDATE plagiarism_logs
SET action_taken = TRUE
WHERE id = 'PLAGIARISM_LOG_ID';
```

## Managing Results

### Calculate Round Ranks

```sql
INSERT INTO round_results (
  student_id, round_name, score, rank_pos
)
SELECT 
  s.id,
  'APTITUDE',
  s.aptitude_score,
  ROW_NUMBER() OVER (ORDER BY s.aptitude_score DESC)
FROM students s;
```

### Get Top 5 Qualifiers for Finals

```sql
SELECT 
  st.id,
  st.name,
  st.reg_no,
  st.overall_score,
  ROW_NUMBER() OVER (ORDER BY st.overall_score DESC) as rank
FROM students st
WHERE st.overall_score > 0
ORDER BY st.overall_score DESC
LIMIT 5;
```

### Export Results to CSV

You can export directly from Supabase Table Editor:

1. **Table Editor** → **students**
2. Click **...** → **Export as CSV**
3. File downloads automatically

Or fetch and process:

```bash
curl -H "Authorization: Bearer ANON_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/leaderboard?select=*&order=rank" \
  > leaderboard.json
```

## Direct Database Access

### Using SQL Editor

Best for one-off queries and admin tasks:

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Write your SQL
5. Click **Run**

### Examples

**Student count:**
```sql
SELECT COUNT(*) FROM students;
```

**Total submissions:**
```sql
SELECT COUNT(*) FROM submissions;
```

**Average score:**
```sql
SELECT AVG(overall_score) as avg_score FROM students;
```

**Students who haven't submitted:**
```sql
SELECT s.id, s.name
FROM students s
LEFT JOIN submissions sub ON s.id = sub.student_id
WHERE sub.id IS NULL
AND s.role = 'STUDENT';
```

**Activity timeline:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as submission_count
FROM submissions
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Using Admin Dashboard UI

If you've built the AdminDashboard component in the app:

1. Login as an admin student
2. Navigate to `/admin`
3. View all metrics in real-time
4. No SQL knowledge needed!

## Supabase GUI Features

### Table Editor

- View all data
- Insert new rows (click +)
- Edit rows (double-click cells)
- Delete rows (right-click → Delete)
- Filter and search
- Import/export data

### SQL Editor

- Write complex queries
- Run one-off operations
- Save query templates
- Export results

### Storage

- Manage question images
- Upload question assets
- Set file permissions
- Direct CDN links

### Authentication

- View user accounts
- Manage sessions
- Reset passwords (if using email auth)

## Backup & Recovery

### Export Data Before Competition

Go to Supabase SQL Editor:

```sql
-- Backup students
COPY (SELECT * FROM students) TO STDOUT WITH CSV;

-- Backup submissions  
COPY (SELECT * FROM submissions) TO STDOUT WITH CSV;

-- Backup questions
COPY (SELECT * FROM questions) TO STDOUT WITH CSV;
```

Then save CSV files locally.

### Restore from Backup

If something goes wrong:

```sql
-- Delete corrupted data
DELETE FROM submissions;
DELETE FROM students;

-- Reimport from backup CSV
-- Use Table Editor → Import data
```

## Best Practices

1. **Always backup before bulk operations**
2. **Use transactions for related updates:**
   ```sql
   BEGIN;
   UPDATE students SET aptitude_score = 0;
   UPDATE submissions SET score = 0 WHERE ...;
   COMMIT;
   ```

3. **Monitor during competition:**
   - Watch real-time leaderboard
   - Track violations
   - Monitor Supabase usage stats

4. **Keep audit trail:**
   - Note when you made manual changes
   - Document any corrections

5. **Test with small data first**
   - Create test student
   - Test question before going live

## Troubleshooting

### Can't see updated data in console

- Refresh the page (Cmd/Ctrl +R)
- Check that record wasn't deleted (filtered out)
- Verify you're in correct table

### Bulk operation failed

- Check for constraint violations
- Verify foreign keys exist
- Use EXPLAIN to debug slow queries

### Data inconsistency

- Check RLS policies aren't blocking updates
- Verify row level security is disabled for admin queries
- Check Supabase status page

## Support Resources

- **Supabase SQL Docs**: https://www.postgresql.org/docs/
- **Supabase Dashboard Help**: https://supabase.com/docs/guides/getting-started
- **This App Support**: Check GitHub issues or project docs
