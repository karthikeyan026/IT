/**
 * Aptitude Round Questions (10 questions)
 * Types: Word Scramble (4), Number Pattern (2), Image Logic (4)
 * Timer: 60 seconds per question
 * Points: 5 points each
 */

export const APTITUDE_QUESTIONS = [
  {
    content: 'Unscramble the IT word: ETDARAABAS',
    type: 'WORD_SCRAMBLE',
    options: {
      A: 'DATABASE',
      B: 'DATASET',
      C: 'DATAWARE',
      D: 'DATASTORE'
    },
    correct_answer: 'A',
    points: 5
  },
  {
    content: 'Unscramble the IT word: RGOTIHALM',
    type: 'WORD_SCRAMBLE',
    options: {
      A: 'ALGORITHM',
      B: 'ALGORITHMS',
      C: 'LOGARITHM',
      D: 'ALGORITHEM'
    },
    correct_answer: 'A',
    points: 5
  },
  {
    content: 'Unscramble the IT word: RETINNET',
    type: 'WORD_SCRAMBLE',
    options: {
      A: 'INTERNET',
      B: 'INTRANET',
      C: 'NETWORK',
      D: 'NETWARE'
    },
    correct_answer: 'A',
    points: 5
  },
  {
    content: 'Unscramble the IT word: RTEPUCOM',
    type: 'WORD_SCRAMBLE',
    options: {
      A: 'COMPUTER',
      B: 'COMPUTE',
      C: 'COMPUTING',
      D: 'COMPUTOR'
    },
    correct_answer: 'A',
    points: 5
  },
  {
    content: 'Find the missing number in the sequence: 4, 6, 9, 13, 18, ?<br/>Pattern: increases by +2, +3, +4, +5, +6',
    type: 'NUMBER_PATTERN',
    options: {
      A: '23',
      B: '24',
      C: '25',
      D: '26'
    },
    correct_answer: 'B',
    points: 5
  },
  {
    content: 'Find the missing number in the sequence: 3, 5, 9, 17, 33, ?<br/>Pattern: Multiply by 2 then subtract 1',
    type: 'NUMBER_PATTERN',
    options: {
      A: '60',
      B: '64',
      C: '65',
      D: '70'
    },
    correct_answer: 'C',
    points: 5
  },
  {
    content: '[GUITAR + GUITAR + GUITAR = 18], [MICROPHONE + GUITAR + MICROPHONE = 20], [MICROPHONE + MICROPHONE + VIOLIN = 26], [MICROPHONE + VIOLIN × GUITAR = ?]',
    type: 'IMAGE_LOGIC',
    options: {
      A: '60',
      B: '66',
      C: '72',
      D: '78'
    },
    correct_answer: 'B',
    points: 5,
    image_url: '/assets/images/music-puzzle.png'
  },
  {
    content: 'Find the missing number in the grid:<br/>[28, 60, 48], [5, 6, 7], [14, 39, 27], [7, ?, 16]<br/>Pattern: Check the relationship between rows and columns',
    type: 'NUMBER_GRID',
    options: {
      A: '44',
      B: '45',
      C: '46',
      D: '47'
    },
    correct_answer: 'B',
    points: 5,
    image_url: '/assets/images/number-grid.png'
  },
  {
    content: 'Find the missing number in the sequence: 1, 6, 15, ?, 45, 66, 91<br/>Pattern: increases by +5, +9, +13, +17...',
    type: 'SEQUENCE',
    options: {
      A: '26',
      B: '28',
      C: '30',
      D: '32'
    },
    correct_answer: 'B',
    points: 5
  },
  {
    content: 'Find the missing number in the star diagram with branches: [5 at top], [4 at left], [1 at right], [64 at far left], [8 at far right], [25 at bottom], [? in another position]',
    type: 'STAR_PATTERN',
    options: {
      A: '16',
      B: '18',
      C: '32',
      D: '36'
    },
    correct_answer: 'A',
    points: 5,
    image_url: '/assets/images/star-pattern.png'
  }
];

export const seedAptitudeQuestionsToDatabase = async () => {
  try {
    // Import the service function
    const { seedAptitudeQuestions } = await import('../services/supabaseQuestions');
    
    const result = await seedAptitudeQuestions(APTITUDE_QUESTIONS);
    return result;
  } catch (error) {
    console.error('Error seeding aptitude questions:', error);
    return { success: false, error: 'Failed to seed questions' };
  }
};
