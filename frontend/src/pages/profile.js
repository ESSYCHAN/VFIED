import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Profile() {
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

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: '#5a45f8',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #ffffff, #e0e0ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    nav: {
      display: 'flex',
      gap: '20px'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      transition: 'background-color 0.2s'
    },
    activeNavLink: {
      backgroundColor: 'rgba(255,255,255,0.2)'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      padding: '32px',
      marginBottom: '24px'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '24px'
    },
    inputGroup: {
      
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      lineHeight: '1.5',
      transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      lineHeight: '1.5',
      transition: 'border-color 0.2s',
      minHeight: '120px',
      resize: 'vertical'
    },
    button: {
      backgroundColor: '#5a45f8',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    loadingCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      padding: '32px',
      textAlign: 'center',
      color: '#6b7280'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '8px'
    },
    checkbox: {
      marginRight: '8px'
    },
    buttonGroup: {
      marginTop: '16px',
      gridColumn: '1 / -1'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px',
      gridColumn: '1 / -1'
    },
    success: {
      backgroundColor: '#dcfce7',
      color: '#15803d',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px',
      gridColumn: '1 / -1'
    },
    wideField: {
      gridColumn: '1 / -1'
    }
  };

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
      if (!currentUser) return;
      
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
    <div style={styles.container}>
      <Head>
        <title>Profile - VFied</title>
      </Head>
      
      <header style={styles.header}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={styles.logo}>VFied</div>
        </Link>
        <nav style={styles.nav}>
          <Link 
            href="/dashboard" 
            style={styles.navLink}
          >
            Dashboard
          </Link>
          <Link 
            href="/profile" 
            style={{
              ...styles.navLink, 
              ...styles.activeNavLink
            }}
          >
            Profile
          </Link>
          <Link 
            href="/settings" 
            style={styles.navLink}
          >
            Settings
          </Link>
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.navLink, 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      
      <main style={styles.main}>
        <div>
          <h1 style={styles.title}>Your Profile</h1>
          <p style={styles.subtitle}>
            Complete your profile to help employers find you based on your skills and experience.
          </p>
        </div>
        
        {loading ? (
          <div style={styles.loadingCard}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
            <p>Loading profile data...</p>
          </div>
        ) : (
          <div style={styles.card}>
            <form style={styles.form} onSubmit={handleSubmit}>
              {error && (
                <div style={styles.error}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={styles.success}>
                  Profile saved successfully!
                </div>
              )}
              
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="title">
                  Professional Title
                </label>
                <input
                  id="title"
                  type="text"
                  style={styles.input}
                  placeholder="e.g., Full Stack Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div style={styles.wideField}>
                <label style={styles.label} htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  style={styles.textarea}
                  placeholder="Tell employers a bit about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  style={styles.input}
                  placeholder="e.g., New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="website">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  style={styles.input}
                  placeholder="e.g., https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="github">
                  GitHub Username
                </label>
                <input
                  id="github"
                  type="text"
                  style={styles.input}
                  placeholder="e.g., octocat"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="linkedin">
                  LinkedIn Username
                </label>
                <input
                  id="linkedin"
                  type="text"
                  style={styles.input}
                  placeholder="e.g., johndoe"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
              
              <div style={styles.wideField}>
                <label style={styles.label} htmlFor="skills">
                  Skills (comma separated)
                </label>
                <input
                  id="skills"
                  type="text"
                  style={styles.input}
                  placeholder="e.g., JavaScript, React, Node.js"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              
              <div style={styles.wideField}>
                <div style={styles.checkboxGroup}>
                  <input
                    id="availableForWork"
                    type="checkbox"
                    style={styles.checkbox}
                    checked={availableForWork}
                    onChange={(e) => setAvailableForWork(e.target.checked)}
                  />
                  <label htmlFor="availableForWork">
                    I am currently available for work opportunities
                  </label>
                </div>
              </div>
              
              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={saving}
                  style={styles.button}
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