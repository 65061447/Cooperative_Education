import express from 'express';
import type { Request, Response } from 'express'; 
import sqlite3 from 'sqlite3'; 
import { open, Database } from 'sqlite';
import cors from 'cors';
import helmet from 'helmet';
import * as path from 'path'; 
import fs from 'fs';

/**
 * STRICT TYPE ENVIRONMENT ADAPTATION
 * We avoid 'import.meta.url' to prevent TS compiler errors.
 * Instead, we use process.cwd() which is the project root 
 * where you are running your npm commands.
 */
const getSafeDirname = (): string => {
  // 1. If we are in CommonJS (Electron Production), __dirname is global
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  
  // 2. Local Dev Fallback: Create the path to the 'api' folder manually
  // process.cwd() returns C:\Users\Asus\Desktop\Sso\Cooperative_Education
  return path.join(process.cwd(), 'api');
};

const _dirname = getSafeDirname();
const app = express();
const port = 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

/**
 * DATABASE PATH LOGIC
 */
const getDbPath = (): string => {
  // 1. Production: Path sent by main.cjs via Environment Variable
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }

  // 2. Development: Look for the DB in the project root
  const devPathExt = path.join(_dirname, '../mydb.db');
  const devPath = path.join(_dirname, '../mydb');
  
  return fs.existsSync(devPathExt) ? devPathExt : devPath;
};

const dbPath = getDbPath();

// Explicitly typed DB opener (No 'any')
const openDb = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  return open({
    filename: dbPath,
    driver: sqlite3.Database 
  });
};

// --- ROUTES ---

// GET ALL EMPLOYEES
app.get('/employees', async (_req: Request, res: Response): Promise<void> => {
  let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  try {
    db = await openDb();
    const employees = await db.all('SELECT * FROM Employee');
    console.log(`📊 Rows fetched: ${employees.length}`);
    res.json(employees);
  } catch (error: unknown) {
    console.error("❌ FETCH ERROR:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Fetch failed: " + message });
  } finally {
    if (db) await db.close();
  }
});

// ADD NEW EMPLOYEE
app.post('/employees/add', async (req: Request, res: Response): Promise<void> => {
  let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  try {
    db = await openDb();
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
                  
    await db.run(sql, [
      Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
      Personel_Type, Position_Level, Position_No,
      Assign_Task, Actual_Task, Status
    ]);
    
    res.status(201).json({ message: "Added successfully" });
  } catch (error: unknown) {
    console.error("❌ ADD ERROR:", error);
    res.status(500).json({ error: "Add failed" });
  } finally {
    if (db) await db.close();
  }
});

// UPDATE EMPLOYEE
app.post('/employees/update', async (req: Request, res: Response): Promise<void> => {
  let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  try {
    db = await openDb();
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
    
    const result = await db.run(sql, [
      Name, Birthday, Citizen_id, Tel, Position, Entry_Date, 
      Personel_Type, Position_Level, Position_No,
      Assign_Task, Actual_Task, Status, id
    ]);
    
    if (result.changes && result.changes > 0) {
      res.json({ message: "Updated successfully" });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error: unknown) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ error: "Update failed" });
  } finally {
    if (db) await db.close();
  }
});

// DELETE EMPLOYEE
app.post('/employees/delete', async (req: Request, res: Response): Promise<void> => {
  let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  try {
    db = await openDb();
    const { id } = req.body;
    const result = await db.run('DELETE FROM Employee WHERE id = ?', [id]);
    
    if (result.changes && result.changes > 0) {
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error: unknown) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    if (db) await db.close();
  }
});

// Server Initialization
app.listen(port, () => {
  console.log(`🚀 API Server running at http://localhost:${port}`);
  console.log(`📂 DB Location: ${dbPath}`);
});