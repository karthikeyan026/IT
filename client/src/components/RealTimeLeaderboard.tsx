import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { socket } from '../services/socket';

interface LeaderboardEntry {
    rank: number;
    student_id?: string;
    name: string;
    regno: string;
    aptitude: number;
    technical: number;
    total: number;
}

interface LeaderboardProps {
    showTechnical?: boolean;
    showAptitude?: boolean;
    limit?: number;
}

export const RealTimeLeaderboard: React.FC<LeaderboardProps> = ({
    showTechnical = true,
    showAptitude = true,
    limit = 50
}) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for leaderboard updates
        const onLeaderboardUpdate = (data: LeaderboardEntry[]) => {
            setLeaderboard(data.slice(0, limit));
            setLoading(false);
        };

        socket.on('leaderboard_update', onLeaderboardUpdate);

        return () => {
            socket.off('leaderboard_update', onLeaderboardUpdate);
        };
    }, [limit]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-400">Loading leaderboard...</div>
            </div>
        );
    }

    const getMedalColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-gray-500';
    };

    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '#';
    };

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Live Leaderboard</h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-4 py-3 text-left text-gray-400 font-semibold w-12">Rank</th>
                            <th className="px-4 py-3 text-left text-gray-400 font-semibold">Name</th>
                            <th className="px-4 py-3 text-left text-gray-400 font-semibold">Register No.</th>
                            {showAptitude && (
                                <th className="px-4 py-3 text-right text-gray-400 font-semibold">Aptitude</th>
                            )}
                            {showTechnical && (
                                <th className="px-4 py-3 text-right text-gray-400 font-semibold">Technical</th>
                            )}
                            <th className="px-4 py-3 text-right text-gray-400 font-semibold font-bold">Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, idx) => (
                            <motion.tr
                                key={entry.student_id || idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                                    entry.rank <= 3 ? 'bg-gray-800 bg-opacity-50' : ''
                                }`}
                            >
                                <td className={`px-4 py-3 font-bold ${getMedalColor(entry.rank)}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getMedalEmoji(entry.rank)}</span>
                                        <span>{entry.rank}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-white font-semibold">
                                    {entry.name}
                                </td>
                                <td className="px-4 py-3 text-gray-400 font-mono">
                                    {entry.regno}
                                </td>
                                {showAptitude && (
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-block px-3 py-1 rounded-lg bg-purple-500 bg-opacity-20 text-purple-300 font-semibold">
                                            {entry.aptitude.toFixed(1)}
                                        </div>
                                    </td>
                                )}
                                {showTechnical && (
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-block px-3 py-1 rounded-lg bg-blue-500 bg-opacity-20 text-blue-300 font-semibold">
                                            {entry.technical.toFixed(1)}
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-3 text-right">
                                    <motion.div
                                        key={entry.total}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 0.3 }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 bg-opacity-20 border border-cyan-500 text-cyan-300 font-bold"
                                    >
                                        <span>{entry.total.toFixed(1)}</span>
                                        {idx === 0 && <TrendingUp className="w-4 h-4" />}
                                    </motion.div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {leaderboard.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    No submissions yet. Check back soon!
                </div>
            )}

            {/* Summary Stats */}
            {leaderboard.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                        <p className="text-gray-400 text-sm mb-1">Top Student</p>
                        <p className="text-xl font-bold text-cyan-400">{leaderboard[0]?.name}</p>
                        <p className="text-gray-500 text-sm">{leaderboard[0]?.total.toFixed(1)} points</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                        <p className="text-gray-400 text-sm mb-1">Total Participants</p>
                        <p className="text-xl font-bold text-purple-400">{leaderboard.length}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                        <p className="text-gray-400 text-sm mb-1">Top 3 Avg Score</p>
                        <p className="text-xl font-bold text-green-400">
                            {(leaderboard.slice(0, 3).reduce((sum, e) => sum + e.total, 0) / 3).toFixed(1)}
                        </p>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
