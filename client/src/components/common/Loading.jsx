import React from 'react';

const Loading = ({ message }) => {
  return (
    <div className="text-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">{message || 'Loading...'}</p>
    </div>
  );
};

export default Loading;