// Author: Jay Prakash
import { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject, getUsers, addMember, removeMember, getProjectById } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EMOJIS = ['📁', '🚀', '⚡', '🔥', '💎', '🎯', '🛠️', '🌟', '📊', '🎨'];

function CreateModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject(form);
      toast.success('Project created!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>New Project</h3>
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Project Name *</label>
            <input placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="What is this project about?" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageModal({ project, onClose, onSaved }) {
  const [allUsers, setAllUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    Promise.all([getUsers(), getProjectById(project.id)]).then(([uRes, pRes]) => {
      setAllUsers(uRes.data);
      setMembers(pRes.data.members || []);
    });
  }, [project.id]);

  const handleAdd = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await addMember(project.id, selectedUser);
      toast.success('Member added!');
      const pRes = await getProjectById(project.id);
      setMembers(pRes.data.members || []);
      setSelectedUser('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setLoading(false); }
  };

  const handleRemove = async (userId) => {
    try {
      await removeMember(project.id, userId);
      toast.success('Member removed.');
      setMembers(m => m.filter(x => x.id !== userId));
    } catch { toast.error('Failed.'); }
  };

  const nonMembers = allUsers.filter(u => !members.find(m => m.id === u.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Manage Members — {project.name}</h3>

        <div style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label>Add Member</label>
            <div className="flex" style={{ gap: 10 }}>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ flex: 1 }}>
                <option value="">Select a user…</option>
                {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!selectedUser || loading}>Add</button>
            </div>
          </div>
        </div>

        <div>
          <div className="form-group">
            <label>Current Members ({members.length})</label>
          </div>
          {members.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-3)', paddingBottom: 10 }}>No members yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: 8 }}>
                  <div className="member-avatar">{m.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.email}</div>
                  </div>
                  <span className={`badge badge-${m.role}`}>{m.role}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemove(m.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [manageProject, setManageProject] = useState(null);
  const { isAdmin } = useAuth();

  const load = () => {
    setLoading(true);
    getProjects().then(res => setProjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This will remove all tasks in this project.`)) return;
    try { await deleteProject(id); toast.success('Project deleted.'); load(); }
    catch { toast.error('Failed to delete.'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading projects…</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects <span>({projects.length})</span></div>
          <div className="page-sub">Manage your team's workspaces</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">📁</div><p>No projects yet. Create your first project to get started.</p></div></div>
      ) : (
        <div className="project-grid">
          {projects.map((p, i) => (
            <div className="project-card" key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div className="project-icon">{EMOJIS[i % EMOJIS.length]}</div>
                {isAdmin && (
                  <div className="project-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setManageProject(p)} title="Manage members">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="project-name">{p.name}</div>
              <div className="project-desc">{p.description || 'No description provided.'}</div>
              <div className="project-meta">
                <div className="project-meta-item">
                  <strong>{p.member_count}</strong>Members
                </div>
                <div className="project-meta-item">
                  <strong>{p.task_count}</strong>Tasks
                </div>
                <div className="project-meta-item">
                  <strong style={{ fontSize: 11 }}>{new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</strong>Created
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); }} />}
      {manageProject && <ManageModal project={manageProject} onClose={() => setManageProject(null)} onSaved={load} />}
    </div>
  );
}
