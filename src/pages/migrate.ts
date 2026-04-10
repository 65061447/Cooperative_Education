import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function migrateData() {
    console.log("🚀 Starting Migration...");

    // 1. Connect to Local SQLite
    const localDb = await open({
        filename: path.join(__dirname, 'mydb.db'),
        driver: sqlite3.Database
    });

    // 2. Connect to Aiven MySQL (Using your Service URI)
    const cloudDb = await mysql.createConnection({
        uri: 'YOUR_AIVEN_SERVICE_URI_HERE',
        ssl: {
            ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        }
    });

    try {
        // 3. Fetch data from SQLite
        const employees = await localDb.all('SELECT * FROM Employee');
        console.log(`📦 Found ${employees.length} records in SQLite.`);

        // 4. Loop and Insert into Aiven
        for (const emp of employees) {
            const sql = `INSERT INTO Employee (
                Name, Birthday, Citizen_id, Tel, Position, Entry_Date,
                Personel_Type, Position_Level, Position_No,
                Assign_Task, Actual_Task, Status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            await cloudDb.execute(sql, [
                emp.Name, emp.Birthday, emp.Citizen_id, emp.Tel, emp.Position, emp.Entry_Date,
                emp.Personel_Type, emp.Position_Level, emp.Position_No,
                emp.Assign_Task, emp.Actual_Task, emp.Status
            ]);
        }

        console.log("✅ Migration Complete! All data is now in the cloud.");
    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        await localDb.close();
        await cloudDb.end();
    }
}

migrateData();