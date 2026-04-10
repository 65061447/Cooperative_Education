import express from 'express';
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import cors from 'cors';
import helmet from 'helmet';
import * as path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

/**
 * 1. ENVIRONMENT & PATH CONFIGURATION
 */
interface ElectronProcess extends NodeJS.Process {
    resourcesPath: string;
}

const caPath = process.env.NODE_ENV === 'production'
    ? path.join((process as ElectronProcess).resourcesPath, 'ca.pem')
    : path.join(process.cwd(), 'ca.pem');

/**
 * 2. DATABASE CONNECTION POOL (Aiven Cloud)
 */
const pool = mysql.createPool({
    host: 'mysql-10dc6cc7-sso-work1.i.aivencloud.com', 
    port: 26522,
    user: 'avnadmin',
    password: 'AVNS_fGt0UHgX0OTgyCrISHw',
    database: 'defaultdb',
    ssl: {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * 3. STRICTLY TYPED SANITIZATION HELPER
 * Prevents "Incorrect integer value: ''" by converting empty inputs to null.
 * Uses 'unknown' to avoid the 'any' keyword.
 */
const toNumOrNull = (value: unknown): number | null => {
    if (typeof value === 'number') {
        return Number.isNaN(value) ? null : value;
    }
    
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
};

/**
 * 4. DATABASE INITIALIZATION
 */
async function initializeDatabase(): Promise<void> {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);
        await pool.query(`
            INSERT IGNORE INTO Users (username, password) 
            VALUES ('admin', 'sso1234')
        `);
        console.log("✅ Database and Admin account are ready.");
    } catch (err) {
        console.error("❌ Setup Error:", err);
    }
}

// --- API ROUTES ---

// LOGIN
app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// GET ALL EMPLOYEES
app.get('/employees', async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Employee');
        console.log(`📊 Rows fetched from Cloud: ${rows.length}`);
        res.json(rows);
    } catch (error: unknown) {
        console.error("❌ FETCH ERROR:", error);
        res.status(500).json({ error: "Fetch failed" });
    }
});

// ADD EMPLOYEE
app.post('/employees/add', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
            Personel_Type, Position_Level, Position_No,
            Assign_Task, Actual_Task, Status
        } = req.body;

        const sql = `INSERT INTO Employee (
                    Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
                    Personel_Type, Position_Level, Position_No,
                    Assign_Task, Actual_Task, Status
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await pool.execute(sql, [
            Name, 
            Birthday, 
            toNumOrNull(Citizen_id), 
            Tel, 
            Position, 
            Entry_Date,
            Personel_Type, 
            Position_Level, 
            toNumOrNull(Position_No), 
            Assign_Task, 
            Actual_Task, 
            Status
        ]);

        res.status(201).json({ message: "Added successfully" });
    } catch (error: unknown) {
        console.error("❌ ADD ERROR:", error);
        res.status(500).json({ error: "Add failed" });
    }
});

// UPDATE EMPLOYEE
app.post('/employees/update', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            id, Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
            Personel_Type, Position_Level, Position_No,
            Assign_Task, Actual_Task, Status
        } = req.body;

        const sql = `UPDATE Employee 
                  SET Name = ?, Birthday = ?, Citizen_id = ?, Tel = ?, 
                      Position = ?, Entry_Date = ?,
                      Personel_Type = ?, Position_Level = ?, Position_No = ?,
                      Assign_Task = ?, Actual_Task = ?, Status = ?
                  WHERE id = ?`;

        const [result] = await pool.execute<ResultSetHeader>(sql, [
            Name, 
            Birthday, 
            toNumOrNull(Citizen_id), // Sanitize to prevent 500 error
            Tel, 
            Position, 
            Entry_Date,
            Personel_Type, 
            Position_Level, 
            toNumOrNull(Position_No), 
            Assign_Task, 
            Actual_Task, 
            Status, 
            toNumOrNull(id)
        ]);

        if (result.affectedRows > 0) {
            res.json({ message: "Updated successfully" });
        } else {
            res.status(404).json({ error: "Employee not found" });
        }
    } catch (error: unknown) {
        console.error("❌ UPDATE ERROR:", error);
        res.status(500).json({ error: "Update failed" });
    }
});

// DELETE EMPLOYEE
app.post('/employees/delete', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM Employee WHERE id = ?', 
            [toNumOrNull(id)]
        );

        if (result.affectedRows > 0) {
            res.json({ message: "Deleted successfully" });
        } else {
            res.status(404).json({ error: "Employee not found" });
        }
    } catch (error: unknown) {
        console.error("❌ DELETE ERROR:", error);
        res.status(500).json({ error: "Delete failed" });
    }
});

app.listen(port, () => {
    console.log(`🚀 API Server running at http://localhost:${port}`);
    initializeDatabase().catch(err => console.error("Initialization Failed:", err));
});