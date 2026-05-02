// Author: Jay Prakash
const pool = require('../config/db');

// POST /api/projects - Admin only
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || '', req.user.id]
    );

    await pool.query(
      'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Project created.', projectId: result.insertId, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, u.name as creator_name,
        COUNT(DISTINCT pm.user_id) as member_count,
        COUNT(DISTINCT t.id) as task_count
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT p.*, u.name as creator_name,
        COUNT(DISTINCT pm2.user_id) as member_count,
        COUNT(DISTINCT t.id) as task_count
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm2 ON p.id = pm2.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    }

    const [projects] = await pool.query(query, params);
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const [projects] = await pool.query(
      `SELECT p.*, u.name as creator_name FROM projects p
       LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const [members] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role FROM users u
       JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = ?`,
      [req.params.id]
    );

    res.json({ ...projects[0], members });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/projects/:id - Admin only
const deleteProject = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/projects/:id/members - Admin only
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required.' });

    const [users] = await pool.query('SELECT id, name FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });

    await pool.query(
      'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
      [req.params.id, userId]
    );

    res.json({ message: `${users[0].name} added to project.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/projects/:id/members/:userId - Admin only
const removeMember = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/users - FIXED: includes created_at
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createProject, getProjects, getProjectById, deleteProject, addMember, removeMember, getAllUsers };
