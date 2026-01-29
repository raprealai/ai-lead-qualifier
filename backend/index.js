require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4000;

// ABSOLUTE frontend path (no ambiguity)
const FRONTEND_PATH = path.join(__dirname, 'frontend');
console.log('Serving frontend from:', FRONTEND_PATH);

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use('/app', express.static(FRONTEND_PATH));

// Explicit route (NO root confusion)
app.get('/app', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Lead Qualifier API'
  });
});

// Lead intake endpoint (mock AI scoring)
app.post('/leads', (req, res) => {
  const { message } = req.body;

  let score = 0;
  let reasons = [];

  if (message.toLowerCase().includes('price')) {
    score += 30;
    reasons.push('Asked about pricing');
  }
  if (message.toLowerCase().includes('demo')) {
    score += 30;
    reasons.push('Requested a demo');
  }
  if (message.toLowerCase().includes('month')) {
    score += 20;
    reasons.push('Shows urgency');
  }

  let intent = 'cold';
  if (score >= 70) intent = 'hot';
  else if (score >= 40) intent = 'warm';

  res.json({
    score,
    intent,
    reasons,
    summary: intent === 'hot'
      ? 'High-intent lead ready for sales follow-up'
      : 'Lower intent lead'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Frontend available at http://localhost:${PORT}/app`);
});

