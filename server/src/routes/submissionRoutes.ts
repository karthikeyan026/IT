import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../services/aiService.js';
import { plagiarismService } from '../services/plagiarismService.js';
import { io } from '../index.js';

export const submissionRoutes = express.Router();

// Submit answer
submissionRoutes.post('/submit', async (req, res) => {
    try {
        const { studentId, questionId, answer, timeTaken } = req.body;

        if (!studentId || !questionId || !answer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get question details
        const [questionRows]: any = await db.execute(
            'SELECT * FROM Questions WHERE id = ?',
            [questionId]
        );

        if (questionRows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const question = questionRows[0];
        let score = 0;
        let feedback = '';
        let isPlagiarized = false;

        // Evaluate based on question type
        switch (question.type) {
            case 'DRAG_DROP':
                // Check if order matches
                if (answer === question.correct_answer) {
                    score = question.points;
                    feedback = 'Correct sequence!';
                } else {
                    score = 0;
                    feedback = 'Incorrect sequence. Try again.';
                }
                break;

            case 'SYNTAX':
            case 'PSEUDOCODE':
            case 'OUTPUT':
                // Use AI to evaluate
                const aiResult = await aiService.evaluateAnswer(
                    question.content,
                    answer,
                    question.correct_answer
                );
                score = aiResult.isCorrect ? question.points : 0;
                feedback = aiResult.feedback;
                break;

            case 'MCQ':
                // Direct comparison
                if (answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()) {
                    score = question.points;
                    feedback = 'Correct!';
                } else {
                    score = 0;
                    feedback = 'Incorrect answer.';
                }
                break;

            case 'PROGRAMMING':
                // Check plagiarism for programming questions
                const [existingSubmissions]: any = await db.execute(
                    'SELECT answer FROM Submissions WHERE question_id = ? AND student_id != ?',
                    [questionId, studentId]
                );

                if (existingSubmissions.length > 0) {
                    const existingAnswers = existingSubmissions.map((s: any) => s.answer);
                    const plagiarismResult = await plagiarismService.checkPlagiarism(
                        answer,
                        existingAnswers
                    );

                    if (plagiarismResult.isPlagiarism) {
                        isPlagiarized = true;
                        // Log plagiarism
                        const plagiarismId = uuidv4();
                        const otherStudentSubmission = existingSubmissions[plagiarismResult.flaggedSubmissionIndex];

                        await db.execute(
                            `INSERT INTO PlagiarismLogs (id, student1_id, student2_id, question_id, similarity_score)
                             VALUES (?, ?, ?, ?, ?)`,
                            [
                                plagiarismId,
                                studentId,
                                otherStudentSubmission.student_id || 'unknown',
                                questionId,
                                plagiarismResult.maxSimilarity * 100
                            ]
                        );

                        feedback = 'Answer flagged for plagiarism review.';
                        score = 0; // Zero score for plagiarized content
                    }
                }

                // If not plagiarized, evaluate with AI
                if (!isPlagiarized) {
                    const codeResult = await aiService.evaluateCode(
                        question.content,
                        answer,
                        question.test_cases ? JSON.parse(question.test_cases) : []
                    );
                    score = codeResult.score;
                    feedback = codeResult.feedback;
                }
                break;
        }

        // Save submission
        const submissionId = uuidv4();
        await db.execute(
            `INSERT INTO Submissions (id, student_id, question_id, answer, score, time_taken, status, ai_feedback)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [submissionId, studentId, questionId, answer, score, timeTaken || 0, 'EVALUATED', feedback]
        );

        // Update student score
        await db.execute(
            `UPDATE Students 
             SET technical_score = technical_score + ?
             WHERE id = ? AND ? IN (SELECT round_name FROM Questions WHERE id = ? AND round_name = 'TECHNICAL')`,
            [score, studentId, 'TECHNICAL', questionId]
        );

        await db.execute(
            `UPDATE Students 
             SET aptitude_score = aptitude_score + ?
             WHERE id = ? AND ? IN (SELECT round_name FROM Questions WHERE id = ? AND round_name = 'APTITUDE')`,
            [score, studentId, 'APTITUDE', questionId]
        );

        // Update overall score
        await db.execute(
            `UPDATE Students
             SET overall_score = technical_score + aptitude_score
             WHERE id = ?`,
            [studentId]
        );

        // Emit to admin dashboard via WebSocket
        io.to('admin').emit('new_submission', {
            studentId,
            questionId,
            answer,
            score,
            feedback,
            isPlagiarized,
            timestamp: new Date()
        });

        // Get updated leaderboard and broadcast it
        const [leaderboard]: any = await db.execute(
            `SELECT 
                id as student_id,
                name,
                reg_no,
                technical_score,
                aptitude_score,
                overall_score
             FROM Students
             WHERE role = 'STUDENT'
             ORDER BY overall_score DESC, technical_score DESC
             LIMIT 50`
        );

        const rankedLeaderboard = leaderboard.map((row: any, i: number) => ({
            rank: i + 1,
            name: row.name,
            regno: row.reg_no,
            aptitude: row.aptitude_score,
            technical: row.technical_score,
            total: row.overall_score
        }));

        io.emit('leaderboard_update', rankedLeaderboard);

        res.json({
            success: true,
            submissionId,
            score,
            feedback,
            isPlagiarized
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// Get student submissions
submissionRoutes.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const [rows] = await db.execute(
            `SELECT s.*, q.content as question_content, q.type as question_type, q.round_name
             FROM Submissions s
             JOIN Questions q ON s.question_id = q.id
             WHERE s.student_id = ?
             ORDER BY s.created_at DESC`,
            [studentId]
        );

        res.json({ submissions: rows });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get all submissions for admin
submissionRoutes.get('/all', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT s.*, st.name, st.reg_no, q.content as question_content, q.type
             FROM Submissions s
             JOIN Students st ON s.student_id = st.id
             JOIN Questions q ON s.question_id = q.id
             ORDER BY s.created_at DESC
             LIMIT 100`
        );

        res.json({ submissions: rows });
    } catch (error) {
        console.error('Get all submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});
