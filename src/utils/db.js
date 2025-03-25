// src/utils/db.js
const sqlite3 = require('sqlite3').verbose();
const dbFile = process.env.DATABASE_FILE || 'call_logs.db';

const db = new sqlite3.Database(dbFile, (err) => {
     if (err) {
          console.error("Error opening database", err);
     } else {
          db.run(`CREATE TABLE IF NOT EXISTS call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      callSid TEXT,
      phoneNumber TEXT,
      status TEXT,
      patientResponse TEXT,
      recordingUrl TEXT,
      llmReply TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
          console.log("Connected to SQLite database.");
     }
});

module.exports = db;
