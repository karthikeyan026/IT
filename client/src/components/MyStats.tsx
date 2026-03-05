import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Clock, Award } from 'lucide-react';

export const MyStats: React.FC = () => {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-t-[4px] border-t-cyan-500 border-x-gray-800 border-b-gray-800 rounded-xl p-6 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Highest Streak</h3>
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><Zap className="w-5 h-5" /></div>
                    </div>
                    <div className="text-4xl font-black text-white font-mono">14</div>
                    <p className="text-sm text-cyan-500 mt-2 font-semibold">+3 from yesterday</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-t-[4px] border-t-pink-500 border-x-gray-800 border-b-gray-800 rounded-xl p-6 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Best Game (Fun)</h3>
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500"><Award className="w-5 h-5" /></div>
                    </div>
                    <div className="text-2xl font-black text-white font-sans mt-2">Song Lyrics 🎵</div>
                    <p className="text-sm text-pink-500 mt-2 font-semibold">Score: 950/1000</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-t-[4px] border-t-purple-500 border-x-gray-800 border-b-gray-800 rounded-xl p-6 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Avg Reaction Time</h3>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Clock className="w-5 h-5" /></div>
                    </div>
                    <div className="text-4xl font-black text-white font-mono">1.8s</div>
                    <p className="text-sm text-purple-500 mt-2 font-semibold">Top 5% of players</p>
                </motion.div>

            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Target className="text-cyan-500" /> Performance Radar</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-gray-400 text-sm font-bold uppercase mb-4">Technical Breakdown</h4>
                        <div className="space-y-4 font-mono text-sm max-w-sm">
                            <div>
                                <div className="flex justify-between mb-1 text-white"><span>Logic Formulation</span> <span>90%</span></div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-cyan-500 h-full w-[90%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-white"><span>Syntax Accuracy</span> <span>75%</span></div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-cyan-500 h-full w-[75%]"></div></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-gray-400 text-sm font-bold uppercase mb-4">Fun Breakdown</h4>
                        <div className="space-y-4 font-mono text-sm max-w-sm">
                            <div>
                                <div className="flex justify-between mb-1 text-white"><span>Pop Culture Match</span> <span>95%</span></div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-pink-500 h-full w-[95%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-white"><span>Trivia Speed</span> <span>60%</span></div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-pink-500 h-full w-[60%]"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MyStats;
