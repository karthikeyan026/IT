/**
 * Aptitude Questions Admin Setup
 * Provides UI to seed and manage aptitude questions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { seedAptitudeQuestions, getRoundQuestions, Question } from '../services/supabaseQuestions';
import { APTITUDE_QUESTIONS } from '../data/aptitudeQuestions';

export const AptitudeSetup: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load existing questions
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const aptitudeQuestions = await getRoundQuestions('APTITUDE');
      setQuestions(aptitudeQuestions);
      setMessage({
        type: 'info',
        text: `Found ${aptitudeQuestions.length} existing questions`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to load questions'
      });
    } finally {
      setLoading(false);
    }
  };

  // Seed questions
  const handleSeedQuestions = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const result = await seedAptitudeQuestions(APTITUDE_QUESTIONS);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: '✅ Successfully added 10 aptitude questions!'
        });
        loadQuestions();
      } else {
        setMessage({
          type: 'error',
          text: `❌ Failed: ${result.error}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Aptitude Questions Setup</h2>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-300">
          Current Status: <span className="font-bold text-cyan-400">{questions.length}/10 questions</span>
        </p>
        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            style={{ width: `${(questions.length / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500 bg-opacity-10 border border-green-500 text-green-300'
              : message.type === 'error'
              ? 'bg-red-500 bg-opacity-10 border border-red-500 text-red-300'
              : 'bg-blue-500 bg-opacity-10 border border-blue-500 text-blue-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSeedQuestions}
          disabled={seeding || questions.length === 10}
          className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            questions.length === 10
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
          }`}
        >
          <Zap className="w-5 h-5" />
          {seeding ? 'Seeding...' : 'Seed 10 Questions'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadQuestions}
          disabled={loading}
          className="py-3 px-6 rounded-lg font-bold text-cyan-300 border border-cyan-500 hover:bg-cyan-500 hover:bg-opacity-10 transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-6 py-3">
            <h3 className="font-bold text-white">Added Questions ({questions.length}/10)</h3>
          </div>
          <div className="divide-y divide-gray-700 max-h-64 overflow-y-auto">
            {questions.map((q, idx) => (
              <div key={q.id} className="px-6 py-3 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">
                      <span className="font-bold text-cyan-400">Q{idx + 1}</span> · {q.type}
                    </p>
                    <p className="text-gray-300 text-sm line-clamp-2">{q.content}</p>
                  </div>
                  <span className="text-xs bg-cyan-500 bg-opacity-20 text-cyan-300 px-2 py-1 rounded whitespace-nowrap">
                    {q.points}pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {questions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-4">No questions added yet</p>
          <p className="text-sm">Click "Seed 10 Questions" to add all aptitude questions</p>
        </div>
      )}
    </div>
  );
};
