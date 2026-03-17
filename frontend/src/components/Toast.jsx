import { useEffect } from 'react';

export default function Toast({ show, onClose, title = 'Success', message = '' }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose && onClose(), 4000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div style={styles.container}>
      <div style={styles.toast}>
        <div style={styles.icon}>✓</div>

        <div style={styles.content}>
          <div style={styles.header}>
            <strong style={styles.title}>{title}</strong>
            <button style={styles.closeBtn} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.body}>{message}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    width: 'min(92vw, 400px)',
    animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  },

  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    borderRadius: '1.5rem',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: '1rem',
    background: 'linear-gradient(135deg, #14b8a6, #34d399)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)'
  },

  content: {
    flex: 1
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },

  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.3px'
  },

  closeBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: 24,
    lineHeight: 1,
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    transition: 'color 0.2s ease'
  },

  body: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.5,
    fontWeight: 500
  }
};