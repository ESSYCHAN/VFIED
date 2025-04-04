// src/pages/_app.js
// import '../styles/globals.css';
// // import { AuthProvider } from '../context/AuthContext';
// import { AuthProvider } from '@/context/AuthContext';


import { AuthProvider } from '@/context/AuthContext';
import { initializeFirebase } from '@/lib/firebase';

// Initialize Firebase once
initializeFirebase();

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;