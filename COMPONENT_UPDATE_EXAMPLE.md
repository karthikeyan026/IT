# Example: Updating AptitudeRound.tsx Component

This shows how to update a component from using the old API to using Supabase services.

## Before (Old API)

```typescript
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { socket } from '../services/socket';
import { submissionsAPI } from '../services/api';

interface AptitudeRoundProps {
    student: any;
    questions: any[];
    currentQuestionIndex: number;
    onQuestionSubmit: (answer: string, timeTaken: number) => Promise<void>;
}

export const AptitudeRound: React.FC<AptitudeRoundProps> = ({
    student,
    questions,
    currentQuestionIndex,
    onQuestionSubmit
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // ... rest of component
    
    const submitAnswer = async () => {
        if (!selectedOption || !currentQuestion) return;

        setIsSubmitting(true);
        const timeTaken = 60 - timeLeft;

        try {
            // OLD: Using axios API
            const response = await submissionsAPI.submit(
                student.id,
                currentQuestion.id,
                selectedOption,
                timeTaken
            );
            
            setSubmitted(true);
            setFeedback('Answer submitted successfully!');
            
            // Emit socket event to update leaderboard
            socket.emit('submission_complete', { studentId: student.id });

            setTimeout(() => {
                setFeedback(null);
            }, 2000);
        } catch (error) {
            setFeedback('Error submitting answer. Please try again.');
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... rest of component
};
```

## After (Supabase)

```typescript
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { submitAnswer, checkPlagiarism } from '../services/supabaseQuestions';
import { checkPlagiarism as checkPlagiarismScore } from '../services/supabasePlagiarism';

interface AptitudeRoundProps {
    student: any;
    questions: any[];
    currentQuestionIndex: number;
    onQuestionSubmit: (answer: string, timeTaken: number) => Promise<void>;
}

export const AptitudeRound: React.FC<AptitudeRoundProps> = ({
    student,
    questions,
    currentQuestionIndex,
    onQuestionSubmit
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // ... rest of component (unchanged)
    
    const submitAnswer = async () => {
        if (!selectedOption || !currentQuestion) return;

        setIsSubmitting(true);
        const timeTaken = 60 - timeLeft;

        try {
            // NEW: Using Supabase
            const result = await submitAnswer(
                student.id,
                currentQuestion.id,
                selectedOption,
                timeTaken
            );
            
            if (result.success) {
                // Check for plagiarism
                const plagiarismCheck = await checkPlagiarismScore(
                    student.id,
                    currentQuestion.id,
                    selectedOption
                );
                
                if (plagiarismCheck.suspicious) {
                    setFeedback('Answer flagged for potential plagiarism');
                } else {
                    setFeedback('Answer submitted successfully!');
                }

                setSubmitted(true);

                // No need for manual socket emit - 
                // Supabase realtime will automatically update leaderboard
                
                setTimeout(() => {
                    setFeedback(null);
                }, 2000);
            } else {
                setFeedback(result.error || 'Error submitting answer');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            setFeedback('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... rest of component (unchanged)
};
```

## Key Changes

### Imports
```typescript
// REMOVE
import { socket } from '../services/socket';
import { submissionsAPI } from '../services/api';

// ADD
import { submitAnswer, checkPlagiarism } from '../services/supabaseQuestions';
import { checkPlagiarism as checkPlagiarismScore } from '../services/supabasePlagiarism';
```

### Submission Logic
```typescript
// BEFORE
const response = await submissionsAPI.submit(...);
socket.emit('submission_complete', { studentId: student.id });

// AFTER
const result = await submitAnswer(...);
if (result.success) {
    // No manual real-time emit needed
    // Supabase automatically broadcasts updates
}
```

### Error Handling
```typescript
// BEFORE
catch (error) {
    setFeedback(error.response?.data?.error || 'Error');
}

// AFTER
catch (error: any) {
    console.error('Error:', error);
    setFeedback(error.message || 'An error occurred');
}
```

### Plagiarism Detection (New Feature)
```typescript
// Check if answer matches others'
const plagiarismCheck = await checkPlagiarismScore(
    student.id,
    currentQuestion.id,
    selectedOption
);

if (plagiarismCheck.suspicious) {
    setFeedback('Answer flagged for potential plagiarism');
}
```

## Benefits of Migration

1. ✅ **No manual socket.emit()** - Supabase Realtime handles updates automatically
2. ✅ **Simpler error handling** - Direct function returns instead of axios responses
3. ✅ **Built-in plagiarism detection** - Automatically checks similarity
4. ✅ **Cleaner code** - No middleware or interceptors needed
5. ✅ **Automatic score updates** - Database updates trigger realtime subscriptions
6. ✅ **Better TypeScript support** - Direct function returns with types

## Testing the Updated Component

```typescript
// Test login and aptitude round
const student = {
    id: '123',
    name: 'John Doe',
    regNo: 'IT-2026-001'
};

const questions = [
    {
        id: '1',
        content: 'What is 2+2?',
        options: ['3', '4', '5'],
        correct_answer: '4',
        points: 5,
        type: 'MCQ'
    }
];

// Component will now:
// 1. Accept answer
// 2. Calculate score automatically
// 3. Check for plagiarism
// 4. Update student record in Supabase
// 5. Real-time subscriptions update leaderboard
// 6. Admin dashboard sees update instantly
```

## Common Patterns in Other Components

After understanding this example, apply these changes to:

### RealTimeLeaderboard.tsx
```typescript
// BEFORE: socket.on('leaderboard_update', ...)
// AFTER: subscribeToLeaderboard(...)
```

### AdminDashboard.tsx
```typescript
// BEFORE: adminAPI.getLeaderboard()
// AFTER: getLeaderboard() + subscribeToLeaderboard()
```

### TabDetector.tsx
```typescript
// BEFORE: violationsAPI.log(studentId, 'TAB_SWITCH')
// AFTER: logViolation(studentId, 'TAB_SWITCH')
```

## Debugging Tips

If your updated component isn't working:

1. Check browser console for errors
   - `F12` → **Console** tab
   - Look for "Supabase" errors

2. Verify Supabase connection
   ```typescript
   import { supabase } from '../lib/supabaseClient';
   console.log(supabase); // Should show client object
   ```

3. Check database directly
   - Supabase Dashboard → **Table Editor** → **submissions**
   - Verify your submission appears

4. Check real-time subscription
   ```typescript
   // Test in browser console
   import { subscribeToLeaderboard } from './services/supabaseRealtime';
   const channel = subscribeToLeaderboard(data => console.log(data));
   ```

## Performance Considerations

1. **Debounce rapid updates:**
   ```typescript
   import { debounce } from 'lodash';
   const debouncedUpdate = debounce(refetch, 500);
   ```

2. **Cache frequently accessed data:**
   ```typescript
   const [cachedQuestions, setCachedQuestions] = useState(null);
   if (cachedQuestions) return cachedQuestions;
   ```

3. **Use Promise.all for parallel loads:**
   ```typescript
   const [questions, submissions] = await Promise.all([
     getRoundQuestions('APTITUDE'),
     getStudentSubmissions(student.id)
   ]);
   ```

## Next Steps

1. Update this component in your codebase
2. Test with a login and submission
3. Check Supabase dashboard to verify data
4. Move on to next component using this guide as reference
5. See [COMPONENT_MIGRATION_GUIDE.md](./COMPONENT_MIGRATION_GUIDE.md) for all components
