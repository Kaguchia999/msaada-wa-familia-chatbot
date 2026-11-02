const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'logs.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadLogs() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveLogs(logs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

app.get('/api/logs', (req, res) => {
  const logs = loadLogs();
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const logs = loadLogs();
  const newEntry = {
    id: Date.now(),
    childName: req.body.childName || 'Unknown',
    seizureDate: req.body.seizureDate || new Date().toISOString(),
    seizureTime: req.body.seizureTime || '',
    duration: req.body.duration || '',
    description: req.body.description || '',
    location: req.body.location || '',
    medicationTaken: req.body.medicationTaken || 'No',
    medicationType: req.body.medicationType || '',
    medicationTime: req.body.medicationTime || '',
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };
  logs.unshift(newEntry);
  saveLogs(logs);
  res.json({ success: true, entry: newEntry });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
