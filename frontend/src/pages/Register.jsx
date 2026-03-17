import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Member' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                name: (form.name || '').trim(),
                email: (form.email || '').trim(),
                password: form.password,
                role: form.role
            };
            if (!payload.name || payload.name.length < 2) throw new Error('Name must be at least 2 characters');
            if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) throw new Error('Please enter a valid email');
            if (!payload.password || payload.password.length < 6) throw new Error('Password must be at least 6 characters');
            if (form.password !== form.confirmPassword) throw new Error('Passwords do not match');

            await axios.post('/api/auth/register', payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            setToast({
                show: true,
                title: 'Verification Email Sent',
                message: 'Account created successfully. Please check your email to verify your account.'
            });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '1.75rem'
                    }}>
                        ✨
                    </div>
                    <h1 style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Create Account
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        Join your team and start managing tasks today
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Name</label>
                        <input 
                            name="name" 
                            value={form.name} 
                            onChange={handleChange} 
                            className="form-control" 
                            placeholder="Your full name"
                            required 
                        />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Email</label>
                        <input 
                            name="email" 
                            type="email" 
                            value={form.email} 
                            onChange={handleChange} 
                            className="form-control" 
                            placeholder="you@example.com"
                            required 
                        />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Password</label>
                        <input 
                            name="password" 
                            type="password" 
                            value={form.password} 
                            onChange={handleChange} 
                            className="form-control" 
                            placeholder="At least 6 characters"
                            required 
                        />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Confirm Password</label>
                        <input 
                            name="confirmPassword" 
                            type="password" 
                            value={form.confirmPassword} 
                            onChange={handleChange} 
                            className="form-control" 
                            placeholder="Re-enter password"
                            required 
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Role</label>
                        <select 
                            name="role" 
                            value={form.role} 
                            onChange={handleChange} 
                            className="form-select"
                        >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <div className="form-text">Choose role for this account (Member by default)</div>
                    </div>

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        className="btn btn-primary btn-lg rounded-pill w-100" 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
            </div>

            <p style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem', 
                color: 'var(--text-secondary)',
                fontSize: '0.9375rem'
            }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign in
                </Link>
            </p>

            <Toast show={toast.show} title={toast.title} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
