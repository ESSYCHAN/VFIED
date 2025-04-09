
// frontend/src/components/NetworkStatus.js
import React, { useState, useEffect } from 'react';

// Add useEffect to avoid hydration errors
const NetworkStatus = ({ onStatusChange }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const handleOnline = () => onStatusChange(true);
    const handleOffline = () => onStatusChange(false);
    
    // Set initial status
    onStatusChange(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);
  
  // Don't render anything during SSR
  if (!isMounted) return null;
  
  return null; // Or a UI indicator if you want to show network status
};

export default NetworkStatus;
