import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Call login
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.brandSection}>
          <h1 style={styles.brandTitle}>🚀 Smart Recruitment</h1>
          <p style={styles.brandTagline}>AI-Powered Job Matching Platform</p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✨</span>
              <span>Intelligent Job Matching</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>📊</span>
              <span>Skill Gap Analysis</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🎯</span>
              <span>Personalized Recommendations</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Welcome Back!</h2>
          <p style={styles.formSubtitle}>Sign in to continue to your account</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{...styles.input, paddingRight: '45px'}}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div style={styles.forgotPassword}>
              <a href="/forgot-password" style={styles.link}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}>⏳</span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>OR</span>
          </div>

          <div style={styles.registerSection}>
            <p style={styles.registerText}>
              Don't have an account?{' '}
              <a href="/register" style={styles.registerLink}>
                Sign up now
              </a>
            </p>
          </div>

          <div style={styles.testCredentials}>
            <p style={styles.testTitle}>🧪 Test Account:</p>
            <p style={styles.testInfo}>Email: john@example.com</p>
            <p style={styles.testInfo}>Password: password123</p>
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
    lineHeight: '1.2',
  },
  brandTagline: {
    fontSize: '20px',
    marginBottom: '50px',
    opacity: '0.9',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    gap: '15px',
  },
  featureIcon: {
    fontSize: '28px',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'white',
    padding: '50px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  formTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px',
  },
  formSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  errorIcon: {
    fontSize: '18px',
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
    transition: 'border-color 0.2s',
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
  forgotPassword: {
    textAlign: 'right',
    marginBottom: '25px',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
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
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  divider: {
    margin: '30px 0',
    textAlign: 'center',
    position: 'relative',
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 15px',
    color: '#9ca3af',
    fontSize: '14px',
    position: 'relative',
    zIndex: 1,
  },
  registerSection: {
    textAlign: 'center',
    marginTop: '20px',
  },
  registerText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  registerLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
  },
  testCredentials: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    fontSize: '13px',
  },
  testTitle: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  testInfo: {
    color: '#6b7280',
    margin: '4px 0',
  },
};

export default Login;
