/*
 * Team Task Manager — Backend API
 * Author: Jay Prakash
 * Stack: Node.js, Express, MySQL
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();

// ✅ CORS - allow Vercel frontend
app.use(cors({
  origin: [
    'https://team-task-manager-git-main-jay26yadavs-projects.vercel.app',
    'https://team-task-manager-n67ipc69a-jay26yadavs-projects.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // Handle preflight

app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Team Task Manager API is running ✅',
    author: 'Jay Prakash',
    version: '1.0.0',
    stack: 'Node.js + Express + MySQL'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Team Task Manager API running on port ${PORT} | Author: Jay Prakash`);
});