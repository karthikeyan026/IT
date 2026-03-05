import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ChevronRight, Trophy } from 'lucide-react';
import { getRoundQuestions, submitAnswer, getLeaderboard, Question } from '../services/supabaseQuestions';
import { getCurrentStudentId } from '../lib/supabaseClient';

interface AptitudeRoundProps {
    student?: any;
}

export const AptitudeRound: React.FC<AptitudeRoundProps> = ({ student }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [studentScore, setStudentScore] = useState(0);

    // Fetch questions on mount
    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true);
            try {
                const aptitudeQuestions = await getRoundQuestions('APTITUDE');
                setQuestions(aptitudeQuestions);
            } catch (error) {
                console.error('Error loading questions:', error);
                setFeedback('Error loading questions. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, []);

    // Fetch leaderboard on component mount and after submissions
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                setLeaderboard(data);
                const currentStudent = data.find(s => s.student_id === student?.id);
                if (currentStudent) {
                    setStudentScore(currentStudent.aptitude_score || 0);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        };

        fetchLeaderboard();
        // Refresh leaderboard every 3 seconds for real-time feel
        const interval = setInterval(fetchLeaderboard, 3000);

        return () => clearInterval(interval);
    }, [student?.id]);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = questions.length;

    // Timer effect
    useEffect(() => {
        if (!currentQuestion || submitted || loading) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Auto-submit when time expires
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestion, submitted, loading]);

    // Reset state when question changes
    useEffect(() => {
        if (currentQuestion && !loading) {
            setTimeLeft(60);
            setSelectedOption(null);
            setSubmitted(false);
            setFeedback(null);
        }
    }, [currentQuestion, currentQuestionIndex, loading]);

    const handleAutoSubmit = async () => {
        if (!selectedOption || !currentQuestion) return;
        await submitQuestionAnswer();
    };

    const submitQuestionAnswer = async () => {
        if (!selectedOption || !currentQuestion) return;

        setIsSubmitting(true);
        const timeTaken = 60 - timeLeft;
        const studentId = await getCurrentStudentId();

        try {
            const result = await submitAnswer(
                studentId || student?.id,
                currentQuestion.id,
                selectedOption,
                timeTaken
            );

            if (result.success) {
                setSubmitted(true);
                setFeedback('Answer submitted successfully! ✓');

                // Move to next question after 2 seconds
                setTimeout(() => {
                    if (isLastQuestion) {
                        setFeedback('Aptitude Round Complete! 🎉');
                    } else {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setFeedback(null);
                    }
                }, 2000);
            } else {
                setFeedback(result.error || 'Error submitting answer');
            }
        } catch (error: any) {
            setFeedback('Error submitting answer. Please try again.');
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <h1 className="text-3xl font-bold text-white">Loading Aptitude Questions...</h1>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center p-4">
                <div className="text-center bg-gray-900 rounded-2xl p-8 border border-gray-800 w-full max-w-2xl">
                    <h1 className="text-3xl font-bold text-white mb-4">No Questions Available</h1>
                    <p className="text-gray-400 mb-6">Please wait for the administrator to add questions.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    // Parse options from database format
    const optionsObj = typeof currentQuestion.options === 'string'
        ? JSON.parse(currentQuestion.options)
        : currentQuestion.options || {};

    const optionEntries = Object.entries(optionsObj).map(([key, value]) => ({
        key,
        value: value as string
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Two-column layout: Question on left, Leaderboard on right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Question Section - 2 columns */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Aptitude Round</h1>
                                    <p className="text-gray-400">Question {questionNumber} of {totalQuestions}</p>
                                </div>
                                <motion.div
                                    animate={{
                                        scale: timeLeft <= 10 ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                                        timeLeft <= 10
                                            ? 'bg-red-500 text-white'
                                            : 'bg-cyan-500 text-black'
                                    }`}
                                >
                                    <Clock className="w-5 h-5" />
                                    <span>{timeLeft}s</span>
                                </motion.div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                                />
                            </div>
                        </div>

                        {/* Main Question Card */}
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 mb-6"
                        >
                            {/* Question Type Badge */}
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-cyan-500 bg-opacity-20 border border-cyan-500 text-cyan-300 rounded-full text-xs font-semibold">
                                    {currentQuestion.type}
                                </span>
                            </div>

                            {/* Question Content */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4"
                                    dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
                                />
                                {currentQuestion.image_url && (
                                    <div className="mt-4 mb-6">
                                        <img
                                            src={currentQuestion.image_url}
                                            alt="Question illustration"
                                            className="max-w-full h-auto rounded-lg border border-gray-700"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {optionEntries.map(({ key, value }) => (
                                    <motion.button
                                        key={key}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => !submitted && setSelectedOption(key)}
                                        disabled={submitted || isSubmitting}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left font-semibold flex items-center gap-3 ${
                                            selectedOption === key
                                                ? 'border-cyan-500 bg-cyan-500 bg-opacity-20 text-cyan-300'
                                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                        } ${submitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                selectedOption === key
                                                    ? 'border-cyan-500 bg-cyan-500'
                                                    : 'border-gray-600'
                                            }`}
                                        >
                                            {selectedOption === key && (
                                                <div className="w-3 h-3 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold text-cyan-400 mr-2">{key}.</span>
                                            <span>{value}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Feedback Message */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${
                                            feedback.includes('success') || feedback.includes('submitted')
                                                ? 'bg-green-500 bg-opacity-20 border border-green-500 text-green-300'
                                                : 'bg-red-500 bg-opacity-20 border border-red-500 text-red-300'
                                        }`}
                                    >
                                        {feedback.includes('success') || feedback.includes('submitted') ? (
                                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        )}
                                        <span>{feedback}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            {!submitted && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={submitQuestionAnswer}
                                    disabled={!selectedOption || isSubmitting}
                                    className="w-full mt-8 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
                                >
                                    <span>Submit Answer</span>
                                    <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            )}

                            {submitted && !isLastQuestion && (
                                <div className="mt-8 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-300 text-center font-semibold">
                                    ✓ Moving to next question...
                                </div>
                            )}

                            {submitted && isLastQuestion && (
                                <div className="mt-8 p-4 bg-cyan-500 bg-opacity-10 border border-cyan-500 rounded-lg text-cyan-300 text-center font-semibold">
                                    ✓ Aptitude Round Complete! 🎉
                                </div>
                            )}
                        </motion.div>

                        {/* Student Info */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                            <p className="text-gray-400 text-sm">
                                <strong>Student:</strong> {student?.name || 'Student'} | 
                                <strong className="ml-4">Score:</strong> <span className="text-cyan-400 font-bold ml-2">{studentScore} pts</span> |
                                <strong className="ml-4">Points/Question:</strong> <span className="text-cyan-400 font-bold ml-2">{currentQuestion.points}</span>
                            </p>
                        </div>
                    </div>

                    {/* Leaderboard Section - 1 column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-white" />
                                    <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                                </div>

                                {/* Rankings */}
                                <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
                                    {leaderboard.length === 0 ? (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            No scores yet
                                        </div>
                                    ) : (
                                        leaderboard.slice(0, 10).map((entry, idx) => (
                                            <div
                                                key={entry.student_id}
                                                className={`px-6 py-3 flex items-center justify-between ${
                                                    entry.student_id === student?.id
                                                        ? 'bg-cyan-500 bg-opacity-10 border-l-2 border-l-cyan-500'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        idx === 0 ? 'bg-yellow-500 text-black' :
                                                        idx === 1 ? 'bg-gray-400 text-black' :
                                                        idx === 2 ? 'bg-orange-500 text-white' :
                                                        'bg-gray-700 text-gray-300'
                                                    }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${
                                                            entry.student_id === student?.id ? 'text-cyan-300' : 'text-white'
                                                        }`}>
                                                            {entry.name || 'Student'}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {entry.register_number || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${
                                                        entry.student_id === student?.id ? 'text-cyan-400' : 'text-cyan-300'
                                                    }`}>
                                                        {entry.aptitude_score || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-400">pts</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
