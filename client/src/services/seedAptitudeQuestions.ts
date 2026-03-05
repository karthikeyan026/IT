/**
 * Seed Aptitude Questions to Supabase
 * Run this once to populate the aptitude round with all 10 questions
 */

import { seedAptitudeQuestions } from './supabaseQuestions';
import { APTITUDE_QUESTIONS } from '../data/aptitudeQuestions';

export const seedAptitudeRound = async () => {
  try {
    console.log('🌱 Starting to seed aptitude questions...');
    
    const result = await seedAptitudeQuestions(APTITUDE_QUESTIONS);
    
    if (result.success) {
      console.log('✅ Successfully seeded 10 aptitude questions!');
      return { success: true, message: 'Questions added successfully' };
    } else {
      console.error('❌ Failed to seed questions:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test function to verify questions are in database
 */
export const verifyAptitudeQuestions = async () => {
  try {
    const { getRoundQuestions } = await import('./supabaseQuestions');
    const questions = await getRoundQuestions('APTITUDE');
    
    console.log(`✅ Found ${questions.length} aptitude questions in database`);
    questions.forEach((q, idx) => {
      console.log(`  ${idx + 1}. ${q.type} - ${q.content.substring(0, 50)}...`);
    });
    
    return questions;
  } catch (error) {
    console.error('❌ Error verifying questions:', error);
    return [];
  }
};
