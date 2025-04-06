import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context'; 

export default function EmployerDashboard() {
  const { currentUser, userRole } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'employer') {
      const fetchJobs = async () => {
        try {
          const q = query(
            collection(db, 'requisitions'),
            where('employerId', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          setJobs(querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchJobs();
    }
  }, [currentUser, userRole]);

  if (loading) {
    return <div className="p-4">Loading job listings...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Employer Dashboard</h1>
      
      <div className="mb-8">
        <Link 
          href="/jobs/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Post New Job
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Job Postings</h2>
        {jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{job.title}</h3>
              <p>Status: {job.status || 'Draft'}</p>
              <p>Candidates: {job.candidates?.length || 0}</p>
              <Link 
                href={`/jobs/${job.id}`}
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p>No job postings found.</p>
        )}
      </div>
    </div>
  );
}