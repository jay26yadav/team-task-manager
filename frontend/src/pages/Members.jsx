// Author: Jay Prakash
import { useEffect, useState } from 'react';
import { getUsers } from '../api';

const ROLE_COLORS = { admin: 'var(--accent2)', member: 'var(--text-2)' };

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getUsers().then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = filtered.filter(u => u.role?.toLowerCase() === 'admin');
  const members = filtered.filter(u => u.role?.toLowerCase() === 'member');

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading members…</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Team Members <span>({users.length})</span></div>
          <div className="page-sub">Everyone on your platform</div>
        </div>
        <div className="filter-bar" style={{ margin: 0 }}>
          <input placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ minWidth: 200 }} />
        </div>
      </div>

      {admins.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Admins</div>
            <span className="badge badge-admin">{admins.length}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--accent2)', fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <div className="flex">
                        <div className="member-avatar" style={{ background: 'linear-gradient(135deg, var(--accent2), #a78bfa)' }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="fw-600">{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.email}</td>
                    <td><span className="badge badge-admin">admin</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Members</div>
          <span className="badge badge-member">{members.length}</span>
        </div>
        {members.length === 0 ? (
          <div className="empty"><div className="empty-icon">👥</div><p>No members found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <div className="flex">
                        <div className="member-avatar">{u.name[0].toUpperCase()}</div>
                        <span className="fw-600">{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.email}</td>
                    <td><span className="badge badge-member">member</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
