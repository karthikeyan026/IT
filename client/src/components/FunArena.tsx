import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, Timer, Trophy, CheckCircle, XCircle } from 'lucide-react';

type GameType = 'MENU' | 'SONG_LYRICS' | 'EMOJI_MOVIE' | 'CARTOON_SILHOUETTE' | 'RAPID_FIRE';

const GAMES = [
    { id: 'SONG_LYRICS', title: 'Song Lyrics 🎵', desc: 'Guess the movie from 2 lines of lyrics.' },
    { id: 'EMOJI_MOVIE', title: 'Emoji Movie 🎬', desc: 'Decode the movie name from emojis.' },
    { id: 'CARTOON_SILHOUETTE', title: 'Cartoon Silhouette 👤', desc: 'Guess the character from a blurred image.' },
    { id: 'RAPID_FIRE', title: 'Rapid Fire Blitz ⚡', desc: '30 seconds. Mixed trivia. Auto-next!' }
];

export const FunArena: React.FC = () => {
    const [activeGame, setActiveGame] = useState<GameType>('MENU');

    return (
        <div className="w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                {activeGame === 'MENU' && (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {GAMES.map(game => (
                            <div
                                key={game.id}
                                onClick={() => setActiveGame(game.id as GameType)}
                                className="bg-gray-900 border border-gray-800 hover:border-pink-500 rounded-xl p-8 cursor-pointer transition-all duration-300 group hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    {game.title}
                                    <Play className="w-5 h-5 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-gray-400">{game.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeGame === 'SONG_LYRICS' && <SongLyricsGame onBack={() => setActiveGame('MENU')} />}
                {activeGame === 'EMOJI_MOVIE' && <EmojiMovieGame onBack={() => setActiveGame('MENU')} />}
                {activeGame === 'CARTOON_SILHOUETTE' && <CartoonSilhouetteGame onBack={() => setActiveGame('MENU')} />}
                {activeGame === 'RAPID_FIRE' && <RapidFireGame onBack={() => setActiveGame('MENU')} />}
            </AnimatePresence>
        </div>
    );
};

// ==========================================
// 1. SONG LYRICS GAME
// ==========================================
const songQuestions = [
    { lyrics: "Why this kolaveri kolaveri kolaveri di\nDistance la moon-u moon-u", answer: "3" },
    { lyrics: "Tum hi ho\nAb tum hi ho", answer: "Aashiqui 2" },
    // mock for brevity
    { lyrics: "All is well\nMurge kya jaane ande ka kya hoga", answer: "3 Idiots" }
];

const SongLyricsGame = ({ onBack }: { onBack: () => void }) => {
    const [qIndex, setQIndex] = useState(0);
    const [inputVal, setInputVal] = useState('');
    const [timeLeft, setTimeLeft] = useState(20);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            handleNext();
        }
    }, [timeLeft]);

    const handleNext = () => {
        if (qIndex < songQuestions.length - 1) {
            setQIndex(prev => prev + 1);
            setTimeLeft(20);
            setInputVal('');
        } else {
            // end game
            onBack();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const correct = songQuestions[qIndex].answer.toLowerCase();
        // basic fuzzy match
        if (correct.includes(inputVal.toLowerCase().trim()) && inputVal.length > 2) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ec4899', '#a855f7'] });
            setScore(prev => prev + 100 - (20 - timeLeft) * 2); // speed bonus
            handleNext();
        } else {
            // wrong answer logic
            setInputVal('');
        }
    };

    return (
        <GameLayout title="Song Lyrics 🎵" score={score} timeLeft={timeLeft} onBack={onBack}>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-pink-500/30 mb-8 text-center min-h-[150px] flex items-center justify-center">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 whitespace-pre-wrap">
                    "{songQuestions[qIndex].lyrics}"
                </p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    autoFocus
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Type movie name here..."
                    className="flex-1 bg-gray-900 border border-gray-700 focus:border-pink-500 rounded-lg px-6 py-4 text-white text-xl outline-none transition-colors"
                />
                <button type="submit" className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 px-8 rounded-lg transition-transform active:scale-95 text-xl">
                    Guess
                </button>
            </form>
        </GameLayout>
    );
};


// ==========================================
// 2. EMOJI MOVIE GAME
// ==========================================
// Similar quick mockup implementation...
const EmojiMovieGame = ({ onBack }: { onBack: () => void }) => {
    return (
        <GameLayout title="Emoji Movie 🎬" score={0} timeLeft={20} onBack={onBack}>
            <div className="text-6xl text-center my-10 tracking-[1rem]">🚢👩‍❤️‍👨🧊🥶</div>
            <input placeholder="Type movie name..." className="w-full bg-gray-900 border border-gray-700 focus:border-pink-500 rounded-lg px-6 py-4 text-white text-xl outline-none" />
            <div className="mt-4 flex justify-end"><button onClick={onBack} className="text-gray-400 hover:text-white">Give up</button></div>
        </GameLayout>
    );
};


// ==========================================
// 3. CARTOON SILHOUETTE GAME
// ==========================================
const CartoonSilhouetteGame = ({ onBack }: { onBack: () => void }) => {
    return (
        <GameLayout title="Cartoon Silhouette 👤" score={0} timeLeft={20} onBack={onBack}>
            <div className="w-48 h-48 mx-auto bg-white/5 rounded-full blur-xl border-4 border-dashed border-purple-500 my-8"></div>
            <input placeholder="Who's that character?" className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-lg px-6 py-4 text-white text-xl outline-none" />
        </GameLayout>
    );
};


// ==========================================
// 4. RAPID FIRE BLITZ
// ==========================================
const RapidFireGame = ({ onBack }: { onBack: () => void }) => {
    return (
        <GameLayout title="Rapid Fire Blitz ⚡" score={0} timeLeft={30} onBack={onBack}>
            <div className="text-center text-3xl font-bold text-yellow-400 my-10">What does HTML stand for?</div>
            <div className="grid grid-cols-2 gap-4">
                {['Hyper text', 'Hyperlink', 'Home tool', 'Hyper text markup language'].map((opt, i) => (
                    <button key={i} className="bg-gray-800 hover:bg-yellow-600 border border-gray-700 p-4 rounded-lg text-white font-bold text-lg transition-colors">
                        {opt}
                    </button>
                ))}
            </div>
        </GameLayout>
    );
};


// ==========================================
// SHARED LAYOUT
// ==========================================
const GameLayout = ({ title, score, timeLeft, onBack, children }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-8"
        >
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div>
                    <button onClick={onBack} className="text-gray-500 hover:text-white mb-2 text-sm">← Back to Menu</button>
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                </div>
                <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">Score</span>
                        <span className="text-2xl font-mono text-pink-500 flex items-center gap-2"><Trophy className="w-5 h-5" /> {score}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">Time</span>
                        <span className={`text-2xl font-mono flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                            <Timer className="w-5 h-5" /> {timeLeft}s
                        </span>
                    </div>
                </div>
            </div>
            {children}
        </motion.div>
    );
};

export default FunArena;
