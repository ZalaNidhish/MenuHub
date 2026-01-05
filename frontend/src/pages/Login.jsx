// frontend/src/pages/Login.jsx - UPDATED VERSION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const { login, isAuthenticated, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard();
    }
  }, [isAuthenticated, isAdmin, isOwner]);

  const redirectToDashboard = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isOwner) {
      navigate('/owner/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleNormalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (isRegister) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;
      
      // Use the login from context (it will store the token)
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      // Reload to update auth context
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const user = await login(credentialResponse.credential);
      redirectToDashboard();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Login Failed');
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome to MenuHub</h1>
          <p className="subtitle">{isRegister ? 'Create your account' : 'Sign in to continue'}</p>
          
          {error && <div className="error-message">{error}</div>}

          {/* Normal Login/Register Form */}
          <form onSubmit={handleNormalSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="toggle-form">
            <p>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className="toggle-btn"
              >
                {isRegister ? 'Login here' : 'Register here'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Google Login */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          
          <div className="features">
            <h3>Why MenuHub?</h3>
            <ul>
              <li>🍽️ Browse restaurants and menus</li>
              <li>📱 Easy to use interface</li>
              <li>⭐ Rate your favorite places</li>
              <li>📋 See today's special menu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;