// src/pages/requisitions/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link';

export default function RequisitionsList() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchRequisitions = async () => {
      try {
        let q = query(
          collection(db, 'requisitions'),
          where('employerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        // Apply status filter if needed
        if (filter !== 'all') {
          q = query(
            collection(db, 'requisitions'),
            where('employerId', '==', currentUser.uid),
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          );
        }

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
  }, [currentUser, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Job Requisitions</h1>
            <Link
              href="/requisitions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + New Job Requisition
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`${filter === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`${filter === 'active'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`${filter === 'draft'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilter('closed')}
                className={`${filter === 'closed'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Closed
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : requisitions.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
            <ul className="divide-y divide-gray-200">
              {requisitions.map((req) => (
                <li key={req.id}>
                  <Link href={`/requisitions/${req.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {req.title}
                        </p>
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
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {req.location || 'No location specified'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <p>
                            {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                      </div>
                      {req.requiredSkills && req.requiredSkills.length > 0 && (
                        <div className="mt-2 flex flex-wrap">
                          {req.requiredSkills.map((skill, index) => (
                            <span key={index} className="mr-2 mb-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}