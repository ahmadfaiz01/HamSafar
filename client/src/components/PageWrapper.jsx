import React from 'react';
import { useLocation } from 'react-router-dom';

const PageWrapper = ({ children, className = '' }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className={`page-wrapper ${isHomePage ? '' : 'content-page'} ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;