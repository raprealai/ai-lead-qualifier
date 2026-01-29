const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// ===== App =====
const app = express();
const PORT = 4000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Static Frontend =====
const FRONTEND_PATH = path.join(__dirname, 'frontend');
app.use(express.static(FRONTEND_PATH));

// ===== Database =====
const dbPath = path.join(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath);

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

// ===== Health =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Lead Qualifier API' });
});

// ===== Lead Intake (mock scoring + save) =====
app.post('/leads', (req, res) => {
  const { name, email, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  let score = 0;
  let reasons = [];
  const msg = message.toLowerCase();

  if (msg.includes('price') || msg.includes('pricing')) {
    score += 30; reasons.push('Asked about pricing');
  }
  if (msg.includes('demo')) {
    score += 30; reasons.push('Requested a demo');
  }
  if (msg.includes('month') || msg.includes('urgent') || msg.includes('asap')) {
    score += 20; reasons.push('Shows urgency');
  }
  if (msg.includes('budget')) {
    score += 20; reasons.push('Mentions budget');
  }
  if (score > 100) score = 100;

  let intent = 'cold';
  if (score >= 70) intent = 'hot';
  else if (score >= 40) intent = 'warm';

  const summary =
    intent === 'hot'
      ? 'High-intent lead ready for sales follow-up'
      : intent === 'warm'
      ? 'Interested lead that needs nurturing'
      : 'Low-intent lead';

  db.run(
    `
      INSERT INTO leads (name, email, message, score, intent, reasons, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [name, email, message, score, intent, JSON.stringify(reasons), summary],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save lead' });
      res.json({ id: this.lastID, score, intent, reasons, summary });
    }
  );
});

// ===== Admin API =====
app.get('/api/leads', (req, res) => {
  db.all(
    `
      SELECT id, name, email, score, intent, created_at
      FROM leads
      ORDER BY created_at DESC
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch leads' });
      res.json(rows);
    }
  );
});

// ===== Start =====
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ App → http://localhost:${PORT}/index.html`);
  console.log(`✅ Admin → http://localhost:${PORT}/admin.html`);
});

