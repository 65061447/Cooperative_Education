// 002-add-user-role.js
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
 * DB CONNECTION CONFIG
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

async function runMigration() {
  let connection;

  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("🔌 Connected to DB");

    /**
     * 🧠 Step 1: Check if 'role' column exists
     */
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Users LIKE 'role'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE Users
        ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'User'
      `);

      console.log("✅ 'role' column added to Users table");
    } else {
      console.log("ℹ️ 'role' column already exists");
    }

    /**
     * 🧠 Step 2: Ensure admin has correct role
     */
    const [adminResult] = await connection.query(`
      UPDATE Users
      SET role = 'Admin'
      WHERE username = 'admin'
    `);

    console.log(`✅ Admin role ensured (${adminResult.affectedRows} row(s))`);

    /**
     * 🧠 Step 3: Clean invalid/null roles
     */
    const [cleanupResult] = await connection.query(`
      UPDATE Users
      SET role = 'User'
      WHERE role IS NULL OR role = ''
    `);

    console.log(`✅ Cleaned invalid roles (${cleanupResult.affectedRows} row(s))`);

    console.log("🎉 Migration completed successfully");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

runMigration();