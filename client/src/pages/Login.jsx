import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination or default to profile
  const from = location.state?.from || '/profile';

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      // Redirect to profile page after successful login
      navigate(from);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await signInWithGoogle();
      // Redirect to profile page after successful Google sign-in
      navigate(from);
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card auth-card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">
                {' '}
                Welcome Back
              </h2>
              
              {/* Error Alert */}
              
              
              {/* Authentication Form */}
              <form onSubmit={handleSubmit}>
                
                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
                
                {/* Password Field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <div className="d-flex justify-content-end mt-1">
                      <Link 
                        to="/forgot-password" 
                        className="text-primary text-decoration-none small"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                </div>
                
                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading 
                    ? 'Signing In...' 
                    : 'Log In'
                  }
                </button>
              </form>
              
              {/* Divider */}
              <div className="position-relative my-3">
                <hr />
                <span className="divider-text">or</span>
              </div>
              
              {/* Google Sign In Button */}
              <button
                type="button"
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <i className="fab fa-google me-2"></i>
                Continue with Google
              </button>
              
              {/* Toggle between Login and Register */}
              <div className="text-center mt-3">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default Login;