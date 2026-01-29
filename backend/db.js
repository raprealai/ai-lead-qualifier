const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create / open database file
const dbPath = path.join(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath);

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      score INTEGER,
      intent TEXT,
      reasons TEXT,
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;

