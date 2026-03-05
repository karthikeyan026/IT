import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const violationRoutes = express.Router();

// Log violation
violationRoutes.post('/log', async (req, res) => {
    try {
        const { studentId, type } = req.body;

        if (!studentId || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const violationId = uuidv4();
        await db.execute(
            'INSERT INTO Violations (id, student_id, violation_type, timestamp) VALUES (?, ?, ?, NOW())',
            [violationId, studentId, type]
        );

        // Get total violation count
        const [rows]: any = await db.execute(
            'SELECT COUNT(*) as count FROM Violations WHERE student_id = ?',
            [studentId]
        );

        res.json({
            success: true,
            violationId,
            totalViolations: rows[0].count
        });
    } catch (error) {
        console.error('Log violation error:', error);
        res.status(500).json({ error: 'Failed to log violation' });
    }
});

// Get violations for a student
violationRoutes.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        const [rows] = await db.execute(
            'SELECT * FROM Violations WHERE student_id = ? ORDER BY timestamp DESC',
            [studentId]
        );

        res.json({ violations: rows });
    } catch (error) {
        console.error('Get violations error:', error);
        res.status(500).json({ error: 'Failed to fetch violations' });
    }
});

// Get all violations (for admin)
violationRoutes.get('/all', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT v.*, s.name, s.reg_no
             FROM Violations v
             JOIN Students s ON v.student_id = s.id
             ORDER BY v.timestamp DESC
             LIMIT 100`
        );

        res.json({ violations: rows });
    } catch (error) {
        console.error('Get all violations error:', error);
        res.status(500).json({ error: 'Failed to fetch violations' });
    }
});

// Get suspicious students (students with 2+ violations)
violationRoutes.get('/suspicious', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT s.id, s.name, s.reg_no, COUNT(v.id) as violation_count
             FROM Students s
             LEFT JOIN Violations v ON s.id = v.student_id
             GROUP BY s.id
             HAVING violation_count >= 2
             ORDER BY violation_count DESC`
        );

        res.json({ suspiciousStudents: rows });
    } catch (error) {
        console.error('Get suspicious students error:', error);
        res.status(500).json({ error: 'Failed to fetch suspicious students' });
    }
});
