import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // Attempt password reset
      await resetPassword(email);
      
      // Show success message
      toast.success('Password reset link sent! Check your email inbox.');
      
      // Optional: Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // Error handling
      console.error('Password reset error:', err);
      
      // Check specific error types
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many reset attempts. Please try again later.');
      } else {
        toast.error('Failed to send password reset email. Please try again.');
      }
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
              <h2 className="text-center mb-4">Reset Password</h2>
              
              <p className="text-center text-muted mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {/* Password Reset Form */}
              <form onSubmit={handleSubmit}>
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
                
                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>
              </form>
              
              {/* Back to Login Link */}
              <div className="text-center mt-3">
                <Link 
                  to="/login" 
                  className="text-primary text-decoration-none small"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;