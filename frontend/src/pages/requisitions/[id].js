// src/pages/requisitions/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function RequisitionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id || !currentUser) return;

    const fetchRequisition = async () => {
      try {
        const docRef = doc(db, 'requisitions', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Ensure this requisition belongs to the current user
          if (data.employerId !== currentUser.uid) {
            setError('You do not have permission to view this requisition');
            return;
          }
          
          setRequisition({
            id: docSnap.id,
            ...data
          });
          
          // Initialize form data for editing
          setFormData({
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            requiredSkills: data.requiredSkills ? data.requiredSkills.join(', ') : '',
            minSalary: data.salary?.min || '',
            maxSalary: data.salary?.max || '',
            type: data.type || 'full-time'
          });
        } else {
          setError('Requisition not found');
        }
      } catch (err) {
        console.error('Error fetching requisition:', err);
        setError('Failed to load requisition details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequisition();
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to update a requisition');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Format skills as an array
      const skills = formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);
      
      // Update requisition document
      const reqRef = doc(db, 'requisitions', id);
      const updateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        requiredSkills: skills,
        salary: {
          min: formData.minSalary ? parseInt(formData.minSalary) : null,
          max: formData.maxSalary ? parseInt(formData.maxSalary) : null,
          currency: 'USD'
        },
        type: formData.type,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(reqRef, updateData);
      
      // Update the local state
      setRequisition({
        ...requisition,
        ...updateData
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating requisition:', error);
      setError('Failed to update requisition: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'requisitions', id));
      router.push('/requisitions');
    } catch (error) {
      console.error('Error deleting requisition:', error);
      setError('Failed to delete requisition: ' + error.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const reqRef = doc(db, 'requisitions', id);
      await updateDoc(reqRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setRequisition({
        ...requisition,
        status: newStatus
      });
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      setError(`Failed to change status to ${newStatus}: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-md mb-4">
          <p>{error}</p>
        </div>
        <Link 
          href="/requisitions" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Requisitions
        </Link>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md max-w-md mb-4">
          <p>Requisition not found or you do not have permission to view it.</p>
        </div>
        <Link 
          href="/requisitions" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Requisitions
        </Link>
      </div>
    );
  }

  const createdDate = requisition.createdAt ? 
    new Date(requisition.createdAt.seconds * 1000).toLocaleDateString() : 
    'Unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {requisition.title}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {requisition.location || 'No location specified'}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Created: {createdDate}
                </div>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  requisition.status === 'active' ? 'bg-green-100 text-green-800' : 
                  requisition.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                  requisition.status === 'closed' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {requisition.status || 'Draft'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
              <Link
                href="/requisitions"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to List
              </Link>
              
              {requisition.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('active')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Activate
                </button>
              )}
              
              {requisition.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('closed')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Close
                </button>
              )}
              
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit
                </button>
              )}
              
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isEditing ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleUpdate}>
                <div className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Job Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">
                      Required Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="requiredSkills"
                      id="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700">
                        Minimum Salary
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="minSalary"
                          id="minSalary"
                          value={formData.minSalary}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700">
                        Maximum Salary
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="maxSalary"
                          id="maxSalary"
                          value={formData.maxSalary}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Employment Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Job Details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the job requisition.</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{requisition.description}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{requisition.type || 'Not specified'}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {requisition.salary?.min && requisition.salary?.max ? 
                        `$${requisition.salary.min.toLocaleString()} - $${requisition.salary.max.toLocaleString()}` : 
                        'Not specified'}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Required Skills</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {requisition.requiredSkills && requisition.requiredSkills.length > 0 ? (
                        <div className="flex flex-wrap">
                          {requisition.requiredSkills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="mr-2 mb-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No specific skills required'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Candidate Management</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View and manage candidates for this position.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <div className="py-8 px-4 text-center">
                  {requisition.status === 'draft' ? (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Requisition is in draft mode</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Activate this requisition to start receiving applications from candidates.
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('active')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Activate Requisition
                        </button>
                      </div>
                    </div>
                  ) : requisition.status === 'closed' ? (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Requisition is closed</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This requisition is no longer accepting new applications.
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('active')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Reopen Requisition
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Candidates who apply will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Requisition</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this requisition? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}