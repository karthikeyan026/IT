import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Activity } from 'lucide-react';

export const Leaderboard: React.FC = () => {
    const [rankings, setRankings] = useState<any[]>([]);

    useEffect(() => {
        // Initial fetch
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/admin/leaderboard', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                if (data.leaderboard) {
                    const formatted = data.leaderboard.map((row: any, i: number) => ({
                        rank: i + 1,
                        name: row.name,
                        regno: row.reg_no,
                        aptitude: row.aptitude_score,
                        technical: row.technical_score,
                        total: row.overall_score
                    }));
                    setRankings(formatted);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };

        fetchLeaderboard();

        // Socket listener
        import('../services/socket').then(({ socket }) => {
            socket.on('leaderboard_update', (data: any[]) => {
                setRankings(data);
            });
        });

        return () => {
            import('../services/socket').then(({ socket }) => {
                socket.off('leaderboard_update');
            });
        };
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden relative">
                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.8)]"></div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <Trophy className="text-yellow-500 w-8 h-8" />
                            Live Rankings
                        </h2>

                        <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                            <div className="px-6 py-2 rounded-md font-bold text-sm bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-500/20">
                                Live Rankings
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400">
                                    <th className="p-4 w-16 text-center">Rank</th>
                                    <th className="p-4">Candidate</th>
                                    <th className="p-4 text-center">Aptitude Score</th>
                                    <th className="p-4 text-center">Technical Score</th>
                                    <th className="p-4 text-center border-l border-gray-800 bg-gray-900/50">Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {rankings.map((row, index) => (
                                        <motion.tr
                                            key={row.regno}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="p-4 text-center">
                                                {row.rank === 1 ? <Trophy className="w-6 h-6 text-yellow-500 mx-auto" /> :
                                                    row.rank === 2 ? <Trophy className="w-6 h-6 text-gray-300 mx-auto" /> :
                                                        row.rank === 3 ? <Trophy className="w-6 h-6 text-orange-400 mx-auto" /> :
                                                            <span className="text-gray-500 font-bold">#{row.rank}</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white text-lg">{row.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{row.regno}</div>
                                            </td>
                                            <td className="p-4 text-center text-pink-400 font-mono">{row.aptitude}</td>
                                            <td className="p-4 text-center text-cyan-400 font-mono">{row.technical}</td>

                                            <td className="p-4 text-center border-l border-gray-800 bg-gray-900/30">
                                                <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded font-bold font-mono">
                                                    {row.total}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-between text-xs text-gray-500 font-mono">
                        <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> SOCKET_CONNECTED</div>
                        <div>TOTAL = APTITUDE + TECHNICAL</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
