import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [profileError, setProfileError] = useState('');
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const isAdmin = user && ['Admin', 'SuperAdmin'].includes(user.role);
  const isSuperAdmin = user && user.role === 'SuperAdmin';
  const brandTarget = user ? '/dashboard' : '/';

  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('token');
      if (!token) { setUser(null); return; }
      axios.get('/api/auth/me')
        .then((res) => {
          setUser(res.data.user);
          setNewName(res.data.user?.name || '');
          localStorage.setItem('userRole', res.data.user.role);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('userRole');
        });
    };
    fetchUser();
    window.addEventListener('authChanged', fetchUser);
    return () => window.removeEventListener('authChanged', fetchUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showProfile) return;
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
        setEditingName(false);
        setProfileError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return setProfileError('Name is required');
    try {
      setSavingName(true);
      setProfileError('');
      const res = await axios.patch('/api/users/me', { name: newName.trim() }, { headers: { 'Content-Type': 'application/json' } });
      setUser(res.data.user);
      setEditingName(false);
      window.dispatchEvent(new Event('authChanged'));
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Unable to update name');
    } finally {
      setSavingName(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light app-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand text-gradient" to={brandTarget}>
          SmartTask
        </Link>

        <div className="d-flex align-items-center gap-2 ms-auto me-2 order-lg-last navbar-right-cluster" ref={profileRef}>
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="theme-toggle-btn"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {user && (
            <>
              <button
                type="button"
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
                onClick={() => setShowProfile((s) => !s)}
              >
                <div className="text-end d-none d-lg-block">
                  <div className="fw-semibold mb-0 lh-1" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
                  <div className="small lh-1 mt-1" style={{ color: 'var(--text-muted)' }}>{user.role}</div>
                </div>
                <div className="avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold d-none d-lg-block"
                onClick={handleLogout}
              >
                Logout
              </button>

              {showProfile && (
                <div className="profile-card">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="avatar avatar-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div className="small" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-4 p-2 rounded-3" style={{ background: 'var(--bg-subtle)' }}>
                    <span className="badge bg-primary">{user.role}</span>
                    <span className="small" style={{ color: 'var(--text-muted)' }}>Account Role</span>
                  </div>

                  <div className="d-lg-none mb-3">
                    <button className="btn btn-outline-danger btn-sm w-100 rounded-pill fw-semibold" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>

                  {editingName ? (
                    <div className="profile-edit-box">
                      <label className="form-label small fw-semibold mb-2">Edit Name</label>
                      <input
                        className="form-control form-control-sm mb-2"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                      />
                      {profileError && <div className="text-danger small mb-2 fw-medium">{profileError}</div>}
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-primary btn-sm flex-fill" onClick={handleSaveName} disabled={savingName}>
                          {savingName ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm flex-fill"
                          onClick={() => { setEditingName(false); setProfileError(''); setNewName(user.name || ''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => setEditingName(true)}>
                        Edit Name
                      </button>
                      <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => setShowProfile(false)}>
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse order-lg-0" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user && <li className="nav-item"><Link className="nav-link" to="/dashboard">Home</Link></li>}
            {isAdmin && <li className="nav-item"><Link className="nav-link" to="/teams">Teams</Link></li>}
            {user && <li className="nav-item"><Link className="nav-link" to="/tasks/my">Tasks</Link></li>}
            {isSuperAdmin && <li className="nav-item"><Link className="nav-link" to="/superadmin/users">Users</Link></li>}
            {!user && (
              <li className="nav-item">
                <Link className="nav-link nav-auth-btn me-2" to="/register">Register</Link>
              </li>
            )}
            {!user && (
              <li className="nav-item">
                <Link className="nav-link nav-auth-btn" to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
