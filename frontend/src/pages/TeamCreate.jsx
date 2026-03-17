import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

export default function TeamCreate() {
    const [teamName, setTeamName] = useState('');
    const [availableMembers, setAvailableMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAvailableMembers = async () => {
            try {
                const res = await axios.get('/api/users?role=Member&available=true');
                setAvailableMembers(res.data || []);
            } catch {
                setAvailableMembers([]);
            }
        };

        fetchAvailableMembers();
    }, []);

    const toggleMember = (id) => {
        setSelectedMembers((prev) => (
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!teamName || teamName.trim().length < 2) throw new Error('Team name must be at least 2 characters');

            const payload = { teamName: teamName.trim(), members: selectedMembers };

            const res = await axios.post('/api/teams', payload, { headers: { 'Content-Type': 'application/json' } });
            setToast({ show: true, title: 'Created', message: 'Team created successfully' });
            setTimeout(() => navigate(`/teams/${res.data._id}`), 700);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to create team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                marginBottom: '2rem'
            }}>
                Create <span className="text-gradient">Team</span>
            </h1>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Team Name</label>
                        <input 
                            className="form-control" 
                            value={teamName} 
                            onChange={e => setTeamName(e.target.value)} 
                            placeholder="Enter team name"
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Add Members (optional)</label>
                        {availableMembers.length ? (
                            <div style={{ 
                                border: '1px solid var(--border-color)', 
                                borderRadius: 'var(--radius-lg)', 
                                maxHeight: '220px', 
                                overflowY: 'auto',
                                padding: '0.5rem'
                            }}>
                                {availableMembers.map((member) => (
                                    <div 
                                        key={member._id}
                                        onClick={() => toggleMember(member._id)}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'background var(--transition-fast)',
                                            background: selectedMembers.includes(member._id) ? 'var(--color-primary-light)' : 'transparent'
                                        }}
                                    >
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={selectedMembers.includes(member._id)}
                                            onChange={() => toggleMember(member._id)}
                                            style={{ margin: 0 }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{member.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                padding: '1rem', 
                                background: 'var(--bg-subtle)', 
                                borderRadius: 'var(--radius-lg)',
                                color: 'var(--text-muted)',
                                fontSize: '0.9375rem'
                            }}>
                                No unassigned members available right now.
                            </div>
                        )}
                    </div>

                    {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                    <button 
                        className="btn btn-primary btn-lg rounded-pill w-100" 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creating...
                            </>
                        ) : (
                            'Create Team'
                        )}
                    </button>
                </form>
            </div>

            <Toast show={toast.show} title={toast.title} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
