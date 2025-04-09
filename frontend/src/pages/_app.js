// src/pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import NetworkMonitor from '../components/NetworkMonitor';
import { setupBackgroundSync } from '../lib/backgroundSync';


function MyApp({ Component, pageProps }) {
  useEffect(() => {
    setupBackgroundSync();
  }, []);

  return (
    <AuthProvider>
      <NetworkMonitor />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
export default MyApp;