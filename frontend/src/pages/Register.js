import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    // Job Seeker specific
    current_job_title: '',
    experience_years: '',
    // Employer specific
    company_name: '',
    company_size: '',
    industry: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateStep1 = () => {
    if (!role) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { email, password, confirmPassword, first_name, last_name } = formData;

    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (role === 'jobseeker') {
      if (!formData.current_job_title) {
        setError('Please enter your current job title');
        return false;
      }
    } else if (role === 'employer') {
      if (!formData.company_name || !formData.industry) {
        setError('Please fill in all company details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setLoading(true);

    // Prepare data based on role
    const userData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: role,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      country: formData.country,
    };

    if (role === 'jobseeker') {
      userData.job_seeker_profile = {
        current_job_title: formData.current_job_title,
        experience: parseInt(formData.experience_years) || 0,
      };
    } else if (role === 'employer') {
      userData.employer_profile = {
        company_name: formData.company_name,
        company_size: formData.company_size,
        industry: formData.industry,
      };
    }

    const result = await register(userData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const renderStep1 = () => (
    <div style={styles.stepContainer}>
      <h2 style={styles.stepTitle}>Choose Your Role</h2>
      <p style={styles.stepSubtitle}>Select how you want to use the platform</p>

      <div style={styles.roleCards}>
        <div
          style={{
            ...styles.roleCard,
            ...(role === 'jobseeker' ? styles.roleCardSelected : {}),
          }}
          onClick={() => setRole('jobseeker')}
        >
          <div style={styles.roleIcon}>👤</div>
          <h3 style={styles.roleTitle}>Job Seeker</h3>
          <p style={styles.roleDescription}>
            Find your dream job with AI-powered matching
          </p>
          <ul style={styles.roleFeatures}>
            <li>✓ Browse job listings</li>
            <li>✓ Get personalized recommendations</li>
            <li>✓ Track applications</li>
            <li>✓ Skill gap analysis</li>
          </ul>
        </div>

        <div
          style={{
            ...styles.roleCard,
            ...(role === 'employer' ? styles.roleCardSelected : {}),
          }}
          onClick={() => setRole('employer')}
        >
          <div style={styles.roleIcon}>🏢</div>
          <h3 style={styles.roleTitle}>Employer</h3>
          <p style={styles.roleDescription}>
            Find the perfect candidates for your team
          </p>
          <ul style={styles.roleFeatures}>
            <li>✓ Post job openings</li>
            <li>✓ AI-powered candidate matching</li>
            <li>✓ Manage applications</li>
            <li>✓ Analytics dashboard</li>
          </ul>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <button onClick={handleNext} style={styles.primaryButton}>
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.stepContainer}>
      <h2 style={styles.stepTitle}>Create Your Account</h2>
      <p style={styles.stepSubtitle}>Basic information to get started</p>

      <div style={styles.formGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="John"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Doe"
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="john.doe@example.com"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Password *</label>
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="At least 6 characters"
            style={{ ...styles.input, paddingRight: '45px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Confirm Password *</label>
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Re-enter your password"
          style={styles.input}
        />
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.buttonGroup}>
        <button onClick={handleBack} style={styles.secondaryButton}>
          Back
        </button>
        <button onClick={handleNext} style={styles.primaryButton}>
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.stepContainer}>
      <h2 style={styles.stepTitle}>
        {role === 'jobseeker' ? 'Your Profile' : 'Company Details'}
      </h2>
      <p style={styles.stepSubtitle}>Tell us more about yourself</p>

      {role === 'jobseeker' ? (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Job Title *</label>
            <input
              type="text"
              name="current_job_title"
              value={formData.current_job_title}
              onChange={handleInputChange}
              placeholder="e.g. Software Engineer"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              style={styles.input}
            />
          </div>
        </>
      ) : (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="Acme Corporation"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Industry *</label>
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
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Size</label>
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
          </div>
        </>
      )}

      <div style={styles.formGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="San Francisco"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="California"
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="United States"
          style={styles.input}
        />
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.buttonGroup}>
        <button onClick={handleBack} style={styles.secondaryButton}>
          Back
        </button>
        <button
          onClick={handleSubmit}
          style={{
            ...styles.primaryButton,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.brandSection}>
          <h1 style={styles.brandTitle}>🚀 Join Us Today</h1>
          <p style={styles.brandTagline}>
            Start your journey with Smart Recruitment Portal
          </p>

          {/* Progress Steps */}
          <div style={styles.progressContainer}>
            <div style={styles.progressStep}>
              <div
                style={{
                  ...styles.progressCircle,
                  ...(step >= 1 ? styles.progressCircleActive : {}),
                }}
              >
                1
              </div>
              <span style={styles.progressLabel}>Role</span>
            </div>
            <div style={styles.progressLine}></div>
            <div style={styles.progressStep}>
              <div
                style={{
                  ...styles.progressCircle,
                  ...(step >= 2 ? styles.progressCircleActive : {}),
                }}
              >
                2
              </div>
              <span style={styles.progressLabel}>Account</span>
            </div>
            <div style={styles.progressLine}></div>
            <div style={styles.progressStep}>
              <div
                style={{
                  ...styles.progressCircle,
                  ...(step >= 3 ? styles.progressCircleActive : {}),
                }}
              >
                3
              </div>
              <span style={styles.progressLabel}>Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div style={styles.loginSection}>
            <p style={styles.loginText}>
              Already have an account?{' '}
              <a href="/login" style={styles.loginLink}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  brandSection: {
    maxWidth: '500px',
  },
  brandTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  brandTagline: {
    fontSize: '20px',
    marginBottom: '60px',
    opacity: '0.9',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '40px',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  progressCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  progressCircleActive: {
    backgroundColor: 'white',
    color: '#667eea',
  },
  progressLabel: {
    fontSize: '14px',
    opacity: '0.9',
  },
  progressLine: {
    width: '60px',
    height: '2px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    margin: '0 10px',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    overflowY: 'auto',
  },
  formContainer: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'white',
    padding: '50px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px',
  },
  stepSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '30px',
  },
  roleCards: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px',
  },
  roleCard: {
    padding: '30px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  roleCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  roleIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  roleTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px',
  },
  roleDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  roleFeatures: {
    textAlign: 'left',
    listStyle: 'none',
    padding: 0,
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.8',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
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
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '5px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  primaryButton: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  secondaryButton: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: 'white',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  loginSection: {
    textAlign: 'center',
    marginTop: '30px',
    paddingTop: '30px',
    borderTop: '1px solid #e5e7eb',
  },
  loginText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  loginLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Register;
