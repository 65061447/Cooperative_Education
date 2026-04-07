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
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * DETERMINING DIRECTORY
 */
const getSafeDirname = () => {
    if (typeof __dirname !== 'undefined') {
        return __dirname;
    }
    return path.join(process.cwd(), 'api');
};
const _dirname = getSafeDirname();
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
/**
 * DATABASE PATH LOGIC (UPDATED FOR PRODUCTION)
 */
const getDbPath = () => {
    // 1. Check for Environment Variable (Passed from Electron Main)
    if (process.env.DB_PATH) {
        return process.env.DB_PATH;
    }
    // 2. Production Check: When packaged, files move to 'resources' folder
    // We check if we are inside 'win-unpacked' or an installed directory
    const prodPath = path.join(process.cwd(), 'resources', 'mydb');
    if (fs_1.default.existsSync(prodPath)) {
        return prodPath;
    }
    // 3. Development: Look for the DB in the project root
    const devPathExt = path.join(_dirname, '../mydb.db');
    const devPath = path.join(_dirname, '../mydb');
    return fs_1.default.existsSync(devPathExt) ? devPathExt : devPath;
};
const dbPath = getDbPath();
// Explicitly typed DB opener
const openDb = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
});
// --- ROUTES ---
// GET ALL EMPLOYEES
app.get('/employees', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let db = null;
    try {
        db = yield openDb();
        const employees = yield db.all('SELECT * FROM Employee');
        console.log(`📊 Rows fetched: ${employees.length}`);
        res.json(employees);
    }
    catch (error) {
        console.error("❌ FETCH ERROR:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: "Fetch failed: " + message });
    }
    finally {
        if (db)
            yield db.close();
    }
}));
// ADD NEW EMPLOYEE
app.post('/employees/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let db = null;
    try {
        db = yield openDb();
        const { Name, Birthday, Citizen_id, Tel, Position, Entry_Date, Personel_Type, Position_Level, Position_No, Assign_Task, Actual_Task, Status } = req.body;
        const sql = `INSERT INTO Employee (
                    Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
                    Personel_Type, Position_Level, Position_No,
                    Assign_Task, Actual_Task, Status
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        yield db.run(sql, [
            Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
            Personel_Type, Position_Level, Position_No,
            Assign_Task, Actual_Task, Status
        ]);
        res.status(201).json({ message: "Added successfully" });
    }
    catch (error) {
        console.error("❌ ADD ERROR:", error);
        res.status(500).json({ error: "Add failed" });
    }
    finally {
        if (db)
            yield db.close();
    }
}));
// UPDATE EMPLOYEE
app.post('/employees/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let db = null;
    try {
        db = yield openDb();
        const { id, Name, Birthday, Citizen_id, Tel, Position, Entry_Date, Personel_Type, Position_Level, Position_No, Assign_Task, Actual_Task, Status } = req.body;
        const sql = `UPDATE Employee 
                  SET Name = ?, Birthday = ?, Citizen_id = ?, Tel = ?, 
                      Position = ?, Entry_Date = ?,
                      Personel_Type = ?, Position_Level = ?, Position_No = ?,
                      Assign_Task = ?, Actual_Task = ?, Status = ?
                  WHERE id = ?`;
        const result = yield db.run(sql, [
            Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
            Personel_Type, Position_Level, Position_No,
            Assign_Task, Actual_Task, Status, id
        ]);
        if (result.changes && result.changes > 0) {
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
    finally {
        if (db)
            yield db.close();
    }
}));
// DELETE EMPLOYEE
app.post('/employees/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let db = null;
    try {
        db = yield openDb();
        const { id } = req.body;
        const result = yield db.run('DELETE FROM Employee WHERE id = ?', [id]);
        if (result.changes && result.changes > 0) {
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
    finally {
        if (db)
            yield db.close();
    }
}));
// Server Initialization
app.listen(port, () => {
    console.log(`🚀 API Server running at http://localhost:${port}`);
    console.log(`📂 DB Location: ${dbPath}`);
});
