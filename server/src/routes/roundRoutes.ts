import { Router } from 'express';
import { getRoundQuestions, submitRound1Answer, submitRoundAnswer } from '../controllers/roundController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Retrieve questions for a specific round
router.get('/:roundId/questions', requireAuth, getRoundQuestions);

// Submit Drag & Drop code reordering answer (Round 1)
router.post('/1/submit', requireAuth, submitRound1Answer);

// Submit standard coding or communication answers (Round 2 & 3)
router.post('/:roundId/submit', requireAuth, submitRoundAnswer);

// Future endpoints: Leaderboard stream handled via WebSockets

export default router;
