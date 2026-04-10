"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
const caPath = process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, 'ca.pem')
    : path.join(process.cwd(), 'ca.pem');
/**
 * 2. DATABASE CONNECTION POOL (Aiven Cloud)
 */
const pool = promise_1.default.createPool({
    host: 'mysql-10dc6cc7-sso-work1.i.aivencloud.com',
    port: 26522,
    user: 'avnadmin',
    password: 'AVNS_fGt0UHgX0OTgyCrISHw',
    database: 'defaultdb',
    ssl: {
        ca: fs_1.default.readFileSync(caPath),
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
const toNumOrNull = (value) => {
    if (typeof value === 'number') {
        return Number.isNaN(value) ? null : value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '')
            return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};
/**
 * 4. DATABASE INITIALIZATION
 */
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);
            yield pool.query(`
            INSERT IGNORE INTO Users (username, password) 
            VALUES ('admin', 'sso1234')
        `);
            console.log("✅ Database and Admin account are ready.");
        }
        catch (err) {
            console.error("❌ Setup Error:", err);
        }
    });
}
// --- API ROUTES ---
// LOGIN
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const [rows] = yield pool.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ success: true });
        }
        else {
            res.status(401).json({ success: false });
        }
    }
    catch (error) {
        res.status(500).json({ success: false });
    }
}));
// GET ALL EMPLOYEES
app.get('/employees', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield pool.query('SELECT * FROM Employee');
        console.log(`📊 Rows fetched from Cloud: ${rows.length}`);
        res.json(rows);
    }
    catch (error) {
        console.error("❌ FETCH ERROR:", error);
        res.status(500).json({ error: "Fetch failed" });
    }
}));
// ADD EMPLOYEE
app.post('/employees/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Name, Birthday, Citizen_id, Tel, Position, Entry_Date, Personel_Type, Position_Level, Position_No, Assign_Task, Actual_Task, Status } = req.body;
        const sql = `INSERT INTO Employee (
                    Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
                    Personel_Type, Position_Level, Position_No,
                    Assign_Task, Actual_Task, Status
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        yield pool.execute(sql, [
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
    }
    catch (error) {
        console.error("❌ ADD ERROR:", error);
        res.status(500).json({ error: "Add failed" });
    }
}));
// UPDATE EMPLOYEE
app.post('/employees/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, Name, Birthday, Citizen_id, Tel, Position, Entry_Date, Personel_Type, Position_Level, Position_No, Assign_Task, Actual_Task, Status } = req.body;
        const sql = `UPDATE Employee 
                  SET Name = ?, Birthday = ?, Citizen_id = ?, Tel = ?, 
                      Position = ?, Entry_Date = ?,
                      Personel_Type = ?, Position_Level = ?, Position_No = ?,
                      Assign_Task = ?, Actual_Task = ?, Status = ?
                  WHERE id = ?`;
        const [result] = yield pool.execute(sql, [
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
        }
        else {
            res.status(404).json({ error: "Employee not found" });
        }
    }
    catch (error) {
        console.error("❌ UPDATE ERROR:", error);
        res.status(500).json({ error: "Update failed" });
    }
}));
// DELETE EMPLOYEE
app.post('/employees/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const [result] = yield pool.execute('DELETE FROM Employee WHERE id = ?', [toNumOrNull(id)]);
        if (result.affectedRows > 0) {
            res.json({ message: "Deleted successfully" });
        }
        else {
            res.status(404).json({ error: "Employee not found" });
        }
    }
    catch (error) {
        console.error("❌ DELETE ERROR:", error);
        res.status(500).json({ error: "Delete failed" });
    }
}));
app.listen(port, () => {
    console.log(`🚀 API Server running at http://localhost:${port}`);
    initializeDatabase().catch(err => console.error("Initialization Failed:", err));
});
