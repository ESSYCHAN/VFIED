// src/components/LoadingScreen.js
import React from 'react';

/**
 * A loading screen component to show while checking permissions or loading data
 * 
 * @param {Object} props Component props
 * @param {string} props.message Custom message to display
 */
export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="animate-spin mx-auto h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">{message}</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your experience.</p>
      </div>
    </div>
  );
}