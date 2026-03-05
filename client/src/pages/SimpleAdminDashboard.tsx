import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Users, Trophy, Activity, RefreshCw, LogOut } from 'lucide-react';

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

const SimpleAdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        onlineStudents: 0,
        totalAdmins: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
        
        // Subscribe to real-time changes
        const subscription = supabase
            .channel('students-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'students' },
                () => {
                    fetchStudents();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
