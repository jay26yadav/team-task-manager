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
  origin: function(origin, callback) {
    if (!origin || origin.includes('jay26yadavs-projects.vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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