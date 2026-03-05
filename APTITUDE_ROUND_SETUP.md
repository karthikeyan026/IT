# Aptitude Round Setup Guide

## Overview
The Aptitude Round consists of 10 questions with a 60-second timer per question:
- **4 Word Scramble** questions (IT terminology)
- **2 Number Pattern** questions (sequence/logic)
- **4 Image Logic Puzzles** (visual reasoning)

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── AptitudeRound.tsx          ← Main component for students
│   │   └── AptitudeSetup.tsx          ← Admin setup component
│   ├── data/
│   │   └── aptitudeQuestions.ts       ← Question data definitions
│   └── services/
│       └── seedAptitudeQuestions.ts   ← Seed utility functions
└── public/assets/images/              ← Image puzzles (create these)
```

## Step 1: Prepare Images (Optional)
If using image-based puzzles, upload these files:
- `/public/assets/images/music-puzzle.png` - Guitar/Microphone/Violin puzzle
- `/public/assets/images/number-grid.png` - 4x4 number grid puzzle  
- `/public/assets/images/star-pattern.png` - Star diagram puzzle

## Step 2: Seed Questions to Database

### Option A: Using Admin Dashboard
1. Navigate to Admin Dashboard
2. Find "Aptitude Questions Setup" section
3. Click "Seed 10 Questions"
4. Wait for success message ✅

### Option B: Using Console
Run in browser console:
```javascript
import { seedAptitudeQuestions } from './src/services/supabaseQuestions';
import { APTITUDE_QUESTIONS } from './src/data/aptitudeQuestions';

await seedAptitudeQuestions(APTITUDE_QUESTIONS);
```

### Option C: Programmatic
```typescript
import { seedAptitudeRound } from './src/services/seedAptitudeQuestions';

const result = await seedAptitudeRound();
console.log(result); // { success: true, message: '...' }
```

## Step 3: Verify Questions
```typescript
import { verifyAptitudeQuestions } from './src/services/seedAptitudeQuestions';

const questions = await verifyAptitudeQuestions();
// Should print 10 questions in console
```

## Step 4: Start Aptitude Round
```typescript
import { AptitudeRound } from './components/AptitudeRound';

<AptitudeRound student={currentStudent} />
```

## Question Format

Each question in the database has:
```json
{
  "id": "uuid",
  "round_name": "APTITUDE",
  "type": "WORD_SCRAMBLE|NUMBER_PATTERN|IMAGE_LOGIC|NUMBER_GRID|SEQUENCE|STAR_PATTERN",
  "content": "Question text (supports HTML)",
  "options": {
    "A": "Option text",
    "B": "Option text",
    "C": "Option text",
    "D": "Option text"
  },
  "correct_answer": "A",
  "points": 5,
  "time_limit": 60,
  "order_index": 0,
  "image_url": "optional path to image"
}
```

## Features Implemented

✅ **Real-time Timer**
- 60 seconds per question
- Flashing red alert at 10 seconds remaining
- Auto-submit when time expires

✅ **Multiple Question Types**
- Word Scramble - Unscramble IT terminology
- Number Pattern - Find missing numbers in sequences
- Image Logic - Visual reasoning puzzles
- Number Grid - 2D array pattern matching
- Sequence - Advanced number patterns
- Star Pattern - Radial diagram logic

✅ **Auto-submission**
- Submits automatically when timer runs out
- Prevents answer changes after submission
- 2-second delay before next question

✅ **Real-time Leaderboard**
- Updates after each submission
- Shows top 10 students
- Highlights current student
- Displays aptitude scores

✅ **Score Calculation**
- 5 points per correct answer
- Automatic score updates
- Stored in Supabase with timestamp

✅ **Progress Tracking**
- Question counter (X of 10)
- Visual progress bar
- Shows which question user is on

## Questions Included

**Q1-Q4: Word Scramble (5 pts each)**
1. DATABASE (ETDARAABAS)
2. ALGORITHM (RGOTIHALM)
3. INTERNET (RETINNET)
4. COMPUTER (RTEPUCOM)

**Q5-Q6: Number Pattern (5 pts each)**
5. Sequence: 4, 6, 9, 13, 18, **24**
6. Multiply & subtract: 3, 5, 9, 17, 33, **65**

**Q7-Q10: Visual Logic Puzzles (5 pts each)**
7. Music instruments equation = **66**
8. Number grid pattern = **45**
9. Complex sequence: 1, 6, 15, **28**, 45, 66, 91
10. Star pattern with numbers = **16**

**Total Points Available: 50**

## Testing Checklist

- [ ] Questions load from database
- [ ] Timer counts down correctly
- [ ] Auto-submit works at 0 seconds
- [ ] Scores update after submission
- [ ] Leaderboard shows in real-time
- [ ] Progress bar fills as questions complete
- [ ] Last question shows "Complete" message
- [ ] All 10 questions display correctly
- [ ] Options are randomized/consistent
- [ ] Correct answers match database

## Troubleshooting

**Questions not showing:**
- Check Supabase database for APTITUDE round questions
- Verify `getRoundQuestions('APTITUDE')` returns data
- Check browser console for fetch errors

**Timer not working:**
- Verify `useEffect` dependencies
- Check browser performance/slow machine
- Console should show no errors

**Scores not updating:**
- Check `submitAnswer()` function completion
- Verify student ID is correctly retrieved
- Check Supabase submissions table

**Leaderboard not updating:**
- Verify Supabase realtime is enabled
- Check `subscribeToLeaderboard()` subscription
- Look for network errors in console

## Database Schema

Questions stored in `questions` table:
- `id` (primary key, uuid)
- `round_name` (APTITUDE)
- `type` (question type)
- `content` (question text)
- `options` (JSON object)
- `correct_answer` (single letter A-D)
- `points` (5)
- `time_limit` (60 seconds)
- `order_index` (0-9)
- `image_url` (optional)

Submissions stored in `submissions` table:
- `id` (primary key)
- `student_id` (foreign key)
- `question_id` (foreign key)
- `answer` (selected option)
- `score` (points earned)
- `time_taken` (seconds used)
- `status` (EVALUATED)
- `created_at` (timestamp)

## Next Steps

1. ✅ Seed 10 questions to database
2. ✅ Test with single student
3. ✅ Test with multiple students (concurrent)
4. ✅ Verify leaderboard updates
5. ✅ Check plagiarism detection (identical answers)
6. ✅ Monitor tab violation detection
7. Deploy to production

## Performance Notes

- Timer updates every 1 second (efficient)
- Submissions are sent individually (not batched)
- Leaderboard updates via Supabase realtime (efficient)
- Questions are cached after initial fetch
- Images should be optimized (<100KB each)

---

**Created:** 2024
**Last Updated:** March 2026
**Status:** Ready for Production ✅
