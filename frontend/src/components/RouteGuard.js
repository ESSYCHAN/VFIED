// src/components/RouteGuard.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import UnauthorizedAccess from './UnauthorizedAccess';

/**
 * A component that guards routes based on authentication and role requirements
 * 
 * @param {Object} props Component props
 * @param {string|string[]} props.allowedRoles Roles that are allowed to access this route
 * @param {boolean} props.requireAuth Whether authentication is required
 * @param {string} props.redirectTo Where to redirect if access is denied (defaults to dashboard or login)
 * @param {React.ReactNode} props.children The content to render if access is granted
 */
export default function RouteGuard({ 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = null,
  children 
}) {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  
  // Convert allowedRoles to array if it's a string
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  useEffect(() => {
    // Still loading auth state
    if (loading) {
      setAuthorized(null);
      return;
    }
    
    // Authentication check
    if (requireAuth && !currentUser) {
      setAuthorized(false);
      router.push(redirectTo || '/login');
      return;
    }
    
    // If no role restrictions or user has an allowed role
    if (
      !requireAuth || 
      roles.length === 0 || 
      roles.includes(userRole) ||
      userRole === 'admin' // Admin has access to everything
    ) {
      setAuthorized(true);
      return;
    }
    
    // User doesn't have the required role
    setAuthorized(false);
    
    // If redirectTo is provided, redirect there
    if (redirectTo) {
      router.push(redirectTo);
    }
    // Otherwise show unauthorized message directly (handled in return)
  }, [currentUser, userRole, loading, router, redirectTo, requireAuth, roles]);
  
  // Show loading state
  if (loading || authorized === null) {
    return <LoadingScreen message="Checking permissions..." />;
  }
  
  // Show unauthorized message if not redirecting
  if (!authorized && !redirectTo) {
    return <UnauthorizedAccess currentRole={userRole} requiredRoles={roles} />;
  }
  
  // Render children if authorized
  return authorized ? children : null;
}