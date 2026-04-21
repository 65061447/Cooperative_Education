import express from "express";
import type { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const port = 3000;

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));

app.use(helmet());
app.use(express.json());

/**
 * =========================
 * DB (UNCHANGED)
 * =========================
 */
const caPath = path.join(process.cwd(), "ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
});

/**
 * =========================
 * TYPES (NO ANY USED)
 * =========================
 */
interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

interface EmployeeBody {
  id?: number;
  Name?: unknown;
  Birthday?: unknown;
  Citizen_id?: unknown;
  Tel?: unknown;
  Position?: unknown;
  Entry_Date?: unknown;
  Personel_Type?: unknown;
  Position_Level?: unknown;
  Position_No?: unknown;
  Assign_Task?: unknown;
  Actual_Task?: unknown;
  Status?: unknown;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  role: string;
  password: string;
}

/**
 * =========================
 * HELPERS (NO ANY)
 * =========================
 */
function isJwtPayload(obj: unknown): obj is JwtPayload {
  if (typeof obj !== "object" || obj === null) return false;

  const o = obj as Record<string, unknown>;

  return (
    typeof o.id === "number" &&
    typeof o.username === "string" &&
    typeof o.role === "string"
  );
}

const toNum = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const toStr = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
};

/**
 * =========================
 * AUTH MIDDLEWARE
 * =========================
 */
function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isJwtPayload(decoded)) {
      res.status(403).json({ error: "Invalid token shape" });
      return;
    }

    req.user = decoded;
    next();

  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

/**
 * =========================
 * LOGIN (FIXED - NO return res.json)
 * =========================
 */
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false });
      return;
    }

    const user = rows[0];

    if (user.password !== password) {
      res.status(401).json({ success: false });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * =========================
 * CURRENT USER (UNCHANGED)
 * =========================
 */
app.get("/api/me", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

/**
 * =========================
 * EMPLOYEES (UNCHANGED SQL)
 * =========================
 */
app.get("/employees", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const offset = (page - 1) * limit;

    let where = "";
    const params: (string | number)[] = [];

    if (search) {
      where = `
        WHERE Name LIKE ? 
        OR Citizen_id LIKE ?
        OR Position LIKE ?
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) as total FROM Employee ${where}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM Employee ${where} ORDER BY Position_No ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});
app.get(
  "/employees/all",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM Employee ORDER BY id DESC`
      );

      res.json({
        data: rows,
      });

    } catch (err) {
      console.error("FETCH ALL ERROR:", err);
      res.status(500).json({ error: "Fetch all employees failed" });
    }
  }
);
app.post(
  "/employees/update",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const b = req.body as EmployeeBody;

      if (!b.id) {
        res.status(400).json({ error: "Missing ID" });
        return;
      }

      await pool.execute(
        `UPDATE Employee SET
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
        WHERE id = ?`,
        [
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
        ]
      );

      res.json({ message: "Updated successfully" });

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ error: "Update failed" });
    }
  }
);  
app.post(
  "/employees/delete",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.body as { id: number };

      if (!id) {
        res.status(400).json({ error: "Missing ID" });
        return;
      }

      await pool.execute(
        "DELETE FROM Employee WHERE id = ?",
        [id]
      );

      res.json({ message: "Deleted successfully" });

    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ error: "Delete failed" });
    }
  }
);
/**
 * =========================
 * ADD EMPLOYEE (UNCHANGED)
 * =========================
 */
app.post(
  "/employees/add",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const b = req.body as EmployeeBody;

      await pool.execute(
        `INSERT INTO Employee (
          Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
          Personel_Type, Position_Level, Position_No,
          Assign_Task, Actual_Task, Status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
          toStr(b.Status ?? "Active"),
        ]
      );

      res.status(201).json({ message: "Added successfully" });

    } catch (err) {
      console.error("ADD ERROR:", err);
      res.status(500).json({ error: "Add failed" });
    }
  }
);

/**
 * =========================
 * START
 * =========================
 */
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});