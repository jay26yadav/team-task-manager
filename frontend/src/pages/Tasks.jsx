// Author: Jay Prakash
import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask, getProjects, getUsers } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function TaskModal({ task, projects, users, onClose, onSaved }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    project_id: task?.project_id || '',
    assigned_to: task?.assigned_to || ''
  });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null };
      if (isEdit) await updateTask(task.id, payload);
      else await createTask(payload);
      toast.success(isEdit ? 'Task updated!' : 'Task created!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Task' : 'Create New Task'}</h3>
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Title *</label>
            <input placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Task details…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Project *</label>
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} required>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', project_id: '' });
  const { isAdmin, user } = useAuth();

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.project_id) params.project_id = filters.project_id;
    getTasks(params).then(res => setTasks(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([getProjects(), getUsers()]).then(([pRes, uRes]) => {
      setProjects(pRes.data);
      setUsers(uRes.data);
    });
  }, []);

  useEffect(load, [filters]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); toast.success('Task deleted.'); load(); }
    catch { toast.error('Failed to delete.'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { await updateTaskStatus(taskId, status); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const canChangeStatus = (task) => isAdmin || task.assigned_to === user?.id;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks <span>({tasks.length})</span></div>
          <div className="page-sub">Track and manage all assignments</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </button>
        )}
      </div>

      <div className="filter-bar">
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filters.project_id} onChange={e => setFilters({ ...filters, project_id: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>Loading tasks…</span></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 22 }}>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 50 }}>
                    <div className="empty-icon">📋</div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No tasks found.</div>
                  </td></tr>
                ) : tasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ paddingLeft: 22 }}>
                      <div className="fw-600" style={{ maxWidth: 200 }}>{task.title}</div>
                      {task.is_overdue ? <span className="badge badge-overdue" style={{ marginTop: 4 }}>Overdue</span> : ''}
                    </td>
                    <td>{task.project_name || '—'}</td>
                    <td>
                      {task.assigned_to_name ? (
                        <div className="flex">
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>
                            {task.assigned_to_name[0]}
                          </div>
                          {task.assigned_to_name}
                        </div>
                      ) : '—'}
                    </td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>
                      {canChangeStatus(task) ? (
                        <select className="status-select" value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                      )}
                    </td>
                    <td style={{ color: task.is_overdue ? 'var(--danger)' : 'var(--text-2)' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <div className="flex" style={{ gap: 6 }}>
                        {isAdmin && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => { setEditTask(task); setShowModal(true); }} title="Edit">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)} title="Delete">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <TaskModal task={editTask} projects={projects} users={users}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}
