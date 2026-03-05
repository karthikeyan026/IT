import express from 'express';
import { db } from '../config/database.js';

export const questionRoutes = express.Router();

// Get questions for a specific round
questionRoutes.get('/:round', async (req, res) => {
    try {
        const { round } = req.params;

        const [rows] = await db.execute(
            'SELECT * FROM Questions WHERE round_name = ? ORDER BY order_index ASC',
            [round.toUpperCase()]
        );

        res.json({ questions: rows });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get single question
questionRoutes.get('/single/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;

        const [rows]: any = await db.execute(
            'SELECT * FROM Questions WHERE id = ?',
            [questionId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ question: rows[0] });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// Admin: Create question
questionRoutes.post('/create', async (req, res) => {
    try {
        const { id, roundName, type, content, options, correctAnswer, testCases, points, timeLimit, orderIndex } = req.body;

        await db.execute(
            `INSERT INTO Questions (id, round_name, type, content, options, correct_answer, test_cases, points, time_limit, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                roundName,
                type,
                content,
                JSON.stringify(options || null),
                correctAnswer,
                JSON.stringify(testCases || null),
                points || 10,
                timeLimit || 300,
                orderIndex || 0
            ]
        );

        res.json({ success: true, message: 'Question created' });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
});

// Admin: Seed technical round questions
questionRoutes.post('/seed/technical', async (req, res) => {
    try {
        const technicalQuestions = [
            {
                id: 'tech-q1',
                round_name: 'TECHNICAL',
                type: 'DRAG_DROP',
                content: 'Rearrange the following code lines to create a valid function that calculates the sum of an array:',
                options: JSON.stringify([
                    { id: '1', content: 'function calculateSum(arr) {' },
                    { id: '2', content: '  let sum = 0;' },
                    { id: '3', content: '  for (let i = 0; i < arr.length; i++) {' },
                    { id: '4', content: '    sum += arr[i];' },
                    { id: '5', content: '  }' },
                    { id: '6', content: '  return sum;' },
                    { id: '7', content: '}' }
                ]),
                correct_answer: '1,2,3,4,5,6,7',
                test_cases: null,
                points: 10,
                time_limit: 60,
                order_index: 1
            },
            {
                id: 'tech-q2',
                round_name: 'TECHNICAL',
                type: 'SYNTAX',
                content: 'Find the syntax error in the following code:\n\nfunction greet(name) {\n  console.log("Hello " + name\n  return true;\n}',
                options: null,
                correct_answer: 'Missing closing parenthesis on line 2',
                test_cases: null,
                points: 10,
                time_limit: 60,
                order_index: 2
            },
            {
                id: 'tech-q3',
                round_name: 'TECHNICAL',
                type: 'PSEUDOCODE',
                content: 'What will be the output of this pseudocode?\n\nBEGIN\n  SET x = 5\n  SET y = 10\n  SET z = x + y\n  PRINT z * 2\nEND',
                options: JSON.stringify(['20', '30', '15', '25']),
                correct_answer: '30',
                test_cases: null,
                points: 10,
                time_limit: 60,
                order_index: 3
            },
            {
                id: 'tech-q4',
                round_name: 'TECHNICAL',
                type: 'OUTPUT',
                content: 'What will be the output of this program?\n\nfor (let i = 0; i < 3; i++) {\n  console.log(i * 2);\n}',
                options: null,
                correct_answer: '0\n2\n4',
                test_cases: null,
                points: 10,
                time_limit: 60,
                order_index: 4
            },
            {
                id: 'tech-q5',
                round_name: 'TECHNICAL',
                type: 'PROGRAMMING',
                content: 'Write a function that takes an array of numbers and returns the maximum value.',
                options: null,
                correct_answer: null,
                test_cases: JSON.stringify([
                    { input: '[1, 5, 3, 9, 2]', expected: '9' },
                    { input: '[10, 20, 30]', expected: '30' },
                    { input: '[-5, -1, -10]', expected: '-1' }
                ]),
                points: 20,
                time_limit: 60,
                order_index: 5
            }
        ];

        for (const q of technicalQuestions) {
            await db.execute(
                `INSERT IGNORE INTO Questions (id, round_name, type, content, options, correct_answer, test_cases, points, time_limit, order_index)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [q.id, q.round_name, q.type, q.content, q.options, q.correct_answer, q.test_cases, q.points, q.time_limit, q.order_index]
            );
        }

        res.json({ success: true, message: 'Technical questions seeded' });
    } catch (error) {
        console.error('Seed technical questions error:', error);
        res.status(500).json({ error: 'Failed to seed questions' });
    }
});

// Admin: Seed aptitude round questions
questionRoutes.post('/seed/aptitude', async (req, res) => {
    try {
        const aptitudeQuestions = [
            // Numerical Calculation
            {
                id: 'apt-q1',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If 5x + 3 = 18, what is the value of x?',
                options: JSON.stringify(['2', '3', '4', '5']),
                correct_answer: '3',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 1
            },
            {
                id: 'apt-q2',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'A train travels 120 km in 2 hours. What is its speed in km/h?',
                options: JSON.stringify(['50', '60', '70', '80']),
                correct_answer: '60',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 2
            },
            {
                id: 'apt-q3',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If the ratio of A:B is 3:5 and A = 12, what is B?',
                options: JSON.stringify(['15', '18', '20', '25']),
                correct_answer: '20',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 3
            },
            // Pattern Recognition
            {
                id: 'apt-q4',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'Complete the pattern: 2, 4, 8, 16, ?',
                options: JSON.stringify(['24', '32', '28', '20']),
                correct_answer: '32',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 4
            },
            {
                id: 'apt-q5',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'Which number comes next? 1, 1, 2, 3, 5, 8, ?',
                options: JSON.stringify(['11', '13', '15', '17']),
                correct_answer: '13',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 5
            },
            {
                id: 'apt-q6',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'What comes next in the sequence? A, C, E, G, ?',
                options: JSON.stringify(['H', 'I', 'J', 'K']),
                correct_answer: 'I',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 6
            },
            // Logical Reasoning
            {
                id: 'apt-q7',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If all roses are flowers and some flowers fade quickly, which statement must be true?',
                options: JSON.stringify([
                    'All roses fade quickly',
                    'Some roses might fade quickly',
                    'No roses fade quickly',
                    'All flowers are roses'
                ]),
                correct_answer: 'Some roses might fade quickly',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 7
            },
            {
                id: 'apt-q8',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If today is Monday, what day will it be 15 days from now?',
                options: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday']),
                correct_answer: 'Tuesday',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 8
            },
            {
                id: 'apt-q9',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'Which is the odd one out? Newspaper, Magazine, Radio, Television',
                options: JSON.stringify(['Newspaper', 'Magazine', 'Radio', 'Television']),
                correct_answer: 'Radio',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 9
            },
            // Analytical Thinking
            {
                id: 'apt-q10',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If a container has 5 red balls, 3 blue balls, and 2 green balls, what is the probability of drawing a red ball?',
                options: JSON.stringify(['1/2', '5/10', '1/3', '2/5']),
                correct_answer: '1/2',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 10
            },
            {
                id: 'apt-q11',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'What is 25% of 200?',
                options: JSON.stringify(['25', '40', '50', '75']),
                correct_answer: '50',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 11
            },
            {
                id: 'apt-q12',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If X = 2Y and Y = 3Z, what is the ratio X:Y:Z?',
                options: JSON.stringify(['2:1:3', '6:3:1', '2:3:1', '6:1:3']),
                correct_answer: '6:3:1',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 12
            },
            // Problem Solving
            {
                id: 'apt-q13',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'A person buys an item for Rs. 80 and sells it for Rs. 100. What is the profit percentage?',
                options: JSON.stringify(['15%', '20%', '25%', '30%']),
                correct_answer: '25%',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 13
            },
            {
                id: 'apt-q14',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'If a book costs Rs. 150 and is sold at 20% discount, what is the selling price?',
                options: JSON.stringify(['Rs. 100', 'Rs. 110', 'Rs. 120', 'Rs. 130']),
                correct_answer: 'Rs. 120',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 14
            },
            {
                id: 'apt-q15',
                round_name: 'APTITUDE',
                type: 'MCQ',
                content: 'How many hours are in 3 days and 12 hours?',
                options: JSON.stringify(['60', '72', '84', '96']),
                correct_answer: '84',
                test_cases: null,
                points: 5,
                time_limit: 60,
                order_index: 15
            }
        ];

        for (const q of aptitudeQuestions) {
            await db.execute(
                `INSERT IGNORE INTO Questions (id, round_name, type, content, options, correct_answer, test_cases, points, time_limit, order_index)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [q.id, q.round_name, q.type, q.content, q.options, q.correct_answer, q.test_cases, q.points, q.time_limit, q.order_index]
            );
        }

        res.json({ success: true, message: 'Aptitude questions seeded' });
    } catch (error) {
        console.error('Seed aptitude questions error:', error);
        res.status(500).json({ error: 'Failed to seed questions' });
    }
});
