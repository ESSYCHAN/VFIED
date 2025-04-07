// src/components/recruiter/RequisitionForm.js
import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';

const RequisitionForm = ({ requisition, onSubmit }) => {
  // Initialize form state with existing requisition data or defaults
  const [formData, setFormData] = useState({
    title: requisition?.title || '',
    description: requisition?.description || '',
    location: requisition?.location || '',
    requiredSkills: requisition?.requiredSkills?.join(', ') || '',
    salary: {
      min: requisition?.salary?.min || '',
      max: requisition?.salary?.max || '',
      currency: requisition?.salary?.currency || 'USD'
    },
    contactEmail: requisition?.contactEmail || '',
    company: requisition?.company || '',
    employmentType: requisition?.employmentType || 'full-time',
    remote: requisition?.remote || false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Access Web3 context
  const { account } = useWeb3();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., salary.min)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) : value
        }
      }));
    } else {
      // Handle normal properties
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Add more validation as needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format data for submission
      const formattedData = {
        ...formData,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean),
        // Use Web3 account if available
        employerAddress: account || ''
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{errors.submit}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Job Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.title ? 'border-red-300' : ''
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.description ? 'border-red-300' : ''
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">
          Required Skills (comma separated)
        </label>
        <input
          type="text"
          id="requiredSkills"
          name="requiredSkills"
          value={formData.requiredSkills}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="salary.min" className="block text-sm font-medium text-gray-700">
            Minimum Salary
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="salary.min"
              name="salary.min"
              value={formData.salary.min}
              onChange={handleChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="salary.max" className="block text-sm font-medium text-gray-700">
            Maximum Salary
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="salary.max"
              name="salary.max"
              value={formData.salary.max}
              onChange={handleChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
          Employment Type
        </label>
        <select
          id="employmentType"
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="temporary">Temporary</option>
        </select>
      </div>
      
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="remote"
            name="remote"
            type="checkbox"
            checked={formData.remote}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="remote" className="font-medium text-gray-700">
            Remote Work Available
          </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
          Contact Email
        </label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : requisition ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

export default RequisitionForm;