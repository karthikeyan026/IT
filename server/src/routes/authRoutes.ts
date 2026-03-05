import express from 'express';
import { db } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const authRoutes = express.Router();
const ADMIN_REG_NO = '621323205024';

// Student Login (Name + Register Number)
authRoutes.post('/login', async (req, res) => {
    try {
        const { name, regNo } = req.body;

        if (!name || !regNo) {
            return res.status(400).json({ error: 'Name and Register Number are required' });
        }

        // Check if this is the admin registration number
        const isAdmin = regNo === ADMIN_REG_NO;

        // Check if student exists in approved list
        const [rows]: any = await db.execute(
            'SELECT * FROM Students WHERE reg_no = ?',
            [regNo]
        );

        if (rows.length === 0 && !isAdmin) {
            return res.status(403).json({
                error: 'Register number not found in approved student list'
            });
        }

        let student;
        if (rows.length === 0) {
            // Create admin profile if missing
            const studentId = uuidv4();
            const role = isAdmin ? 'ADMIN' : 'STUDENT';
            await db.execute(
                'INSERT INTO Students (id, reg_no, name, role, login_time) VALUES (?, ?, ?, ?, NOW())',
                [studentId, regNo, name, role]
            );
            student = { id: studentId, reg_no: regNo, name, role };
        } else {
            // Validate student name to prevent login with someone else's register number.
            student = rows[0];
            const normalizedInputName = String(name).trim().toUpperCase();
            const normalizedSavedName = String(student.name || '').trim().toUpperCase();

            if (!isAdmin && normalizedSavedName !== normalizedInputName) {
                return res.status(403).json({
                    error: 'Name does not match this register number'
                });
            }

            if (isAdmin && student.role !== 'ADMIN') {
                await db.execute(
                    'UPDATE Students SET role = ?, login_time = NOW(), is_online = TRUE WHERE id = ?',
                    ['ADMIN', student.id]
                );
                student.role = 'ADMIN';
                student.name = name;
            } else {
                await db.execute(
                    'UPDATE Students SET login_time = NOW(), is_online = TRUE WHERE id = ?',
                    [student.id]
                );
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: student.id, regNo: student.reg_no, role: student.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            student: {
                id: student.id,
                name: student.name || name,
                regNo: student.reg_no,
                role: student.role
            },
            token,
            isAdmin: student.role === 'ADMIN'
        });
    } catch (error) {
        console.error('Login error:', error);
        const { name, regNo } = req.body || {};

        // Allow admin to access dashboard even when DB is temporarily unavailable.
        if (regNo === ADMIN_REG_NO) {
            const token = jwt.sign(
                { id: 'admin-local', regNo: ADMIN_REG_NO, role: 'ADMIN' },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                student: {
                    id: 'admin-local',
                    name: name || 'Admin',
                    regNo: ADMIN_REG_NO,
                    role: 'ADMIN'
                },
                token,
                isAdmin: true,
                warning: 'Database unavailable. Running in admin fallback mode.'
            });
        }

        const message = error instanceof Error ? error.message : 'Login failed';
        res.status(500).json({ error: process.env.NODE_ENV === 'development' ? message : 'Login failed' });
    }
});

// Admin Login
authRoutes.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check admin credentials (for simplicity, using hardcoded or env variables)
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (username === adminUsername && password === adminPassword) {
            const token = jwt.sign(
                { username, role: 'ADMIN' },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                admin: { username, role: 'ADMIN' },
                token
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current event status
authRoutes.get('/status', async (req, res) => {
    try {
        const [rows]: any = await db.execute('SELECT * FROM EventStatus WHERE id = 1');
        res.json(rows[0]);
    } catch (error) {
        console.error('Status fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});
