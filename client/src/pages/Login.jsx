import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup, login, googleSignIn, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegister) {
      // Register logic
      if (!name || !email || !password || !confirmPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        toast.error('Password should be at least 6 characters');
        return;
      }
      
      try {
        setLoading(true);
        console.log("Attempting to register with:", { name, email });
        await signup(name, email, password);
        toast.success('Account created successfully!');
        navigate('/');
      } catch (err) {
        console.error("Registration error:", err);
        if (!error) {
          toast.error(err.message || 'Failed to create account');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Login logic
      if (!email || !password) {
        toast.error('Please enter both email and password');
        return;
      }
      
      try {
        setLoading(true);
        await login(email, password);
        toast.success('Logged in successfully!');
        navigate('/');
      } catch (err) {
        console.error("Login error:", err);
        if (!error) {
          toast.error('Invalid email or password');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Attempting Google sign in");
      await googleSignIn();
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (err) {
      console.error("Google Sign In error:", err);
      
      // Display the specific error from auth context
      if (error) {
        toast.error(error);
      } else if (err.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in popup was closed');
      } else if (err.code === 'auth/popup-blocked') {
        toast.error('Sign-in popup was blocked. Please allow popups for this website');
      } else {
        toast.error('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card auth-card">
            <div className="card-body">
              <h2 className="text-center mb-4">
                {isRegister ? 'Create an Account' : 'Welcome Back'}
              </h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                {isRegister && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {isRegister && (
                    <small className="password-instructions">
                      Password must be at least 6 characters
                    </small>
                  )}
                  {!isRegister && (
                    <div className="d-flex justify-content-end mt-1">
                      <Link to="/forgot-password" className="forgot-password-link">
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                </div>
                
                {isRegister && (
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 auth-btn"
                  disabled={loading}
                >
                  {loading 
                    ? (isRegister ? 'Creating Account...' : 'Signing In...') 
                    : (isRegister ? 'Sign Up' : 'Login')}
                </button>
              </form>
              
              <div className="divider my-4">
                <span>or</span>
              </div>
              
              <button
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <i className="fab fa-google me-2"></i> 
                Sign in with Google
              </button>
              
              <div className="text-center mt-3">
                {isRegister ? (
                  <p>
                    Already have an account? {' '}
                    <button 
                      className="auth-toggle-btn" 
                      onClick={() => {
                        setIsRegister(false);
                        setError('');
                      }}
                    >
                      Log In
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account? {' '}
                    <button 
                      className="auth-toggle-btn" 
                      onClick={() => {
                        setIsRegister(true);
                        setError('');
                      }}
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