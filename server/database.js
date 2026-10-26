const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "projects.db"));

// Store project submissions
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL,
    github_url TEXT NOT NULL,
    demo_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
      CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT
  )
`);

module.exports = db;