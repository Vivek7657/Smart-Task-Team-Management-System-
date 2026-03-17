import axios from 'axios';
import { useEffect, useState } from 'react';

export default function SuperAdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [savingId, setSavingId] = useState('');
    const [deletingId, setDeletingId] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const me = await axios.get('/api/auth/me');
            if (me.data?.user?.role !== 'SuperAdmin') {
                setError('Only SuperAdmin can access this page');
                setUsers([]);
                return;
            }
            const res = await axios.get('/api/users');
            setUsers(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const updateRole = async (userId, nextRole) => {
        try {
            setSavingId(userId);
            await axios.patch(`/api/users/${userId}/role`, { role: nextRole }, { headers: { 'Content-Type': 'application/json' } });
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u)));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to update role');
        } finally {
            setSavingId('');
        }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Delete user "${user.name}"? This may also delete teams/tasks owned by the user.`)) return;
        try {
            setDeletingId(user._id);
            await axios.delete(`/api/users/${user._id}`);
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to delete user');
        } finally {
            setDeletingId('');
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'SuperAdmin': return 'bg-danger';
            case 'Admin': return 'bg-primary';
            default: return 'bg-light';
        }
    };

    return (
        <div className="page-container">
            <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                marginBottom: '2rem'
            }}>
                <span className="text-gradient">User Management</span>
            </h1>

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ marginBottom: 0 }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th style={{ width: 180 }}>Change Role</th>
                                    <th style={{ width: 120 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar avatar-sm">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                        <td>
                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.role === 'SuperAdmin' ? (
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Protected</span>
                                            ) : (
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={user.role}
                                                    disabled={savingId === user._id}
                                                    onChange={(e) => updateRole(user._id, e.target.value)}
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    <option value="Member">Member</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            {user.role === 'SuperAdmin' ? (
                                                <span className="badge bg-light" style={{ fontSize: '0.75rem' }}>Protected</span>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={deletingId === user._id}
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    {deletingId === user._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
