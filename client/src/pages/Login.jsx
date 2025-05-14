import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup, login, googleSignIn, error, setError } = useAuth();
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    if (isRegister) {
      // Registration validations
      if (!name || name.trim().length < 2) {
        toast.error('Please enter a valid name');
        return false;
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    if (setError) {
      setError('');
    }
    
    // Validate form
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (isRegister) {
        // Registration logic
        await signup(name, email, password);
        toast.success('Account created successfully!');
        navigate('/onboarding');
      } else {
        // Login logic
        await login(email, password);
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(isRegister ? 'Registration error' : 'Login error', err);
      
      // Only show toast if no specific error from AuthContext
      if (!error) {
        toast.error(isRegister 
          ? 'Failed to create account' 
          : 'Login failed. Please check your credentials'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Clear any previous errors
      if (setError) {
        setError('');
      }
      
      await googleSignIn();
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign In error', err);
      
      // Only show toast if no specific error from AuthContext
      if (!error) {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and register
  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setError(''); // Clear any previous errors
    
    // Reset form fields
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card auth-card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              
              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')}
                  ></button>
                </div>
              )}
              
              {/* Authentication Form */}
              <form onSubmit={handleSubmit}>
                {/* Name Field (only for registration) */}
                {isRegister && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                
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
                    {isRegister ? 'Create Password' : 'Password'}
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? 'Minimum 6 characters' : 'Enter your password'}
                    required
                    minLength={isRegister ? 6 : undefined}
                  />
                  {isRegister && (
                    <small className="form-text text-muted">
                      Password must be at least 6 characters
                    </small>
                  )}
                  {!isRegister && (
                    <div className="d-flex justify-content-end mt-1">
                      <Link 
                        to="/forgot-password" 
                        className="text-primary text-decoration-none small"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Confirm Password Field (only for registration) */}
                {isRegister && (
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      minLength={6}
                    />
                  </div>
                )}
                
                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading 
                    ? (isRegister ? 'Creating Account...' : 'Signing In...') 
                    : (isRegister ? 'Sign Up' : 'Log In')
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
                {isRegister ? (
                  <p className="small">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      className="btn btn-link p-0 align-baseline"
                      onClick={toggleAuthMode}
                    >
                      Log In
                    </button>
                  </p>
                ) : (
                  <p className="small">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      className="btn btn-link p-0 align-baseline"
                      onClick={toggleAuthMode}
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default Login;