# Component Migration Guide: API → Supabase

This guide shows how to migrate existing React components from the old Express API to Supabase.

## File Structure Overview

### Old Services (Remove)
- `src/services/api.ts` - Old axios API client
- `src/services/socket.ts` - Old Socket.io client

### New Services (Use These)
- `src/lib/supabaseClient.ts` - Supabase client
- `src/services/supabaseAuth.ts` - Authentication
- `src/services/supabaseQuestions.ts` - Questions & submissions
- `src/services/supabaseViolations.ts` - Violation logging
- `src/services/supabasePlagiarism.ts` - Plagiarism detection
- `src/services/supabaseRealtime.ts` - Real-time subscriptions

## Component-by-Component Migration

### 1. LoginPage.tsx ✅ (Already Updated)

**What Changed:**
```typescript
// OLD
import { authAPI } from '../services/api';
const response = await authAPI.login(name, regNo);

// NEW
import { loginStudent, isAdmin as checkIsAdmin } from '../services/supabaseAuth';
const result = await loginStudent(name, regNo);
```

### 2. AptitudeRound.tsx (Needs Update)

**Current:** Uses `questionsAPI.getRound('APTITUDE')`  
**New:** Use `getRoundQuestions('APTITUDE')`

```typescript
// OLD
import { questionsAPI } from '../services/api';
const response = await questionsAPI.getRound('APTITUDE');
const questions = response.data;

// NEW
import { getRoundQuestions } from '../services/supabaseQuestions';
const questions = await getRoundQuestions('APTITUDE');
```

**For Answer Submission:**

```typescript
// OLD
const response = await submissionsAPI.submit(studentId, questionId, answer, timeTaken);

// NEW
import { submitAnswer, checkPlagiarism } from '../services/supabaseQuestions';
import { checkPlagiarism } from '../services/supabasePlagiarism';

const result = await submitAnswer(studentId, questionId, answer, timeTaken);
const plagiarism = await checkPlagiarism(studentId, questionId, answer);
```

### 3. RealTimeLeaderboard.tsx (Critical Update)

**Old Code:**
```typescript
import { socket, connectSocket } from '../services/socket';

useEffect(() => {
  connectSocket(studentId, name);
  socket.on('leaderboard_update', (data) => {
    setLeaderboard(data);
  });
  return () => socket.disconnect();
}, []);
```

**New Code:**
```typescript
import { subscribeToLeaderboard, unsubscribeFromChannel } from '../services/supabaseRealtime';
import { getLeaderboard } from '../services/supabaseQuestions';

useEffect(() => {
  // Load initial leaderboard
  (async () => {
    const data = await getLeaderboard();
    setLeaderboard(data);
  })();

  // Subscribe to real-time updates
  const channel = subscribeToLeaderboard(async () => {
    const updated = await getLeaderboard();
    setLeaderboard(updated);
  });

  return () => {
    unsubscribeFromChannel(channel);
  };
}, []);
```

### 4. AdminDashboard.tsx (Multiple Updates)

**For Leaderboard:**
```typescript
// OLD
const { data } = await adminAPI.getLeaderboard();

// NEW
import { getLeaderboard } from '../services/supabaseQuestions';
const data = await getLeaderboard();
```

**For Violations:**
```typescript
// OLD
const { data } = await violationsAPI.getSuspicious();

// NEW
import { getSuspiciousStudents } from '../services/supabaseViolations';
const data = await getSuspiciousStudents();
```

**For Plagiarism:**
```typescript
// OLD
const { data } = await adminAPI.getPlagiarismLogs();

// NEW
import { getPlagiarismLogs } from '../services/supabasePlagiarism';
const data = await getPlagiarismLogs();
```

**Real-time Admin Updates:**
```typescript
// NEW: Subscribe to multiple channels
import { 
  subscribeToLeaderboard,
  subscribeToViolations,
  subscribeToPlagiarismLogs,
  unsubscribeFromChannel 
} from '../services/supabaseRealtime';

const leaderboardChannel = subscribeToLeaderboard(async () => {
  const data = await getLeaderboard();
  setLeaderboard(data);
});

const violationsChannel = subscribeToViolations(async () => {
  const data = await getSuspiciousStudents();
  setViolations(data);
});

const plagiarismChannel = subscribeToPlagiarismLogs(async () => {
  const data = await getPlagiarismLogs();
  setPlagiarism(data);
});

// Cleanup
return () => {
  unsubscribeFromChannel(leaderboardChannel);
  unsubscribeFromChannel(violationsChannel);
  unsubscribeFromChannel(plagiarismChannel);
};
```

### 5. TabDetector.tsx (Violation Logging)

**For Tab Switch Detection:**
```typescript
// OLD
import { violationsAPI } from '../services/api';
const response = await violationsAPI.log(studentId, 'TAB_SWITCH');

// NEW
import { logViolation } from '../services/supabaseViolations';
await logViolation(studentId, 'TAB_SWITCH');
```

**For Window Blur Detection:**
```typescript
// NEW: Same function, different type
window.addEventListener('blur', async () => {
  await logViolation(studentId, 'BLUR');
});

window.addEventListener('focus', async () => {
  await logViolation(studentId, 'FOCUS');
});
```

