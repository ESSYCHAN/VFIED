import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f7fa',
      padding: '16px'
    },
    formContainer: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      padding: '32px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logo: {
      fontSize: '30px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #5a45f8, #c177ec)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280'
    },
    form: {
      marginBottom: '24px'
    },
    inputGroup: {
      marginBottom: '16px'
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
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      border: 'none',
      backgroundColor: '#5a45f8',
      color: 'white',
      marginBottom: '16px'
    },
    socialButton: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    dividerLine: {
      flexGrow: 1,
      height: '1px',
      backgroundColor: '#e5e7eb'
    },
    dividerText: {
      padding: '0 16px',
      color: '#6b7280',
      fontSize: '14px'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    link: {
      color: '#5a45f8',
      textDecoration: 'none',
      fontWeight: '500'
    },
    footer: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: '#6b7280'
    },
    roleSelection: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    roleOption: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '16px'
    },
    radio: {
      marginRight: '8px'
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name, role);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    }
    
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google: ' + error.message);
    }
    setLoading(false);
  }

  async function handleGithubSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGithub();
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to sign in with GitHub: ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>Sign Up - VFied</title>
      </Head>
      
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <div style={styles.logo}>VFied</div>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Your Credentials, Your Super-Power</p>
        </div>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email-address">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password-confirm">Confirm Password</label>
            <input
              id="password-confirm"
              name="password-confirm"
              type="password"
              autoComplete="new-password"
              required
              style={styles.input}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          <div style={styles.roleSelection}>
            <div style={styles.roleOption}>
              <input
                id="candidate"
                name="role"
                type="radio"
                style={styles.radio}
                checked={role === 'candidate'}
                onChange={() => setRole('candidate')}
              />
              <label htmlFor="candidate">I'm looking for a job</label>
            </div>
            <div style={styles.roleOption}>
              <input
                id="employer"
                name="role"
                type="radio"
                style={styles.radio}
                checked={role === 'employer'}
                onChange={() => setRole('employer')}
              />
              <label htmlFor="employer">I'm hiring</label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>
        
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>Or continue with</span>
          <div style={styles.dividerLine}></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={styles.socialButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4" />
          </svg>
          Sign up with Google
        </button>

        <button
          onClick={handleGithubSignIn}
          disabled={loading}
          style={styles.socialButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="#24292F" />
          </svg>
          Sign up with GitHub
        </button>
        
        <div style={styles.footer}>
          Already have an account?{' '}
          <Link href="/login">
            <span style={styles.link}>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}