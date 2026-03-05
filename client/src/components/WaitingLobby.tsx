import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Trophy } from 'lucide-react';
import { socket } from '../services/socket';

interface WaitingLobbyProps {
    student: any;
    onRoundStart: (round: string) => void;
}

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({ student, onRoundStart }) => {
    const [onlineCount, setOnlineCount] = useState(0);
    const [message, setMessage] = useState('Waiting for Admin to Start the Test');

    useEffect(() => {
        // Listen for round start
        socket.on('round_started', (data) => {
            setMessage(`${data.round} Round Starting...`);
            setTimeout(() => {
                onRoundStart(data.round);
            }, 2000);
        });

        // Listen for student count updates
        socket.on('student_online', () => {
            setOnlineCount(prev => prev + 1);
        });

        return () => {
            socket.off('round_started');
            socket.off('student_online');
        };
    }, [onRoundStart]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                {/* Animated Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-cyan-500 rounded-2xl mb-4 shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                    >
                        <span className="text-5xl font-bold text-white">IT</span>
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Tech Arena AI
                    </h1>
                </div>

                {/* Main Waiting Card */}
                <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
                    {/* Student Info */}
                    <div className="mb-8 flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div>
                            <p className="text-sm text-gray-400">Logged in as</p>
                            <p className="text-xl font-bold text-white">{student.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Register Number</p>
                            <p className="text-lg font-mono font-bold text-cyan-400">{student.regNo}</p>
                        </div>
                    </div>

                    {/* Waiting Message */}
                    <div className="text-center py-12">
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mb-6"
                        >
                            <Clock className="w-16 h-16 text-cyan-400 mx-auto" />
                        </motion.div>
                        
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {message}
                        </h2>
                        
                        <p className="text-gray-400 mb-8">
                            Please stay on this page. The test will begin automatically when the admin starts it.
                        </p>

                        {/* Loading Animation */}
                        <div className="flex justify-center gap-2 mb-8">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                    className="w-3 h-3 bg-cyan-500 rounded-full"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-800">
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                            <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{onlineCount}</p>
                            <p className="text-sm text-gray-400">Students Online</p>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">2</p>
                            <p className="text-sm text-gray-400">Total Rounds</p>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                >
                    <h3 className="text-lg font-bold text-blue-400 mb-3">Competition Guidelines</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Round 1: Technical Round with programming challenges</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Top 5 students will advance to Round 2: Aptitude Round</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">⚠</span>
                            <span><strong>Warning:</strong> Tab switching is monitored. 3 violations = Auto-submit</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">⚠</span>
                            <span>Copy/paste and right-click are disabled during the test</span>
                        </li>
                    </ul>
                </motion.div>
            </motion.div>
        </div>
    );
};
