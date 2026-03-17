import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Toast from '../components/Toast';

export default function TeamView() {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [memberId, setMemberId] = useState('');
    const [availableMembers, setAvailableMembers] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [editName, setEditName] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '' });

    const fetchAvailableMembers = async () => {
        try {
            const usersRes = await axios.get('/api/users?role=Member&available=true');
            setAvailableMembers(usersRes.data || []);
        } catch {
            setAvailableMembers([]);
        }
    };

    const fetchTeam = async () => {
        setLoading(true);
        setError('');
        try {
            const me = await axios.get('/api/auth/me');
            setUserRole(me.data?.user?.role || '');
            const res = await axios.get(`/api/teams/${id}`);
            setTeam(res.data);
            setEditName(res.data?.teamName || '');
            await fetchAvailableMembers();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to load team');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeam(); }, [id]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!memberId) return setError('Please select a member');
        try {
            const res = await axios.post(`/api/teams/${id}/add-member`, { memberId }, { headers: { 'Content-Type': 'application/json' } });
            setTeam(res.data);
            setMemberId('');
            await fetchAvailableMembers();
            setToast({ show: true, title: 'Added', message: 'Member added' });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to add member');
        }
    };

    const handleRemove = async (mId) => {
        if (!confirm('Remove member from team?')) return;
        try {
            const res = await axios.delete(`/api/teams/${id}/remove-member/${mId}`);
            setTeam(res.data);
            await fetchAvailableMembers();
            setToast({ show: true, title: 'Removed', message: 'Member removed' });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to remove member');
        }
    };

    const canManage = ['Admin', 'SuperAdmin'].includes(userRole);

    const handleTeamUpdate = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return setError('Team name is required');
        try {
            setSavingName(true);
            const res = await axios.patch(`/api/teams/${id}`, { teamName: editName.trim() }, { headers: { 'Content-Type': 'application/json' } });
            setTeam(res.data);
            setShowEditForm(false);
            setToast({ show: true, title: 'Updated', message: 'Team details updated' });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to update team');
        } finally {
            setSavingName(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!confirm('Delete this team? Related tasks will be deleted.')) return;
        try {
            await axios.delete(`/api/teams/${id}`);
            setToast({ show: true, title: 'Deleted', message: 'Team deleted successfully' });
            setTimeout(() => window.location.assign('/teams'), 700);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to delete team');
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                marginBottom: '2rem'
            }}>
                <span className="text-gradient">Team Details</span>
            </h1>

            {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            {team && (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    {/* Team Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="avatar avatar-lg">
                                {team.teamName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                    {team.teamName}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9375rem' }}>
                                    Created by {team.createdBy?.name || '-'}
                                </p>
                            </div>
                        </div>
                        {canManage && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setShowEditForm((s) => !s)}>
                                    {showEditForm ? 'Cancel' : 'Edit Name'}
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteTeam}>
                                    Delete Team
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Edit Form */}
                    {canManage && showEditForm && (
                        <form onSubmit={handleTeamUpdate} style={{ 
                            display: 'flex', 
                            gap: '0.75rem', 
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-lg)'
                        }}>
                            <input
                                className="form-control"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Update team name"
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-primary" disabled={savingName}>
                                {savingName ? 'Saving...' : 'Save'}
                            </button>
                        </form>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

                    {/* Members Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Team Members
                        </h3>
                        <span className="badge bg-primary" style={{ fontSize: '0.875rem' }}>
                            {team.members?.length || 0}
                        </span>
                    </div>

                    {/* Add Member Form */}
                    {canManage && (
                        <form onSubmit={handleAdd} style={{ 
                            display: 'flex', 
                            gap: '0.75rem', 
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-lg)',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Add Member:</span>
                            <select 
                                className="form-select" 
                                value={memberId} 
                                onChange={(e) => setMemberId(e.target.value)}
                                style={{ flex: 1, minWidth: '200px' }}
                            >
                                <option value="">Select member to add</option>
                                {availableMembers.map((u) => (
                                    <option key={u._id} value={u._id}>{u.name || u.email}</option>
                                ))}
                            </select>
                            <button className="btn btn-primary">Add</button>
                        </form>
                    )}

                    {/* Members Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '1rem' 
                    }}>
                        {team.members && team.members.length ? team.members.map((m) => (
                            <div 
                                key={m._id} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="avatar avatar-sm">
                                        {(m.name || m.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                                            {m.name || 'Unnamed'}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            {m.email}
                                        </div>
                                    </div>
                                </div>
                                {canManage && (
                                    <button 
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemove(m._id)} 
                                        title="Remove Member"
                                        style={{ padding: '0.375rem 0.75rem' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <p style={{ margin: 0 }}>No members in this team yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Toast show={toast.show} title={toast.title} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
