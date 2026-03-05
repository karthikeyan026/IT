/**
 * Test & Demo Script for Aptitude Round
 * Use this in browser console or React component to test/demo functionality
 */

// ============================================
// SETUP & SEEDING
// ============================================

/**
 * Seed all 10 questions (run once)
 */
export const setupAptitudeRound = async () => {
  console.log('🚀 Setting up Aptitude Round...');
  
  const { seedAptitudeRound } = await import('../services/seedAptitudeQuestions');
  const result = await seedAptitudeRound();
  
  if (result.success) {
    console.log('✅ Aptitude Round setup complete!');
    console.log('📊 Next: Verify questions with verifySetup()');
  } else {
    console.error('❌ Setup failed:', result.error);
  }
  
  return result;
};

/**
 * Verify questions were added correctly
 */
export const verifySetup = async () => {
  console.log('🔍 Verifying Aptitude Round setup...');
  
  const { getRoundQuestions } = await import('../services/supabaseQuestions');
  const questions = await getRoundQuestions('APTITUDE');
  
  console.log(`✅ Found ${questions.length} questions`);
  
  if (questions.length !== 10) {
    console.warn(`⚠️ Expected 10 questions, found ${questions.length}`);
  }
  
  questions.forEach((q, i) => {
    console.log(`  ${i + 1}. [${q.type}] ${q.content.substring(0, 50)}...`);
  });
  
  return questions;
};

// ============================================
// TESTING
// ============================================

/**
 * Simulate a student taking the test
 * Useful for testing leaderboard updates
 */
export const simulateStudentTest = async (studentId: string, studentName: string) => {
  console.log(`🎓 Simulating test for ${studentName}...`);
  
  const { getRoundQuestions, submitAnswer } = await import('../services/supabaseQuestions');
  const questions = await getRoundQuestions('APTITUDE');
  
  if (questions.length === 0) {
    console.error('❌ No questions found. Run setupAptitudeRound() first.');
    return;
  }
  
  let correctAnswers = 0;
  let totalScore = 0;
  
  for (const question of questions) {
    // Simulate selecting the correct answer
    const answer = question.correct_answer;
    
    const result = await submitAnswer(
      studentId,
      question.id,
      answer,
      Math.random() * 50 + 10 // Random time between 10-60 seconds
    );
    
    if (result.success && result.submission?.score > 0) {
      correctAnswers++;
      totalScore += result.submission.score;
      console.log(`  ✅ Q${questions.indexOf(question) + 1}: Correct (+${result.submission.score} pts)`);
    } else {
      console.log(`  ❌ Q${questions.indexOf(question) + 1}: Incorrect`);
    }
  }
  
  console.log(`\n📊 Final Score: ${totalScore}/${questions.length * 5}`);
  console.log(`✅ Correct: ${correctAnswers}/${questions.length}`);
  
  return { correctAnswers, totalScore };
};

/**
 * Check current leaderboard
 */
export const checkLeaderboard = async () => {
  console.log('🏆 Fetching leaderboard...');
  
  const { getLeaderboard } = await import('../services/supabaseQuestions');
  const leaderboard = await getLeaderboard();
  
  console.log(`Found ${leaderboard.length} students:\n`);
  
  leaderboard.slice(0, 10).forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry.name || 'Unknown'} - ${entry.aptitude_score || 0} pts`);
  });
  
  return leaderboard;
};

// ============================================
// DEBUGGING
// ============================================

/**
 * Check database connection and question count
 */
export const diagnoseDatabase = async () => {
  console.log('🔧 Running diagnostics...\n');
  
  try {
    const { getRoundQuestions } = await import('../services/supabaseQuestions');
    const questions = await getRoundQuestions('APTITUDE');
    
    console.log('✅ Database connection: OK');
    console.log(`✅ Questions found: ${questions.length}/10`);
    
    if (questions.length === 0) {
      console.warn('⚠️ No questions found in database');
      console.log('💡 Run: setupAptitudeRound()');
      return false;
    }
    
    // Check question structure
    const firstQuestion = questions[0];
    console.log('✅ Question structure:');
    console.log(`   - ID: ${firstQuestion.id ? '✅' : '❌'}`);
    console.log(`   - Content: ${firstQuestion.content ? '✅' : '❌'}`);
    console.log(`   - Type: ${firstQuestion.type ? '✅' : '❌'}`);
    console.log(`   - Options: ${firstQuestion.options ? '✅' : '❌'}`);
    console.log(`   - Correct Answer: ${firstQuestion.correct_answer ? '✅' : '❌'}`);
    console.log(`   - Points: ${firstQuestion.points ? '✅' : '❌'}`);
    console.log(`   - Time Limit: ${firstQuestion.time_limit ? '✅' : '❌'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Diagnostic Error:', error);
    return false;
  }
};

/**
 * Show detailed question information
 */
export const showQuestionDetails = async (questionIndex: number = 0) => {
  const { getRoundQuestions } = await import('../services/supabaseQuestions');
  const questions = await getRoundQuestions('APTITUDE');
  
  if (questionIndex >= questions.length) {
    console.error(`❌ Question ${questionIndex} not found (max: ${questions.length})`);
    return;
  }
  
  const q = questions[questionIndex];
  console.log(`\n📝 Question ${questionIndex + 1}/${questions.length}\n`);
  console.log(`Type: ${q.type}`);
  console.log(`Content: ${q.content}`);
  console.log(`Points: ${q.points}`);
  console.log(`Time Limit: ${q.time_limit}s`);
  console.log(`\nOptions:`);
  
  const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  Object.entries(options).forEach(([key, value]) => {
    const isCorrect = key === q.correct_answer;
    console.log(`  ${key}. ${value} ${isCorrect ? '✅ CORRECT' : ''}`);
  });
};

// ============================================
// QUICK START HELPERS
// ============================================

/**
 * Complete setup in one command
 */
export const quickStart = async () => {
  console.log('🚀 Starting Quick Setup...\n');
  
  // Step 1: Setup
  await setupAptitudeRound();
  
  // Step 2: Verify
  await new Promise(r => setTimeout(r, 1000)); // Wait 1 second
  await verifySetup();
  
  // Step 3: Diagnose
  const isOK = await diagnoseDatabase();
  
  if (isOK) {
    console.log('\n✅ Everything is ready! Use AptitudeRound component now.');
    console.log('💡 Example: <AptitudeRound student={currentStudent} />');
  }
};

/**
 * Show all available commands
 */
export const help = () => {
  console.log(`
🎯 APTITUDE ROUND - TESTING COMMANDS

SETUP:
  setupAptitudeRound()    - Seed 10 questions to database
  verifySetup()           - Check that questions were added
  quickStart()            - Complete setup in one command

TESTING:
  simulateStudentTest(id, name)  - Student completes all questions
  checkLeaderboard()      - Show top 10 students

DEBUGGING:
  diagnoseDatabase()      - Check database status
  showQuestionDetails(n)  - Show specific question details
  help()                  - Show this message

EXAMPLES:
  // Setup and verify
  await quickStart();
  
  // Simulate a student
  await simulateStudentTest('student-123', 'John Doe');
  
  // Check leaderboard
  await checkLeaderboard();
  
  // Debug specific question
  await showQuestionDetails(0); // First question
  `);
};

console.log('📚 Aptitude Round test utilities loaded. Type help() for commands.');
