// Author: Jay Prakash
const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const { signup, login, getMe } = require('../controllers/authController');
const {
  createProject, getProjects, getProjectById, deleteProject,
  addMember, removeMember, getAllUsers
} = require('../controllers/projectController');
const {
  createTask, getTasks, getTaskById, updateTaskStatus,
  updateTask, deleteTask, getDashboard
} = require('../controllers/taskController');

// ── Auth Routes ──────────────────────────────────────
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);

// ── User Routes ──────────────────────────────────────
router.get('/users', authenticate, getAllUsers);

// ── Project Routes ───────────────────────────────────
router.post('/projects', authenticate, adminOnly, createProject);
router.get('/projects', authenticate, getProjects);
router.get('/projects/:id', authenticate, getProjectById);
router.delete('/projects/:id', authenticate, adminOnly, deleteProject);
router.post('/projects/:id/members', authenticate, adminOnly, addMember);
router.delete('/projects/:id/members/:userId', authenticate, adminOnly, removeMember);

// ── Task Routes ──────────────────────────────────────
router.post('/tasks', authenticate, adminOnly, createTask);
router.get('/tasks', authenticate, getTasks);
router.get('/tasks/:id', authenticate, getTaskById);
router.patch('/tasks/:id/status', authenticate, updateTaskStatus);
router.put('/tasks/:id', authenticate, adminOnly, updateTask);
router.delete('/tasks/:id', authenticate, adminOnly, deleteTask);

// ── Dashboard Route ──────────────────────────────────
router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
