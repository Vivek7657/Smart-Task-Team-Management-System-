import axios from "axios";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../components/Toast";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ show: false, title: "", message: "" });

    const passwordEmpty = password.length === 0;
    const confirmTouched = confirmPassword.length > 0;
    const passwordsMatch = password === confirmPassword;

    const validate = () => {
        if (!password) return "New password is required.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (!confirmPassword) return "Please confirm your new password.";
        if (!passwordsMatch) return "Passwords do not match.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) return setError(validationError);

        try {
            setLoading(true);
            await axios.post(`/api/auth/reset-password?token=${token}`, { password });

            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            delete axios.defaults.headers.common["Authorization"];

            setToast({
                show: true,
                title: "Password Reset Successful",
                message: "Your password has been updated. Redirecting to login...",
            });
            setSuccess(true);

            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed. The link may have expired.");
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
                        🔒
                    </div>
                    <h1 style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Reset Password
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        Choose a new password for your account
                    </p>
                </div>

                {success ? (
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
                            ✓
                        </div>
                        <h2 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: '0.75rem'
                        }}>
                            Password Updated!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                            You can now log in with your new password.
                        </p>
                        <Link to="/login" className="btn btn-primary rounded-pill">
                            Go to Login
                        </Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '1rem' }}>
                            Redirecting automatically in 3 seconds...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '0.75rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.125rem',
                                        padding: '0.25rem'
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className={`form-control ${confirmTouched ? (passwordsMatch ? 'is-valid' : 'is-invalid') : ''}`}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '0.75rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.125rem',
                                        padding: '0.25rem'
                                    }}
                                    tabIndex={-1}
                                >
                                    {showConfirm ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {confirmTouched && (
                                <div className="form-text" style={{ color: passwordsMatch ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '0.5rem' }}>
                                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                                {error}
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-lg rounded-pill w-100"
                            type="submit"
                            disabled={loading || passwordEmpty || !passwordsMatch}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Resetting...
                                </>
                            ) : (
                                'Set New Password'
                            )}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link 
                                to="/login" 
                                style={{ 
                                    color: 'var(--color-primary)', 
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            <Toast
                show={toast.show}
                title={toast.title}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
}
