import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("/api/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '440px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                {!sent ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                background: 'linear-gradient(135deg, var(--color-warning), var(--color-primary))',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '1.75rem'
                            }}>
                                🔑
                            </div>
                            <h1 style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem'
                            }}>
                                Forgot Password?
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                                No worries! Enter your email and we'll send you a recovery link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                className="btn btn-primary btn-lg rounded-pill w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Recovery Email'
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            background: 'linear-gradient(135deg, var(--color-success), var(--color-primary))',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '1.75rem'
                        }}>
                            ✉️
                        </div>
                        <h2 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 700,
                            color: 'var(--color-success)',
                            marginBottom: '0.75rem'
                        }}>
                            Email Sent!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                            If an account exists with this email, a password recovery link has been sent.
                        </p>
                        <Link to="/login" className="btn btn-outline-primary rounded-pill">
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>

            {!sent && (
                <p style={{ 
                    textAlign: 'center', 
                    marginTop: '1.5rem', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9375rem'
                }}>
                    Remember your password?{' '}
                    <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            )}
        </div>
    );
}
