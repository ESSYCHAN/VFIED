// src/pages/employer/requisitions/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { getRequisition, updateRequisition } from '../../../services/recruiter/requisitionService';
import Layout from '../../../components/Layout';
import CandidateList from '../../../components/recruiter/CandidateList';
import RequisitionForm from '../../../components/recruiter/RequisitionForm';
import { 
  container, 
  header, 
  section, 
  editButton,
  candidateGrid
} from '../../../styles/sharedStyles';

export default function RequisitionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  const [requisition, setRequisition] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || !id) return;

    const loadRequisition = async () => {
      try {
        const req = await getRequisition(id);
        if (req.companyId !== currentUser.uid) {
          router.push('/employer/dashboard');
          return;
        }
        setRequisition(req);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRequisition();
  }, [id, currentUser]);

  const handleUpdate = async (updatedData) => {
    try {
      const updatedReq = await updateRequisition(id, updatedData);
      setRequisition(updatedReq);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Layout loading />;
  if (error) return <Layout error={error} />;
  if (!requisition) return <Layout>Requisition not found</Layout>;

  return (
    <Layout title={`${requisition.title} | VFied`}>
      <div className={container}>
        <div className={header}>
          <h1>{requisition.title}</h1>
          <button 
            onClick={() => setEditMode(!editMode)}
            className={editButton}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <RequisitionForm 
            requisition={requisition} 
            onSubmit={handleUpdate} 
          />
        ) : (
          <>
            <div className={section}>
              <h2>Details</h2>
              <p><strong>Company:</strong> {requisition.companyName}</p>
              <p><strong>Location:</strong> {requisition.location}</p>
              <p><strong>Salary Range:</strong> {requisition.salaryRange}</p>
            </div>

            <div className={section}>
              <h2>Requirements</h2>
              <ul>
                {requisition.requiredSkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className={section}>
              <h2>Matching Candidates</h2>
              <div className={candidateGrid}>
                <CandidateList requisitionId={id} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}