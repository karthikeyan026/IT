# Two-Round System - Quick Start Guide

## 60 Second Setup

### 1. Database & Seeds
```bash
cd server
npm run setup:students          # Creates schema + loads students from PDF

# Wait for completion, then seed questions:
curl -X POST http://localhost:5000/api/questions/seed/aptitude
curl -X POST http://localhost:5000/api/questions/seed/technical
```

### 2. Start Backend
```bash
cd server
npm run dev    # Runs on http://localhost:5000
```

### 3. Start Frontend
```bash
cd client
npm run dev    # Runs on http://localhost:5173
```

---

## How It Works

### Aptitude Round (All Students)
1. **15 MCQ Questions** - Formal reasoning
2. **60 seconds per question** - Auto-submits if time expires
3. **Real-time leaderboard** - Updates on each submission
4. **5 points each** - Max 75 points

### Technical Round (Top Students)
1. **5 Coding Questions** - Drag & Drop, Syntax, Output, Programming
2. **60 seconds per question** - Auto-submits if time expires  
3. **Real-time leaderboard** - Updates on each submission
4. **10-20 points each** - Max 75+ points

### Final Score
**Total = Aptitude Score + Technical Score**

---

## Admin Dashboard Controls

### Phase 1: Aptitude
```
1. Click "Start Aptitude Round"
   → All students get notification
   → Timer starts: 60 sec per question

2. Watch "Live Activity" tab:
   - Student | Question | Time | Violations

3. Watch "Leaderboard" tab:
   - Real-time rankings update

4. Click "Stop Aptitude Round"
   → Scores calculated
   → Top students marked as qualified
```

### Phase 2: Technical
```
1. Click "Start Technical Round"
   → Only qualified students notified
   → Other students see "Not qualified"

2. Monitor submissions & scores

3. Click "Stop Technical Round"
   → Final rankings calculated
   → View total scores
```

---

## Key Features Implemented

✅ **Two-Round System**
- Aptitude (MCQ) + Technical (Coding)
- 60-second timer per question
- Auto-submit on timeout
- Round transitions with student filtering

✅ **Real-Time Leaderboard**
- Socket.io updates on each submission
- Shows: Rank, Name, Reg No, Aptitude, Technical, Total
- Medal emojis for top 3
- Live statistics

✅ **Answer Storage**
- Immediate DB insertion on submit
- Tracks: Student, Question, Answer, Score, Time Taken
- Auto-scoring for MCQ (exact match)
- AI scoring for technical answers

✅ **Admin Monitoring**
- Live student activity dashboard
- Submission tracker
- Violation detection (tab switching)
- Plagiarism logs
- Real-time stats

✅ **Violation Detection**
- Detects tab switches
- Logs all violations
- Auto-submit on 3rd violation
- Admin notifications

---

## Testing

### Test as Student
1. Go to `http://localhost:5173`
2. Login: Name: Any Student's Name, Register No: From PDF
3. Wait in lobby
4. When admin starts round, questions appear
5. Select option → Submit or wait for auto-submit
6. View leaderboard tab for real-time rankings

### Test as Admin
1. Go to `http://localhost:5173`
2. Login: Register No: `621323205024`
3. Auto-routed to Admin Dashboard
4. Click "Start Aptitude Round"
5. Watch live activity & leaderboard
6. Click "Stop Aptitude Round"
7. View qualified students
8. Start technical round
9. Stop and view final Rankings

---

## Important Notes

### Database
- All tables auto-created on `npm run setup:students`
- 15 Aptitude questions (5 points each)
- 5 Technical questions (10-20 points each)
- Leaderboard calculated in real-time

### Timer
- **Per Question**: 60 seconds (visible countdown)  
- **Behavior**: 
  - Submit early → Move to next question
  - Timeout → Auto-submit → Move to next
  - Red flash when < 10 seconds

### Scoring
- **Aptitude**: Direct comparison (MCQ)
- **Technical**: AI evaluation + plagiarism check
- **Leaderboard**: Updated via Socket.io immediately

### Socket Events
- `round_started` → All students notified
- `leaderboard_update` → All clients update live
- `student_activity` → Admin sees activity
- `tab_violation` → Violation logged

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Students won't load | Run `curl -X POST http://localhost:5000/api/admin/students/sync` |
| Questions not showing | Seed: `curl -X POST http://localhost:5000/api/questions/seed/aptitude` |
| Leaderboard not updating | Check Socket.io: Open DevTools → Console, type `socket.connected` |
| Timer not working | Check question time_limit = 60 in DB |
| Admin sees "Not Qualified" | Verify qualified students in table: `SELECT * FROM RoundResults;` |

---

## Database Queries

### Check Setup
```sql
-- Connected students
SELECT COUNT(*) FROM Students WHERE role = 'STUDENT';

-- Aptitude questions
SELECT COUNT(*) FROM Questions WHERE round_name = 'APTITUDE';

-- Technical questions  
SELECT COUNT(*) FROM Questions WHERE round_name = 'TECHNICAL';

-- Submissions
SELECT COUNT(*) FROM Submissions;

-- Top students
SELECT name, reg_no, overall_score FROM Students ORDER BY overall_score DESC LIMIT 10;
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `server/src/routes/questionRoutes.ts` | Question seeding |
| `server/src/routes/adminRoutes.ts` | Admin controls |
| `server/src/routes/submissionRoutes.ts` | Answer submission & scoring |
| `client/src/components/AptitudeRound.tsx` | Aptitude UI with timer |
| `client/src/components/RealTimeLeaderboard.tsx` | Live leaderboard |
| `client/src/App.tsx` | Main app logic |
| `database/schema.sql` | Database structure |

---

## Environment Variables

### Server (.env)
```
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## Support

For detailed documentation, see: `TWO_ROUND_SYSTEM_GUIDE.md`
