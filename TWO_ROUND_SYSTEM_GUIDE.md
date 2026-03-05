# IT Tech Arena AI - Two Round System Upgrade Guide

## System Overview

The platform has been upgraded to support a **two-round competitive system**:

1. **Aptitude Round** - MCQ-based formal reasoning assessment (Logical Reasoning, Pattern Recognition, Numerical Calculation, Analytical Thinking, Problem Solving)
2. **Technical Round** - Code-based practical assessment (Drag & Drop, Syntax Errors, Output Prediction, Programming Problems)

---

## Round Structure

### Phase 1: Aptitude Round
- **Duration**: 60 seconds per question (15 questions total = ~15 minutes)
- **Format**: Multiple Choice Questions (MCQ) with 4 options
- **Scoring**: 5 points per question (75 points total)
- **Submission**: Immediate upon answer or auto-submit on timeout
- **Students**: All students participate

### Phase 2: Technical Round
- **Duration**: 60 seconds per question (5 questions total)
- **Format**: Code-based with various question types
- **Scoring**: 10-20 points per question
- **Submission**: Immediate upon answer or auto-submit on timeout
- **Students**: Only top performers from Aptitude Round (if filtering enabled)

**Final Score = Aptitude Score + Technical Score**

---

## Database Changes

### New/Updated Tables

```sql
-- Already includes all necessary fields:
- Students: aptitude_score, technical_score, overall_score, is_online
- Questions: round_name (APTITUDE/TECHNICAL), type, time_limit (60s fixed)
- Submissions: student_id, question_id, answer, score, time_taken
- RoundResults: Tracks qualifications and rankings
- EventStatus: Manages current_round state
```

---

## Setup Instructions

### Step 1: Initialize Database

```bash
cd server
npm run setup:students
```

This will:
- Create database schema
- Insert admin user (Register No: 621323205024)
- Load students from PDF

### Step 2: Seed Questions

**Terminal 1 - Start Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Seed Questions:**

```bash
# Seed Aptitude Questions
curl -X POST http://localhost:5000/api/questions/seed/aptitude

# Seed Technical Questions
curl -X POST http://localhost:5000/api/questions/seed/technical
```

**Verification:**
```bash
# Check database
mysql it_tech_arena
SELECT COUNT(*) FROM Questions WHERE round_name = 'APTITUDE';
SELECT COUNT(*) FROM Questions WHERE round_name = 'TECHNICAL';
```

### Step 3: Start Frontend

**Terminal 3:**
```bash
cd client
npm install
npm run dev
```

Access at: `http://localhost:5173`

---

## Operation Workflow

### Administrator's Workflow

#### Login as Admin
1. Register No: `621323205024`
2. Name: Any name (will be accepted as ADMIN role)
3. Access Admin Dashboard automatically

#### Phase 1: Aptitude Round

1. **Wait for Students** - Monitor online students in dashboard
   - View: Students Online, Current Question, Answers Submitted
   - Watch: Real-time leaderboard updates

2. **Start Aptitude Round**
   - Click: "Start Aptitude Round" button
   - All students receive notification
   - Round duration: ~15 minutes
   - System Features:
     - Auto-timer: 60 seconds per question
     - Auto-submit: When time expires
     - Tab switch detection: Violations logged
     - Real-time score updates

3. **Monitor Submissions**
   - View student activity table:
     - Student Name
     - Current Question
     - Time on Question
     - Violations Count
   - Watch live leaderboard ranking

4. **Stop Aptitude Round**
   - Click: "Stop Aptitude Round"
   - System calculates scores automatically
   - Leaderboard updates reflect aptitude scores

#### Phase 2: Technical Round (Optional)

If you want to filter only top students:

1. **Auto-Selection** 
   - Top students from Aptitude are pre-selected
   - View qualified students: Dashboard → "Qualified Students"

2. **Start Technical Round**
   - Click: "Start Technical Round"
   - Only top students receive notification
   - Other students see "Not qualified" message

3. **Monitor Technical Submissions**
   - Same dashboard features as Aptitude
   - Additional: Code plagiarism detection
   - AI-based answer evaluation

4. **Stop Technical Round & View Finals**
   - Click: "Stop Technical Round"
   - System calculates final rankings
   - Final leaderboard shows:
     - Aptitude Score
     - Technical Score
     - Total Score
     - Final Rank

### Student's Workflow

#### Pre-Round
1. Login with Name + Register Number
2. Wait in "Waiting Lobby"
3. Cannot proceed until admin starts round

#### During Aptitude Round
1. **See Question** with 60-second timer
2. **Select Option** from 4 MCQ choices
3. **Submit Answer** manually or auto-submit on timeout
4. **Auto-proceed** to next question after submission
5. **Watch Leaderboard** in real-time
6. Complete all 15 questions

#### Between Rounds
1. View Aptitude scores
2. If qualified: Wait for Technical Round
3. If not qualified: Round ends (view final leaderboard)

