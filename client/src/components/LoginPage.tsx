import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle } from 'lucide-react';
import { loginStudent, isAdmin as checkIsAdmin } from '../services/supabaseAuth';
import { updateStudentOnlineStatus } from '../services/supabaseAuth';

interface LoginPageProps {
    onLoginSuccess: (student: any, token: string, isAdmin?: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [name, setName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !regNo.trim()) {
            setError('Please enter both name and register number');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await loginStudent(name.trim(), regNo.trim().toUpperCase());
            
            if (result.success && result.student) {
                const student = result.student;
                
                // Store student data (no token needed with Supabase)
                localStorage.setItem('student', JSON.stringify(student));
                const isAdminUser = checkIsAdmin(student);
                
                // Update online status
                await updateStudentOnlineStatus(student.id, true);
                
                onLoginSuccess(student, '', isAdminUser);
                
                // Redirect to appropriate dashboard
                setTimeout(() => {
                    if (isAdminUser) {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/';
                    }
                }, 500);
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-2xl mb-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        <span className="text-4xl font-bold text-white">IT</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Tech Arena AI
                    </h1>
                    <p className="text-gray-400 mt-2">Technical Competition Platform</p>
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800"
                >
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-cyan-400 mb-4">
                            <Lock className="w-5 h-5" />
                            <h2 className="text-xl font-bold">Student Login</h2>
                        </div>
                        <p className="text-sm text-gray-400">
                            Enter your details to access the competition
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                    placeholder="Enter your name"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Register Number
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono">#</span>
                                <input
                                    type="text"
                                    value={regNo}
                                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                    placeholder="IT-2026-001"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Logging in...</span>
                                </div>
                            ) : (
                                'Enter Competition'
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2026 IT Tech Arena AI. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};
