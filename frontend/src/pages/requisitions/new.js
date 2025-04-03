// src/pages/requisitions/new.js
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import JobRequisitionForm from '../../components/recruiter/JobRequisitionForm';
import { createRequisition } from '../../services/recruiter/requisitionService';

const NewRequisitionPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      // Create the new requisition
      const result = await createRequisition(formData);
      
      // Redirect to the detail page for the new requisition
      router.push(`/requisitions/${result.id}`);
    } catch (error) {
      console.error('Error creating requisition:', error);
      throw error; // Let the form component handle the error
    }
  };

  const handleCancel = () => {
    router.push('/requisitions');
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>Create New Job Requisition</h1>
        <JobRequisitionForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px',
  },
};

export default NewRequisitionPage;