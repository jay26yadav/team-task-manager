// Author: Jay Prakash
const pool = require('../config/db');

// POST /api/tasks - Admin only
const createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, project_id, assigned_to } = req.body;
    if (!title || !project_id) {
      return res.status(400).json({ message: 'Title and project_id are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_date, project_id, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', priority || 'medium', due_date || null, project_id, assigned_to || null, req.user.id]
    );

    res.status(201).json({ message: 'Task created.', taskId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { project_id, status, assigned_to } = req.query;
    let conditions = [];
    let params = [];

    if (req.user.role !== 'admin') {
      conditions.push('(t.assigned_to = ? OR t.created_by = ?)');
      params.push(req.user.id, req.user.id);
    }

    if (project_id) { conditions.push('t.project_id = ?'); params.push(project_id); }
    if (status) { conditions.push('t.status = ?'); params.push(status); }
    if (assigned_to) { conditions.push('t.assigned_to = ?'); params.push(assigned_to); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [tasks] = await pool.query(
      `SELECT t.*, 
        u.name as assigned_to_name, u.email as assigned_to_email,
        p.name as project_name,
        cb.name as created_by_name,
        CASE WHEN t.due_date < CURDATE() AND t.status != 'completed' THEN 1 ELSE 0 END as is_overdue
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users cb ON t.created_by = cb.id
       ${where}
       ORDER BY t.due_date ASC, t.created_at DESC`,
      params
    );

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const [tasks] = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json(tasks[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: pending, in_progress, completed' });
    }

    if (req.user.role !== 'admin') {
      const [tasks] = await pool.query('SELECT assigned_to FROM tasks WHERE id = ?', [req.params.id]);
      if (tasks.length === 0) return res.status(404).json({ message: 'Task not found.' });
      if (tasks[0].assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
      }
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Task status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/tasks/:id - Admin only
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, assigned_to, status } = req.body;
    await pool.query(
      `UPDATE tasks SET title=?, description=?, priority=?, due_date=?, assigned_to=?, status=?
       WHERE id = ?`,
      [title, description, priority, due_date || null, assigned_to || null, status, req.params.id]
    );
    res.json({ message: 'Task updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/tasks/:id - Admin only
const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/dashboard - FIXED: parameterized queries, no SQL injection
const getDashboard = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    // Status counts
    const statusQuery = isAdmin
      ? `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
      : `SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status`;
    const [statusCounts] = await pool.query(statusQuery, isAdmin ? [] : [userId]);

    // Overdue count
    const overdueQuery = isAdmin
      ? `SELECT COUNT(*) as count FROM tasks WHERE due_date < CURDATE() AND status != 'completed'`
      : `SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND due_date < CURDATE() AND status != 'completed'`;
    const [overdue] = await pool.query(overdueQuery, isAdmin ? [] : [userId]);

    // Recent tasks
    const recentQuery = isAdmin
      ? `SELECT t.*, u.name as assigned_to_name, p.name as project_name,
          CASE WHEN t.due_date < CURDATE() AND t.status != 'completed' THEN 1 ELSE 0 END as is_overdue
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
         LEFT JOIN projects p ON t.project_id = p.id
         ORDER BY t.updated_at DESC LIMIT 10`
      : `SELECT t.*, u.name as assigned_to_name, p.name as project_name,
          CASE WHEN t.due_date < CURDATE() AND t.status != 'completed' THEN 1 ELSE 0 END as is_overdue
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
         LEFT JOIN projects p ON t.project_id = p.id
         WHERE t.assigned_to = ?
         ORDER BY t.updated_at DESC LIMIT 10`;
    const [recentTasks] = await pool.query(recentQuery, isAdmin ? [] : [userId]);

    // Project count
    const [projectCount] = await pool.query(
      isAdmin
        ? 'SELECT COUNT(*) as count FROM projects'
        : 'SELECT COUNT(*) as count FROM project_members WHERE user_id = ?',
      isAdmin ? [] : [userId]
    );

    const [memberCount] = await pool.query('SELECT COUNT(*) as count FROM users');

    const stats = { pending: 0, in_progress: 0, completed: 0 };
    statusCounts.forEach(row => { stats[row.status] = row.count; });

    res.json({
      stats: {
        ...stats,
        total: stats.pending + stats.in_progress + stats.completed,
        overdue: overdue[0].count,
        projects: projectCount[0].count,
        members: memberCount[0].count
      },
      recentTasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTaskStatus, updateTask, deleteTask, getDashboard };
