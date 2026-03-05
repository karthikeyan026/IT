import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import { adminAPI } from '../services/api';
import { motion } from 'framer-motion';
import { 
    Play, 
    Square, 
    Lock, 
    Users, 
    Activity, 
    AlertTriangle, 
    Trophy,
    Eye,
    RefreshCw
} from 'lucide-react';

interface DashboardStats {
    onlineStudents: number;
    totalSubmissions: number;
    suspiciousStudents: number;
    plagiarismCases: number;
    currentRound: string;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        onlineStudents: 0,
        totalSubmissions: 0,
        suspiciousStudents: 0,
        plagiarismCases: 0,
        currentRound: 'LOBBY'
    });
    const [activity, setActivity] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACTIVITY' | 'LEADERBOARD'>('OVERVIEW');
    const [isSyncingStudents, setIsSyncingStudents] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string>('');

    useEffect(() => {
        socket.connect();
        socket.emit('admin_join');

        fetchDashboardData();

        // Real-time updates
        socket.on('student_activity_update', fetchActivity);
        socket.on('new_submission', fetchDashboardData);
        socket.on('student_violation', fetchDashboardData);

        const interval = setInterval(fetchDashboardData, 5000);

        return () => {
            socket.off('student_activity_update');
            socket.off('new_submission');
            socket.off('student_violation');
            clearInterval(interval);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await adminAPI.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        }
    };

    const fetchActivity = async () => {
        try {
            const response = await adminAPI.getActivity();
            setActivity(response.data.activity || []);
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await adminAPI.getLeaderboard();
            setLeaderboard(response.data.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        }
    };

    const handleStartTechnical = async () => {
        try {
            await adminAPI.startTechnical();
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to start technical round:', error);
        }
    };

    const handleStopTechnical = async () => {
        try {
            await adminAPI.stopTechnical();
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to stop technical round:', error);
        }
    };

    const handleStartAptitude = async () => {
        try {
            await adminAPI.startAptitude();
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to start aptitude round:', error);
        }
    };

    const handleStopAptitude = async () => {
        try {
            await adminAPI.stopAptitude();
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to stop aptitude round:', error);
        }
    };

    const handleLock = async () => {
        try {
            await adminAPI.lock();
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to lock system:', error);
        }
    };

    const handleSyncStudents = async () => {
        try {
            setIsSyncingStudents(true);
            setSyncMessage('Syncing students from PDF...');
            const response = await adminAPI.syncStudentsFromPdf();
            setSyncMessage(
                `${response.data.message}. Imported ${response.data.importedCount} records.`
            );
            fetchDashboardData();
            fetchActivity();
        } catch (error: any) {
            console.error('Failed to sync students:', error);
            setSyncMessage(error.response?.data?.error || 'Failed to sync students');
        } finally {
            setIsSyncingStudents(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-400">IT Tech Arena AI - Live Monitoring & Control</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={<Users className="w-6 h-6" />}
                    title="Online Students"
                    value={stats.onlineStudents}
                    color="cyan"
                />
                <StatsCard
                    icon={<Activity className="w-6 h-6" />}
                    title="Total Submissions"
                    value={stats.totalSubmissions}
                    color="blue"
                />
                <StatsCard
                    icon={<AlertTriangle className="w-6 h-6" />}
                    title="Suspicious Students"
                    value={stats.suspiciousStudents}
                    color="yellow"
                />
                <StatsCard
                    icon={<Eye className="w-6 h-6" />}
                    title="Plagiarism Cases"
                    value={stats.plagiarismCases}
                    color="red"
                />
            </div>

            {/* Control Panel */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Play className="w-6 h-6 text-cyan-400" />
                    Round Control Panel
                </h2>
                
                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Current Status:</p>
                    <p className="text-2xl font-bold text-cyan-400">{stats.currentRound}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={handleStartTechnical}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Start Technical
                    </button>
                    <button
                        onClick={handleStopTechnical}
                        className="bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Square className="w-4 h-4" />
                        Stop Technical
                    </button>
                    <button
                        onClick={handleStartAptitude}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Start Aptitude
                    </button>
                    <button
                        onClick={handleStopAptitude}
                        className="bg-pink-600 hover:bg-pink-700 px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Square className="w-4 h-4" />
                        Stop Aptitude
                    </button>
                </div>

                <button
                    onClick={handleLock}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <Lock className="w-4 h-4" />
                    Lock All Submissions
                </button>

                <button
                    onClick={handleSyncStudents}
                    disabled={isSyncingStudents}
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncingStudents ? 'animate-spin' : ''}`} />
                    {isSyncingStudents ? 'Syncing Students...' : 'Sync Students From PDF'}
                </button>

                {syncMessage && (
                    <p className="mt-3 text-sm text-cyan-300 bg-cyan-900/30 border border-cyan-700 rounded-lg px-3 py-2">
                        {syncMessage}
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <TabButton
                    active={activeTab === 'OVERVIEW'}
                    onClick={() => { setActiveTab('OVERVIEW'); fetchDashboardData(); }}
                >
                    Overview
                </TabButton>
                <TabButton
                    active={activeTab === 'ACTIVITY'}
                    onClick={() => { setActiveTab('ACTIVITY'); fetchActivity(); }}
                >
                    Live Activity
                </TabButton>
                <TabButton
                    active={activeTab === 'LEADERBOARD'}
                    onClick={() => { setActiveTab('LEADERBOARD'); fetchLeaderboard(); }}
                >
                    Leaderboard
                </TabButton>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                {activeTab === 'OVERVIEW' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">System Overview</h3>
                        <p className="text-gray-400">Real-time statistics are displayed above. Use the control panel to manage rounds.</p>
                    </div>
                )}

                {activeTab === 'ACTIVITY' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Live Student Activity</h3>
                        {activity.length === 0 ? (
                            <p className="text-gray-400">No students currently active</p>
                        ) : (
                            <div className="space-y-2">
                                {activity.map((student: any) => (
                                    <div key={student.student_id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{student.name}</p>
                                            <p className="text-sm text-gray-400">{student.reg_no}</p>
                                            <p className="text-xs text-gray-500">
                                                {student.current_question || 'No active question'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-block w-3 h-3 rounded-full ${student.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
                                            <p className="text-xs text-gray-400 mt-1">
                                                {student.violation_count} violations
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'LEADERBOARD' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Current Rankings</h3>
                        {leaderboard.length === 0 ? (
                            <p className="text-gray-400">No rankings available yet</p>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((student: any, index: number) => (
                                    <div key={student.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-bold text-cyan-400">#{index + 1}</div>
                                            <div>
                                                <p className="font-bold">{student.name}</p>
                                                <p className="text-sm text-gray-400">{student.reg_no}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-cyan-400">{student.overall_score}</p>
                                            <p className="text-xs text-gray-400">
                                                T: {student.technical_score} | A: {student.aptitude_score}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatsCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({
    icon,
    title,
    value,
    color
}) => {
    const colorMap: any = {
        cyan: 'from-cyan-500 to-cyan-600',
        blue: 'from-blue-500 to-blue-600',
        yellow: 'from-yellow-500 to-yellow-600',
        red: 'from-red-500 to-red-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colorMap[color]} p-6 rounded-xl shadow-lg`}
        >
            <div className="flex items-center justify-between mb-2">
                {icon}
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-sm opacity-90">{title}</p>
        </motion.div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
    active,
    onClick,
    children
}) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${
            active
                ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);

export default AdminDashboard;
