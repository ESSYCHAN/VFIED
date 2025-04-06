// src/pages/profile.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Profile() {
  // All hooks must be called unconditionally at the top level
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
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
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setError('');
      
      const skillsArray = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);
      
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
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
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError('Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
                  Profile saved successfully!
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
              
              <div className="mt-6 text-right">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}