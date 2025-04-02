// server/models/JobRequisition.js
const Joi = require('joi');

// Validation schema for job requisitions
const jobRequisitionSchema = Joi.object({
  // Basic job information
  title: Joi.string().required().max(100),
  company: Joi.string().required().max(100),
  description: Joi.string().required().max(5000),
  location: Joi.string().required().max(100),
  workType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').required(),
  remote: Joi.boolean().default(false),
  
  // Compensation information
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number().min(Joi.ref('salaryMin')),
  salaryCurrency: Joi.string().default('USD').length(3),
  salaryPeriod: Joi.string().valid('hourly', 'monthly', 'annual').default('annual'),
  benefits: Joi.array().items(Joi.string()),
  
  // Required qualifications
  requiredSkills: Joi.array().items(
    Joi.object({
      skill: Joi.string().required(),
      importance: Joi.number().min(1).max(5).default(3), // 1=nice to have, 5=essential
      yearsRequired: Joi.number().min(0).default(0)
    })
  ).min(1).required(),
  
  requiredEducation: Joi.array().items(
    Joi.object({
      degreeLevel: Joi.string().valid('high_school', 'associate', 'bachelor', 'master', 'doctorate', 'certification', 'none'),
      field: Joi.string(),
      required: Joi.boolean().default(true)
    })
  ),
  
  requiredExperience: Joi.number().min(0).default(0), // Years of experience
  
  // Verification requirements
  verificationRequirements: Joi.object({
    educationVerified: Joi.boolean().default(false),
    experienceVerified: Joi.boolean().default(false),
    skillsVerified: Joi.boolean().default(false),
    minimumVerificationStrength: Joi.string().valid('none', 'low', 'medium', 'high').default('none')
  }).default(),
  
  // Application process
  applicationProcess: Joi.object({
    acceptDirect: Joi.boolean().default(true),
    redirectUrl: Joi.string().uri().allow(''),
    assessmentRequired: Joi.boolean().default(false),
    allowAiMatching: Joi.boolean().default(true),
    customQuestions: Joi.array().items(Joi.string())
  }).default(),
  
  // Dates and status
  postDate: Joi.date().default(Date.now),
  expiryDate: Joi.date().greater(Joi.ref('postDate')),
  status: Joi.string().valid('draft', 'active', 'paused', 'filled', 'expired').default('draft'),
  
  // Visibility settings
  visibility: Joi.string().valid('public', 'private', 'network').default('public'),
  
  // Metadata
  keywords: Joi.array().items(Joi.string()),
  industry: Joi.string(),
  category: Joi.string(),
  referenceId: Joi.string(), // Company's internal reference ID
  
  // Creator/ownership information
  createdBy: Joi.string().required(), // User ID
  companyId: Joi.string().required(), // Company ID in your system
  
  // Blockchain information (if using blockchain)
  contractAddress: Joi.string(),
  tokenId: Joi.string(),
  blockchainVerified: Joi.boolean().default(false)
});

// Function to validate a job requisition
function validateJobRequisition(requisition) {
  return jobRequisitionSchema.validate(requisition);
}

module.exports = {
  validateJobRequisition
};