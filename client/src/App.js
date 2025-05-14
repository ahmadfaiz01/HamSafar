import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BasicRecommendations from './pages/BasicRecommendations';
import SimpleDestinationDetail from './pages/SimpleDestinationDetail';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* ...existing routes... */}
        
        {/* Simple recommendation routes */}
        <Route path="/recommendations" element={<BasicRecommendations />} />
        <Route path="/destination/:id" element={<SimpleDestinationDetail />} />
        
        {/* ...existing routes... */}
      </Routes>
    </div>
  );
}

export default App;