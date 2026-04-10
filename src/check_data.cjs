const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function check() {
    const caCertPath = path.join(__dirname, '..', 'ca.pem');
    
    const cloudDb = await mysql.createConnection({
        host: 'mysql-10dc6cc7-sso-work1.i.aivencloud.com',
        port: 26522,
        user: 'avnadmin',
        password: 'AVNS_fGt0UHgX0OTgyCrISHw',
        database: 'defaultdb',
        ssl: { ca: fs.readFileSync(caCertPath), rejectUnauthorized: true }
    });

    // Just pull the first 5 rows to verify
    const [rows] = await cloudDb.query("SELECT * FROM Employee LIMIT 5");
    
    console.log("📊 Data Preview from Aiven:");
    console.table(rows); 

    await cloudDb.end();
}

check();