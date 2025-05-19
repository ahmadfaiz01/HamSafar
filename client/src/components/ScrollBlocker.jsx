import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component prevents browser auto-scrolling behavior
const ScrollBlocker = () => {
  const location = useLocation();

  useEffect(() => {
    // Override the browser's scroll restoration behavior
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Block scroll anchoring
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        overflow-anchor: none !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Clean up
      document.head.removeChild(style);
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return null;
};

export default ScrollBlocker;