import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface TabDetectorProps {
    studentId: string;
    onViolationLimitReached: () => void;
}

export const TabDetector: React.FC<TabDetectorProps> = ({ studentId, onViolationLimitReached }) => {
    const [violations, setViolations] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                recordViolation('TAB_SWITCH');
            }
        };

        const handleBlur = () => {
            recordViolation('BLUR');
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault(); // Disable Right-Click
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable Inspect Element (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) ||
                (e.ctrlKey && e.key === 'U') ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
            }

            // Disable Copy/Paste/Cut
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'C' || e.key === 'V' || e.key === 'X')) {
                e.preventDefault();
            }
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        const recordViolation = (type: string) => {
            const newCount = violations + 1;
            setViolations(newCount);

            // Show warning popup
            if (newCount === 1) {
                setWarningMessage('⚠️ Warning 1/3: Tab switching detected. Please stay on the test page.');
            } else if (newCount === 2) {
                setWarningMessage('⚠️ Warning 2/3: Second violation! One more and your test will be auto-submitted.');
            } else if (newCount >= 3) {
                setWarningMessage('🚨 Third violation detected! Your test is being submitted automatically.');
                setTimeout(() => {
                    onViolationLimitReached();
                }, 2000);
            }

            setShowWarning(true);

            // Auto-hide warning after 5 seconds
            setTimeout(() => {
                setShowWarning(false);
            }, 5000);

            // Emit to server for admin dashboard logging
            socket.emit('tab_violation', { studentId, type });
        };

        // Listen for forced submission from server
        socket.on('force_submit', () => {
            onViolationLimitReached();
        });

        socket.on('violation_warning', (data) => {
            setViolations(data.count);
            setWarningMessage(data.message);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
        });

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            socket.off('force_submit');
            socket.off('violation_warning');
        };
    }, [studentId, violations, onViolationLimitReached]);

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="fixed top-4 left-1/2 z-50 max-w-md w-full"
                >
                    <div className={`p-4 rounded-lg shadow-2xl border-2 ${
                        violations === 1 ? 'bg-yellow-900/90 border-yellow-500' :
                        violations === 2 ? 'bg-orange-900/90 border-orange-500' :
                        'bg-red-900/90 border-red-500'
                    }`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${
                                violations === 1 ? 'text-yellow-400' :
                                violations === 2 ? 'text-orange-400' :
                                'text-red-400'
                            }`} />
                            <div className="flex-1">
                                <p className="font-bold text-white mb-1">Anti-Cheat System</p>
                                <p className="text-sm text-white">{warningMessage}</p>
                            </div>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="text-white hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
