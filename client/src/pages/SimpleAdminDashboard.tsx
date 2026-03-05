import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
    Users, Trophy, Activity, RefreshCw, LogOut, Play, Square, 
    AlertTriangle, Eye, Award, Crown, Medal
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
}

const SimpleAdminDashboard: React.FC = () => {
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
        fetchAllData();
        
        // Subscribe to real-time changes
        const studentsSubscription = supabase
            .channel('students-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'students' },
                () => {
                    fetchStudents();
                }
            )
            .subscribe();

        const violationsSubscription = supabase
            .channel('violations-changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'violations' },
                () => {
                    fetchViolations();
                }
            )
            .subscribe();

        const plagiarismSubscription = supabase
            .channel('plagiarism-changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'plagiarism_logs' },
                () => {
                    fetchPlagiarism();
                }
            )
            .subscribe();

        // Fetch event status
        fetchEventStatus();
        const interval = setInterval(fetchEventStatus, 3000);

        return () => {
            studentsSubscription.unsubscribe();
            violationsSubscription.unsubscribe();
            plagiarismSubscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchStudents(),
            fetchViolations(),
            fetchPlagiarism(),
            fetchEventStatus()
        ]);
        setLoading(false);
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
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('overall_score', { ascending: false });

            if (error) throw error;

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
            const { data, error } = await supabase
                .from('violations')
                .select(`
                    *,
                    students:student_id (reg_no, name)
                `)
                .order('timestamp', { ascending: false })
                .limit(50);

            if (!error && data) {
                const formattedViolations = data.map((v: any) => ({
                    ...v,
                    student_name: v.students?.name || 'Unknown',
                    student_reg_no: v.students?.reg_no || 'N/A'
                }));
                setViolations(formattedViolations);
                setStats(prev => ({
                    ...prev,
                    totalViolations: data.length
                }));
            }
        } catch (error) {
            console.error('Error fetching violations:', error);
        }
    };

    const fetchPlagiarism = async () => {
        try {
            const { data, error } = await supabase
                .from('plagiarism_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setPlagiarismLogs(data);
                setStats(prev => ({
                    ...prev,
                    plagiarismCases: data.length
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
                alert(`${round} round started!`);
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
                alert('Round stopped!');
            } else {
                alert('Failed to stop round');
            }
        } catch (error) {
            console.error('Error stopping round:', error);
            alert('Error stopping round');
        }
    };

            if (error) throw error;

            if (data) {
                setStudents(data);
                const studentList = data.filter(s => s.role === 'STUDENT');
                const adminList = data.filter(s => s.role === 'ADMIN');
                const onlineList = data.filter(s => s.is_online);

                setStats({
                    totalStudents: studentList.length,
                    onlineStudents: onlineList.length,
                    totalAdmins: adminList.length
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
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
                            onClick={fetchStudents}
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

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                            <p className="text-gray-400 text-sm">Total Students</p>
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
                            <p className="text-gray-400 text-sm">Online Now</p>
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
            </div>

            {/* Leaderboard */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                >
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">All Students Leaderboard</h2>
                    
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
                                                index === 0 ? 'text-yellow-400' :
                                                index === 1 ? 'text-gray-300' :
                                                index === 2 ? 'text-orange-400' :
                                                'text-gray-500'
                                            }`}>
                                                #{index + 1}
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
                                            <span className={`inline-block w-2 h-2 rounded-full ${
                                                student.is_online ? 'bg-green-400' : 'bg-gray-600'
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
        </div>
    );
};

export default SimpleAdminDashboard;
