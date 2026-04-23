"use strict";
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use((0, cors_1.default)({
    origin: "http://localhost:8080",
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
/**
 * =========================
 * DB (UNCHANGED)
 * =========================
 */
const caPath = path_1.default.join(process.cwd(), "ca.pem");
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs_1.default.readFileSync(caPath),
        rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
});
/**
 * =========================
 * HELPERS (NO ANY)
 * =========================
 */
function isJwtPayload(obj) {
    if (typeof obj !== "object" || obj === null)
        return false;
    const o = obj;
    return (typeof o.id === "number" &&
        typeof o.username === "string" &&
        typeof o.role === "string");
}
const toNum = (v) => {
    if (v === null || v === undefined || v === "")
        return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
};
const toStr = (v) => {
    if (v === null || v === undefined || v === "")
        return "-";
    return String(v);
};
/**
 * =========================
 * AUTH MIDDLEWARE
 * =========================
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        res.status(401).json({ error: "No token" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!isJwtPayload(decoded)) {
            res.status(403).json({ error: "Invalid token shape" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (_a) {
        res.status(403).json({ error: "Invalid token" });
    }
}
/**
 * =========================
 * LOGIN (FIXED - NO return res.json)
 * =========================
 */
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const [rows] = yield pool.query("SELECT * FROM Users WHERE username = ?", [username]);
        if (rows.length === 0) {
            res.status(401).json({ success: false });
            return;
        }
        const user = rows[0];
        if (user.password !== password) {
            res.status(401).json({ success: false });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role,
        }, JWT_SECRET, { expiresIn: "2h" });
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    }
    catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ success: false });
    }
}));
/**
 * =========================
 * CURRENT USER (UNCHANGED)
 * =========================
 */
app.get("/api/me", authenticateToken, (req, res) => {
    res.json(req.user);
});
/**
 * =========================
 * EMPLOYEES (UNCHANGED SQL)
 * =========================
 */
app.get("/employees", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");
        const offset = (page - 1) * limit;
        let where = "";
        const params = [];
        if (search) {
            where = `
        WHERE Name LIKE ? 
        OR Citizen_id LIKE ?
        OR Position LIKE ?
      `;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const [countRows] = yield pool.query(`SELECT COUNT(*) as total FROM Employee ${where}`, params);
        const total = (_b = (_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
        const [rows] = yield pool.query(`SELECT * FROM Employee ${where} ORDER BY Position_No ASC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        res.json({
            data: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (err) {
        console.error("FETCH ERROR:", err);
        res.status(500).json({ error: "Fetch failed" });
    }
}));
app.get("/employees/all", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield pool.query(`SELECT * FROM Employee ORDER BY id DESC`);
        res.json({
            data: rows,
        });
    }
    catch (err) {
        console.error("FETCH ALL ERROR:", err);
        res.status(500).json({ error: "Fetch all employees failed" });
    }
}));
app.post("/employees/update", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const b = req.body;
        if (!b.id) {
            res.status(400).json({ error: "Missing ID" });
            return;
        }
        yield pool.execute(`UPDATE Employee SET
          Name = ?,
          Birthday = ?,
          Citizen_id = ?,
          Tel = ?,
          Position = ?,
          Entry_Date = ?,
          Personel_Type = ?,
          Position_Level = ?,
          Position_No = ?,
          Assign_Task = ?,
          Actual_Task = ?,
          Status = ?
        WHERE id = ?`, [
            toStr(b.Name),
            toStr(b.Birthday),
            toStr(b.Citizen_id),
            toStr(b.Tel),
            toStr(b.Position),
            toStr(b.Entry_Date),
            toStr(b.Personel_Type),
            toStr(b.Position_Level),
            toNum(b.Position_No),
            toStr(b.Assign_Task),
            toStr(b.Actual_Task),
            toStr(b.Status),
            toNum(b.id),
        ]);
        res.json({ message: "Updated successfully" });
    }
    catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: "Update failed" });
    }
}));
app.post("/employees/delete", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({ error: "Missing ID" });
            return;
        }
        yield pool.execute("DELETE FROM Employee WHERE id = ?", [id]);
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: "Delete failed" });
    }
}));
/**
 * =========================
 * ADD EMPLOYEE (UNCHANGED)
 * =========================
 */
app.post("/employees/add", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const b = req.body;
        yield pool.execute(`INSERT INTO Employee (
          Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
          Personel_Type, Position_Level, Position_No,
          Assign_Task, Actual_Task, Status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            toStr(b.Name),
            toStr(b.Birthday),
            toStr(b.Citizen_id),
            toStr(b.Tel),
            toStr(b.Position),
            toStr(b.Entry_Date),
            toStr(b.Personel_Type),
            toStr(b.Position_Level),
            toNum(b.Position_No),
            toStr(b.Assign_Task),
            toStr(b.Actual_Task),
            toStr((_a = b.Status) !== null && _a !== void 0 ? _a : "Active"),
        ]);
        res.status(201).json({ message: "Added successfully" });
    }
    catch (err) {
        console.error("ADD ERROR:", err);
        res.status(500).json({ error: "Add failed" });
    }
}));
/**
 * =========================
 * START
 * =========================
 */
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
