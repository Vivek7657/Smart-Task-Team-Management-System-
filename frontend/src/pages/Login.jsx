import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleResendVerification = async () => {
        try {
            await axios.post('/api/auth/resend-verification', {
                email: form.email.trim()
            });
            setToast({
                show: true,
                title: "Email Sent",
                message: "Verification email sent again."
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to resend verification email"
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error('Please enter a valid email');
            if (!form.password) throw new Error('Please enter your password');

            const res = await axios.post('/api/auth/login', { email: form.email.trim(), password: form.password }, {
                headers: { 'Content-Type': 'application/json' }
            });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user?.role || '');
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            window.dispatchEvent(new Event('authChanged'));
            setToast({ show: true, title: 'Success', message: 'Logged in successfully' });
            setTimeout(() => navigate('/dashboard'), 700);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '440px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '1.75rem'
                    }}>
                        👋
                    </div>
                    <h1 style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        Enter your credentials to access your dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Password</label>
                        <input 
                            name="password" 
                            type="password" 
                            value={form.password} 
                            onChange={handleChange} 
                            className="form-control" 
                            placeholder="Enter your password"
                            required 
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                            {error}
                            {error.toLowerCase().includes("verify") && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={handleResendVerification}
                                    >
                                        Resend Verification Email
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button 
                        className="btn btn-primary btn-lg rounded-pill w-100" 
                        type="submit" 
                        disabled={loading}
                        style={{ marginBottom: '1rem' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <Link 
                            to="/forgot-password" 
                            style={{ 
                                color: 'var(--color-primary)', 
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </form>
            </div>

            <p style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem', 
                color: 'var(--text-secondary)',
                fontSize: '0.9375rem'
            }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign up
                </Link>
            </p>

            <Toast show={toast.show} title={toast.title} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
