// SQLAlt.js
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * SSL CA (Aiven)
 */
const caPath = path.join(process.cwd(), "ca.pem");

/**
 * DB CONNECTION (one-time use)
 */
const connectionConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
};

async function runAlter() {
  let connection;

  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("🔌 Connected to DB");

    // 🧠 Step 1: Try full fix (with PRIMARY KEY)
    try {
      await connection.query(`
        ALTER TABLE Employee
        MODIFY id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        MODIFY Citizen_id VARCHAR(20),
        MODIFY Position_No INT NULL
      `);

      console.log("✅ Table fully fixed (AUTO_INCREMENT + columns)");

    } catch (err) {
      console.warn("⚠️ Primary key may already exist, trying fallback...");

      // 🧠 Step 2: fallback (if PRIMARY KEY already exists)
      await connection.query(`
        ALTER TABLE Employee
        MODIFY id INT NOT NULL AUTO_INCREMENT,
        MODIFY Citizen_id VARCHAR(20),
        MODIFY Position_No INT NULL
      `);

      console.log("✅ Table fixed (AUTO_INCREMENT applied)");
    }

  } catch (error) {
    console.error("❌ ERROR running ALTER:", error);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

runAlter();