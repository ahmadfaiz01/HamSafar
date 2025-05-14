import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Itinerary from './pages/Itinerary';
import Recommendations from './pages/Recommendations';
import FlightSearch from './pages/FlightSearch';
import WeatherInfo from './components/WeatherInfo';
import MapView from './components/MapView';
import TicketPlanner from './pages/TicketPlanner';
import Chatbot from './pages/Chatbot';
import ChatFAB from './components/ChatFab';
import HotelBooking from './pages/HotelBooking'; // Import the HotelBooking component
import FlightPage from './pages/FlightPage'; // Import FlightPage component
import ForgotPassword from './pages/ForgotPassword'; // Import ForgotPassword component
import theme from './theme';  // Use named import instead of default import
import ItineraryDashboard from './pages/ItineraryDashboard';
import CreateItinerary from './pages/CreateItinerary';
import ItineraryDetail from './pages/ItineraryDetail';
import EditItinerary from './pages/EditItinerary';

// Add the new routes for the itinerary planner features
import ItineraryPlanner from './components/itinerary/ItineraryPlanner';
import TripDetails from './components/itinerary/TripDetails';
import SavedTrips from './components/profile/SavedTrips';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './assets/logo.png'; // Import the logo image

// Protected route wrapper function
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="d-flex justify-content-center p-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app-container d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/weather" element={<WeatherInfo />} />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/itinerary" element={
                  <PrivateRoute>
                    <Itinerary />
                  </PrivateRoute>
                } />
                <Route path="/recommendations" element={
                  <PrivateRoute>
                    <Recommendations />
                  </PrivateRoute>
                } />
                <Route path="/flights" element={<FlightPage />} />
                <Route path="/flights/search" element={<FlightPage />} />
                <Route path="/ticket-planner" element={<TicketPlanner />} />
                <Route path="/weather/:city" element={<WeatherInfo />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/hotels" element={<HotelBooking />} />
                <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add Forgot Password route */}
                
                {/* Itinerary Routes */}
                <Route path="/itinerary/dashboard" element={<ItineraryDashboard />} />
                <Route path="/itinerary/create" element={<CreateItinerary />} />
                <Route path="/itinerary/:id" element={<ItineraryDetail />} />
                <Route path="/itinerary/edit/:id" element={<EditItinerary />} />
                
                {/* New Itinerary Planner Routes */}
                <Route path="/itinerary-planner" element={<ItineraryPlanner />} />
                <Route path="/trip/:tripId" element={<TripDetails />} />
                <Route path="/profile/trips" element={<SavedTrips />} />
              </Routes>
            </main>
            <footer className="modern-footer text-white py-5">
              <div className="container py-4">
                <div className="row g-4">
                  <div className="col-lg-4 mb-4 mb-lg-0">
                    <div className="footer-brand d-flex align-items-center mb-3">
                      <img 
                        src={logo} 
                        alt="HamSafar Logo" 
                        className="footer-logo me-2"
                      />
                    </div>
                    <p className="text-light mb-4 footer-text">
                      Your all-in-one travel planning solution. Designed to make your journey seamless and memorable.
                    </p>
                    <div className="social-icons">
                      <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                      <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                      <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                      <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2 mb-4 mb-lg-0">
                    <h6 className="text-uppercase fw-bold mb-3 footer-heading">Explore</h6>
                    <ul className="list-unstyled footer-links">
                      <li><Link to="/" className="footer-link">Home</Link></li>
                      <li><Link to="/ticket-planner" className="footer-link">Ticket Planner</Link></li>
                      <li><Link to="/profile" className="footer-link">Profile</Link></li>
                    </ul>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2 mb-4 mb-lg-0">
                    <h6 className="text-uppercase fw-bold mb-3 footer-heading">Features</h6>
                    <ul className="list-unstyled footer-links">
                      <li><Link to="/itinerary-planner" className="footer-link">Plan Trip</Link></li>
                      <li><Link to="/recommendations" className="footer-link">Recommendations</Link></li>
                      <li><Link to="/chatbot" className="footer-link">Travel Assistant</Link></li>
                    </ul>
                  </div>
                  
                  <div className="col-md-4 col-lg-4">
                    <h6 className="text-uppercase fw-bold mb-3 footer-heading">Contact Us</h6>
                    <ul className="list-unstyled footer-contact">
                      <li className="d-flex mb-3">
                        <i className="fas fa-envelope me-2 neon-text"></i>
                        <span>info@hamsafar.com</span>
                      </li>
                      <li className="d-flex mb-3">
                        <i className="fas fa-phone me-2 neon-text"></i>
                        <span>+92 (300) 456-7890</span>
                      </li>
                      <li className="d-flex">
                        <i className="fas fa-map-marker-alt me-2 neon-text"></i>
                        <span>Islamabad, Pakistan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="footer-bottom">
                <div className="container">
                  <hr className="footer-divider" />
                  <div className="d-md-flex justify-content-between align-items-center text-center text-md-start py-2">
                    <p className="mb-md-0">© {new Date().getFullYear()} HamSafar. All rights reserved.</p>
                    <div className="footer-legal">
                      <Link to="/privacy" className="footer-link me-3">Privacy Policy</Link>
                      <Link to="/terms" className="footer-link me-3">Terms of Service</Link>
                      <Link to="/cookies" className="footer-link">Cookies</Link>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <ChatFAB />
          <ToastContainer position="top-right" autoClose={3000} />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;