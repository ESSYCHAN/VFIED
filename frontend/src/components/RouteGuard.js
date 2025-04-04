import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RouteGuard({ allowedRoles, children }) {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userRole && !allowedRoles.includes(userRole)) {
      router.push('/unauthorized');
    }
  }, [userRole, loading, allowedRoles]);

  if (loading || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Checking permissions...</h1>
          {/* Add your loading spinner here */}
        </div>
      </div>
    );
  }

  return children;
}