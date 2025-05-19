import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BasicRecommendations from './pages/BasicRecommendations';
import SimpleDestinationDetail from './pages/SimpleDestinationDetail';
import ProtectedRoute from './components/common/ProtectedRoute';
import Hotels from './pages/Hotels';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <main>
            <Routes>
              {/* Home routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Hotel routes */}
              <Route path="/hotels" element={<Hotels />} />

              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Recommendation routes */}
              <Route path="/recommendations" element={<BasicRecommendations />} />
              <Route path="/destination/:id" element={<SimpleDestinationDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

// Add a simple NotFound component for debugging
const NotFound = () => {
  const location = useLocation();
  
  return (
    <div className="container mt-5 text-center">
      <h1>Page Not Found</h1>
      <p>The requested page "{location.pathname}" does not exist.</p>
      <p>This could be due to:</p>
      <ul className="list-unstyled">
        <li>A missing or incorrect route definition</li>
        <li>A typo in the URL</li>
        <li>An issue with lazy-loaded components</li>
      </ul>
      <Link to="/" className="btn btn-primary mt-3">Go to Homepage</Link>
    </div>
  );
};

export default App;