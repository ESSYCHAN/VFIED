// src/pages/admin/user-management.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import AdminNavigation from '../../components/admin/AdminNavigation';
import Head from 'next/head';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';

export default function UserManagement() {
  const { currentUser, userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user'
  });
  
  const [isCreating, setIsCreating] = useState(false);
  
  // Redirect if not an admin
  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [userRole, loading]);
  
  // Fetch all users
  useEffect(() => {
    if (!currentUser || userRole !== 'admin') return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users list.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, userRole]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      setError(null);
      setSuccess('');
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      
      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        createdAt: new Date(),
        createdBy: currentUser.uid
      });
      
      // Update users list
      setUsers(prev => [
        ...prev,
        {
          id: userCredential.user.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          role: newUser.role,
          createdAt: new Date()
        }
      ]);
      
      // Reset form
      setNewUser({
        email: '',
        password: '',
        displayName: '',
        role: 'user'
      });
      
      setSuccess(`User ${newUser.email} created successfully with role: ${newUser.role}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (error) {
      console.error("Error creating user:", error);
      setError(`Failed to create user: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      // Find the user document by uid
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError(`User document not found for ID: ${userId}`);
        return;
      }
      
      // Update the user's role
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: newRole
      });
      
      // Update local state
      setUsers(prev =>
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      setSuccess(`User role updated to ${newRole}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error("Error updating user role:", error);
      setError(`Failed to update role: ${error.message}`);
    }
  };
  
  return (
    <DashboardLayout title="User Management">
      <Head>
        <title>User Management - VFied</title>
      </Head>
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">
            Create and manage user accounts with different roles
          </p>
        </div>
        
        <AdminNavigation />
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            {success}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Create New User</h2>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateUser}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={newUser.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={newUser.password}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 6 characters
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={newUser.displayName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        User Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={newUser.role}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="user">User</option>
                        <option value="employer">Employer</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                        <option value="verifier">Verifier</option>
                      </select>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isCreating ? 'Creating...' : 'Create User'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Users</h2>
              </div>
              
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No users found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-medium">
                                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.displayName || 'Unnamed User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="user">User</option>
                              <option value="employer">Employer</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="admin">Admin</option>
                              <option value="verifier">Verifier</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => {/* Implement user details view */}}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}