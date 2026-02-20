import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Applications = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Mock applications data (in reality, this would come from API)
  const applications = [
    {
      id: 1,
      job_title: 'Data Scientist',
      company_name: 'Analytics Pro',
      status: 'submitted',
      applied_date: '2 hours ago',
      location: 'New York, NY',
    }
  ];

  const getStatusStyle = (status) => {
    const styles = {
      submitted: { bg: '#dbeafe', color: '#1e40af', label: '📝 Submitted' },
      'under-review': { bg: '#fef3c7', color: '#92400e', label: '👀 Under Review' },
      shortlisted: { bg: '#d1fae5', color: '#065f46', label: '⭐ Shortlisted' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: '✕ Rejected' },
    };
    return styles[status] || styles.submitted;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>📋 My Applications</h1>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/jobs')} style={styles.jobsButton}>
            💼 Browse Jobs
          </button>
          <button onClick={() => navigate('/dashboard')} style={styles.dashboardButton}>
            🏠 Dashboard
          </button>
          <button onClick={() => navigate('/profile')} style={styles.profileButton}>
            👤 Profile
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{applications.length}</h3>
              <p style={styles.statLabel}>Total Applications</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👀</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>0</h3>
              <p style={styles.statLabel}>Under Review</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>0</h3>
              <p style={styles.statLabel}>Shortlisted</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📞</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>0</h3>
              <p style={styles.statLabel}>Interviews</p>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Applications</h2>
            <button onClick={() => navigate('/jobs')} style={styles.applyButton}>
              + Apply to More Jobs
            </button>
          </div>

          {applications.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>No Applications Yet</h3>
              <p style={styles.emptyText}>
                You haven't applied to any jobs yet. Start browsing and apply to positions that match your skills!
              </p>
              <button onClick={() => navigate('/jobs')} style={styles.browseButton}>
                Browse Jobs →
              </button>
            </div>
          ) : (
            <div style={styles.applicationsList}>
              {applications.map((app) => {
                const statusStyle = getStatusStyle(app.status);
                return (
                  <div key={app.id} style={styles.applicationCard}>
                    <div style={styles.appLeft}>
                      <div style={styles.appIcon}>💼</div>
                      <div style={styles.appInfo}>
                        <h3 style={styles.appTitle}>{app.job_title}</h3>
                        <p style={styles.appCompany}>{app.company_name}</p>
                        <p style={styles.appLocation}>📍 {app.location}</p>
                      </div>
                    </div>
                    <div style={styles.appRight}>
                      <div
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {statusStyle.label}
                      </div>
                      <p style={styles.appDate}>Applied {app.applied_date}</p>
                      <button
                        onClick={() => navigate(`/jobs/${app.id}`)}
                        style={styles.viewButton}
                      >
                        View Job →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Card */}
        <div style={styles.tipsCard}>
          <h3 style={styles.tipsTitle}>💡 Application Tips</h3>
          <ul style={styles.tipsList}>
            <li>Check your email regularly for responses from employers</li>
            <li>Follow up if you haven't heard back in 1-2 weeks</li>
            <li>Keep your profile updated with latest skills and experience</li>
            <li>Prepare for potential interviews by researching the company</li>
            <li>Be patient - hiring processes can take time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 40px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    color: '#1f2937',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  jobsButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  dashboardButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  profileButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {},
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  applyButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '24px',
    color: '#1f2937',
    marginBottom: '10px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '30px',
    maxWidth: '500px',
    margin: '0 auto 30px',
  },
  browseButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  applicationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  appLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  appIcon: {
    fontSize: '40px',
    backgroundColor: 'white',
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {},
  appTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  appCompany: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  appLocation: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  appRight: {
    textAlign: 'right',
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'inline-block',
  },
  appDate: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '1px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: '12px',
    padding: '30px',
  },
  tipsTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
  },
  tipsList: {
    paddingLeft: '24px',
    margin: 0,
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.8',
  },
};

export default Applications;
