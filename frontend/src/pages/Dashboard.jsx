import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [taskSummary, setTaskSummary] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, pending: 0 });
    const [userCounts, setUserCounts] = useState({ total: 0, admins: 0, members: 0, superAdmins: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        const loadDashboard = async () => {
            setLoading(true);
            setError('');
            try {
                const meRes = await axios.get('/api/auth/me');
                const summaryRes = await axios.get('/api/dashboard/summary');
                if (!mounted) return;
                setUser(meRes.data?.user || null);
                setTeams(summaryRes.data?.teams || []);
                setTaskSummary(summaryRes.data?.taskSummary || { total: 0, todo: 0, inProgress: 0, completed: 0, pending: 0 });
                setUserCounts(summaryRes.data?.userCounts || { total: 0, admins: 0, members: 0, superAdmins: 0 });
            } catch (err) {
                if (mounted) setError(err.response?.data?.message || err.message || 'Unable to load dashboard');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadDashboard();
        return () => { mounted = false; };
    }, []);

    const isAdmin = ['Admin', 'SuperAdmin'].includes(user?.role);
    const isSuperAdmin = user?.role === 'SuperAdmin';
    const memberTeam = !isAdmin ? teams[0] : null;

    const completionRate = useMemo(() => {
        if (!taskSummary.total) return 0;
        return Math.round((taskSummary.completed / taskSummary.total) * 100);
    }, [taskSummary]);

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Welcome Header */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: 800, 
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem'
                        }}>
                            Welcome back, <span className="text-gradient">{user?.name}</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Here's what's happening with your tasks today
                        </p>
                    </div>
                    <span className="badge bg-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {isAdmin && (
                    <div className="stat-card">
                        <div className="stat-label">{isSuperAdmin ? 'All Teams' : 'My Teams'}</div>
                        <div className="stat-value">{teams.length}</div>
                    </div>
                )}
                <div className="stat-card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                    <div className="stat-label">{isSuperAdmin ? 'All Tasks' : (isAdmin ? 'My Tasks' : 'Assigned Tasks')}</div>
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{taskSummary.total}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '3px solid var(--color-success)' }}>
                    <div className="stat-label">Completed</div>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{taskSummary.completed}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
                    <div className="stat-label">Pending</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{taskSummary.pending}</div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem'
                }}>
                    Task Progress Overview
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Overall Completion</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '1.25rem' }}>{completionRate}%</span>
                </div>
                <div className="progress" style={{ marginBottom: '2rem' }}>
                    <div className="progress-bar" style={{ width: `${completionRate}%` }} />
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '1rem' 
                }}>
                    <div style={{ 
                        padding: '1rem', 
                        background: 'var(--bg-subtle)', 
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Todo</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{taskSummary.todo}</div>
                    </div>
                    <div style={{ 
                        padding: '1rem', 
                        background: 'var(--color-primary-light)', 
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>In Progress</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{taskSummary.inProgress}</div>
                    </div>
                    <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Completed</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{taskSummary.completed}</div>
                    </div>
                </div>
            </div>

            {/* SuperAdmin User Stats */}
            {isSuperAdmin && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>User Distribution</h3>
                        <Link className="btn btn-outline-secondary btn-sm" to="/superadmin/users">Manage Users</Link>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="badge bg-light" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>Total: {userCounts.total}</span>
                        <span className="badge bg-light" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>Admins: {userCounts.admins}</span>
                        <span className="badge bg-light" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>Members: {userCounts.members}</span>
                        <span className="badge bg-light" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>SuperAdmins: {userCounts.superAdmins}</span>
                    </div>
                </div>
            )}

            {/* Teams Section */}
            {isAdmin ? (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {isSuperAdmin ? 'All Teams' : 'Your Teams'}
                        </h3>
                        <Link className="btn btn-primary btn-sm rounded-pill" to="/teams/create">Create Team</Link>
                    </div>
                    {teams.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {teams.map((team) => (
                                <Link
                                    key={team._id}
                                    to={`/teams/${team._id}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        background: 'var(--bg-subtle)',
                                        borderRadius: 'var(--radius-lg)',
                                        textDecoration: 'none',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    className="team-item"
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{team.teamName}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Created by: {team.createdBy?.name}</div>
                                    </div>
                                    <span className="badge bg-primary">{team.members?.length || 0} members</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p style={{ margin: 0 }}>No teams found. Create your first team!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Your Team</h3>
                    {memberTeam ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Team Name</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{memberTeam.teamName}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Created by {memberTeam.createdBy?.name}</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Team Members</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {memberTeam.members?.length ? memberTeam.members.map((m) => (
                                        <span key={m._id} className="badge bg-light" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                                            {m.name}
                                        </span>
                                    )) : <span style={{ color: 'var(--text-muted)' }}>No members</span>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p style={{ margin: 0 }}>You are not assigned to any team yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
