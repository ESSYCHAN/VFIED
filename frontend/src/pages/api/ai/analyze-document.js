// src/pages/api/ai/analyze-document.js
import { IncomingForm } from 'formidable';
import { analyzeDocumentWithClaude } from '../../../services/aiService';

// Custom verify token function to replace imported one
async function verifyIdToken(token) {
  // In a real implementation, this would verify the token
  // For now, we'll just return a mock user ID
  return { uid: 'mock-user-id' };
}

// Disable body parsing, we'll handle the form data ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    let userId;
    try {
      const decodedToken = await verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Parse form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });
    
    // Parse the form data
    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
    const file = formData.files.file[0];
    const credentialType = formData.fields.credentialType[0];
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Call your AI service to analyze the document
    // For now, we'll mock this function to return sample data
    const mockAnalyzeDocumentWithClaude = (filePath, credentialType) => {
      return Promise.resolve({
        title: 'Example Credential',
        issuer: 'Example University',
        dateIssued: '2023-01-15',
        description: 'This is a sample credential extracted from the document.',
        skills: ['JavaScript', 'React', 'Node.js']
      });
    };
    
    const analysisResult = await mockAnalyzeDocumentWithClaude(file.filepath, credentialType);
    
    // Return the analysis result
    res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
}