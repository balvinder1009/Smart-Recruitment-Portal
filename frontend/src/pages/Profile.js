import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    // Job Seeker specific
    current_job_title: '',
    experience: '',
    expected_salary_min: '',
    expected_salary_max: '',
    // Employer specific
    company_name: '',
    company_size: '',
    industry: '',
    company_description: '',
    company_website: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        country: user.location?.country || '',
        zip_code: user.location?.zip_code || '',
        // Job Seeker
        current_job_title: user.job_seeker_profile?.current_job_title || '',
        experience: user.job_seeker_profile?.experience || '',
        expected_salary_min: user.job_seeker_profile?.expected_salary?.min || '',
        expected_salary_max: user.job_seeker_profile?.expected_salary?.max || '',
        // Employer
        company_name: user.employer_profile?.company_name || '',
        company_size: user.employer_profile?.company_size || '',
        industry: user.employer_profile?.industry || '',
        company_description: user.employer_profile?.company_description || '',
        company_website: user.employer_profile?.company_website || '',
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.find(s => s.skill?.name === newSkill.toLowerCase())) {
      setSkills([...skills, { 
        skill: { 
          name: newSkill.toLowerCase(), 
          display_name: newSkill 
        },
        proficiency_level: 3 
      }]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter(s => s.skill?.name !== skillName));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        bio: formData.bio,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip_code: formData.zip_code,
      };

      if (user.role === 'jobseeker') {
        updateData.job_seeker_profile = {
          current_job_title: formData.current_job_title,
          experience: parseInt(formData.experience) || 0,
          expected_salary: {
            min: parseInt(formData.expected_salary_min) || 0,
            max: parseInt(formData.expected_salary_max) || 0,
            currency: 'USD'
          }
        };
      } else if (user.role === 'employer') {
        updateData.employer_profile = {
          company_name: formData.company_name,
          company_size: formData.company_size,
          industry: formData.industry,
          company_description: formData.company_description,
          company_website: formData.company_website,
        };
      }

      await authAPI.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Reload page to refresh user data
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <a href="/dashboard" style={styles.backLink}>← Back to Dashboard</a>
          <h1 style={styles.title}>My Profile</h1>
        </div>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.content}>
        {/* Profile Completion Card */}
        <div style={styles.completionCard}>
          <div style={styles.completionHeader}>
            <h3 style={styles.completionTitle}>Profile Completion</h3>
            <span style={styles.completionPercent}>{user.profile_completion}%</span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${user.profile_completion}%`
              }}
            />
          </div>
          <p style={styles.completionText}>
            {user.profile_completion < 100 
              ? 'Complete your profile to improve job matching!' 
              : '🎉 Your profile is complete!'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={styles.successBox}>
            ✓ {success}
          </div>
        )}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.grid}>
          {/* Left Column - Basic Info */}
          <div style={styles.column}>
            {/* Profile Picture & Basic Info */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Basic Information</h2>
                {!editing && (
                  <button 
                    onClick={() => setEditing(true)} 
                    style={styles.editButton}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>

              <div style={styles.profilePictureSection}>
                <div style={styles.profilePicture}>
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" style={styles.profileImage} />
                  ) : (
                    <div style={styles.profileInitials}>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={styles.userName}>{user.full_name}</h3>
                  <p style={styles.userEmail}>{user.email}</p>
                  <span style={styles.roleBadge}>
                    {user.role === 'jobseeker' ? '👤 Job Seeker' : '🏢 Employer'}
                  </span>
                </div>
              </div>

              <div style={styles.formSection}>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>First Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    ) : (
                      <p style={styles.value}>{user.first_name}</p>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Last Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    ) : (
                      <p style={styles.value}>{user.last_name}</p>
                    )}
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p style={styles.value}>{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Bio</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      style={{...styles.input, minHeight: '100px'}}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p style={styles.value}>{user.bio || 'No bio added yet'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Location</h2>
              <div style={styles.formSection}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  {editing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  ) : (
                    <p style={styles.value}>{user.location?.city || 'Not provided'}</p>
                  )}
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>State</label>
                    {editing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    ) : (
                      <p style={styles.value}>{user.location?.state || 'Not provided'}</p>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>ZIP Code</label>
                    {editing ? (
                      <input
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    ) : (
                      <p style={styles.value}>{user.location?.zip_code || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Country</label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  ) : (
                    <p style={styles.value}>{user.location?.country || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Role-Specific Info & Skills */}
          <div style={styles.column}>
            {/* Role-Specific Information */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                {user.role === 'jobseeker' ? 'Career Information' : 'Company Information'}
              </h2>
              
              <div style={styles.formSection}>
                {user.role === 'jobseeker' ? (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Current Job Title</label>
                      {editing ? (
                        <input
                          type="text"
                          name="current_job_title"
                          value={formData.current_job_title}
                          onChange={handleInputChange}
                          style={styles.input}
                          placeholder="e.g. Software Engineer"
                        />
                      ) : (
                        <p style={styles.value}>
                          {user.job_seeker_profile?.current_job_title || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Years of Experience</label>
                      {editing ? (
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          style={styles.input}
                          min="0"
                        />
                      ) : (
                        <p style={styles.value}>
                          {user.job_seeker_profile?.experience || 0} years
                        </p>
                      )}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Expected Salary Range (USD/year)</label>
                      {editing ? (
                        <div style={styles.formGrid}>
                          <input
                            type="number"
                            name="expected_salary_min"
                            value={formData.expected_salary_min}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Min"
                          />
                          <input
                            type="number"
                            name="expected_salary_max"
                            value={formData.expected_salary_max}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Max"
                          />
                        </div>
                      ) : (
                        <p style={styles.value}>
                          {user.job_seeker_profile?.expected_salary?.min && 
                           user.job_seeker_profile?.expected_salary?.max
                            ? `$${user.job_seeker_profile.expected_salary.min.toLocaleString()} - $${user.job_seeker_profile.expected_salary.max.toLocaleString()}`
                            : 'Not specified'}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Company Name</label>
                      {editing ? (
                        <input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleInputChange}
                          style={styles.input}
                        />
                      ) : (
                        <p style={styles.value}>
                          {user.employer_profile?.company_name || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Industry</label>
                      {editing ? (
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          style={styles.input}
                        >
                          <option value="">Select industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p style={styles.value}>
                          {user.employer_profile?.industry || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Company Size</label>
                      {editing ? (
                        <select
                          name="company_size"
                          value={formData.company_size}
                          onChange={handleInputChange}
                          style={styles.input}
                        >
                          <option value="">Select size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501+">501+ employees</option>
                        </select>
                      ) : (
                        <p style={styles.value}>
                          {user.employer_profile?.company_size || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Company Website</label>
                      {editing ? (
                        <input
                          type="url"
                          name="company_website"
                          value={formData.company_website}
                          onChange={handleInputChange}
                          style={styles.input}
                          placeholder="https://example.com"
                        />
                      ) : (
                        <p style={styles.value}>
                          {user.employer_profile?.company_website ? (
                            <a 
                              href={user.employer_profile.company_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.link}
                            >
                              {user.employer_profile.company_website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      )}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Company Description</label>
                      {editing ? (
                        <textarea
                          name="company_description"
                          value={formData.company_description}
                          onChange={handleInputChange}
                          style={{...styles.input, minHeight: '100px'}}
                          placeholder="Describe your company..."
                        />
                      ) : (
                        <p style={styles.value}>
                          {user.employer_profile?.company_description || 'No description added'}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Skills Section (Job Seekers only) */}
            {user.role === 'jobseeker' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Skills</h2>
                
                <form onSubmit={handleAddSkill} style={styles.skillForm}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python)"
                    style={{...styles.input, flex: 1}}
                  />
                  <button type="submit" style={styles.addButton}>
                    + Add
                  </button>
                </form>

                <div style={styles.skillsContainer}>
                  {skills.length > 0 ? (
                    skills.map((skillItem, index) => (
                      <div key={index} style={styles.skillBadge}>
                        <span>{skillItem.skill?.display_name || skillItem.skill?.name}</span>
                        {editing && (
                          <button
                            onClick={() => handleRemoveSkill(skillItem.skill?.name)}
                            style={styles.removeSkillButton}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={styles.emptyText}>No skills added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div style={styles.actionButtons}>
            <button 
              onClick={() => {
                setEditing(false);
                setError('');
                setSuccess('');
              }} 
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              style={{
                ...styles.saveButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
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
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  backLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
  },
  title: {
    fontSize: '28px',
    color: '#1f2937',
    margin: 0,
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
    margin: '40px auto',
    padding: '0 20px',
  },
  completionCard: {
    backgroundColor: '#eff6ff',
    border: '2px solid #dbeafe',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
  },
  completionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  completionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: 0,
  },
  completionPercent: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s ease',
  },
  completionText: {
    fontSize: '14px',
    color: '#3b82f6',
    margin: 0,
  },
  successBox: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
    marginBottom: '20px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  profilePictureSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e5e7eb',
  },
  profilePicture: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profileInitials: {
    width: '100%',
    height: '100%',
    backgroundColor: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 5px 0',
  },
  userEmail: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 10px 0',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  value: {
    fontSize: '14px',
    color: '#1f2937',
    margin: 0,
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
  },
  skillForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  skillBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  removeSkillButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '30px',
    paddingTop: '30px',
    borderTop: '1px solid #e5e7eb',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
};

export default Profile;
