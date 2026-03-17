import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MyTeams() {
    const [teams, setTeams] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTeams = async () => {
        setLoading(true);
        setError('');
        try {
            const me = await axios.get('/api/auth/me');
            const role = me.data?.user?.role || '';
            setUserRole(role);
            const url = role === 'SuperAdmin' ? '/api/teams' : '/api/teams?mine=true';
            const res = await axios.get(url);
            setTeams(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to load teams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeams(); }, []);

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    <span className="text-gradient">Teams</span>
                </h1>
                {['Admin', 'SuperAdmin'].includes(userRole) && (
                    <Link to="/teams/create" className="btn btn-primary rounded-pill">
                        + Create Team
                    </Link>
                )}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Teams Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {teams && teams.length ? teams.map((t) => (
                    <Link 
                        to={`/teams/${t._id}`} 
                        key={t._id} 
                        className="glass-card card-interactive"
                        style={{ 
                            padding: '1.5rem', 
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div className="avatar">
                                {t.teamName.charAt(0).toUpperCase()}
                            </div>
                            <span className="badge bg-primary" style={{ fontSize: '0.8125rem' }}>
                                {t.members?.length || 0} members
                            </span>
                        </div>
                        <h3 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem'
                        }}>
                            {t.teamName}
                        </h3>
                        <div style={{ 
                            marginTop: 'auto', 
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                View Details
                            </span>
                            <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>→</span>
                        </div>
                    </Link>
                )) : !loading && (
                    <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
                        <div className="empty-state-icon">👥</div>
                        <p style={{ margin: 0, fontSize: '1rem' }}>No teams found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
