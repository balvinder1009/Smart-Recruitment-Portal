import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJob(id);
      setJob(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load job details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min, max, currency, period) => {
    if (!min || !max) return 'Not specified';
    return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}/${period}`;
  };

  const handleApply = () => {
    navigate(`/jobs/${id}/apply`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>😕 Job Not Found</h2>
          <p>{error || 'This job posting is no longer available'}</p>
          <button onClick={() => navigate('/jobs')} style={styles.backButton}>
            ← Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/jobs')} style={styles.backLink}>
            ← Back to Jobs
          </button>
        </div>
        <div style={styles.headerActions}>
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
        {/* Job Header Card */}
        <div style={styles.jobHeader}>
          <div style={styles.jobHeaderLeft}>
            <div style={styles.badges}>
              {job.featured && <span style={styles.featuredBadge}>⭐ Featured</span>}
              {job.urgent && <span style={styles.urgentBadge}>🔥 Urgent</span>}
              {job.is_open ? (
                <span style={styles.openBadge}>✓ Open</span>
              ) : (
                <span style={styles.closedBadge}>✕ Closed</span>
              )}
            </div>
            
            <h1 style={styles.jobTitle}>{job.title}</h1>
            
            <div style={styles.companyInfo}>
              <h2 style={styles.companyName}>{job.company_name}</h2>
              <div style={styles.jobMeta}>
                <span style={styles.metaItem}>
                  📍 {job.location.city}, {job.location.state || job.location.country}
                </span>
                <span style={styles.metaItem}>💼 {job.job_type}</span>
                <span style={styles.metaItem}>🏢 {job.work_mode}</span>
                <span style={styles.metaItem}>📊 {job.experience_level}</span>
              </div>
            </div>

            {job.salary && (
              <div style={styles.salary}>
                💰 {formatSalary(
                  job.salary.min,
                  job.salary.max,
                  job.salary.currency,
                  job.salary.period
                )}
              </div>
            )}
          </div>

          <div style={styles.jobHeaderRight}>
            {user?.role === 'jobseeker' && job.is_open && (
              <button onClick={handleApply} style={styles.applyButton}>
                Apply Now
              </button>
            )}
            <button style={styles.saveButton}>💾 Save Job</button>
            <button style={styles.shareButton}>📤 Share</button>
            
            <div style={styles.statsBox}>
              <div style={styles.stat}>
                <span style={styles.statValue}>{job.views}</span>
                <span style={styles.statLabel}>Views</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{job.applications_count}</span>
                <span style={styles.statLabel}>Applications</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{job.number_of_openings}</span>
                <span style={styles.statLabel}>Openings</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Left Column - Main Content */}
          <div style={styles.mainColumn}>
            {/* Description */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Job Description</h2>
              <p style={styles.description}>{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>✅ Key Responsibilities</h2>
                <ul style={styles.list}>
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} style={styles.listItem}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🎯 Requirements</h2>
                
                {job.requirements.education && (
                  <div style={styles.requirement}>
                    <strong>Education:</strong> {job.requirements.education.level}
                    {job.requirements.education.required && (
                      <span style={styles.requiredBadge}> (Required)</span>
                    )}
                  </div>
                )}
                
                {job.requirements.experience && (
                  <div style={styles.requirement}>
                    <strong>Experience:</strong> {job.requirements.experience.min} - {job.requirements.experience.max} years
                  </div>
                )}
                
                {job.requirements.other && job.requirements.other.length > 0 && (
                  <ul style={styles.list}>
                    {job.requirements.other.map((req, index) => (
                      <li key={index} style={styles.listItem}>{req}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Required Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🛠️ Required Skills</h2>
                <div style={styles.skillsContainer}>
                  {job.required_skills.map((skillItem, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.skillBadge,
                        ...(skillItem.required ? styles.skillRequired : styles.skillOptional)
                      }}
                    >
                      <span>{skillItem.skill?.display_name || skillItem.skill?.name}</span>
                      {skillItem.proficiency_level && (
                        <span style={styles.skillLevel}>
                          {' '}• Level {skillItem.proficiency_level}
                        </span>
                      )}
                      {skillItem.required && <span style={styles.requiredStar}> *</span>}
                    </div>
                  ))}
                </div>
                <p style={styles.note}>* Required skills</p>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🎁 Benefits & Perks</h2>
                <div style={styles.benefitsGrid}>
                  {job.benefits.map((benefit, index) => (
                    <div key={index} style={styles.benefitItem}>
                      <span style={styles.benefitIcon}>✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div style={styles.sidebar}>
            {/* Quick Info */}
            <div style={styles.card}>
              <h3 style={styles.sidebarTitle}>📌 Quick Info</h3>
              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Job Type:</span>
                  <span style={styles.infoValue}>{job.job_type}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Work Mode:</span>
                  <span style={styles.infoValue}>{job.work_mode}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Experience:</span>
                  <span style={styles.infoValue}>{job.experience_level}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Industry:</span>
                  <span style={styles.infoValue}>{job.industry}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Category:</span>
                  <span style={styles.infoValue}>{job.category}</span>
                </div>
                {job.location.allows_remote && (
                  <div style={styles.infoItem}>
                    <span style={styles.remoteOk}>🌐 Remote work available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div style={styles.card}>
              <h3 style={styles.sidebarTitle}>📅 Timeline</h3>
              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Posted:</span>
                  <span style={styles.infoValue}>
                    {job.days_since_posted === 0
                      ? 'Today'
                      : `${job.days_since_posted} days ago`}
                  </span>
                </div>
                {job.application_deadline && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Deadline:</span>
                    <span style={styles.infoValue}>
                      {job.days_until_deadline} days left
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div style={styles.card}>
              <h3 style={styles.sidebarTitle}>📍 Location</h3>
              <div style={styles.locationInfo}>
                <p style={styles.locationText}>
                  {job.location.city && `${job.location.city}, `}
                  {job.location.state && `${job.location.state}, `}
                  {job.location.country}
                </p>
              </div>
            </div>

            {/* Company Info */}
            {job.employer && (
              <div style={styles.card}>
                <h3 style={styles.sidebarTitle}>🏢 About the Company</h3>
                <div style={styles.companyCard}>
                  <h4 style={styles.companyCardName}>{job.employer.name}</h4>
                  <p style={styles.companyCardInfo}>
                    {job.employer.company || 'View more jobs from this employer'}
                  </p>
                  <button style={styles.viewCompanyButton}>
                    View All Jobs →
                  </button>
                </div>
              </div>
            )}

            {/* Share */}
            <div style={styles.card}>
              <h3 style={styles.sidebarTitle}>📤 Share This Job</h3>
              <div style={styles.shareButtons}>
                <button style={styles.shareBtn}>📧 Email</button>
                <button style={styles.shareBtn}>🔗 Copy Link</button>
                <button style={styles.shareBtn}>💬 WhatsApp</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {user?.role === 'jobseeker' && job.is_open && (
          <div style={styles.bottomCTA}>
            <div style={styles.ctaContent}>
              <div>
                <h3 style={styles.ctaTitle}>Ready to apply?</h3>
                <p style={styles.ctaText}>
                  Join {job.applications_count} other applicants who have already applied
                </p>
              </div>
              <button onClick={handleApply} style={styles.ctaButton}>
                Apply Now →
              </button>
            </div>
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
    padding: '20px 40px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {},
  backLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  dashboardButton: {
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
  errorContainer: {
    textAlign: 'center',
    padding: '100px 20px',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '20px',
  },
  jobHeader: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '40px',
  },
  jobHeaderLeft: {
    flex: 1,
  },
  jobHeaderRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: '200px',
  },
  badges: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  featuredBadge: {
    padding: '6px 14px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  urgentBadge: {
    padding: '6px 14px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  openBadge: {
    padding: '6px 14px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  closedBadge: {
    padding: '6px 14px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 16px 0',
  },
  companyInfo: {
    marginBottom: '20px',
  },
  companyName: {
    fontSize: '24px',
    color: '#667eea',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  jobMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  metaItem: {
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: '500',
  },
  salary: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981',
    marginTop: '16px',
  },
  applyButton: {
    padding: '16px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
  saveButton: {
    padding: '12px 20px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  shareButton: {
    padding: '12px 20px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  statsBox: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-around',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#4b5563',
  },
  list: {
    paddingLeft: '24px',
    margin: 0,
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#4b5563',
    marginBottom: '12px',
  },
  requirement: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#4b5563',
    marginBottom: '12px',
  },
  requiredBadge: {
    color: '#ef4444',
    fontWeight: '600',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
  },
  skillBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  skillRequired: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  skillOptional: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  skillLevel: {
    fontSize: '12px',
    opacity: 0.8,
  },
  requiredStar: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  note: {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic',
    margin: 0,
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    color: '#4b5563',
  },
  benefitIcon: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  remoteOk: {
    fontSize: '14px',
    color: '#10b981',
    fontWeight: '600',
  },
  locationInfo: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  locationText: {
    fontSize: '15px',
    color: '#4b5563',
    margin: 0,
  },
  companyCard: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  companyCardName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  companyCardInfo: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 16px 0',
  },
  viewCompanyButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '1px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    width: '100%',
  },
  shareButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  shareBtn: {
    padding: '10px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
  },
  bottomCTA: {
    backgroundColor: '#667eea',
    borderRadius: '16px',
    padding: '40px',
    marginTop: '40px',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
  },
  ctaContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 8px 0',
  },
  ctaText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.9)',
    margin: 0,
  },
  ctaButton: {
    padding: '16px 40px',
    backgroundColor: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '700',
  },
};

export default JobDetail;