#### During Technical Round (If Qualified)
1. See first technical question
2. Answer varies by question type:
   - **Drag & Drop**: Rearrange code lines
   - **Syntax Error**: Identify and describe error
   - **Output**: Predict program output
   - **Programming**: Write complete code
3. Submit answer
4. Auto-proceed to next question
5. Complete all 5 questions

#### Post-Exam
1. View final leaderboard with all scores
2. See personal performance ranking
3. Check breakdown by round

---

## Real-Time Features

### Leaderboard Updates

**Triggered on**: Each score submission

```javascript
// Example leaderboard entry
{
  rank: 1,
  name: "Student Name",
  regno: "621323205001",
  aptitude: 65.5,      // Aptitude Round Score
  technical: 45.0,     // Technical Round Score
  total: 110.5         // Total Score
}
```

**Broadcast**: Socket.io event `leaderboard_update` to all connected clients

### Admin Dashboard Live Updates

Real-time updates for:
- Online student count
- Current student activities
- Score submissions
- Violations detected
- Plagiarism flags

---

## Timer Behavior

### Per-Question Timer (60 seconds)
1. **Countdown visible** to student
2. **Less than 10 seconds**: Red flash
3. **At 0 seconds**: Auto-submit current answer
4. **Auto-advance**: Move to next question

### No Round-Level Timer
- Each question has its own 60-second timer
- Total round time varies based on time spent per question
- Earlier submission → Earlier next question

---

## Violation Detection

### Types Tracked
- **TAB_SWITCH**: Student switched to another browser tab
- **BLUR**: Application window lost focus
- **MINIMIZE**: Application window minimized

### Actions
- **1st Violation**: Warning to student
- **2nd Violation**: Warning with message
- **3rd Violation**: Auto-submit current answer, round ends
- **Admin View**: All violations logged in dashboard

---

## Answer Submission & Scoring

### Aptitude Round (MCQ)
```
Submission Process:
1. Student selects option
2. Clicks "Submit Answer"
3. Backend matches with correct_answer
4. Score = 5 if correct, 0 if incorrect
5. Update student Avg → Leaderboard broadcast
```

### Technical Round
```
Submission Process:
1. Student provides answer (varies by type)
2. Backend routes to appropriate evaluator:
   - DRAG_DROP: Exact sequence match
   - SYNTAX: AI evaluation
   - OUTPUT: AI evaluation
   - PROGRAMMING: AI + test case evaluation
3. Plagiarism check (for PROGRAMMING questions)
4. Score calculation
5. Update student score → Leaderboard broadcast
```

---

## Database Transaction Examples

### Submission Flow
```sql
-- 1. Insert submission record
INSERT INTO Submissions (id, student_id, question_id, answer, score, time_taken, status)
VALUES (uuid(), 'student-123', 'apt-q1', 'B', 5, 45, 'EVALUATED');

-- 2. Update student's aptitude score
UPDATE Students SET aptitude_score = aptitude_score + 5 WHERE id = 'student-123';

-- 3. Recalculate overall score
UPDATE Students SET overall_score = technical_score + aptitude_score WHERE id = 'student-123';

-- 4. Broadcast leaderboard (handled by backend)
-- io.emit('leaderboard_update', rankedLeaderboard)
```

### Round Transition Flow
```sql
-- After Technical Round ends:
-- 1. Calculate top students
SELECT id, technical_score FROM Students ORDER BY technical_score DESC LIMIT 5;

-- 2. Mark as qualified
INSERT INTO RoundResults (id, student_id, round_name, is_qualified, rank_pos)
VALUES (uuid(), 'student-123', 'TECHNICAL', TRUE, 1);

-- 3. Change round status
UPDATE EventStatus SET current_round = 'APTITUDE' WHERE id = 1;

-- 4. Notify students via Socket.io
```

---

## API Endpoints Summary

### Admin Actions
```
POST /api/admin/start/technical    - Start Technical Round
POST /api/admin/stop/technical     - End Technical Round (auto-evaluate)
POST /api/admin/start/aptitude     - Start Aptitude Round
POST /api/admin/stop/aptitude      - End Aptitude Round (calculate finals)
POST /api/admin/lock               - Lock all submissions
GET  /api/admin/leaderboard        - Get current leaderboard
GET  /api/admin/dashboard/stats    - Online students, submissions, violations
GET  /api/admin/dashboard/activity - Live student activity
GET  /api/admin/dashboard/qualified - Top students qualified for next round
```

### Student Submissions
```
POST /api/submissions/submit                 - Submit answer
GET  /api/submissions/student/:studentId    - Get student's submissions
```

### Questions
```
GET  /api/questions/APTITUDE        - Get all Aptitude questions
GET  /api/questions/TECHNICAL       - Get all Technical questions
GET  /api/questions/single/:qId     - Get single question
POST /api/questions/seed/aptitude   - Seed aptitude questions (admin only)
POST /api/questions/seed/technical  - Seed technical questions (admin only)
```

