import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css'; // Create this file for custom navbar styling
import * as bootstrap from 'bootstrap';
import logo from '../assets/logo.png'; // Import your logo image

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = location.pathname === '/';
  
  // Handle scroll event to add background color to navbar when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Add this useEffect to apply the correct body class
  useEffect(() => {
    if (isHomePage) {
      document.body.classList.add('has-hero');
    } else {
      document.body.classList.add('has-navbar');
    }
    
    return () => {
      document.body.classList.remove('has-hero');
      document.body.classList.remove('has-navbar');
    };
  }, [isHomePage]);
  
  useEffect(() => {
    // Use Bootstrap JS for navbar toggling
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
      const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
      
      // Close mobile menu when a link is clicked
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 992) { // lg breakpoint
            bsCollapse.hide();
          }
        });
      });
    }
  }, []);
  
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }
  
  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <nav 
      className={`navbar navbar-expand-lg navbar-dark fixed-top transition-all w-100 
      ${scrolled ? 'scrolled bg-primary' : isHomePage ? 'bg-transparent' : 'bg-primary'}`}
    >
      <div className="container-fluid px-3 px-lg-5">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src={logo} 
            alt="HamSafar Logo" 
            className="navbar-logo me-2"
          />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/chatbot')}`} to="/chatbot">Chat</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/flights')}`} to="/flights">Flights</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/ticket-planner')}`} to="/ticket-planner">Ticket Planner</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/map')}`} to="/map">Map</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/weather')}`} to="/weather">Weather</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/hotels')}`} to="/hotels">Hotels</Link>
            </li>
            {currentUser && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/itinerary')}`} to="/itinerary">Itinerary</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/recommendations')}`} to="/recommendations">Recommendations</Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex">
            {currentUser ? (
              <div className="d-flex align-items-center">
                <div className="text-light me-3 d-none d-md-block">
                  <small>Hello, {currentUser.email?.split('@')[0]}</small>
                </div>
                <Link className="btn btn-outline-light me-2" to="/profile">
                  <i className="fas fa-user me-1"></i> Profile
                </Link>
                <button 
                  className="btn" 
                  style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-color)' }}
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-1"></i> Logout
                </button>
              </div>
            ) : (
              <Link 
                className="btn" 
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-color)' }}
                to="/login"
              >
                <i className="fas fa-sign-in-alt me-1"></i> Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;