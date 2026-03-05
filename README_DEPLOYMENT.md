# IT Tech Arena AI - Upgraded Platform

## Complete Deployment & Usage Guide

### 🎯 **Overview**

A fully upgraded AI-powered technical competition system  with:
- **Technical Round** (5 question types with AI evaluation)
- **Aptitude Round** (MCQ-based, Top 5 students only)
- **Admin Dashboard** (Live monitoring, real-time updates)
- **Tab Switch Detection** (Anti-cheat system)
- **Plagiarism Detection** (AI-powered similarity check)
- **WebSocket Integration** (Real-time updates)

---

## 📁 **Project Structure**

```
IT_Tech_Arena_AI/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── WaitingLobby.tsx
│   │   │   ├── DragReorder.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── MyStats.tsx
│   │   ├── pages/
│   │   │   └── AdminDashboard.tsx
│   │   ├── modules/
│   │   │   └── TabDetector.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/                 # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── questionRoutes.ts
│   │   │   ├── submissionRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── violationRoutes.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   └── plagiarismService.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── database/
│   └── schema.sql           # Updated MySQL schema
└── README_DEPLOYMENT.md
```

---

## 🚀 **Installation & Setup**

### **1. Database Setup**

```bash
# Start MySQL server
mysql -u root -p

# Create database and tables
mysql -u root -p < database/schema.sql
```

### **2. Backend Setup**

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=it_tech_arena
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=5000

# Seed sample questions
# Start server first, then:
curl -X POST http://localhost:5000/api/questions/seed/technical
curl -X POST http://localhost:5000/api/questions/seed/aptitude

# Start development server
npm run dev
```

### **3. Frontend Setup**

```bash
cd client

# Install dependencies (already done)
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev
```

---

## 🎮 **System Flow**

### **Student Journey**

1. **Login** → Name + Register Number (no email)
2. **Waiting Lobby** → Shows "Waiting for Admin to Start the Test"
3. **Technical Round** (when admin starts)
   - Drag & Drop Code Reordering
   - Find Syntax Errors
   - Pseudocode Output Questions
   - Write Program Output
   - Programming Questions (code execution)
   - Timer countdown per question
   - Auto-submit on time end
4. **Auto-Evaluation** → AI evaluates answers
5. **Top 5 Selection** → Automatic after Technical Round ends
6. **Aptitude Round** (Top 5 only)
   - MCQ questions
   - Timed per question
   - Auto-evaluation
7. **Final Rankings** → Leaderboard with winners

### **Admin Journey**

1. **Admin Login** → Username: `admin`, Password: `admin123`
2. **Admin Dashboard** → Full control panel
   - Start/Stop Technical Round
   - Start/Stop Aptitude Round
   - Lock all submissions
   - View live student activity
   - Monitor tab violations
   - Check plagiarism logs
   - View real-time leaderboard

---

## 🛡️ **Anti-Cheat Features**

### **Tab Switch Detection**

- Monitors `document.visibilitychange`
- Detects window blur/focus events
- **3-Strike System:**
  - 1st violation → Warning popup
  - 2nd violation → Second warning
  - 3rd violation → Auto-submit test
- Admin dashboard shows suspicious students

### **Copy Protection**

-  Right-click disabled
- Copy/Paste disabled (Ctrl+C/V/X)
- Inspect element disabled (F12, Ctrl+Shift+I)
- All keyboard shortcuts blocked during test

### **Plagiarism Detection**

- Uses OpenAI embeddings for code similarity
- Compares all programming question answers
- Threshold: 85% similarity = flagged
- Ignores variable names, formatting, indentation
- Admin can view similarity scores
- Automatic score deduction for plagiarized content

---

## 📊 **Admin Dashboard Features**

### **Dashboard Statistics**

- Students online (real-time count)
- Total submissions
- Suspicious students (2+ violations)
- Plagiarism cases detected
- Current round status

### **Live Student monitoring**

Real-time table showing:
- Student name & register number
- Current question they're answering
- Last activity timestamp
- Violation count
- Online/offline status

### **Round Controls**

- **Start Technical Round** button
- **Stop Technical Round** button (auto-evaluates and selects Top 5)
- **Start Aptitude Round** button (only for Top 5)
- **Stop Aptitude Round** button (calculates final rankings)
- **Lock System** button (prevents all submissions)

### **Plagiarism Logs**

- Student A vs Student B
- Similarity percentage
- Question details
- Timestamp

---

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/status` - Get event status

