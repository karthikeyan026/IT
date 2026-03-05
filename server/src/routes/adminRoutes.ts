import express from 'express';
import { db } from '../config/database.js';
import { io } from '../index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

export const adminRoutes = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STUDENT_PDF_PATH = path.resolve(__dirname, '../../..', 'II year name list (Batch 2024-28).pdf');
const ADMIN_REG_NO = '621323205024';

type StudentRow = {
    regNo: string;
    name: string;
};

function parseStudentRows(rawText: string): StudentRow[] {
    const rows = new Map<string, StudentRow>();

    const lines = rawText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    for (const line of lines) {
        const match = line.match(/^\d+\.\s+(\d{12})\s+(.+)$/);
        if (!match) {
            continue;
        }

        const regNo = match[1].trim();
        const name = match[2].replace(/\s+/g, ' ').trim();
        if (!rows.has(regNo)) {
            rows.set(regNo, { regNo, name });
        }
    }

    return Array.from(rows.values());
}

// Start Technical Round
adminRoutes.post('/start/technical', async (req, res) => {
    try {
        await db.execute(
            'UPDATE EventStatus SET current_round = ?, is_locked = FALSE WHERE id = 1',
            ['TECHNICAL']
        );

        // Notify all students
        io.emit('round_started', {
            round: 'TECHNICAL',
            message: 'Technical Round has started!',
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Technical Round started' });
    } catch (error) {
        console.error('Start technical round error:', error);
        res.status(500).json({ error: 'Failed to start round' });
    }
});

// Stop Technical Round
adminRoutes.post('/stop/technical', async (req, res) => {
    try {
        await db.execute(
            'UPDATE EventStatus SET is_locked = TRUE WHERE id = 1'
        );

        // Auto-evaluate and select Top 5
        await evaluateTechnicalRound();

        // Notify all students
        io.emit('round_stopped', {
            round: 'TECHNICAL',
            message: 'Technical Round has ended',
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Technical Round stopped and evaluated' });
    } catch (error) {
        console.error('Stop technical round error:', error);
        res.status(500).json({ error: 'Failed to stop round' });
    }
});

// Start Aptitude Round
adminRoutes.post('/start/aptitude', async (req, res) => {
    try {
        // Check if there are any qualified students from technical round
        const [qualifiedStudents]: any = await db.execute(
            `SELECT s.id, s.name, s.reg_no
             FROM Students s
             INNER JOIN RoundResults rr ON s.id = rr.student_id
             WHERE rr.round_name = 'TECHNICAL' AND rr.is_qualified = TRUE`
        );

        if (qualifiedStudents.length === 0) {
            // If no qualified students from technical round, allow all students to attempt aptitude
            await db.execute(
                'UPDATE EventStatus SET current_round = ?, is_locked = FALSE WHERE id = 1',
                ['APTITUDE']
            );

            // Reset all students' aptitude scores for fresh start
            await db.execute(
                'UPDATE Students SET aptitude_score = 0 WHERE role = "STUDENT"'
            );

            // Notify all students
            io.emit('round_started', {
                round: 'APTITUDE',
                message: 'Aptitude Round has started! Answer all questions.',
                timestamp: new Date()
            });
        } else {
            // Only qualified students can access aptitude round
            await db.execute(
                'UPDATE EventStatus SET current_round = ?, is_locked = FALSE WHERE id = 1',
                ['APTITUDE']
            );

            // Notify qualified students only
            qualifiedStudents.forEach((student: any) => {
                io.to(`student-${student.id}`).emit('round_started', {
                    round: 'APTITUDE',
                    message: 'Congratulations! You qualified for the Aptitude Round',
                    timestamp: new Date()
                });
            });

            // Notify non-qualified students
            const [allStudents]: any = await db.execute(
                'SELECT id FROM Students WHERE role = "STUDENT"'
            );

            const nonQualifiedIds = allStudents
                .filter((s: any) => !qualifiedStudents.find((qs: any) => qs.id === s.id))
                .map((s: any) => s.id);

            nonQualifiedIds.forEach((studentId: string) => {
                io.to(`student-${studentId}`).emit('round_notification', {
                    message: 'You did not qualify for the Aptitude Round',
                    timestamp: new Date()
                });
            });
        }

        res.json({ 
            success: true, 
            message: 'Aptitude Round started',
            qualifiedStudents: qualifiedStudents.length 
        });
    } catch (error) {
        console.error('Start aptitude round error:', error);
        res.status(500).json({ error: 'Failed to start round' });
    }
});

// Stop Aptitude Round
adminRoutes.post('/stop/aptitude', async (req, res) => {
    try {
        await db.execute(
            'UPDATE EventStatus SET current_round = ?, is_locked = TRUE WHERE id = 1',
            ['ENDED']
        );

        // Calculate final rankings
        await calculateFinalRankings();

        // Notify all students
        io.emit('round_stopped', {
            round: 'APTITUDE',
            message: 'Aptitude Round has ended. Check leaderboard for final rankings!',
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Aptitude Round stopped and final rankings calculated' });
    } catch (error) {
        console.error('Stop aptitude round error:', error);
        res.status(500).json({ error: 'Failed to stop round' });
    }
});

// Get dashboard statistics
adminRoutes.get('/dashboard/stats', async (req, res) => {
    try {
        // Online students
        const [onlineStudents]: any = await db.execute(
            'SELECT COUNT(*) as count FROM Students WHERE is_online = TRUE'
        );

        // Total submissions
        const [totalSubmissions]: any = await db.execute(
            'SELECT COUNT(*) as count FROM Submissions'
        );

        // Suspicious students
        const [suspiciousStudents]: any = await db.execute(
            `SELECT COUNT(DISTINCT student_id) as count
             FROM Violations
             GROUP BY student_id
             HAVING COUNT(*) >= 2`
        );

        // Plagiarism cases
        const [plagiarismCases]: any = await db.execute(
            'SELECT COUNT(*) as count FROM PlagiarismLogs'
        );

        // Current round
        const [eventStatus]: any = await db.execute(
            'SELECT current_round FROM EventStatus WHERE id = 1'
        );

        res.json({
            onlineStudents: onlineStudents[0].count,
            totalSubmissions: totalSubmissions[0].count,
            suspiciousStudents: suspiciousStudents.length || 0,
            plagiarismCases: plagiarismCases[0].count,
            currentRound: eventStatus[0].current_round
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get live student activity
adminRoutes.get('/dashboard/activity', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                s.id as student_id,
                s.name,
                s.reg_no,
                s.is_online,
                sa.current_question_id,
                q.content as current_question,
                sa.last_activity,
                (SELECT COUNT(*) FROM Violations WHERE student_id = s.id) as violation_count
             FROM Students s
             LEFT JOIN StudentActivity sa ON s.id = sa.student_id
             LEFT JOIN Questions q ON sa.current_question_id = q.id
             WHERE s.role = 'STUDENT'
             ORDER BY s.is_online DESC, sa.last_activity DESC
             LIMIT 50`
        );

        res.json({ activity: rows });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Get qualified students for next round
adminRoutes.get('/dashboard/qualified', async (req, res) => {
    try {
        const [qualifiedStudents]: any = await db.execute(
            `SELECT s.id, s.name, s.reg_no, s.technical_score, s.aptitude_score, s.overall_score
             FROM Students s
             INNER JOIN RoundResults rr ON s.id = rr.student_id
             WHERE rr.round_name = 'TECHNICAL' AND rr.is_qualified = TRUE
             ORDER BY rr.rank_pos ASC`
        );

        res.json({ qualifiedStudents });
    } catch (error) {
        console.error('Get qualified students error:', error);
        res.status(500).json({ error: 'Failed to fetch qualified students' });
    }
});

// Get leaderboard
adminRoutes.get('/leaderboard', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                id as student_id,
                name,
                reg_no,
                technical_score,
                aptitude_score,
                overall_score,
                (SELECT COUNT(*) FROM Violations WHERE student_id = Students.id) as violations
             FROM Students
             WHERE role = 'STUDENT'
             ORDER BY overall_score DESC, technical_score DESC
             LIMIT 50`
        );

        res.json({ leaderboard: rows });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get plagiarism logs
adminRoutes.get('/plagiarism', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                p.*,
                s1.name as student1_name,
                s1.reg_no as student1_reg,
                s2.name as student2_name,
                s2.reg_no as student2_reg,
                q.content as question_content
             FROM PlagiarismLogs p
             JOIN Students s1 ON p.student1_id = s1.id
             JOIN Students s2 ON p.student2_id = s2.id
             JOIN Questions q ON p.question_id = q.id
             ORDER BY p.similarity_score DESC`
        );

        res.json({ plagiarismLogs: rows });
    } catch (error) {
        console.error('Get plagiarism logs error:', error);
        res.status(500).json({ error: 'Failed to fetch plagiarism logs' });
    }
});

// Helper function to evaluate technical round and select Top 5
async function evaluateTechnicalRound() {
    try {
        // Calculate total technical scores
        await db.execute(
            `UPDATE Students s
             SET technical_score = (
                 SELECT COALESCE(SUM(score), 0)
                 FROM Submissions sub
                 JOIN Questions q ON sub.question_id = q.id
                 WHERE sub.student_id = s.id AND q.round_name = 'TECHNICAL'
             )`
        );

        // Get top 5 students
        const [topStudents]: any = await db.execute(
            `SELECT id, name, reg_no, technical_score
             FROM Students
             WHERE role = 'STUDENT'
             ORDER BY technical_score DESC, created_at ASC
             LIMIT 5`
        );

        // Mark them as qualified
        for (let i = 0; i < topStudents.length; i++) {
            const student = topStudents[i];
            await db.execute(
                `INSERT INTO RoundResults (id, student_id, round_name, score, rank_pos, is_qualified)
                 VALUES (UUID(), ?, 'TECHNICAL', ?, ?, TRUE)
                 ON DUPLICATE KEY UPDATE score = ?, rank_pos = ?, is_qualified = TRUE`,
                [student.id, student.technical_score, i + 1, student.technical_score, i + 1]
            );
        }

        console.log('Top 5 students qualified for Aptitude Round:', topStudents);
    } catch (error) {
        console.error('Evaluate technical round error:', error);
    }
}

// Helper function to calculate final rankings
async function calculateFinalRankings() {
    try {
        // Calculate overall scores
        await db.execute(
            `UPDATE Students
             SET overall_score = technical_score + aptitude_score`
        );

        // Update final rankings
        const [students]: any = await db.execute(
            `SELECT id, overall_score
             FROM Students
             WHERE role = 'STUDENT'
             ORDER BY overall_score DESC`
        );

        for (let i = 0; i < students.length; i++) {
            await db.execute(
                `INSERT INTO RoundResults (id, student_id, round_name, score, rank_pos)
                 VALUES (UUID(), ?, 'FINAL', ?, ?)
                 ON DUPLICATE KEY UPDATE score = ?, rank_pos = ?`,
                [students[i].id, students[i].overall_score, i + 1, students[i].overall_score, i + 1]
            );
        }

        console.log('Final rankings calculated');
    } catch (error) {
        console.error('Calculate final rankings error:', error);
    }
}

// Lock all submissions
adminRoutes.post('/lock', async (req, res) => {
    try {
        await db.execute(
            'UPDATE EventStatus SET is_locked = TRUE WHERE id = 1'
        );

        io.emit('system_locked', {
            message: 'All submissions have been locked by admin',
            timestamp: new Date()
        });

        res.json({ success: true, message: 'System locked' });
    } catch (error) {
        console.error('Lock system error:', error);
        res.status(500).json({ error: 'Failed to lock system' });
    }
});

// Sync students from PDF list
adminRoutes.post('/students/sync', async (req, res) => {
    let parser: PDFParse | null = null;

    try {
        if (!fs.existsSync(STUDENT_PDF_PATH)) {
            return res.status(404).json({
                error: `Student list PDF not found at: ${STUDENT_PDF_PATH}`
            });
        }

        const pdfBuffer = fs.readFileSync(STUDENT_PDF_PATH);
        parser = new PDFParse({ data: pdfBuffer });
        const textResult = await parser.getText();
        const students = parseStudentRows(textResult.text || '');

        if (students.length === 0) {
            return res.status(400).json({ error: 'No students parsed from PDF' });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            for (const student of students) {
                await connection.execute(
                    `INSERT INTO Students (id, reg_no, name, role, is_online, login_time)
                     VALUES (?, ?, ?, 'STUDENT', FALSE, NOW())
                     ON DUPLICATE KEY UPDATE
                       name = VALUES(name),
                       role = CASE WHEN Students.reg_no = ? THEN 'ADMIN' ELSE 'STUDENT' END`,
                    [uuidv4(), student.regNo, student.name, ADMIN_REG_NO]
                );
            }

            await connection.execute(
                `UPDATE Students
                 SET role = 'ADMIN'
                 WHERE reg_no = ?`,
                [ADMIN_REG_NO]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const [studentCountRows]: any = await db.execute(
            "SELECT COUNT(*) as total FROM Students WHERE role = 'STUDENT'"
        );

        return res.json({
            success: true,
            importedCount: students.length,
            totalStudents: studentCountRows[0].total,
            message: 'Student list synced successfully'
        });
    } catch (error) {
        console.error('Sync students error:', error);
        return res.status(500).json({ error: 'Failed to sync students from PDF' });
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
});
