import express from 'express';
import type { Request, Response } from 'express'; 
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Helper function to open the database
const openDb = async () => {
  return open({
    filename: './mydb.db', // <--- MAKE SURE THIS MATCHES YOUR FILENAME
    driver: sqlite3.Database
  });
};

// 1. The "Select *" Route for your Employees
app.get('/employees', async (req: Request, res: Response) => {
  try {
    const db = await openDb();
    // Your "Select *" logic
    const employees = await db.all('SELECT * FROM Employee');
    res.json(employees);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database connection failed. Check if table 'Employee' exists." });
  }
});

// 2. A simple test route to check if the API is awake
app.get('/', (req: Request, res: Response) => {
  res.send('API is running and sprinting! 🏃‍♂️');
});

app.listen(port, () => {
  console.log(`🚀 Server is sprinting at http://localhost:${port}`);
});

app.get('/employees/single', async (req: Request, res: Response) => {
  const db = await openDb();
  const employeeId = req.query.id;
  // We use ? to prevent SQL Injection (Safety First!)
  const employee = await db.get('SELECT * FROM Employee WHERE id = ?', [employeeId]);
  
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

app.post('/employees/add', async (req: Request, res: Response) => {
  const db = await openDb();
  const { Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date } = req.body;

  const sql = `INSERT INTO Employee (Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.run(sql, [Name, Birthday, Citizen_id, Tel, Department, Division, Position, Entry_Date]);

  res.status(201).json({ message: "Success!" });
});