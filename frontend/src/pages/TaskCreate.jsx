import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

export default function TaskCreate() {
    const [teams, setTeams] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        teamId: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const me = await axios.get('/api/auth/me');
                if (!['Admin', 'SuperAdmin'].includes(me.data?.user?.role)) {
                    navigate('/dashboard');
                    return;
                }
                const res = await axios.get('/api/teams');
                setTeams(res.data || []);
            } catch {
                navigate('/login');
            }
        };
        load();
    }, [navigate]);

    const selectedTeam = useMemo(
        () => teams.find((t) => t._id === form.teamId),
        [teams, form.teamId]
    );

    const availableMembers = useMemo(() => {
        if (!selectedTeam?.members) return [];
        return selectedTeam.members.filter((m) => m.role === 'Member');
    }, [selectedTeam]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'teamId' ? { assignedTo: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!form.title.trim()) throw new Error('Title is required');
            if (!form.teamId) throw new Error('Please select a team');
            if (!form.assignedTo) throw new Error('Please select an assignee');

            await axios.post('/api/tasks', {
                title: form.title.trim(),
                description: form.description.trim(),
                teamId: form.teamId,
                assignedTo: form.assignedTo,
                priority: form.priority,
                dueDate: form.dueDate || null
            });
            setToast({ show: true, title: 'Created', message: 'Task created successfully' });
            setTimeout(() => navigate('/tasks/my'), 700);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to create task');
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
                Create <span className="text-gradient">Task</span>
            </h1>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Title</label>
                        <input 
                            name="title" 
                            className="form-control" 
                            value={form.title} 
                            onChange={handleChange} 
                            placeholder="Task title"
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Description</label>
                        <textarea 
                            name="description" 
                            className="form-control" 
                            rows="3" 
                            value={form.description} 
                            onChange={handleChange}
                            placeholder="Task description (optional)"
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Team</label>
                        <select 
                            name="teamId" 
                            className="form-select" 
                            value={form.teamId} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Select team</option>
                            {teams.map((team) => (
                                <option key={team._id} value={team._id}>{team.teamName}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Assign To</label>
                        <select 
                            name="assignedTo" 
                            className="form-select" 
                            value={form.assignedTo} 
                            onChange={handleChange} 
                            required 
                            disabled={!form.teamId}
                        >
                            <option value="">Select member</option>
                            {availableMembers.map((member) => (
                                <option key={member._id} value={member._id}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                        {form.teamId && availableMembers.length === 0 && (
                            <div className="form-text" style={{ color: 'var(--color-warning)' }}>
                                No members available in this team
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label">Priority</label>
                            <select 
                                name="priority" 
                                className="form-select" 
                                value={form.priority} 
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Due Date</label>
                            <input 
                                name="dueDate" 
                                type="date" 
                                className="form-control" 
                                value={form.dueDate} 
                                onChange={handleChange} 
                            />
                        </div>
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
                            'Create Task'
                        )}
                    </button>
                </form>
            </div>

            <Toast show={toast.show} title={toast.title} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
