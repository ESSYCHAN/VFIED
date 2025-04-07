// frontend/src/components/FirebaseTroubleshooter.js
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

export default function FirebaseTroubleshooter() {
  const [testResult, setTestResult] = useState(null);
  const [firebaseConfig, setFirebaseConfig] = useState({});
  const [loading, setLoading] = useState(false);

  // Check Firebase configuration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFirebaseConfig({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing'
      });
    }
  }, []);

  // Run Firestore test
  async function testFirestore() {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Create a test document
      const testCollection = collection(db, 'firestoreTest');
      const testData = { 
        testField: 'Test Value', 
        timestamp: new Date().toISOString() 
      };
      
      const docRef = await addDoc(testCollection, testData);
      console.log("Test document written with ID: ", docRef.id);
      
      // Read the test collection
      const querySnapshot = await getDocs(testCollection);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      // Clean up - delete the documents
      for (const doc of docs) {
        await deleteDoc(docRef);
      }
      
      setTestResult({
        success: true,
        message: 'Firestore connection is working correctly',
        details: {
          testDocId: docRef.id,
          documentsFound: docs.length
        }
      });
    } catch (error) {
      console.error("Firestore test error:", error);
      setTestResult({
        success: false,
        message: 'Firestore test failed',
        error: {
          code: error.code,
          message: error.message
        }
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Firebase Configuration Checker</h2>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Environment Variables</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(firebaseConfig).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className={value.startsWith('✓') ? 'text-green-600' : 'text-red-600'}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Test Firestore Connection</h3>
        <button 
          onClick={testFirestore}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Test'}
        </button>
        
        {testResult && (
          <div className={`mt-3 p-3 rounded text-sm ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={testResult.success ? 'text-green-800' : 'text-red-800'}>
              {testResult.message}
            </p>
            {testResult.details && (
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            )}
            {testResult.error && (
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                {JSON.stringify(testResult.error, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-2">Browser Compatibility Check</h3>
        <ul className="text-sm space-y-1">
          <li className="flex items-center">
            <span className={typeof window !== 'undefined' && 'indexedDB' in window ? 'text-green-600' : 'text-red-600'}>
              {typeof window !== 'undefined' && 'indexedDB' in window ? '✓' : '✗'}
            </span>
            <span className="ml-2">IndexedDB Support</span>
          </li>
          <li className="flex items-center">
            <span className={typeof window !== 'undefined' && 'localStorage' in window ? 'text-green-600' : 'text-red-600'}>
              {typeof window !== 'undefined' && 'localStorage' in window ? '✓' : '✗'}
            </span>
            <span className="ml-2">LocalStorage Support</span>
          </li>
          <li className="flex items-center">
            <span className={typeof window !== 'undefined' && navigator.onLine ? 'text-green-600' : 'text-yellow-600'}>
              {typeof window !== 'undefined' && navigator.onLine ? '✓' : '⚠'}
            </span>
            <span className="ml-2">Online Status</span>
          </li>
        </ul>
      </div>
    </div>
  );
}