### **Questions**
- `GET /api/questions/:round` - Get questions for round
- `POST /api/questions/seed/technical` - Seed technical questions
- `POST /api/questions/seed/aptitude` - Seed aptitude questions

### **Submissions**
- `POST /api/submissions/submit` - Submit answer
- `GET /api/submissions/student/:id` - Get student submissions
- `GET /api/submissions/all` - Get all submissions (admin)

### **Admin**
- `POST /admin/start/technical` - Start technical round
- `POST /admin/stop/technical` - Stop and evaluate technical round
- `POST /admin/start/aptitude` - Start aptitude round (Top 5 only)
- `POST /admin/stop/aptitude` - Stop and calculate final rankings
- `POST /admin/lock` - Lock all submissions
- `GET /admin/dashboard/stats` - Get dashboard statistics
- `GET /admin/dashboard/activity` - Get live student activity
- `GET /admin/leaderboard` - Get leaderboard
- `GET /admin/plagiarism` - Get plagiarism logs

### **Violations**
- `POST /api/violations/log` - Log tab violation
- `GET /api/violations/student/:id` - Get student violations
- `GET /api/violations/suspicious` - Get suspicious students

---

## 🌐 **WebSocket Events**

### **Client → Server**
- `student_join` - Student connects with ID and name
- `admin_join` - Admin joins dashboard
- `student_activity` - Student activity update (question navigation)
- `submission` - Answer submitted
- `tab_violation` - Tab switch detected

### **Server → Client**
- `round_started` - Round has been started by admin
- `round_stopped` - Round has ended
- `student_online` - New student came online
- `student_activity_update` - Student activity changed
- `new_submission` - New answer submitted (for admin)
- `student_violation` - Violation detected (for admin)
- `violation_warning` - Warning sent to student
- `force_submit` - Force student to submit (3 violations)
- `system_locked` - System locked by admin

---

## 🎨 **UI Theme**

- **Dark neon IT theme** (maintained from original)
- Cyan/Blue gradient accents
- Glassmorphism effects
- Smooth animations with Framer Motion
- Responsive design (works on tablets and desktop)

---

## 📋 **Database Tables**

### **Students**
- Stores: Name, Register Number, Scores, Online Status

### **EventStatus**
- Current round (LOBBY, TECHNICAL, APTITUDE, ENDED)
- Lock status

### **Questions**
- Round name, Type, Content, Options, Correct Answer, Test Cases

### **Submissions**
- Student answers, Scores, AI feedback, Timestamps

### **Violations**
- Tab switches, Blur events, Timestamps

### **PlagiarismLogs**
- Student pairs, Similarity scores, Question details

### **RoundResults**
- Round-wise scores, Rankings, Qualification status

### **StudentActivity**
- Current question, Last activity timestamp (for live monitoring)

---

## ⚡ **Performance Optimization**

- **Database:** Connection pooling (100 connections)
- **WebSocket:** Auto-reconnection with exponential backoff
- **Frontend:** Code splitting with React.lazy()
- **Backend:** Async/await for all database operations
- **Caching:** JWT tokens in localStorage
- **Scalability:** Supports 100+ concurrent students

---

## 🧪 **Testing**

### **1. Test Student Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "regNo": "IT-2026-001"}'
```

### **2. Test Admin Login**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### **3. Test Question Seeding**
```bash
# Seed 5 technical questions
curl -X POST http://localhost:5000/api/questions/seed/technical

# Seed 5 aptitude questions
curl -X POST http://localhost:5000/api/questions/seed/aptitude
```

---

## 🐛 **Troubleshooting**

### **Database Connection Failed**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `it_tech_arena` exists

### **WebSocket Not Connecting**
- Check CORS settings in server
- Verify `VITE_API_URL` in client `.env.local`
- Check firewall rules

### **AI Evaluation Not Working**
- Verify `OPENAI_API_KEY` in server `.env`
- Check OpenAI API quota and billing
- Check network connectivity

### **Tab Detection Not Working**
- Ensure TabDetector component is mounted
- Check browser console for errors
- Verify socket connection is established

---

## 📄 **License**

MIT License - Feel free to modify and use for your institution.

---

## 👨‍💻 **Support**

For issues or questions, please check:
- Server logs: `server/` directory console
- Client logs: Browser DevTools Console
- Database logs: MySQL error logs

---

**Built with ❤️ for IT Tech Arena AI Competition Platform**
