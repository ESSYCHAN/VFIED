// src/components/FirebaseTroubleshooter.js
import React, { useState, useEffect } from 'react';
import { app, db, auth, isFirebaseConfigured } from '../lib/firebase';

const FirebaseTroubleshooter = () => {
  const [firebaseStatus, setFirebaseStatus] = useState({
    initialized: false,
    configValid: false,
    connection: 'checking',
    firestore: 'checking',
    auth: 'checking',
    details: {}
  });

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    const status = {
      initialized: Boolean(app),
      configValid: isFirebaseConfigured(),
      connection: 'checking',
      firestore: 'checking',
      auth: 'checking',
      details: {}
    };

    // Check if Firebase is initialized
    if (!app) {
      status.details.initError = 'Firebase app not initialized';
      setFirebaseStatus(status);
      return;
    }

    // Check config validity
    if (!status.configValid) {
      status.details.configError = 'Firebase configuration is incomplete';
    }

    // Check Firebase connection
    try {
      // Check Firestore connection
      if (db) {
        try {
          const testCollection = db.collection('_connectionTest');
          await testCollection.doc('test').set({ timestamp: new Date() });
          await testCollection.doc('test').delete();
          status.firestore = 'connected';
        } catch (error) {
          status.firestore = 'error';
          status.details.firestoreError = error.message;
        }
      } else {
        status.firestore = 'not initialized';
      }

      // Check Auth connection
      if (auth) {
        try {
          await auth.currentUser?.reload();
          status.auth = 'connected';
        } catch (error) {
          // This will error if no user is logged in, which is fine
          if (error.code === 'auth/no-current-user') {
            status.auth = 'connected';
          } else {
            status.auth = 'error';
            status.details.authError = error.message;
          }
        }
      } else {
        status.auth = 'not initialized';
      }

      // Overall connection status
      if (status.firestore === 'connected' || status.auth === 'connected') {
        status.connection = 'connected';
      } else {
        status.connection = 'error';
      }
    } catch (error) {
      status.connection = 'error';
      status.details.connectionError = error.message;
    }

    setFirebaseStatus(status);
  };

  const getStatusColor = (status) => {
    if (status === 'connected') return 'green';
    if (status === 'checking') return 'orange';
    if (status === 'not initialized') return 'orange';
    return 'red';
  };

  const renderDetailRows = () => {
    const rows = [];
    
    for (const [key, value] of Object.entries(firebaseStatus.details)) {
      rows.push(
        <tr key={key}>
          <td style={styles.cell}>{key}</td>
          <td style={styles.cell}>{value}</td>
        </tr>
      );
    }
    
    return rows;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Firebase Connection Troubleshooter</h2>
      
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.cell}>Firebase Initialized</td>
            <td style={styles.cell}>
              <span style={{color: firebaseStatus.initialized ? 'green' : 'red'}}>
                {firebaseStatus.initialized ? '✓' : '✗'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={styles.cell}>Config Valid</td>
            <td style={styles.cell}>
              <span style={{color: firebaseStatus.configValid ? 'green' : 'red'}}>
                {firebaseStatus.configValid ? '✓' : '✗'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={styles.cell}>Connection Status</td>
            <td style={styles.cell}>
              <span style={{color: getStatusColor(firebaseStatus.connection)}}>
                {firebaseStatus.connection}
              </span>
            </td>
          </tr>
          <tr>
            <td style={styles.cell}>Firestore Status</td>
            <td style={styles.cell}>
              <span style={{color: getStatusColor(firebaseStatus.firestore)}}>
                {firebaseStatus.firestore}
              </span>
            </td>
          </tr>
          <tr>
            <td style={styles.cell}>Auth Status</td>
            <td style={styles.cell}>
              <span style={{color: getStatusColor(firebaseStatus.auth)}}>
                {firebaseStatus.auth}
              </span>
            </td>
          </tr>
          {renderDetailRows()}
        </tbody>
      </table>

      <div style={styles.buttonContainer}>
        <button 
          onClick={checkFirebaseStatus}
          style={styles.button}
        >
          Check Firebase Connection
        </button>
      </div>

      <div style={styles.troubleshootingTips}>
        <h3 style={styles.subTitle}>Troubleshooting Tips</h3>
        <ul style={styles.list}>
          <li>Make sure you have correctly set all Firebase environment variables in your .env.local file</li>
          <li>Check that your Firebase project's Authentication service has Google sign-in enabled</li>
          <li>Verify that your Firebase project's Firestore database is created and not in locked mode</li>
          <li>Ensure your Firebase project's security rules allow the operations you're trying to perform</li>
          <li>Check your network connection and make sure you're not behind a restrictive firewall</li>
          <li>Clear browser cache and cookies if you continue experiencing issues</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  subTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '20px',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  cell: {
    padding: '10px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  buttonContainer: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  troubleshootingTips: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
  },
  list: {
    paddingLeft: '20px',
    margin: '10px 0',
  },
};

export default FirebaseTroubleshooter;