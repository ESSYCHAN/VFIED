
// frontend/src/components/NetworkStatus.js
import React, { useState, useEffect } from 'react';

const NetworkStatus = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Initial status
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => {
        setIsOnline(true);
        if (onStatusChange) onStatusChange(true);
      };

      const handleOffline = () => {
        setIsOnline(false);
        if (onStatusChange) onStatusChange(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [onStatusChange]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
      You are currently offline. Some features may not be available.
    </div>
  );
};

export default NetworkStatus;
