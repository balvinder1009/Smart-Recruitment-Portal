import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';

const Recommendations = () => {
  const [matches, setMatches] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' or 'skills'
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [matchesRes, skillsRes] = await Promise.all([
        aiAPI.getMatchedJobs(),
        aiAPI.getSkillGaps(),
      ]);
      
      setMatches(matchesRes.data.matches || []);
      setSkillGaps(skillsRes.data.skill_gaps || []);
      setError('');
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <p>Analyzing your profile and matching jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🎯 AI-Powered Recommendations</h1>
          <p style={styles.subtitle}>Jobs matched to your skills and experience</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/jobs')} style={styles.jobsButton}>
            💼 All Jobs
          </button>
          <button onClick={() => navigate('/dashboard')} style={styles.dashboardButton}>
            🏠 Dashboard
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              ...styles.tab,
              ...(activeTab === 'matches' ? styles.tabActive : {}),
            }}
          >
            🎯 Job Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            style={{
              ...styles.tab,
              ...(activeTab === 'skills' ? styles.tabActive : {}),
            }}
          >
            📚 Skill Gaps ({skillGaps.length})
          </button>
        </div>

        {/* Job Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            {matches.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔍</div>
                <h3 style={styles.emptyTitle}>No Matches Found</h3>
                <p style={styles.emptyText}>
                  Add more skills to your profile to get better job recommendations!
                </p>
                <button onClick={() => navigate('/profile')} style={styles.button}>
                  Update Profile
                </button>
              </div>
            ) : (
              <div style={styles.matchesGrid}>
                {matches.map((match, index) => {
                  const job = match.job;
                  return (
                    <div key={index} style={styles.matchCard}>
                      {/* Match Score Badge */}
                      <div
                        style={{
                          ...styles.matchScoreBadge,
                          backgroundColor: getMatchScoreColor(match.match_score),
                        }}
                      >
                        {match.match_score}% Match
                      </div>

                      <div
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        style={styles.matchContent}
                      >
                        <h3 style={styles.matchTitle}>{job.title}</h3>
                        <p style={styles.matchCompany}>{job.company_name}</p>

                        <div style={styles.matchMeta}>
                          <span>📍 {job.location.city}</span>
                          <span>💼 {job.job_type}</span>
                          <span>🏢 {job.work_mode}</span>
                        </div>

                        {job.salary && (
                          <div style={styles.matchSalary}>
                            💰 ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                          </div>
                        )}

                        {/* Match Reasons */}
                        {match.match_reasons && match.match_reasons.length > 0 && (
                          <div style={styles.matchReasons}>
                            <h4 style={styles.reasonsTitle}>Why this matches:</h4>
                            <ul style={styles.reasonsList}>
                              {match.match_reasons.map((reason, idx) => (
                                <li key={idx} style={styles.reasonItem}>
                                  ✓ {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${job.id}`);
                          }}
                          style={styles.viewJobButton}
                        >
                          View Job Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Skill Gaps Tab */}
        {activeTab === 'skills' && (
          <div style={styles.skillsContainer}>
            <div style={styles.skillsHeader}>
              <h2 style={styles.skillsTitle}>Skills to Learn</h2>
              <p style={styles.skillsSubtitle}>
                These skills are in high demand for jobs similar to your profile
              </p>
            </div>

            {skillGaps.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✅</div>
                <h3 style={styles.emptyTitle}>Great Job!</h3>
                <p style={styles.emptyText}>
                  Your skills match well with available jobs!
                </p>
              </div>
            ) : (
              <div style={styles.skillGapsGrid}>
                {skillGaps.map((skillGap, index) => (
                  <div key={index} style={styles.skillGapCard}>
                    <div style={styles.skillGapHeader}>
                      <h3 style={styles.skillGapName}>{skillGap.name}</h3>
                      <span style={styles.skillGapCount}>
                        {skillGap.count} jobs
                      </span>
                    </div>
                    <p style={styles.skillGapDescription}>
                      Required in {skillGap.jobs.slice(0, 3).join(', ')}
                      {skillGap.jobs.length > 3 && ` and ${skillGap.jobs.length - 3} more`}
                    </p>
                    <div style={styles.skillGapActions}>
                      <button style={styles.learnButton}>
                        📚 Find Courses
                      </button>
                      <button
                        onClick={() => navigate('/profile')}
                        style={styles.addButton}
                      >
                        + Add to Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
    padding: '30px 40px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    color: '#1f2937',
    margin: '0 0 5px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#6b7280',
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '30px',
    borderBottom: '2px solid #e5e7eb',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#667eea',
    borderBottomColor: '#667eea',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
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
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  matchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px',
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 16px',
    color: 'white',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 1,
  },
  matchContent: {
    padding: '24px',
  },
  matchTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    marginRight: '100px',
  },
  matchCompany: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '16px',
  },
  matchMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  matchSalary: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '16px',
  },
  matchReasons: {
    backgroundColor: '#f0f4ff',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  reasonsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  reasonsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  reasonItem: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '6px',
  },
  viewJobButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  skillsContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
  },
  skillsHeader: {
    marginBottom: '30px',
  },
  skillsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  skillsSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
  },
  skillGapsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  skillGapCard: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
  },
  skillGapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  skillGapName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  skillGapCount: {
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  skillGapDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
  },
  skillGapActions: {
    display: 'flex',
    gap: '8px',
  },
  learnButton: {
    flex: 1,
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
};

export default Recommendations;
