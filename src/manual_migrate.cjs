const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function migrate() {
    console.log("🚀 Starting Migration (All fields except ID are nullable)...");

    const dbPath = path.join(__dirname, '..', 'mydb.db');
    const caCertPath = path.join(__dirname, '..', 'ca.pem');

    const connectionConfig = {
        host: 'mysql-10dc6cc7-sso-work1.i.aivencloud.com', 
        port: 26522,
        user: 'avnadmin',
        password: 'AVNS_fGt0UHgX0OTgyCrISHw',
        database: 'defaultdb',
        ssl: {
            ca: fs.readFileSync(caCertPath),
            rejectUnauthorized: true
        },
        connectTimeout: 30000
    };

    let cloudDb;
    try {
        cloudDb = await mysql.createConnection(connectionConfig);
        console.log("✅ Connected to Aiven MySQL.");
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
        return;
    }

    try {
        console.log("🛠️ Rebuilding 'Employee' table with flexible schema...");
        await cloudDb.query(`DROP TABLE IF EXISTS Employee`);
        
        // Only 'id' is NOT NULL now. Everything else can be NULL.
        await cloudDb.query(`
            CREATE TABLE Employee (
                id INT NOT NULL PRIMARY KEY,
                Name VARCHAR(255) NULL,
                Citizen_id BIGINT NULL,
                Birthday VARCHAR(100) NULL,
                Tel VARCHAR(50) NULL,
                Position VARCHAR(255) NULL,
                Entry_Date VARCHAR(100) NULL,
                Personel_Type VARCHAR(255) NULL,
                Position_No VARCHAR(255) NULL,
                Position_Level VARCHAR(255) NULL,
                Assign_Task TEXT NULL,
                Actual_Task TEXT NULL,
                Status VARCHAR(100) NULL
            )
        `);
    } catch (err) {
        console.error("❌ Table Creation Error:", err.message);
        await cloudDb.end();
        return;
    }

    const sqliteDb = new sqlite3.Database(dbPath);

    sqliteDb.all("SELECT * FROM Employee", async (err, rows) => {
        if (err) {
            console.error("❌ SQLite Read Error:", err.message);
            await cloudDb.end();
            return;
        }

        console.log(`📦 Found ${rows.length} records. Processing...`);

        try {
            const sql = `INSERT INTO Employee (
                id, Name, Citizen_id, Birthday, Tel, Position, 
                Entry_Date, Personel_Type, Position_No, Position_Level, 
                Assign_Task, Actual_Task, Status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            // Helper to turn empty strings or undefined into proper SQL NULLs
            const sanitize = (val) => (val === '' || val === undefined || val === null) ? null : val;

            for (const row of rows) {
                await cloudDb.execute(sql, [
                    sanitize(row.id),
                    sanitize(row.Name),
                    sanitize(row.Citizen_id),
                    sanitize(row.Birthday),
                    sanitize(row.Tel),
                    sanitize(row.Position),
                    sanitize(row.Entry_Date),
                    sanitize(row.Personel_Type),
                    sanitize(row.Position_No),
                    sanitize(row.Position_Level),
                    sanitize(row.Assign_Task),
                    sanitize(row.Actual_Task),
                    sanitize(row.Status)
                ]);
            }
            console.log("✅ SUCCESS! 70 records migrated with null-safety.");
        } catch (insertErr) {
            console.error("❌ Insertion Error:", insertErr.message);
        } finally {
            await cloudDb.end();
            sqliteDb.close();
            console.log("👋 Connections closed.");
        }
    });
}

migrate();