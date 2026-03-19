import express from 'express';
import type { Request, Response } from 'express'; 
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

const openDb = async () => {
  return open({
    filename: './mydb.db', 
    driver: sqlite3.Database
  });
};

// GET ALL
app.get('/employees', async (req: Request, res: Response) => {
  try {
    const db = await openDb();
    const employees = await db.all('SELECT * FROM Employee');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ADD NEW
app.post('/employees/add', async (req: Request, res: Response) => {
  try {
    const db = await openDb();
    const { Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date } = req.body;
    const sql = `INSERT INTO Employee (Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.run(sql, [Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date]);
    res.status(201).json({ message: "Added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Add failed" });
  }
});

// UPDATE (No :id in URL)
app.post('/employees/update', async (req: Request, res: Response) => {
  try {
    const db = await openDb();
    const { id, Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date } = req.body;
    
    const sql = `UPDATE Employee 
                 SET Name = ?, Birthday = ?, Citizen_id = ?, Tel = ?, 
                     Department = ?, Division = ?, Position = ?, Entry_Date = ? 
                 WHERE id = ?`;
    
    const result = await db.run(sql, [Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date, id]);
    
    if (result.changes && result.changes > 0) {
      res.json({ message: "Updated successfully" });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE (No :id in URL)
app.post('/employees/delete', async (req: Request, res: Response) => {
  try {
    const db = await openDb();
    const { id } = req.body;
    const result = await db.run('DELETE FROM Employee WHERE id = ?', [id]);
    
    if (result.changes && result.changes > 0) {
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));