### Authentication
```
POST /api/auth/login              - Student login (Name + Register No)
POST /api/auth/admin/login        - Admin login
GET  /api/auth/status             - Get current event status
```

---

## Socket.IO Events

### Client → Server
```javascript
socket.emit('student_join', { studentId, name })
socket.emit('admin_join', {})
socket.emit('student_activity', { studentId, questionId, action })
socket.emit('tab_violation', { studentId, type })
```

### Server → Client

**All Students:**
```javascript
socket.on('round_started', { round, message, timestamp })
socket.on('round_stopped', { round, message, timestamp })
socket.on('leaderboard_update', [...leaderboardEntries])
socket.on('violation_warning', { count, message })
socket.on('force_submit', {})
```

**Admin Only:**
```javascript
socket.on('student_online', { studentId, name, timestamp })
socket.on('student_activity_update', data)
socket.on('new_submission', { studentId, questionId, score, feedback })
socket.on('student_violation', { studentId, type, count })
```

---

## Troubleshooting

### Students Can't Login
```bash
# Check if students table has data
mysql it_tech_arena
SELECT COUNT(*) FROM Students;

# Run student sync from PDF
curl -X POST http://localhost:5000/api/admin/students/sync
```

### Questions Not Loading
```bash
# Verify questions are in database
SELECT COUNT(*) FROM Questions WHERE round_name = 'APTITUDE';

# Seed again if needed
curl -X POST http://localhost:5000/api/questions/seed/aptitude
curl -X POST http://localhost:5000/api/questions/seed/technical
```

### Leaderboard Not Updating
```bash
# Check socket.io connection in browser console
socket.connected  // Should be true

# Check browser for console errors
# Verify admin is listening on 'admin' channel
# Verify submissions are being saved (check database)
```

### Timer Not Working
```bash
# Ensure Question.time_limit is set to 60
SELECT DISTINCT time_limit FROM Questions;
# All should be 60

# Check client-side timer logic in AptitudeRound.tsx
```

---

## Performance Considerations

### For 100+ Simultaneous Students

1. **Database Optimization**
   - Indexes already created on:
     - Students.overall_score DESC
     - Students.technical_score DESC
     - Students.aptitude_score DESC
     - Violations (student_id, timestamp)

2. **Socket.io Optimization**
   - Leaderboard broadcasts to all clients
   - Consider pagination for large leaderboards
   - Activity updates only to admin

3. **Scaling Recommendations**
   - Use MySQL connection pooling (configured)
   - Monitor database query times
   - Consider Redis cache for leaderboard
   - Use Socket.io with horizontal scaling if needed

---

## Files Modified/Created

### Backend
- ✅ `server/src/routes/questionRoutes.ts` - Enhanced aptitude seeding (15 questions)
- ✅ `server/src/routes/adminRoutes.ts` - Enhanced round management
- ✅ `server/src/routes/submissionRoutes.ts` - Already supports scoring
- ✅ `server/src/index.ts` - Socket.io already configured

### Frontend (New)
- ✅ `client/src/components/AptitudeRound.tsx` - MCQ component with timer
- ✅ `client/src/components/RealTimeLeaderboard.tsx` - Live leaderboard with Socket.io

### Frontend (Modified)
- ✅ `client/src/App.tsx` - Integrated AptitudeRound & RealTimeLeaderboard
- ✅ `client/src/services/api.ts` - Added getQualifiedStudents endpoint

### Database
- ✅ `database/schema.sql` - All tables already present

---

## Testing Checklist

- [ ] Login as admin (No: 621323205024)
- [ ] Login as student (from PDF list)
- [ ] Start Aptitude Round
- [ ] Submit answers as student (verify auto-submit on timeout)
- [ ] Check leaderboard update in real-time
- [ ] Admin sees live activity
- [ ] Stop Aptitude Round
- [ ] View qualified students
- [ ] Start Technical Round (if filtering enabled)
- [ ] Complete technical questions
- [ ] View final leaderboard with total scores
- [ ] Check violations are logged
- [ ] Verify plagiarism detection works

---

## Next Steps & Future Enhancements

1. **Analytics Dashboard**
   - Question difficulty analysis
   - Student performance trends
   - Difficulty-wise performance

2. **Advanced Features**
   - Question categories/subjects
   - Partial marking for technical answers
   - Negative marking support
   - Question shuffling per student

3. **Security Enhancements**
   - Rate limiting on submissions
   - Answer encryption in transit
   - IP-based login restrictions
   - Screenshot capture detection

4. **User Experience**
   - Practice mode before exam
   - Question bookmarking
   - Section-wise performance breakdown
   - Performance analytics dashboard for students

---

## Support & Contact

For issues or questions about the two-round system upgrade:
- Check database schema: `database/schema.sql`
- Review endpoint documentation above
- Check browser console for Socket.io errors
- Review server logs for backend errors
