// src/pages/profile.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  
  // Safely access auth context
  let auth = { currentUser: null, loading: true, logout: () => {}, userRole: null };
  
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context error:", error);
    // If we're on the client side, redirect to login
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
  }
  
  const { currentUser, userRole, logout } = auth;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [retries, setRetries] = useState(0);
  
  // Profile data
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState('');
  const [availableForWork, setAvailableForWork] = useState(false);

  // Function to check Firebase connectivity
  const checkFirebaseConnection = async () => {
    try {
      // Try to access Firestore with a small timeout
      const testDocRef = doc(db, '_connectivity_test', 'test');
      
      const testPromise = getDoc(testDocRef).catch(err => {
        throw new Error(`Firestore read failed: ${err.message}`);
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firebase connection timeout after 5 seconds')), 5000);
      });
      
      // Race between the Firebase operation and the timeout
      await Promise.race([testPromise, timeoutPromise]);
      
      console.log("Firebase connectivity check passed");
      return true;
    } catch (error) {
      console.error('Firebase connectivity check failed:', error);
      return false;
    }
  };

  // Function to use offline fallback data
  const useOfflineFallback = () => {
    // Set some default values for offline mode
    setName(currentUser?.displayName || '');
    setLoading(false);
    setError('You are currently in offline mode. Some data may not be available, but you can still edit your profile.');
  };

  // Fetch profile data
  const fetchProfile = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      // Check if Firebase is online
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.log("Firebase is offline, using fallback data");
        useOfflineFallback();
        return;
      }
      
      console.log("Fetching profile for user:", currentUser.uid);
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("Profile data loaded successfully");
        const data = docSnap.data();
        setName(data.name || '');
        setTitle(data.title || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setWebsite(data.website || '');
        setGithub(data.github?.username || '');
        setLinkedin(data.linkedin || '');
        setSkills(data.skills?.join(', ') || '');
        setAvailableForWork(data.availableForWork || false);
      } else {
        // Create a new user document if it doesn't exist
        console.log("No profile found, creating a new one");
        
        const newUserData = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          createdAt: new Date(),
          role: userRole || 'user',
        };
        
        try {
          await setDoc(docRef, newUserData);
          console.log("Created new user profile document");
          
          // Set initial state with the data we have
          setName(currentUser.displayName || '');
        } catch (setDocError) {
          console.error("Failed to create new user document:", setDocError);
          // Still use the data we have from auth
          setName(currentUser.displayName || '');
        }
      }
      
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError('Failed to load profile data: ' + error.message);
      
      // If we've retried less than 3 times, try again after a delay
      if (retries < 3) {
        const retryDelay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Retrying in ${retryDelay/1000} seconds (retry ${retries + 1}/3)...`);
        
        setTimeout(() => {
          setRetries(retries + 1);
          fetchProfile();
        }, retryDelay);
      } else {
        // After 3 retries, use offline fallback
        useOfflineFallback();
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch profile data on component mount
  useEffect(() => {
    if (!auth.loading) {
      fetchProfile();
    }
  }, [currentUser, auth.loading]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!auth.loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, auth.loading, router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("You must be logged in to save your profile");
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        setError('Cannot save profile while offline. Please check your internet connection and try again.');
        setSaving(false);
        return;
      }
      
      const skillsArray = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);
      
      const docRef = doc(db, 'users', currentUser.uid);
      
      const profileData = {
        name,
        title,
        bio,
        location,
        website,
        github: {
          username: github
        },
        linkedin,
        skills: skillsArray,
        availableForWork,
        profileComplete: true,
        updatedAt: new Date()
      };
      
      // Try to update the document
      try {
        await updateDoc(docRef, profileData);
      } catch (updateError) {
        // If update fails (document might not exist), try to create it
        if (updateError.code === 'not-found') {
          await setDoc(docRef, {
            ...profileData,
            email: currentUser.email,
            createdAt: new Date(),
            role: userRole || 'user'
          });
        } else {
          throw updateError;
        }
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError('Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
      setError('Failed to log out: ' + error.message);
    }
  };
  
  // If still loading auth, show loading spinner
  if (auth.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // If not logged in and still rendering, show nothing
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Profile - VFied</title>
      </Head>
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              VFied
            </Link>
            
            <nav className="flex space-x-4">
              <Link href="/dashboard" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Dashboard
              </Link>
              
              <Link href="/profile" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700">
                Profile
              </Link>
              
              {userRole === 'employer' && (
                <Link href="/requisitions" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Job Requisitions
                </Link>
              )}
              
              {userRole === 'recruiter' && (
                <Link href="/recruiter/dashboard" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Recruiter Tools
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete your profile to help employers find you based on your skills and experience.
          </p>
        </div>
        
        {loading ? (
          <div className="mt-6 bg-white shadow rounded-lg p-6 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
            <form className="p-6" onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                      <button 
                        type="button"
                        className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                        onClick={() => {
                          setError('');
                          setLoading(true);
                          setRetries(0);
                          fetchProfile();
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Profile saved successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Professional Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., Full Stack Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows="4"
                    placeholder="Tell employers a bit about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., New York, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    id="website"
                    type="url"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                    GitHub Username
                  </label>
                  <input
                    id="github"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., octocat"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                    LinkedIn Username
                  </label>
                  <input
                    id="linkedin"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., johndoe"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills (comma separated)
                  </label>
                  <input
                    id="skills"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., JavaScript, React, Node.js"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="availableForWork"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={availableForWork}
                      onChange={(e) => setAvailableForWork(e.target.checked)}
                    />
                    <label htmlFor="availableForWork" className="ml-2 block text-sm text-gray-700">
                      I am currently available for work opportunities
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}