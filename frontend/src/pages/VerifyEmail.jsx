import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verifying your email...");
    const called = useRef(false);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        const token = params.get("token");

        axios
            .get(`/api/auth/verify-email?token=${token}`)
            .then(res => {
                setStatus("success");
                setMessage(res.data.message || "Email verified successfully!");
            })
            .catch(err => {
                setStatus("error");
                setMessage(err.response?.data?.message || "Verification failed");
            });
    }, []);

    return (
        <div className="page-container" style={{ maxWidth: '440px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                {status === "loading" && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="spinner-border" role="status" style={{ color: 'var(--color-primary)', width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <h2 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem'
                        }}>
                            {message}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Please wait while we verify your email address.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
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
                            fontSize: '1.5rem', 
                            fontWeight: 700,
                            color: 'var(--color-success)',
                            marginBottom: '0.75rem'
                        }}>
                            Email Verified!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                            {message}
                        </p>
                        <Link to="/login" className="btn btn-primary rounded-pill">
                            Continue to Login
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            background: 'linear-gradient(135deg, var(--color-danger), var(--color-warning))',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '1.75rem'
                        }}>
                            !
                        </div>
                        <h2 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 700,
                            color: 'var(--color-danger)',
                            marginBottom: '0.75rem'
                        }}>
                            Verification Failed
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                            {message}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/login" className="btn btn-outline-primary rounded-pill">
                                Go to Login
                            </Link>
                            <Link to="/register" className="btn btn-primary rounded-pill">
                                Register Again
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
