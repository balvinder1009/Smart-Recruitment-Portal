import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    job_type: '',
    work_mode: '',
    experience_level: '',
    city: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    per_page: 9,
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [pagination.current_page, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await jobAPI.getJobs(params);
      setJobs(response.data.jobs);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages,
        current_page: response.data.current_page,
      });
      setError('');
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current_page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      job_type: '',
      work_mode: '',
      experience_level: '',
      city: '',
    });
    setPagination({ ...pagination, current_page: 1 });
  };

  const formatSalary = (min, max, currency, period) => {
    if (!min || !max) return 'Not specified';
    return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}/${period}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>💼 Browse Jobs</h1>
          <p style={styles.subtitle}>
            Discover your next career opportunity
          </p>
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
        {/* Search and Filters */}
        <div style={styles.searchSection}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search jobs, companies, or keywords..."
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>
              🔍 Search
            </button>
          </form>

          <div style={styles.filters}>
            <select
              value={filters.job_type}
              onChange={(e) => handleFilterChange('job_type', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <select
              value={filters.work_mode}
              onChange={(e) => handleFilterChange('work_mode', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Work Modes</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select
              value={filters.experience_level}
              onChange={(e) => handleFilterChange('experience_level', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>

            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="City"
              style={styles.filterInput}
            />

            <button onClick={clearFilters} style={styles.clearButton}>
              ✕ Clear
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div style={styles.resultsSummary}>
          <p style={styles.resultsText}>
            {loading ? 'Loading...' : `${pagination.total} jobs found`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Job Cards Grid */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⏳</div>
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No jobs found</h3>
            <p style={styles.emptyText}>
              Try adjusting your search filters to find more opportunities
            </p>
            <button onClick={clearFilters} style={styles.clearFiltersButton}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={styles.jobsGrid}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={styles.jobCard}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {/* Featured Badge */}
                  {job.featured && (
                    <div style={styles.featuredBadge}>⭐ Featured</div>
                  )}
                  {/* Urgent Badge */}
                  {job.urgent && (
                    <div style={styles.urgentBadge}>🔥 Urgent</div>
                  )}

                  <div style={styles.cardHeader}>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <p style={styles.companyName}>{job.company_name}</p>
                  </div>

                  <div style={styles.jobMeta}>
                    <span style={styles.metaItem}>
                      📍 {job.location.city}, {job.location.state || job.location.country}
                    </span>
                    <span style={styles.metaItem}>
                      💼 {job.job_type}
                    </span>
                    <span style={styles.metaItem}>
                      🏢 {job.work_mode}
                    </span>
                  </div>

                  <p style={styles.jobDescription}>
                    {job.description.substring(0, 120)}...
                  </p>

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

                  <div style={styles.tags}>
                    <span style={styles.tag}>{job.experience_level}</span>
                    <span style={styles.tag}>{job.category}</span>
                    {job.location.allows_remote && (
                      <span style={{...styles.tag, ...styles.remoteTag}}>
                        🌐 Remote OK
                      </span>
                    )}
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.views}>👁️ {job.views} views</span>
                    <span style={styles.posted}>
                      {job.days_since_posted === 0
                        ? 'Posted today'
                        : `Posted ${job.days_since_posted} days ago`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}
                  disabled={pagination.current_page === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(pagination.current_page === 1 ? styles.paginationButtonDisabled : {})
                  }}
                >
                  ← Previous
                </button>
                <span style={styles.paginationInfo}>
                  Page {pagination.current_page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}
                  disabled={pagination.current_page === pagination.pages}
                  style={{
                    ...styles.paginationButton,
                    ...(pagination.current_page === pagination.pages ? styles.paginationButtonDisabled : {})
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
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
  headerContent: {},
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
  searchSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  searchForm: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
  },
  searchButton: {
    padding: '14px 30px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  filterInput: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  resultsSummary: {
    marginBottom: '20px',
  },
  resultsText: {
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '20px',
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
  },
  clearFiltersButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  featuredBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  urgentBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  cardHeader: {
    marginBottom: '12px',
  },
  jobTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  companyName: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '600',
    margin: 0,
  },
  jobMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  metaItem: {
    fontSize: '14px',
    color: '#6b7280',
  },
  jobDescription: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  salary: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '16px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  tag: {
    padding: '4px 12px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  remoteTag: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  views: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  posted: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
  },
  paginationButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  paginationButtonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600',
  },
};

export default Jobs;
