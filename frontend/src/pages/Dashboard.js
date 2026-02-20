import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎉 Welcome, {user?.first_name}!</h1>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/jobs')} style={styles.jobsButton}>
            💼 Browse Jobs
          </button>
          <button onClick={() => navigate('/profile')} style={styles.profileButton}>
            👤 My Profile
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Profile Completion Card */}
        {user?.profile_completion < 100 && (
          <div style={styles.alertCard}>
            <div style={styles.alertIcon}>⚠️</div>
            <div style={styles.alertContent}>
              <h3 style={styles.alertTitle}>Complete Your Profile</h3>
              <p style={styles.alertText}>
                Your profile is {user?.profile_completion}% complete. 
                Complete it to get better job matches!
              </p>
              <button 
                onClick={() => navigate('/profile')}
                style={styles.alertButton}
              >
                Complete Profile →
              </button>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✅ You're logged in!</h2>
          <p style={styles.cardText}>
            Your full-stack authentication is working perfectly!
          </p>
          
          <div style={styles.userInfo}>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Profile Completion:</strong> {user?.profile_completion}%</p>
          </div>

          <div style={styles.nextSteps}>
            <h3 style={styles.nextStepsTitle}>🚀 What's Next?</h3>
            <ul style={styles.list}>
              <li 
                style={styles.listItem}
                onClick={() => navigate('/profile')}
              >
                📝 Complete your profile
              </li>
              <li 
                style={styles.listItem}
                onClick={() => navigate('/jobs')}
              >
                💼 Browse jobs
              </li>
              <li 
                style={styles.listItem}
                onClick={() => navigate('/recommendations')}
              >
                🎯 Get AI-powered job recommendations
              </li>
              <li style={styles.listItemDisabled}>
                📊 Track your applications (coming soon)
              </li>
            </ul>
          </div>
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
    gap: '15px',
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
  profileButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
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
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
  },
  alertCard: {
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: '32px',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#92400e',
    margin: '0 0 8px 0',
  },
  alertText: {
    fontSize: '14px',
    color: '#78350f',
    margin: '0 0 15px 0',
  },
  alertButton: {
    padding: '8px 16px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '24px',
    color: '#10b981',
    marginBottom: '15px',
  },
  cardText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '30px',
  },
  userInfo: {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  nextSteps: {
    marginTop: '30px',
  },
  nextStepsTitle: {
    fontSize: '20px',
    color: '#1f2937',
    marginBottom: '15px',
  },
  list: {
    paddingLeft: '0',
    listStyle: 'none',
  },
  listItem: {
    padding: '12px 16px',
    marginBottom: '8px',
    cursor: 'pointer',
    color: '#667eea',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    ':hover': {
      backgroundColor: '#e5e7eb',
    },
  },
  listItemDisabled: {
    padding: '12px 16px',
    marginBottom: '8px',
    color: '#9ca3af',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
};

export default Dashboard;
