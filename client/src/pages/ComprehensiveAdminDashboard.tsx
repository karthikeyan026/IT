import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
    Users, Trophy, Activity, RefreshCw, LogOut, Play, Square, 
    AlertTriangle, Eye, Award, Crown, Medal, BarChart3
} from 'lucide-react';

interface Student {
    id: string;
    reg_no: string;
    name: string;
    role: string;
    is_online: boolean;
    technical_score: number;
    aptitude_score: number;
    overall_score: number;
}

interface Violation {
    id: string;
    student_id: string;
    violation_type: string;
    timestamp: string;
    student_name?: string;
    student_reg_no?: string;
}

interface PlagiarismLog {
    id: string;
    student1_id: string;
    student2_id: string;
    similarity_score: number;
    created_at: string;
    student1_name?: string;
    student2_name?: string;
}

const ComprehensiveAdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [plagiarismLogs, setPlagiarismLogs] = useState<PlagiarismLog[]>([]);
    const [currentRound, setCurrentRound] = useState<string>('LOBBY');
    const [stats, setStats] = useState({
        totalStudents: 0,
        onlineStudents: 0,
        totalAdmins: 0,
        totalViolations: 0,
        plagiarismCases: 0
    });
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'VIOLATIONS' | 'PLAGIARISM' | 'TOP10' | 'WINNER'>('DASHBOARD');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('ComprehensiveAdminDashboard mounted');
        fetchAllData();
        
        // Safety timeout: ensure loading is set to false after 5 seconds max
        const safetyTimeout = setTimeout(() => {
            console.log('Safety timeout: forcing loading to false');
            setLoading(false);
        }, 5000);
        
        // Subscribe to real-time changes
        const studentsSubscription = supabase
            .channel('students-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'students' },
                () => { fetchStudents(); }
            )
            .subscribe();

        const violationsSubscription = supabase
            .channel('violations-changes')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'violations' },
                () => { fetchViolations(); }
            )
            .subscribe();

        const plagiarismSubscription = supabase
            .channel('plagiarism-changes')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'plagiarism_logs' },
                () => { fetchPlagiarism(); }
            )
            .subscribe();

        // Poll event status every 3 seconds
        const interval = setInterval(fetchEventStatus, 3000);

        return () => {
            clearTimeout(safetyTimeout);
            studentsSubscription.unsubscribe();
            violationsSubscription.unsubscribe();
            plagiarismSubscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const fetchAllData = async () => {
        console.log('fetchAllData called');
        try {
            // Fetch data independently so one failure doesn't break everything
            await fetchStudents().catch(err => console.error('Students fetch failed:', err));
            await fetchViolations().catch(err => console.error('Violations fetch failed:', err));
            await fetchPlagiarism().catch(err => console.error('Plagiarism fetch failed:', err));
            await fetchEventStatus().catch(err => console.error('Event status fetch failed:', err));
            console.log('All data fetched successfully');
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    };

    const fetchEventStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('event_status')
                .select('current_round')
                .eq('id', 1)
                .single();

            if (data && !error) {
                setCurrentRound(data.current_round);
            }
        } catch (error) {
            console.error('Error fetching event status:', error);
        }
    };

    const fetchStudents = async () => {
        console.log('fetchStudents called');
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('overall_score', { ascending: false });

            if (error) {
                console.error('Error in fetchStudents:', error);
                throw error;
            }

            if (data) {
                setStudents(data);
                const studentList = data.filter(s => s.role === 'STUDENT');
                const adminList = data.filter(s => s.role === 'ADMIN');
                const onlineList = data.filter(s => s.is_online);

                setStats(prev => ({
                    ...prev,
                    totalStudents: studentList.length,
                    onlineStudents: onlineList.length,
                    totalAdmins: adminList.length
                }));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchViolations = async () => {
        try {
            const { data: violationsData, error } = await supabase
                .from('violations')
                .select('*')
                .order('timestamp', { ascending: false });

            if (!error && violationsData) {
                // Fetch student details for each violation
                const violationsWithStudents = await Promise.all(
                    violationsData.map(async (v) => {
                        const { data: studentData } = await supabase
                            .from('students')
                            .select('reg_no, name')
                            .eq('id', v.student_id)
                            .single();

                        return {
                            ...v,
                            student_name: studentData?.name || 'Unknown',
                            student_reg_no: studentData?.reg_no || 'N/A'
                        };
                    })
                );

                setViolations(violationsWithStudents);
                setStats(prev => ({
                    ...prev,
                    totalViolations: violationsWithStudents.length
                }));
            }
        } catch (error) {
            console.error('Error fetching violations:', error);
        }
    };

    const fetchPlagiarism = async () => {
        try {
            const { data: plagiarismData, error } = await supabase
                .from('plagiarism_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && plagiarismData) {
                // Fetch student details for each plagiarism log
                const plagiarismWithStudents = await Promise.all(
                    plagiarismData.map(async (p) => {
                        const [student1, student2] = await Promise.all([
                            supabase.from('students').select('name').eq('id', p.student1_id).single(),
                            supabase.from('students').select('name').eq('id', p.student2_id).single()
                        ]);

                        return {
                            ...p,
                            student1_name: student1.data?.name || 'Unknown',
                            student2_name: student2.data?.name || 'Unknown'
                        };
                    })
                );

                setPlagiarismLogs(plagiarismWithStudents);
                setStats(prev => ({
                    ...prev,
                    plagiarismCases: plagiarismWithStudents.length
                }));
            }
        } catch (error) {
            console.error('Error fetching plagiarism logs:', error);
        }
    };

    const startRound = async (round: 'TECHNICAL' | 'APTITUDE') => {
        try {
            const { error } = await supabase
                .from('event_status')
                .update({ current_round: round, updated_at: new Date().toISOString() })
                .eq('id', 1);

            if (!error) {
                setCurrentRound(round);
                alert(`${round} round started successfully!`);
            } else {
                alert('Failed to start round');
            }
        } catch (error) {
            console.error('Error starting round:', error);
            alert('Error starting round');
        }
    };

    const stopRound = async () => {
        try {
            const { error } = await supabase
                .from('event_status')
                .update({ current_round: 'LOBBY', updated_at: new Date().toISOString() })
                .eq('id', 1);

            if (!error) {
                setCurrentRound('LOBBY');
                alert('Round stopped successfully!');
            } else {
                alert('Failed to stop round');
            }
        } catch (error) {
            console.error('Error stopping round:', error);
            alert('Error stopping round');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const getTop10 = () => {
        return students.filter(s => s.role === 'STUDENT').slice(0, 10);
    };

    const getWinner = () => {
        const studentList = students.filter(s => s.role === 'STUDENT');
        return studentList.length > 0 ? studentList[0] : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-cyan-400 text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400">IT Tech Arena AI - Competition Platform</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchAllData}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('DASHBOARD')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'DASHBOARD' 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('VIOLATIONS')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'VIOLATIONS' 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Violations ({stats.totalViolations})
                    </button>
                    <button
                        onClick={() => setActiveTab('PLAGIARISM')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'PLAGIARISM' 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <Eye className="w-5 h-5" />
                        Plagiarism ({stats.plagiarismCases})
                    </button>
                    <button
                        onClick={() => setActiveTab('TOP10')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'TOP10' 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <Award className="w-5 h-5" />
                        Top 10
                    </button>
                    <button
                        onClick={() => setActiveTab('WINNER')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                            activeTab === 'WINNER' 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <Crown className="w-5 h-5" />
                        Winner
                    </button>
                </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'DASHBOARD' && (
                <>
                    {/* Stats Cards */}
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-lg">
                                    <Users className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Students</p>
                                    <p className="text-3xl font-bold text-cyan-400">{stats.totalStudents}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <Activity className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Online</p>
                                    <p className="text-3xl font-bold text-green-400">{stats.onlineStudents}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <Trophy className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Admins</p>
                                    <p className="text-3xl font-bold text-purple-400">{stats.totalAdmins}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Violations</p>
                                    <p className="text-3xl font-bold text-red-400">{stats.totalViolations}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/10 rounded-lg">
                                    <Eye className="w-8 h-8 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Plagiarism</p>
                                    <p className="text-3xl font-bold text-orange-400">{stats.plagiarismCases}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Round Control */}
                    <div className="max-w-7xl mx-auto mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Round Control</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-gray-400">Current Round:</span>
                                <span className={`px-4 py-2 rounded-lg font-bold text-lg ${
                                    currentRound === 'LOBBY' ? 'bg-gray-700 text-gray-300' :
                                    currentRound === 'APTITUDE' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-green-500/20 text-green-400'
                                }`}>
                                    {currentRound}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Aptitude Round Controls */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-3">Aptitude Round</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => startRound('APTITUDE')}
                                            disabled={currentRound === 'APTITUDE'}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition"
                                        >
                                            <Play className="w-5 h-5" />
                                            Start Aptitude
                                        </button>
                                        <button
                                            onClick={stopRound}
                                            disabled={currentRound !== 'APTITUDE'}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition"
                                        >
                                            <Square className="w-5 h-5" />
                                            Stop Aptitude
                                        </button>
                                    </div>
                                </div>

                                {/* Technical Round Controls */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-400 mb-3">Technical Round</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => startRound('TECHNICAL')}
                                            disabled={currentRound === 'TECHNICAL'}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition"
                                        >
                                            <Play className="w-5 h-5" />
                                            Start Technical
                                        </button>
                                        <button
                                            onClick={stopRound}
                                            disabled={currentRound !== 'TECHNICAL'}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition"
                                        >
                                            <Square className="w-5 h-5" />
                                            Stop Technical
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Live Leaderboard */}
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Live Leaderboard</h2>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Rank</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Reg No</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
                                            <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                                            <th className="text-right py-3 px-4 text-gray-400 font-semibold">Technical</th>
                                            <th className="text-right py-3 px-4 text-gray-400 font-semibold">Aptitude</th>
                                            <th className="text-right py-3 px-4 text-gray-400 font-semibold">Overall</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr
                                                key={student.id}
                                                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                                            >
                                                <td className="py-3 px-4">
                                                    <span className={`font-bold ${
                                                        index === 0 ? 'text-yellow-400 text-lg' :
                                                        index === 1 ? 'text-gray-300 text-lg' :
                                                        index === 2 ? 'text-orange-400 text-lg' :
                                                        'text-gray-500'
                                                    }`}>
                                                        {index === 0 && '🥇'}
                                                        {index === 1 && '🥈'}
                                                        {index === 2 && '🥉'}
                                                        {index > 2 && `#${index + 1}`}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-cyan-400 font-mono">{student.reg_no}</td>
                                                <td className="py-3 px-4 font-semibold">{student.name}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        student.role === 'ADMIN' 
                                                            ? 'bg-purple-500/20 text-purple-400' 
                                                            : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {student.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-block w-3 h-3 rounded-full ${
                                                        student.is_online ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                                                    }`}></span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono text-green-400">
                                                    {student.technical_score.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono text-blue-400">
                                                    {student.aptitude_score.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-yellow-400">
                                                    {student.overall_score.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}

            {/* Violations Tab */}
            {activeTab === 'VIOLATIONS' && (
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-8 h-8" />
                            Violation Detection
                        </h2>
                        
                        {violations.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">No violations detected yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">#</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Reg No</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Student Name</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Violation Type</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {violations.map((violation, index) => (
                                            <tr
                                                key={violation.id}
                                                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                                            >
                                                <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                                <td className="py-3 px-4 text-cyan-400 font-mono">{violation.student_reg_no}</td>
                                                <td className="py-3 px-4 font-semibold">{violation.student_name}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                                                        {violation.violation_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                                                    {new Date(violation.timestamp).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Plagiarism Tab */}
            {activeTab === 'PLAGIARISM' && (
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-3">
                            <Eye className="w-8 h-8" />
                            Plagiarism Detection
                        </h2>
                        
                        {plagiarismLogs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">No plagiarism cases detected yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">#</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Student 1</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Student 2</th>
                                            <th className="text-center py-3 px-4 text-gray-400 font-semibold">Similarity %</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Detected At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plagiarismLogs.map((log, index) => (
                                            <tr
                                                key={log.id}
                                                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                                            >
                                                <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                                <td className="py-3 px-4 font-semibold">{log.student1_name}</td>
                                                <td className="py-3 px-4 font-semibold">{log.student2_name}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                        log.similarity_score >= 80 ? 'bg-red-500/20 text-red-400' :
                                                        log.similarity_score >= 60 ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {log.similarity_score.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Top 10 Tab */}
            {activeTab === 'TOP10' && (
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                            <Award className="w-8 h-8" />
                            Top 10 Students
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getTop10().map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative p-6 rounded-xl border-2 ${
                                        index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500' :
                                        'bg-gray-800 border-gray-700'
                                    }`}
                                >
                                    {/* Rank Badge */}
                                    <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl ${
                                        index === 0 ? 'bg-yellow-500 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                        index === 2 ? 'bg-orange-500 text-white' :
                                        'bg-gray-700 text-gray-300 text-lg'
                                    }`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400 mb-1">{student.reg_no}</p>
                                        <h3 className="text-xl font-bold mb-3">{student.name}</h3>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Technical:</span>
                                                <span className="font-mono font-semibold text-green-400">
                                                    {student.technical_score.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Aptitude:</span>
                                                <span className="font-mono font-semibold text-blue-400">
                                                    {student.aptitude_score.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-700 pt-2">
                                                <span className="font-bold text-gray-300">Overall:</span>
                                                <span className="font-mono font-bold text-xl text-yellow-400">
                                                    {student.overall_score.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Winner Tab */}
            {activeTab === 'WINNER' && (
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500 rounded-2xl p-12 text-center"
                    >
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
                        </motion.div>

                        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            🏆 WINNER 🏆
                        </h2>

                        {getWinner() ? (
                            <>
                                <div className="my-8">
                                    <p className="text-gray-400 text-sm mb-2">{getWinner()!.reg_no}</p>
                                    <h3 className="text-4xl font-bold text-white mb-6">{getWinner()!.name}</h3>
                                    
                                    <div className="bg-gray-900/50 rounded-xl p-8 max-w-md mx-auto">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-lg">Technical Score:</span>
                                                <span className="text-2xl font-mono font-bold text-green-400">
                                                    {getWinner()!.technical_score.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-lg">Aptitude Score:</span>
                                                <span className="text-2xl font-mono font-bold text-blue-400">
                                                    {getWinner()!.aptitude_score.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="border-t-2 border-yellow-500/30 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-yellow-400 text-xl font-bold">Overall Score:</span>
                                                    <span className="text-4xl font-mono font-bold text-yellow-400">
                                                        {getWinner()!.overall_score.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <p className="text-2xl text-yellow-400 font-semibold">
                                        🎉 Congratulations! 🎉
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-500 text-xl">
                                No winner yet. Competition in progress...
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ComprehensiveAdminDashboard;
