import React, { useState } from 'react';

const DebugPanel = ({ apiUrl, collection }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      setResult(data);
      console.log('API check result:', data);
    } catch (err) {
      setError(err.message);
      console.error('API check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      zIndex: 9999,
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '10px',
      maxWidth: '400px'
    }}>
      <h5>Debug: {collection}</h5>
      <button 
        onClick={checkApi}
        className="btn btn-sm btn-primary mb-2"
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check API'}
      </button>
      
      {error && (
        <div className="alert alert-danger" style={{ fontSize: '12px' }}>
          {error}
        </div>
      )}
      
      {result && (
        <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '12px' }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
