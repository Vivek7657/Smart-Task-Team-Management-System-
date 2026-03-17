import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MyTasks() {
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [editingTaskId, setEditingTaskId] = useState('');
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: ''
    });

    const isAdmin = ['Admin', 'SuperAdmin'].includes(userRole);

    const fetchTasks = async (nextFilters = filters) => {
        setLoading(true);
        setError('');
        try {
            const me = await axios.get('/api/auth/me');
            setUserRole(me.data?.user?.role || '');

            const params = new URLSearchParams();
            if (nextFilters.status) params.append('status', nextFilters.status);
            if (nextFilters.priority) params.append('priority', nextFilters.priority);

            const res = await axios.get(`/api/tasks/my${params.toString() ? `?${params.toString()}` : ''}`);
            setTasks(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const onFilterChange = (e) => {
        const next = { ...filters, [e.target.name]: e.target.value };
        setFilters(next);
        fetchTasks(next);
    };

    const updateStatus = async (taskId, status) => {
        try {
            await axios.patch(`/api/tasks/${taskId}/status`, { status }, { headers: { 'Content-Type': 'application/json' } });
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to update status');
        }
    };

    const startEdit = (task) => {
        setEditingTaskId(task._id);
        setEditForm({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
        });
    };

    const saveEdit = async (taskId) => {
        try {
            await axios.patch(`/api/tasks/${taskId}`, {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                priority: editForm.priority,
                dueDate: editForm.dueDate || null
            }, { headers: { 'Content-Type': 'application/json' } });
            setEditingTaskId('');
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to update task');
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await axios.delete(`/api/tasks/${taskId}`);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Unable to delete task');
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'priority-high';
            case 'Medium': return 'priority-medium';
            case 'Low': return 'priority-low';
            default: return 'bg-light';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-completed';
            case 'In Progress': return 'status-in-progress';
            case 'Todo': return 'status-todo';
            default: return 'bg-light';
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    <span className="text-gradient">My Tasks</span>
                </h1>
                {isAdmin && (
                    <Link to="/tasks/create" className="btn btn-primary rounded-pill">
                        + Create Task
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8125rem' }}>Filter by Status</label>
                        <select name="status" className="form-select" value={filters.status} onChange={onFilterChange}>
                            <option value="">All Statuses</option>
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8125rem' }}>Filter by Priority</label>
                        <select name="priority" className="form-select" value={filters.priority} onChange={onFilterChange}>
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.length ? tasks.map((task) => (
                    <div key={task._id} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    {task.title}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                    <span style={{ 
                                        fontSize: '0.8125rem', 
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        Team: <strong style={{ color: 'var(--text-secondary)' }}>{task.teamId?.teamName || 'No team'}</strong>
                                    </span>
                                    {isAdmin && (
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            Assigned to: <strong style={{ color: 'var(--text-secondary)' }}>{task.assignedTo?.name || 'Unknown'}</strong>
                                        </span>
                                    )}
                                </div>
                                {task.description && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0, lineHeight: 1.6 }}>
                                        {task.description}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className={`badge ${getPriorityClass(task.priority)}`} style={{ fontSize: '0.75rem' }}>
                                    {task.priority}
                                </span>
                                <span className="badge bg-light" style={{ fontSize: '0.75rem' }}>
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                </span>
                                {!isAdmin ? (
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto', minWidth: '130px' }}
                                        value={task.status}
                                        onChange={(e) => updateStatus(task._id, e.target.value)}
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                ) : (
                                    <span className={`badge ${getStatusClass(task.status)}`} style={{ fontSize: '0.75rem' }}>
                                        {task.status}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                                {editingTaskId === task._id ? (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Title</label>
                                                <input
                                                    className="form-control"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                    placeholder="Task title"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Priority</label>
                                                <select
                                                    className="form-select"
                                                    value={editForm.priority}
                                                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Due Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={editForm.dueDate}
                                                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                placeholder="Task description"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(task._id)}>Save Changes</button>
                                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingTaskId('')}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(task)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(task._id)}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )) : !loading && (
                    <div className="empty-state glass-panel">
                        <div className="empty-state-icon">📋</div>
                        <p style={{ margin: 0, fontSize: '1rem' }}>No tasks found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
