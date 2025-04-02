// Example in server/middleware/validateRequest.js
const { body, validationResult } = require('express-validator');

const validateCredentialRequest = [
  body('credentialId').isString().notEmpty().withMessage('Credential ID is required'),
  body('verificationNotes').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCredentialRequest
};