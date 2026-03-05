import { useEffect, useMemo, useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { WaitingLobby } from './components/WaitingLobby';
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';
import DragReorder from './components/DragReorder';
import { AptitudeRound } from './components/AptitudeRound';
import { RealTimeLeaderboard } from './components/RealTimeLeaderboard';
import { TabDetector } from './modules/TabDetector';
import { motion } from 'framer-motion';
import { Database, Trophy, User, Timer } from 'lucide-react';
import { socket, connectSocket } from './services/socket';
import { questionsAPI, submissionsAPI } from './services/api';

type RoundName = 'LOBBY' | 'APTITUDE' | 'TECHNICAL';
type ActiveTab = 'ROUND' | 'LEADERBOARD';

type CodeLine = {
    id: string;
    content: string;
};

function shuffleLines(lines: CodeLine[]): CodeLine[] {
    const copied = [...lines];
    for (let i = copied.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied;
}

function parseOptions(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
}

function App() {
    const pathname = window.location.pathname;
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [student, setStudent] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentRound, setCurrentRound] = useState<RoundName>('LOBBY');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(60);
    const [activeTab, setActiveTab] = useState<ActiveTab>('ROUND');
    const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
    const [dragLines, setDragLines] = useState<CodeLine[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        const savedStudent = localStorage.getItem('student');
        const savedToken = localStorage.getItem('token');
        const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';

        if (savedStudent && savedToken) {
            const studentData = JSON.parse(savedStudent);
            setStudent(studentData);
            setIsAuthenticated(true);
            setIsAdmin(savedIsAdmin);
            connectSocket(studentData.id, studentData.name);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !student) return;

        const onRoundStarted = (data: { round: RoundName }) => {
            setCurrentRound(data.round);
            loadQuestionsForRound(data.round);
            setActiveTab('ROUND');
        };

        if (socket) {
            socket.on('round_started', onRoundStarted);
            socket.on('round_stopped', () => {
                setSubmittedMessage('Round ended. Wait for admin instructions.');
                setCurrentRound('LOBBY');
            });
        }

        return () => {
            if (socket) {
                socket.off('round_started', onRoundStarted);
                socket.off('round_stopped');
            }
        };
    }, [isAuthenticated, student]);

    useEffect(() => {
        if (!currentQuestion || currentRound === 'LOBBY') return;

        const perQuestionTime = Number(currentQuestion.time_limit || 60);
        setTimeLeft(perQuestionTime);

        if (currentQuestion.type === 'DRAG_DROP') {
            const lines = parseOptions(currentQuestion.options) as CodeLine[];
            setDragLines(shuffleLines(lines));
        }

        if (socket) {
            socket.emit('student_activity', {
                studentId: student?.id,
                questionId: currentQuestion.id,
                action: 'VIEW_QUESTION'
            });
        }
    }, [currentQuestionIndex, currentRound, currentQuestion, student?.id]);

    useEffect(() => {
        if (!currentQuestion || currentRound === 'LOBBY' || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    void submitCurrentAnswer(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestion, currentRound, isSubmitting]);

    const loadQuestionsForRound = async (round: string) => {
        try {
            const response = await questionsAPI.getRound(round);
            setQuestions(response.data.questions || []);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setSubmittedMessage(null);
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    };

    const handleLoginSuccess = (studentData: any, _token: string, adminStatus: boolean = false) => {
        setStudent(studentData);
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);
        localStorage.setItem('isAdmin', adminStatus.toString());
        connectSocket(studentData.id, studentData.name);
    };

    const currentAnswer = useMemo(() => {
        if (!currentQuestion) return '';
        if (currentQuestion.type === 'DRAG_DROP') {
            return dragLines.map((line) => line.id).join(',');
        }
        return answers[currentQuestion.id] || '';
    }, [currentQuestion, answers, dragLines]);

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSubmittedMessage(null);
        } else {
            setSubmittedMessage('All questions submitted. Waiting for next round.');
            setCurrentRound('LOBBY');
        }
    };

    const submitCurrentAnswer = async (isAutoSubmit: boolean = false) => {
        if (!student || !currentQuestion || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const timeTaken = Number(currentQuestion.time_limit || 60) - timeLeft;
            const response = await submissionsAPI.submit(
                student.id,
                currentQuestion.id,
                currentAnswer,
                Math.max(0, timeTaken)
            );

            setSubmittedMessage(
                isAutoSubmit
                    ? `Time up. Auto-submitted. Score: ${response.data.score}`
                    : `Submitted. Score: ${response.data.score}`
            );

            setTimeout(goToNextQuestion, 500);
        } catch (error) {
            console.error('Submission failed:', error);
            setSubmittedMessage('Submission failed. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => `0:${seconds.toString().padStart(2, '0')}`;

    // Admin route handling
    if (isAdminRoute) {
        if (!isAuthenticated) {
            return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        }
        // Check if user is admin
        if (!isAdmin) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-gray-950 flex items-center justify-center">
                    <div className="text-center p-8 bg-gray-900 rounded-lg border border-red-500">
                        <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
                        <p className="text-gray-300 mb-6">You do not have admin privileges.</p>
                        <a href="/" className="inline-block px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                            Go to Student Dashboard
                        </a>
                    </div>
                </div>
            );
        }
        return <SimpleAdminDashboard />;
    }

    // Student route handling
    if (!isAuthenticated) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    if (isAdmin) return <SimpleAdminDashboard />;
    if (currentRound === 'LOBBY') return <WaitingLobby student={student} onRoundStart={(r) => setCurrentRound(r as RoundName)} />;

    // Show AptitudeRound component for aptitude round
    if (currentRound === 'APTITUDE') {
        return (
            <div className="min-h-screen bg-gray-950 text-white selection:bg-cyan-500/30">
                <TabDetector studentId={student.id} onViolationLimitReached={() => void submitCurrentAnswer(true)} />
                
                <AptitudeRound
                    student={student}
                />
            </div>
        );
    }

    const options = currentQuestion ? parseOptions(currentQuestion.options) : [];

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-cyan-500/30">
            <TabDetector studentId={student.id} onViolationLimitReached={() => void submitCurrentAnswer(true)} />

            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10 w-full px-6 py-4 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center font-bold text-xl">IT</div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Tech Arena AI</h1>
                </div>
                <div className="text-sm border border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2 bg-gray-800">
                    <Timer className="w-4 h-4 text-red-500" />
                    Time Left: <span className="font-mono text-cyan-400">{formatTime(timeLeft)}</span>
                </div>
                <button className="text-sm bg-gray-800 px-4 py-1.5 rounded border border-gray-700 font-bold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {student.regNo}
                </button>
            </header>

            <nav className="w-full bg-gray-900 border-b border-gray-800 sticky top-[73px] z-10 hidden md:block">
                <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 py-2">
                    <button onClick={() => setActiveTab('ROUND')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'ROUND' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                        <Database className="w-4 h-4" /> {currentRound} Round
                    </button>
                    <button onClick={() => setActiveTab('LEADERBOARD')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'LEADERBOARD' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                        <Trophy className="w-4 h-4" /> Leaderboard
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 md:px-6">
                {activeTab === 'LEADERBOARD' ? (
                    <RealTimeLeaderboard
                        showAptitude={currentRound === 'APTITUDE' as any}
                        showTechnical={currentRound === 'TECHNICAL' as any}
                    />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                        <div className="flex flex-col gap-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-sm font-bold text-cyan-500 uppercase tracking-wider mb-2">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </h2>
                                <h3 className="text-xl font-semibold mb-3">{currentQuestion?.type || 'Question'}</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{currentQuestion?.content}</p>
                            </div>

                            {currentQuestion?.type === 'DRAG_DROP' && (
                                <DragReorder initialLines={dragLines} onOrderChange={setDragLines} />
                            )}

                            {currentQuestion?.type === 'MCQ' && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
                                    {options.map((option: string) => (
                                        <label key={option} className="flex items-center gap-3 p-3 rounded border border-gray-800 hover:border-cyan-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion.id}`}
                                                checked={answers[currentQuestion.id] === option}
                                                onChange={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {currentQuestion && currentQuestion.type !== 'DRAG_DROP' && currentQuestion.type !== 'MCQ' && (
                                <textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                    rows={10}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 font-mono"
                                    placeholder="Type your answer here..."
                                />
                            )}
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit sticky top-[150px]">
                            <h3 className="text-lg font-bold mb-4">Actions</h3>
                            <button
                                onClick={() => void submitCurrentAnswer(false)}
                                disabled={isSubmitting}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded transition-all"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                            </button>

                            {submittedMessage && (
                                <div className="mt-4 p-3 rounded border border-cyan-700 bg-cyan-900/20 text-cyan-200 text-sm">
                                    {submittedMessage}
                                </div>
                            )}

                            <div className="mt-6 text-xs font-mono text-gray-400 space-y-2">
                                <div>Round: {currentRound}</div>
                                <div>Question Timer: 60 seconds</div>
                                <div>Auto-submit on timeout: ENABLED</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default App;