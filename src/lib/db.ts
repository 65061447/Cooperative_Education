import Database from 'better-sqlite3';
import path from 'path';

// This tells VS Code to find the database file in your project folder
const dbPath = path.resolve(process.cwd(), 'mydb.db');
const db = new Database(dbPath);

export default db;