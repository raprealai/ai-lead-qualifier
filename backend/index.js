require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Lead Qualifier API'
  });
});

// Lead intake endpoint
app.post('/leads', (req, res) => {
  console.log('Incoming lead:', req.body);

  res.json({
    received: true,
    lead: req.body,
    score: null,
    intent: "unscored"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

