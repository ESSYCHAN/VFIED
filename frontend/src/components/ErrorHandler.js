// src/components/ErrorHandler.js
import React from 'react';

const ErrorHandler = ({ error, onRetry, onContinueWithMock }) => {
  // Determine error type and provide specific guidance
  const getErrorType = () => {
    if (!error) return null;
    
    if (error.includes('permission') || error.includes('Permission')) {
      return {
        icon: '🔒',
        title: 'Permission Error',
        description: 'You don\'t have permission to access these resources.',
        tip: 'This could be due to authentication issues. Try logging out and back in.'
      };
    } else if (error.includes('offline') || error.includes('connection') || error.includes('network')) {
      return {
        icon: '🌐',
        title: 'Connection Error',
        description: 'Could not connect to the server.',
        tip: 'Check your internet connection and try again.'
      };
    } else if (error.includes('timeout') || error.includes('timed out')) {
      return {
        icon: '⏱️',
        title: 'Request Timeout',
        description: 'The server took too long to respond.',
        tip: 'This might be due to slow internet or high server load. Try again later.'
      };
    } else {
      return {
        icon: '⚠️',
        title: 'Error Loading Data',
        description: error,
        tip: 'If this problem persists, please contact support.'
      };
    }
  };
  
  const errorInfo = getErrorType();
  
  return (
    <div style={{ 
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      borderLeft: '4px solid #ef4444',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ 
          fontSize: '24px',
          marginRight: '16px',
          color: '#ef4444'
        }}>
          {errorInfo.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#ef4444',
            marginBottom: '8px' 
          }}>
            {errorInfo.title}
          </h3>
          <p style={{ 
            marginBottom: '16px',
            color: '#4b5563',
            fontSize: '14px'
          }}>
            {errorInfo.description}
          </p>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <button 
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#5a45f8',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🔄</span> Try Again
            </button>
            
            {onContinueWithMock && (
              <button 
                onClick={onContinueWithMock}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Continue with Sample Data
              </button>
            )}
          </div>
          
          <p style={{ 
            fontSize: '13px',
            color: '#6b7280',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span>{errorInfo.tip}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler;