/**
 * Aptitude Round Integration Examples
 * Use these code snippets to integrate into your existing App.tsx or router
 */

// ================================================================
// EXAMPLE 1: Simple Integration in App.tsx
// ================================================================

import React, { useState } from 'react';
import { AptitudeRound } from './components/AptitudeRound';
import { LoginPage } from './components/LoginPage';

function App() {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentRound, setCurrentRound] = useState('home'); // 'home', 'aptitude', 'technical'

  const handleLoginSuccess = (student: any) => {
    setCurrentStudent(student);
    setCurrentRound('menu'); // Go to round selection
  };

  return (
    <div>
      {!currentStudent ? (
        // Show login
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : currentRound === 'aptitude' ? (
        // Show aptitude round
        <AptitudeRound student={currentStudent} />
      ) : (
        // Show round selection menu
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Select a Round</h1>
            <button
              onClick={() => setCurrentRound('aptitude')}
              className="px-8 py-4 bg-cyan-500 text-white rounded-lg font-bold mb-4 hover:bg-cyan-600"
            >
              Start Aptitude Round (10 Questions)
            </button>
            <button
              onClick={() => setCurrentRound('technical')}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              Start Technical Round (5 Questions)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// ================================================================
// EXAMPLE 2: React Router Integration
// ================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/rounds" element={<RoundSelector />} />
        <Route path="/rounds/aptitude" element={<AptitudeRound />} />
        <Route path="/rounds/technical" element={<TechnicalRound />} />
      </Routes>
    </BrowserRouter>
  );
}

// ================================================================
// EXAMPLE 3: With Admin Dashboard (Seeding)
// ================================================================

import { AptitudeSetup } from './components/AptitudeSetup';

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Question Management */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Question Setup</h2>
            
            {/* Aptitude Round Setup */}
            <div className="mb-6">
              <AptitudeSetup />
            </div>

            {/* Technical Round Setup */}
            {/* <TechnicalSetup /> */}
          </div>

          {/* Right: Monitoring */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Activity</h2>
            {/* Add activity monitoring here */}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// EXAMPLE 4: Context API for Round Management
// ================================================================

import { createContext, useContext, useState } from 'react';

const RoundContext = createContext(null);

export function RoundProvider({ children }: { children: React.ReactNode }) {
  const [currentRound, setCurrentRound] = useState<'home' | 'aptitude' | 'technical'>('home');
  const [currentStudent, setCurrentStudent] = useState(null);

  return (
    <RoundContext.Provider value={{ currentRound, setCurrentRound, currentStudent, setCurrentStudent }}>
      {children}
    </RoundContext.Provider>
  );
}

export function useRound() {
  const context = useContext(RoundContext);
  if (!context) {
    throw new Error('useRound must be used within RoundProvider');
  }
  return context;
}

// Usage in component:
function MyComponent() {
  const { currentRound, setCurrentRound, currentStudent } = useRound();

  return (
    <button onClick={() => setCurrentRound('aptitude')}>
      Start Aptitude Round
    </button>
  );
}

// ================================================================
// EXAMPLE 5: Custom Hook for Aptitude Round Logic
// ================================================================

import { useEffect, useState } from 'react';
import { getRoundQuestions, submitAnswer } from './services/supabaseQuestions';

export function useAptitudeRound(studentId: string) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      const qs = await getRoundQuestions('APTITUDE');
      setQuestions(qs);
      setLoading(false);
    };
    loadQuestions();
  }, []);

  const submitCurrentQuestion = async (answer: string, timeTaken: number) => {
    const question = questions[currentIndex];
    const result = await submitAnswer(studentId, question.id, answer, timeTaken);

    if (result.success && result.submission?.score > 0) {
      setScore(score + result.submission.score);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }

    return result;
  };

  return {
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    score,
    loading,
    isComplete: currentIndex >= questions.length - 1,
    submitAnswer: submitCurrentQuestion
  };
}

// ================================================================
// EXAMPLE 6: Full Component with Navigation
// ================================================================

function RoundFlow() {
  const [stage, setStage] = useState<'login' | 'rounds' | 'aptitude' | 'results'>('login');
  const [student, setStudent] = useState(null);
  const [finalScore, setFinalScore] = useState(0);

  const handleAptitudeComplete = (score: number) => {
    setFinalScore(score);
    setStage('results');
  };

  return (
    <>
      {stage === 'login' && (
        <LoginPage
          onLoginSuccess={(s) => {
            setStudent(s);
            setStage('rounds');
          }}
        />
      )}

      {stage === 'rounds' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Welcome {student?.name}!</h1>
            <button
              onClick={() => setStage('aptitude')}
              className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600"
            >
              Start Aptitude Round
            </button>
          </div>
        </div>
      )}

      {stage === 'aptitude' && (
        <AptitudeRound
          student={student}
          onComplete={handleAptitudeComplete}
        />
      )}

      {stage === 'results' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Round Complete!</h1>
            <p className="text-2xl text-cyan-300 mb-8">Final Score: {finalScore}/50</p>
            <button
              onClick={() => setStage('rounds')}
              className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600"
            >
              Back to Rounds
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ================================================================
// EXAMPLE 7: Integration with Existing Navigation Service
// ================================================================

// If you use a navigation service:
import { navigate } from './services/navigation';

function StartAptitudeRound(student: any) {
  // Set student in context or Redux store
  // Then navigate to aptitude route
  navigate('/rounds/aptitude', { student });
}

// ================================================================
// USAGE: Just copy one of these examples into your App.tsx
// ================================================================

/*
RECOMMENDED: Use Example 1 or Example 2 depending on your routing setup

If you use React Router:
  → Use Example 2 (Routes with paths)

If you don't use React Router:
  → Use Example 1 (Simple state-based)

If you want advanced control:
  → Use Example 3 (Context API)
  → Use Example 5 (Custom hooks)
  → Use Example 6 (Full flow)

For Admin setup:
  → Use Example 3 (includes AptitudeSetup component)
*/
