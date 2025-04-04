// src/pages/debug-firebase.js
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import FirebaseTroubleshooter from '@/components/FirebaseTroubleshooter';
import { signInWithGoogle } from '@/lib/firebase';

const FirebaseDebugPage = () => {
  const [googleSignInResult, setGoogleSignInResult] = useState(null);
  const [signInError, setSignInError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setSignInError(null);
    try {
      const user = await signInWithGoogle();
      setGoogleSignInResult({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      });
    } catch (error) {
      console.error('Google sign-in test error:', error);
      setSignInError(error.message || 'An unknown error occurred');
      setGoogleSignInResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>Firebase Debug Page</h1>
        <p style={styles.description}>
          This page helps you diagnose issues with Firebase configuration and connection.
        </p>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Environment Variables</h2>
          <p>These should all have values. If any are undefined, you need to update your .env.local file:</p>
          
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.cellKey}>NEXT_PUBLIC_FIREBASE_API_KEY</td>
                <td style={styles.cellValue}>
                  {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Defined' : '✗ Undefined'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellKey}>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</td>
                <td style={styles.cellValue}>
                  {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Defined' : '✗ Undefined'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellKey}>NEXT_PUBLIC_FIREBASE_PROJECT_ID</td>
                <td style={styles.cellValue}>
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Defined' : '✗ Undefined'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellKey}>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</td>
                <td style={styles.cellValue}>
                  {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Defined' : '✗ Undefined'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellKey}>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</td>
                <td style={styles.cellValue}>
                  {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Defined' : '✗ Undefined'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellKey}>NEXT_PUBLIC_FIREBASE_APP_ID</td>
                <td style={styles.cellValue}>
                  {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Defined' : '✗ Undefined'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Test Google Sign-In</h2>
          <p>Click the button below to test Google sign-in:</p>
          
          <button 
            onClick={handleGoogleSignIn} 
            disabled={loading} 
            style={styles.button}
          >
            {loading ? 'Testing...' : 'Test Google Sign-In'}
          </button>

          {googleSignInResult && (
            <div style={styles.result}>
              <h3 style={styles.resultTitle}>Test Result:</h3>
              <div style={styles.resultContent}>
                <pre>{JSON.stringify(googleSignInResult, null, 2)}</pre>
              </div>
            </div>
          )}

          {signInError && (
            <div style={styles.error}>
              <h3 style={styles.errorTitle}>Error:</h3>
              <p>{signInError}</p>
            </div>
          )}
        </div>

        <FirebaseTroubleshooter />
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  description: {
    fontSize: '16px',
    marginBottom: '24px',
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
  },
  cellKey: {
    padding: '8px',
    border: '1px solid #ddd',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
  },
  cellValue: {
    padding: '8px',
    border: '1px solid #ddd',
  },
  button: {
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px',
  },
  result: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f5f8ff',
    borderRadius: '4px',
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  resultContent: {
    maxHeight: '200px',
    overflow: 'auto',
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  error: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#fff5f5',
    borderRadius: '4px',
    color: '#e53e3e',
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
};

export default FirebaseDebugPage;