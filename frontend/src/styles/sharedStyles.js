// src/styles/sharedStyles.js
export const styles = {
    // Layout
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
    },
    
    // Header/Navigation
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
    
    // Typography
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
    
    // Components
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      padding: '32px',
      marginBottom: '24px'
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
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#5a45f8',
      border: '1px solid #5a45f8',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    
    // Form elements
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      lineHeight: '1.5',
      transition: 'border-color 0.2s',
      marginBottom: '16px'
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
      resize: 'vertical',
      marginBottom: '16px'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      lineHeight: '1.5',
      transition: 'border-color 0.2s',
      backgroundColor: 'white',
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    
    // Status indicators
    error: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    success: {
      backgroundColor: '#dcfce7',
      color: '#15803d',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    warning: {
      backgroundColor: '#fff7ed',
      color: '#c2410c',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    info: {
      backgroundColor: '#eff6ff',
      color: '#1e40af',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    
    // Badges
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500'
    },
    badgeSuccess: {
      backgroundColor: '#dcfce7',
      color: '#15803d'
    },
    badgeWarning: {
      backgroundColor: '#fff7ed',
      color: '#c2410c'
    },
    badgeDanger: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c'
    },
    badgeInfo: {
      backgroundColor: '#eff6ff',
      color: '#1e40af'
    },
    
    // Utility
    mt1: { marginTop: '4px' },
    mt2: { marginTop: '8px' },
    mt4: { marginTop: '16px' },
    mt8: { marginTop: '32px' },
    mb1: { marginBottom: '4px' },
    mb2: { marginBottom: '8px' },
    mb4: { marginBottom: '16px' },
    mb8: { marginBottom: '32px' },
    flexBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    flexCenter: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    grid2Cols: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    },
    grid3Cols: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    },
    
    // Auth forms
    authContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f7fa',
      padding: '16px'
    },
    authFormContainer: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      padding: '32px'
    },
    authHeader: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    authLogo: {
      fontSize: '30px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #5a45f8, #c177ec)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '16px'
    },
    
    // Dashboard specific
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '16px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    
    // Credentials
    credentialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    },
    credentialCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '16px',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    credentialCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    credentialType: {
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase',
      color: '#6b7280',
      marginBottom: '8px'
    },
    credentialTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '4px'
    },
    credentialIssuer: {
      fontSize: '14px',
      color: '#4b5563',
      marginBottom: '12px'
    }
  };