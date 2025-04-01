// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { admin } = require('./firebase/admin');
const verificationRoutes = require('./routes/verification');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/verification', verificationRoutes);

// Authentication middleware
const authMiddleware = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const credentialRoutes = require('./routes/credentials');
const userRoutes = require('./routes/users');
const aiServiceRoutes = require('./routes/ai-service');
const aiRecruitmentRoutes = require('./routes/ai-recruitment');
const verificationRoutes = require('./routes/verification');  // Add this line

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiServiceRoutes);
app.use('/api/ai-recruitment', aiRecruitmentRoutes);
app.use('/api/verification', verificationRoutes);  // Add this line

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Customize error response based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(isDevelopment && { stack: err.stack })
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; // Export for testing