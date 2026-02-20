import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: '',
    phone: user?.phone || '',
    linkedin_url: '',
    portfolio_url: '',
    availability: '',
    expected_salary: '',
    screening_answers: {},
  });

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const response = await jobAPI.getJob(id);
      setJob(response.data);
      
      // Initialize screening answers
      if (response.data.screening_questions) {
        const answers = {};
        response.data.screening_questions.forEach((q, index) => {
          answers[index] = '';
        });
        setFormData(prev => ({ ...prev, screening_answers: answers }));
      }
    } catch (err) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleScreeningAnswer = (index, value) => {
    setFormData({
      ...formData,
      screening_answers: {
        ...formData.screening_answers,
        [index]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (!formData.cover_letter.trim()) {
      setError('Please write a cover letter');
      setSubmitting(false);
      return;
    }

    if (formData.cover_letter.length < 100) {
      setError('Cover letter should be at least 100 characters');
      setSubmitting(false);
      return;
    }

    // For now, show success message (backend endpoint will be created later)
    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    }, 1000);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <p>Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>Job Not Found</h2>
          <button onClick={() => navigate('/jobs')} style={styles.button}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✅</div>
          <h1 style={styles.successTitle}>Application Submitted!</h1>
          <p style={styles.successText}>
            Your application for <strong>{job.title}</strong> at <strong>{job.company_name}</strong> has been successfully submitted.
          </p>
          <p style={styles.successSubtext}>
            The employer will review your application and contact you if they're interested.
          </p>
          <div style={styles.successButtons}>
            <button onClick={() => navigate('/jobs')} style={styles.primaryButton}>
              Browse More Jobs
            </button>
            <button onClick={() => navigate('/applications')} style={styles.secondaryButton}>
              View My Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate(`/jobs/${id}`)} style={styles.backLink}>
            ← Back to Job
          </button>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/dashboard')} style={styles.dashboardButton}>
            🏠 Dashboard
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.grid}>
          {/* Left Column - Form */}
          <div style={styles.formColumn}>
            <div style={styles.card}>
              <h1 style={styles.pageTitle}>Apply for this Position</h1>
              <p style={styles.pageSubtitle}>
                Fill out the form below to submit your application
              </p>

              {error && (
                <div style={styles.errorBox}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Personal Information */}
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>📋 Personal Information</h2>
                  
                  <div style={styles.infoDisplay}>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Name:</label>
                      <span style={styles.infoValue}>{user?.full_name}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Email:</label>
                      <span style={styles.infoValue}>{user?.email}</span>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>LinkedIn Profile (Optional)</label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Portfolio/Website (Optional)</label>
                    <input
                      type="url"
                      name="portfolio_url"
                      value={formData.portfolio_url}
                      onChange={handleInputChange}
                      placeholder="https://yourportfolio.com"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Cover Letter */}
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>✍️ Cover Letter *</h2>
                  <p style={styles.sectionDescription}>
                    Tell us why you're a great fit for this role (minimum 100 characters)
                  </p>
                  <textarea
                    name="cover_letter"
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                    placeholder="Dear Hiring Manager,

I am writing to express my strong interest in the position...

In my previous role at [Company], I successfully...

