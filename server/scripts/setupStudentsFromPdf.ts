import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { PDFParse } from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const workspaceDir = path.resolve(rootDir, '..');

const schemaPath = path.resolve(workspaceDir, 'database', 'schema.sql');
const pdfPath = path.resolve(workspaceDir, 'II year name list (Batch 2024-28).pdf');

const ADMIN_REG_NO = '621323205024';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Karthikeyan';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'it_tech_arena',
    multipleStatements: true
};

type StudentRecord = {
    regNo: string;
    name: string;
};

function parseStudents(rawText: string): StudentRecord[] {
    const lines = rawText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const records = new Map<string, StudentRecord>();

    for (const line of lines) {
        const match = line.match(/^\d+\.\s+(\d{12})\s+(.+)$/);
        if (!match) {
            continue;
        }

        const regNo = match[1].trim();
        const name = match[2].replace(/\s+/g, ' ').trim();

        if (!records.has(regNo)) {
            records.set(regNo, { regNo, name });
        }
    }

    return Array.from(records.values());
}

async function applySchema() {
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schemaSql = fs
        .readFileSync(schemaPath, 'utf-8')
        // Create indexes in a separate idempotent step for broad MySQL compatibility.
        .replace(/^\s*CREATE INDEX\s+IF NOT EXISTS.+$/gim, '')
        .replace(/^\s*CREATE INDEX\s+.+$/gim, '');
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        multipleStatements: true
    });

    try {
        await connection.query(schemaSql);
        console.log('Schema applied successfully.');
    } finally {
        await connection.end();
    }
}

async function ensureIndexes() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });

    const indexDefinitions = [
        {
            table: 'Students',
            index: 'idx_overall_leaderboard',
            ddl: 'CREATE INDEX idx_overall_leaderboard ON Students (overall_score DESC)'
        },
        {
            table: 'Students',
            index: 'idx_technical_score',
            ddl: 'CREATE INDEX idx_technical_score ON Students (technical_score DESC)'
        },
        {
            table: 'Students',
            index: 'idx_aptitude_score',
            ddl: 'CREATE INDEX idx_aptitude_score ON Students (aptitude_score DESC)'
        },
        {
            table: 'Violations',
            index: 'idx_violations',
            ddl: 'CREATE INDEX idx_violations ON Violations (student_id, timestamp)'
        },
        {
            table: 'PlagiarismLogs',
            index: 'idx_plagiarism',
            ddl: 'CREATE INDEX idx_plagiarism ON PlagiarismLogs (similarity_score DESC)'
        }
    ];

    try {
        for (const definition of indexDefinitions) {
            const [existingRows]: any = await connection.execute(
                `SELECT 1 FROM information_schema.statistics
                 WHERE table_schema = ? AND table_name = ? AND index_name = ?
                 LIMIT 1`,
                [dbConfig.database, definition.table, definition.index]
            );

            if (existingRows.length === 0) {
                await connection.execute(definition.ddl);
            }
        }
    } finally {
        await connection.end();
    }
}

async function readStudentListFromPdf(): Promise<StudentRecord[]> {
    if (!fs.existsSync(pdfPath)) {
        throw new Error(`Student PDF not found: ${pdfPath}`);
    }

    const buffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buffer });

    try {
        const textResult = await parser.getText();
        const students = parseStudents(textResult.text || '');

        if (students.length === 0) {
            throw new Error('No students could be parsed from the PDF.');
        }

        return students;
    } finally {
        await parser.destroy();
    }
}

async function upsertStudents(students: StudentRecord[]) {
    const pool = mysql.createPool(dbConfig);

    try {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            for (const student of students) {
                await conn.execute(
                    `INSERT INTO Students (id, reg_no, name, role, is_online, login_time)
                     VALUES (?, ?, ?, 'STUDENT', FALSE, NOW())
                     ON DUPLICATE KEY UPDATE
                       name = VALUES(name),
                       role = CASE WHEN Students.reg_no = ? THEN 'ADMIN' ELSE 'STUDENT' END`,
                    [uuidv4(), student.regNo, student.name, ADMIN_REG_NO]
                );
            }

            // Ensure admin profile exists and has ADMIN role.
            await conn.execute(
                `INSERT INTO Students (id, reg_no, name, role, is_online, login_time)
                 VALUES (?, ?, ?, 'ADMIN', FALSE, NOW())
                 ON DUPLICATE KEY UPDATE
                   name = VALUES(name),
                   role = 'ADMIN'`,
                [uuidv4(), ADMIN_REG_NO, ADMIN_NAME]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }

        const [countRows]: any = await pool.execute(
            'SELECT COUNT(*) as totalStudents FROM Students WHERE role = \'STUDENT\''
        );
        const [adminRows]: any = await pool.execute(
            'SELECT COUNT(*) as totalAdmins FROM Students WHERE role = \'ADMIN\''
        );

        console.log(`Imported/updated ${students.length} students from PDF.`);
        console.log(`Students in DB: ${countRows[0].totalStudents}`);
        console.log(`Admins in DB: ${adminRows[0].totalAdmins}`);
    } finally {
        await pool.end();
    }
}

async function main() {
    console.log('Starting student database setup...');

    await applySchema();
    await ensureIndexes();
    const students = await readStudentListFromPdf();
    await upsertStudents(students);

    console.log('Student setup completed successfully.');
}

main().catch((error) => {
    console.error('Student setup failed:', error);
    process.exit(1);
});
