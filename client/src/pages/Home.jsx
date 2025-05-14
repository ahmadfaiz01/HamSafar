import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of hero images
  const heroImages = [
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  ];

  // Auto rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

 

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="container-fluid px-0">
          <div className="row g-0">
            {/* Left side content */}
            <div className="col-lg-6 d-flex align-items-center" style={{ 
              backgroundColor: 'var(--primary-color)', 
              minHeight: '85vh',
              padding: '2rem'
            }}>
              <div className="hero-content p-4 p-md-5">
                <h1 className="display-4 fw-bold text-white mb-4 animate__animated animate__fadeInDown">
                  Your Ultimate
                  <span style={{ position: 'relative', display: 'inline-block', margin: '0 0.5rem' }}>
                    Travel
                    <svg 
                      style={{ 
                        position: 'absolute', 
                        bottom: '-5px', 
                        left: '-10px', 
                        width: 'calc(100% + 20px)', 
                        height: '15px', 
                        zIndex: '-1'
                      }}
                      viewBox="0 0 200 20"
                    >
                      <path
                        d="M 0,10 Q 40,20 80,10 T 160,10 T 200,10"
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="15"
                      />
                    </svg>
                  </span>
                  Planning Solution
                </h1>
                <p className="lead text-white-50 mb-5 animate__animated animate__fadeInUp animate__delay-1s">
                  All essential travel planning functions in one unified platform. 
                  Plan trips, find flights, compare prices, and explore destinations with ease.
                </p>

                <div className="d-flex flex-wrap gap-3 animate__animated animate__fadeInUp animate__delay-2s">
                  {currentUser ? (
                    <Link to="/itinerary-planner" className="btn btn-hero btn-lg px-4 py-2">
                      <i className="fas fa-route me-2"></i> Plan Your Journey
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-hero btn-lg px-4 py-2">
                      <i className="fas fa-user-plus me-2"></i> Get Started
                    </Link>
                  )}
                  <Link to="/ticket-planner" className="btn btn-outline-hero btn-lg px-4 py-2">
                    <i className="fas fa-plane me-2"></i> Find Flights
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right side image carousel */}
            <div className="col-lg-6 position-relative">
              <div 
                className="hero-image-container"
                style={{ 
                  backgroundImage: `url(${heroImages[currentImageIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '85vh',
                  position: 'relative',
                  transition: 'background-image 1s ease-in-out',
                }}
              >
                <div className="overlay" style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}></div>
                
                {/* Image navigation dots */}
                <div className="image-navigation position-absolute" style={{ 
                  bottom: '20px', 
                  left: '0', 
                  width: '100%', 
                  textAlign: 'center', 
                  zIndex: '5' 
                }}>
                  {heroImages.map((_, index) => (
                    <button 
                      key={index}
                      className="btn btn-sm rounded-circle mx-1 p-0"
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: index === currentImageIndex ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.5)',
                        border: 'none',
                      }}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Container */}
      <div className="container py-5">
      
  
        {/* Section Title */}
        <div className="text-center mb-5">
          <h2 className="fw-bold">Discover Our Features</h2>
          <p className="text-muted text-primary">Explore all the tools we offer to make your travel planning effortless</p>
        </div>

        {/* Feature Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 hover-card">
              <div className="card-body d-flex flex-column p-4">
                <div className="feature-icon mb-3 text-primary">
                  <i className="fas fa-route fa-2x"></i>
                </div>
                <h5 className="card-title fw-bold">Plan Your Journey</h5>
                <p className="card-text text-secondary mb-4">Create personalized itineraries with our AI-powered recommendations for a perfect trip experience.</p>
                <div className="mt-auto">
                  <Link to="/itinerary-planner" className="btn btn-accent w-100">Get Started</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 hover-card">
              <div className="card-body d-flex flex-column p-4">
                <div className="feature-icon mb-3 text-primary">
                  <i className="fas fa-hotel fa-2x"></i>
                </div>
                <h5 className="card-title fw-bold">Book Hotels</h5>
                <p className="card-text text-secondary mb-4">Find and book the best hotel deals with real-time availability and transparent pricing.</p>
                <div className="mt-auto">
                  <Link to="/hotels" className="btn btn-accent w-100">Search Hotels</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 hover-card">
              <div className="card-body d-flex flex-column p-4">
                <div className="feature-icon mb-3 text-primary">
                  <i className="fas fa-plane fa-2x"></i>
                </div>
                <h5 className="card-title fw-bold">Search Flights</h5>
                <p className="card-text text-secondary mb-4">Find and compare flights from hundreds of airlines to destinations worldwide.</p>
                <div className="mt-auto">
                  <Link to="/ticket-planner" className="btn btn-accent w-100">Search Flights</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Ticket Planner Highlight Section */}
        <div className="ticket-planner-section position-relative my-5 py-5">
          {/* Angled blue background element */}
          <div className="angled-bg-blue"></div>
          
          <div className="row align-items-center position-relative">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-3">New Feature: Ticket Planner</h2>
              <p className="lead mb-4">Find the best flight deals with our powerful comparison tool</p>
              <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item text-primary bg-transparent border-0 ps-0">
                  <i className="fas fa-check-circle me-2"></i> 
                  <span>Live comparison of flight prices across multiple airlines</span>
                </li>
                <li className="list-group-item text-primary bg-transparent border-0 ps-0">
                  <i className="fas fa-check-circle  me-2"></i> 
                  <span>Smart suggestions for cheapest travel times</span>
                </li>
                <li className="list-group-item text-primary bg-transparent border-0 ps-0">
                  <i className="fas fa-check-circle me-2"></i> 
                  <span>Detailed flight information and itineraries</span>
                </li>
                <li className="list-group-item text-primary bg-transparent border-0 ps-0">
                  <i className="fas fa-check-circle me-2"></i> 
                  <span>Powered by industry-leading Amadeus API</span>
                </li>
              </ul>
              <Link to="/ticket-planner" className="btn btn-accent btn-lg">
                Try Ticket Planner
              </Link>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 ticket-planner-image">
                <div className="card-body p-0">
                  <img 
                    src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                    alt="Ticket Planner Preview" 
                    className="img-fluid rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center py-3">
          <h2 className="fw-bold mb-3">Ready to start your adventure?</h2>
          <p className="lead mb-4">Join thousands of travelers who use HamSafar to make their travel planning easier.</p>
          <Link to={currentUser ? "/itinerary-planner" : "/login"} className="btn btn-lg" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--primary-color)' }}>
            {currentUser ? "Plan Your Trip" : "Sign Up Now"}
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;