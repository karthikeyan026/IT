import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
// In a real app, you would import your DB module here
// import db from '../database';

export const getRoundQuestions = async (req: Request, res: Response) => {
    const { roundId } = req.params;
    try {
        // SELECT * FROM Questions WHERE round_number = ?
        // const questions = await db.query('...', [roundId]);

        // Mock response
        res.json({ success: true, roundId, questions: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'DB Error' });
    }
};

export const submitRound1Answer = async (req: Request, res: Response) => {
    const { questionId, orderedLines, timeTaken } = req.body;
    // req.user provided by authMiddleware
    // const studentId = req.user.id;

    try {
        // 1. Fetch correct_order and actual raw text from DB
        // const question = await db.query('SELECT correct_order, content FROM Questions WHERE id = ?', [questionId]);

        // Mock expected code for demonstration
        const expectedCode = "const x = 10;\nconst y = 20;\nconsole.log(x + y);";
        // Student constructed code from their line rearranging
        const studentCode = orderedLines.map((line: any) => line.content).join('\n');

        // 2. Exact match check (fast path)
        if (studentCode.replace(/\s+/g, '') === expectedCode.replace(/\s+/g, '')) {
            // Full points
            // await db.query('INSERT INTO Submissions ... score = fullPoints');
            return res.json({ success: true, score: 10, perfectMatch: true });
        }

        // 3. Fallback: Structural/Logical equivalence via AI
        const evaluation = await AIService.checkLogicalEquivalence(studentCode, expectedCode, 'javascript');

        // Calculate final partial score based on AI feedback
        // The AI score output is 0.0 to 1.0, multiply by max points (e.g., 10)
        const finalScore = evaluation.partialScore * 10;

        // await db.query('INSERT INTO Submissions ... score = ?', [finalScore]);

        res.json({
            success: true,
            score: finalScore,
            feedback: evaluation.feedback,
            perfectMatch: false
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Evaluation Error' });
    }
};

export const submitRoundAnswer = async (req: Request, res: Response) => {
    // Logic for standard coding rounds via Docker sandbox
    // Logic for communication round using AIService.scoreCommunicationAnswer
    res.json({ success: true, message: 'Standard submission acknowledged.' });
};
