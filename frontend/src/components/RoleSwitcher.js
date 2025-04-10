// frontend/src/components/RoleSwitcher.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RoleSwitcher() {
  const { userRole } = useAuth();
  const [newRole, setNewRole] = useState(userRole || 'user');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleRoleChange = async () => {
    try {
      setIsUpdating(true);
      setMessage('');
      
      // Call API to update role
      const response = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
      
      setMessage(`Role updated to ${newRole}. Please refresh the page.`);
      
      // Force refresh after short delay to apply new role
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg border border-gray-200 z-50">
      <div className="text-sm font-medium mb-2">Development Role Switcher</div>
      <div className="flex gap-2">
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="user">User</option>
          <option value="employer">Employer</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
          <option value="verifier">Verifier</option>
        </select>
        <button
          onClick={handleRoleChange}
          disabled={isUpdating}
          className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
        >
          {isUpdating ? 'Updating...' : 'Switch Role'}
        </button>
      </div>
      {message && (
        <div className={`text-xs mt-2 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
}