## Migration CheckList

### Step 1: Stop Using Old Services
- [ ] Remove imports of `api` and `socket` from all components
- [ ] Replace with imports from `supabase*` services

### Step 2: Update Each Component
- [ ] LoginPage.tsx ✅
- [ ] AptitudeRound.tsx
- [ ] TechnicalRound.tsx
- [ ] RealTimeLeaderboard.tsx
- [ ] AdminDashboard.tsx
- [ ] MyStats.tsx
- [ ] TabDetector.tsx
- [ ] Other custom components

### Step 3: Update App.tsx (Main Router)

**Add initialization:**
```typescript
import { useEffect } from 'react';
import { subscribeToEventStatus } from './services/supabaseRealtime';
import { getCurrentUser, updateStudentOnlineStatus } from './services/supabaseAuth';

function App() {
  useEffect(() => {
    // Subscribe to round status changes
    const channel = subscribeToEventStatus((status) => {
      // Update UI based on current_round
    });

    // Set student online on mount
    const user = getCurrentUser();
    if (user) {
      updateStudentOnlineStatus(user.id, true);
    }

    return () => {
      // Cleanup subscriptions
    };
  }, []);

  // Rest of app...
}
```

### Step 4: Handle Cleanup

When a component unmounts:
```typescript
useEffect(() => {
  const channel = subscribeToLeaderboard(onUpdate);
  
  return () => {
    // ALWAYS unsubscribe to prevent memory leaks
    unsubscribeFromChannel(channel);
  };
}, []);
```

## Common Patterns

### Loading Data
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    const result = await getRoundQuestions('APTITUDE');
    setData(result);
    setLoading(false);
  };
  fetch();
}, []);
```

### Submitting Data with Feedback
```typescript
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async () => {
  setSubmitting(true);
  setError('');
  
  try {
    const result = await submitAnswer(studentId, questionId, answer, timeTaken);
    if (result.success) {
      // Show success
      alert('Answer submitted!');
    } else {
      setError(result.error || 'Submission failed');
    }
  } catch (err) {
    setError('An error occurred');
  } finally {
    setSubmitting(false);
  }
};
```

### Real-time Updates
```typescript
const [data, setData] = useState([]);

useEffect(() => {
  // Load initial data
  const loadInitial = async () => {
    const result = await getLeaderboard();
    setData(result);
  };
  loadInitial();

  // Subscribe to updates
  const channel = subscribeToLeaderboard(async () => {
    const updated = await getLeaderboard();
    setData(updated);
  });

  return () => unsubscribeFromChannel(channel);
}, []);
```

## Removing Old Services

After all components are migrated:

1. Delete `src/services/api.ts`
2. Delete `src/services/socket.ts` (replaced by `supabaseRealtime.ts`)
3. Verify no imports remain:
   ```bash
   grep -r "from.*api\|from.*socket" src/
   ```

## Performance Tips

1. **Cache frequently accessed data:**
   ```typescript
   const [cachedQuestions, setCachedQuestions] = useState(null);
   
   if (cachedQuestions) return cachedQuestions;
   const q = await getRoundQuestions('APTITUDE');
   setCachedQuestions(q);
   ```

2. **Debounce real-time updates:**
   ```typescript
   import { debounce } from 'lodash';
   
   const debouncedUpdate = debounce(async () => {
     const data = await getLeaderboard();
     setLeaderboard(data);
   }, 1000);
   
   subscribeToLeaderboard(debouncedUpdate);
   ```

3. **Batch queries when possible:**
   ```typescript
   // Instead of multiple queries
   const questions = await getRoundQuestions('APTITUDE');
   const submissions = await getStudentSubmissions(studentId);
   
   // Use Promise.all
   const [questions, submissions] = await Promise.all([
     getRoundQuestions('APTITUDE'),
     getStudentSubmissions(studentId)
   ]);
   ```

## Testing

Create a test file: `src/services/__tests__/supabase.test.ts`

```typescript
import { loginStudent, getRoundQuestions } from '../supabase*';

describe('Supabase Services', () => {
  it('should login a student', async () => {
    const result = await loginStudent('Test', 'TEST001');
    expect(result.success).toBe(true);
    expect(result.student).toHaveProperty('id');
  });

  it('should fetch questions', async () => {
    const questions = await getRoundQuestions('APTITUDE');
    expect(Array.isArray(questions)).toBe(true);
  });
});
```

Run tests:
```bash
npm test
```

## Troubleshooting

### "Supabase is not defined"
- Import at the top: `import { supabase } from '../lib/supabaseClient'`
- Check that file exists at that path

### Real-time updates not working
- Verify Realtime is enabled in Supabase settings (see SUPABASE_ENVIRONMENT_SETUP.md)
- Check browser console for connection errors

### CORS errors
- Usually means frontend and Supabase URLs are mismatched
- Verify VITE_SUPABASE_URL is correct in .env

### "row level security" errors
- Check Supabase RLS policies were created (from SQL migration)
- Allow public access for student login (see schema file)

## Need Help?

1. Check [Supabase Docs](https://supabase.com/docs)
2. Look at existing migrated components (LoginPage.tsx)
3. Review the service files for API reference
4. Check browser console for detailed error messages
