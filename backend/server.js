/*
 * Team Task Manager — Team Task Manager Backend API
 * Author: Jay Prakash
 * Stack: Node.js, Express, MySQL
 */
import express from 'express';
import cors from 'cors';


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();

app.use(cors());
app.use(express.json());
app.options('*', cors());



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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Team Task Manager API running on port ${PORT} | Author: Jay Prakash`);
});
