// Author: Jay Prakash
import { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import { useAuth } from '../context/AuthContext';

const icons = {
  total: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  pending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  inprog: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  done: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  overdue: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
};

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading dashboard…</span></div>;

  const { stats, recentTasks } = data;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋
          </div>
          <div className="page-sub">{today}</div>
        </div>
        <span className={`badge badge-${user?.role}`}>{user?.role}</span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">{icons.total}</div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">{icons.pending}</div>
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">{icons.inprog}</div>
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.in_progress}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">{icons.done}</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">{icons.overdue}</div>
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{stats.overdue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">{icons.projects}</div>
          <div className="stat-label">Projects</div>
          <div className="stat-value">{stats.projects}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Activity</div>
          <span className="text-muted" style={{fontSize: 12}}>Last 10 updates</span>
        </div>
        {recentTasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <p>No tasks yet. Ask an admin to create projects and assign tasks.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <span className="fw-600">{task.title}</span>
                      {task.is_overdue ? <span className="badge badge-overdue" style={{marginLeft: 8}}>Overdue</span> : ''}
                    </td>
                    <td>{task.project_name}</td>
                    <td>{task.assigned_to_name || '—'}</td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td><span className={`badge badge-${task.status}`}>{STATUS_LABEL[task.status]}</span></td>
                    <td style={{color: task.is_overdue ? 'var(--danger)' : 'var(--text-2)'}}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{textAlign: 'center', padding: '8px 0', fontSize: 11, color: 'var(--text-3)'}}>
        Built by Jay Prakash · Team Task Manager
      </div>
    </div>
  );
}
