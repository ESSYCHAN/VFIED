// frontend/src/pages/debug-firebase.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import FirebaseTroubleshooter from '../components/FirebaseTroubleshooter';

export default function DebugFirebase() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  async function testGoogleSignIn() {
    try {
      setStatus('loading');
      setError(null);
      
      // Using direct Firebase auth function, not the imported one
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      setResult({
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName
        }
      });
      setStatus('success');
    } catch (error) {
      console.error('Debug sign-in error:', error);
      setError({
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setStatus('error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Firebase Debugging</h1>
      
      <div className="mb-6 bg-blue-50 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        {currentUser ? (
          <div>
            <p><strong>User ID:</strong> {currentUser.uid}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Display Name:</strong> {currentUser.displayName || 'Not set'}</p>
          </div>
        ) : (
          <p>Not authenticated</p>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Google Sign-In</h2>
        <button
          onClick={testGoogleSignIn}
          disabled={status === 'loading'}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Signing in...' : 'Test Google Auth'}
        </button>
        
        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <h3 className="font-medium text-green-800">Sign-in successful</h3>
            <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 rounded">
            <h3 className="font-medium text-red-800">Sign-in failed</h3>
            <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <FirebaseTroubleshooter />
    </div>
  );
}