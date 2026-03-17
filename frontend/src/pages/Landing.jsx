import { Link } from 'react-router-dom';

const features = [
  {
    icon: '👥',
    title: 'Team Management',
    desc: 'Create and manage teams, add or remove members, keep team ownership clear, and maintain one-member-one-team consistency.'
  },
  {
    icon: '📋',
    title: 'Task Assignment & Tracking',
    desc: 'Assign tasks with priority and due dates, filter workloads, and track progress from Todo to Completed through role-based dashboards.'
  },
  {
    icon: '📊',
    title: 'Progress Analytics',
    desc: 'Monitor team performance with visual progress indicators and completion rates across all your projects.'
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    desc: 'Secure access control with Member, Admin, and SuperAdmin roles to manage permissions effectively.'
  }
];

export default function Landing() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '4rem 1rem', marginBottom: '4rem' }}>
        <div style={{ 
          display: 'inline-block', 
          padding: '0.5rem 1rem', 
          background: 'var(--color-primary-light)', 
          borderRadius: 'var(--radius-full)',
          marginBottom: '1.5rem'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Streamline Your Workflow
          </span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
          fontWeight: 800, 
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em'
        }}>
          Smart Task & Team<br />
          <span className="text-gradient">Management</span>
        </h1>

        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '600px', 
          margin: '0 auto 2.5rem',
          lineHeight: 1.7
        }}>
          Experience next-level productivity. Manage teams efficiently. 
          Assign tasks seamlessly. Track progress effortlessly in a 
          beautiful, modern workspace.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg rounded-pill" style={{ padding: '1rem 2rem' }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-outline-secondary btn-lg rounded-pill" style={{ padding: '1rem 2rem' }}>
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            marginBottom: '0.75rem'
          }}>
            Core <span className="text-gradient">Features</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
            Everything you need to manage teams and tasks efficiently
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {features.map((item) => (
            <div 
              key={item.title} 
              className="glass-card"
              style={{ padding: '2rem' }}
            >
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)'
              }}>
                {item.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                marginBottom: '0.75rem'
              }}>
                {item.title}
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                margin: 0
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="glass-panel" 
        style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          marginBottom: '2rem'
        }}
      >
        <h2 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 800, 
          color: 'var(--text-primary)',
          marginBottom: '1rem'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          maxWidth: '500px', 
          margin: '0 auto 2rem',
          fontSize: '1rem'
        }}>
          Join teams of all sizes using SmartTask to stay organized, 
          productive, and in control of their workflow.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg rounded-pill" style={{ padding: '1rem 2.5rem' }}>
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
