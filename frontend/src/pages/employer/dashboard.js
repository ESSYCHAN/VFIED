// src/pages/employer/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function EmployerDashboard() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchRequisitions = async () => {
        try {
          const q = query(
            collection(db, 'requisitions'),
            where('employerId', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const requisitionList = [];
          
          querySnapshot.forEach((doc) => {
            requisitionList.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setRequisitions(requisitionList);
        } catch (error) {
          console.error("Error fetching requisitions:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRequisitions();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <div>
              <Link 
                href="/requisitions/new" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                + New Job Requisition
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-lg font-medium text-gray-900">Your Job Requisitions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your job requisitions and view candidates.
          </p>
        </div>
        
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : requisitions.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">No requisitions found</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
                <p>Get started by creating your first job requisition.</p>
              </div>
              <div className="mt-5">
                <Link 
                  href="/requisitions/new" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Job Requisition
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {requisitions.map((req) => (
                <li key={req.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/requisitions/${req.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        {req.title}
                      </Link>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'active' ? 'bg-green-100 text-green-800' : 
                          req.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                          req.status === 'closed' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {req.location || 'No location specified'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Posted: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}