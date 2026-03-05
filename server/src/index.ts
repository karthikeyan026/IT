import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/authRoutes.js';
import { questionRoutes } from './routes/questionRoutes.js';
import { submissionRoutes } from './routes/submissionRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { violationRoutes } from './routes/violationRoutes.js';
import { db } from './config/database.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174'
];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/violations', violationRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
    console.log(`Student connected: ${socket.id}`);

    // Student joins with their ID
    socket.on('student_join', async (data: { studentId: string, name: string }) => {
        socket.join(`student-${data.studentId}`);
        
        // Update online status
        await db.execute(
            'UPDATE Students SET is_online = TRUE WHERE id = ?',
            [data.studentId]
        );

        // Notify admin dashboard
        io.emit('student_online', {
            studentId: data.studentId,
            name: data.name,
            timestamp: new Date()
        });

        console.log(`Student ${data.name} (${data.studentId}) joined`);
    });

    // Admin joins
    socket.on('admin_join', () => {
        socket.join('admin');
        console.log('Admin joined dashboard');
    });

    // Student activity tracking
    socket.on('student_activity', async (data: {
        studentId: string,
        questionId: string,
        action: string
    }) => {
        // Update activity in database
        await db.execute(
            `INSERT INTO StudentActivity (id, student_id, current_question_id, last_activity)
             VALUES (UUID(), ?, ?, NOW())
             ON DUPLICATE KEY UPDATE current_question_id = ?, last_activity = NOW()`,
            [data.studentId, data.questionId, data.questionId]
        );

        // Broadcast to admin
        io.to('admin').emit('student_activity_update', data);
    });

    // Submission event
    socket.on('submission', async (data: {
        studentId: string,
        questionId: string,
        answer: string,
        score: number
    }) => {
        // Broadcast to admin dashboard
        io.to('admin').emit('new_submission', {
            ...data,
            timestamp: new Date()
        });
    });

    // Tab violation detection
    socket.on('tab_violation', async (data: {
        studentId: string,
        type: string
    }) => {
        const violationId = `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Log violation in database
        await db.execute(
            'INSERT INTO Violations (id, student_id, violation_type, timestamp) VALUES (?, ?, ?, NOW())',
            [violationId, data.studentId, data.type]
        );

        // Get violation count
        const [rows]: any = await db.execute(
            'SELECT COUNT(*) as count FROM Violations WHERE student_id = ?',
            [data.studentId]
        );
        
        const violationCount = rows[0].count;

        // Notify student
        io.to(`student-${data.studentId}`).emit('violation_warning', {
            count: violationCount,
            message: violationCount >= 3 
                ? 'Test auto-submitted due to excessive violations'
                : `Warning ${violationCount}/3: Tab switching detected`
        });

        // Notify admin
        io.to('admin').emit('student_violation', {
            studentId: data.studentId,
            type: data.type,
            count: violationCount,
            timestamp: new Date()
        });

        // Auto-submit if 3 violations
        if (violationCount >= 3) {
            io.to(`student-${data.studentId}`).emit('force_submit');
        }
    });

    // Disconnect
    socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
});

// Export io for use in other files
export { io };