I am particularly excited about this opportunity because..."
                    style={styles.textarea}
                    rows="12"
                    required
                  />
                  <div style={styles.characterCount}>
                    {formData.cover_letter.length} characters
                    {formData.cover_letter.length < 100 && (
                      <span style={styles.characterWarning}>
                        {' '}(minimum 100 required)
                      </span>
                    )}
                  </div>
                </div>

                {/* Resume */}
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>📄 Resume/CV</h2>
                  <p style={styles.sectionDescription}>
                    Provide a link to your resume or upload it below
                  </p>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Resume URL (Google Drive, Dropbox, etc.)</label>
                    <input
                      type="url"
                      name="resume_url"
                      value={formData.resume_url}
                      onChange={handleInputChange}
                      placeholder="https://drive.google.com/file/..."
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.uploadNote}>
                    💡 Tip: Share your resume via Google Drive or Dropbox and paste the link above
                  </div>
                </div>

                {/* Additional Information */}
                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>ℹ️ Additional Information</h2>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>When can you start?</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      style={styles.input}
                    >
                      <option value="">Select availability</option>
                      <option value="immediately">Immediately</option>
                      <option value="2-weeks">2 weeks notice</option>
                      <option value="1-month">1 month notice</option>
                      <option value="2-months">2+ months</option>
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Expected Salary (USD/year)</label>
                    <input
                      type="number"
                      name="expected_salary"
                      value={formData.expected_salary}
                      onChange={handleInputChange}
                      placeholder="e.g., 120000"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Screening Questions */}
                {job.screening_questions && job.screening_questions.length > 0 && (
                  <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>❓ Screening Questions</h2>
                    <p style={styles.sectionDescription}>
                      Please answer the following questions from the employer
                    </p>
                    {job.screening_questions.map((question, index) => (
                      <div key={index} style={styles.inputGroup}>
                        <label style={styles.label}>
                          {index + 1}. {question}
                        </label>
                        <textarea
                          value={formData.screening_answers[index] || ''}
                          onChange={(e) => handleScreeningAnswer(index, e.target.value)}
                          style={styles.textarea}
                          rows="4"
                          placeholder="Your answer..."
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <div style={styles.submitSection}>
                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      ...(submitting ? styles.submitButtonDisabled : {}),
                    }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span style={styles.spinner}>⏳</span>
                        Submitting Application...
                      </>
                    ) : (
                      '📨 Submit Application'
                    )}
                  </button>
                  <p style={styles.submitNote}>
                    By submitting this application, you agree to share your information with the employer.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Job Summary */}
          <div style={styles.summaryColumn}>
            <div style={styles.stickyCard}>
              <h3 style={styles.summaryTitle}>📌 Job Summary</h3>
              
              <div style={styles.jobSummary}>
                <h4 style={styles.jobSummaryTitle}>{job.title}</h4>
                <p style={styles.jobSummaryCompany}>{job.company_name}</p>
                
                <div style={styles.summaryDetails}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Location:</span>
                    <span style={styles.summaryValue}>
                      {job.location.city}, {job.location.state || job.location.country}
                    </span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Job Type:</span>
                    <span style={styles.summaryValue}>{job.job_type}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Work Mode:</span>
                    <span style={styles.summaryValue}>{job.work_mode}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Experience:</span>
                    <span style={styles.summaryValue}>{job.experience_level}</span>
                  </div>
                  {job.salary && (
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Salary:</span>
                      <span style={styles.summaryValue}>
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/jobs/${id}`)}
                  style={styles.viewJobButton}
                >
                  View Full Job Description →
                </button>
              </div>

              <div style={styles.tipsCard}>
                <h4 style={styles.tipsTitle}>💡 Application Tips</h4>
                <ul style={styles.tipsList}>
                  <li>Tailor your cover letter to this specific role</li>
                  <li>Highlight relevant skills and experience</li>
                  <li>Proofread for spelling and grammar</li>
                  <li>Keep your answers concise and professional</li>
                  <li>Be honest about your availability</li>
                </ul>
              </div>
            </div>
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
  button: {
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
  successContainer: {
    maxWidth: '600px',
    margin: '100px auto',
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  successIcon: {
    fontSize: '80px',
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: '16px',
  },
  successText: {
    fontSize: '18px',
    color: '#4b5563',
    marginBottom: '12px',
    lineHeight: '1.6',
  },
  successSubtext: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '40px',
  },
  successButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '14px 28px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  secondaryButton: {
    padding: '14px 28px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  formColumn: {},
  summaryColumn: {},
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  stickyCard: {
    position: 'sticky',
    top: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '30px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  section: {
    paddingBottom: '30px',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  infoDisplay: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: '14px',
    color: '#1f2937',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  characterCount: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '8px',
  },
  characterWarning: {
    color: '#ef4444',
    fontWeight: '600',
  },
  uploadNote: {
    fontSize: '13px',
    color: '#6b7280',
    backgroundColor: '#f0f4ff',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '12px',
  },
  submitSection: {
    paddingTop: '20px',
    borderTop: '2px solid #e5e7eb',
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  submitNote: {
    fontSize: '13px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '16px',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
  },
  jobSummary: {
    marginBottom: '24px',
  },
  jobSummaryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '4px',
  },
  jobSummaryCompany: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '20px',
  },
  summaryDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  viewJobButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    color: '#667eea',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '8px',
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '12px',
  },
  tipsList: {
    paddingLeft: '20px',
    margin: 0,
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.8',
  },
};

export default ApplyJob;
