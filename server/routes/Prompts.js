const express = require('express');
const router = express.Router();
const { 
  createPrompt, 
  getPrompts, 
  getPromptById,
  deletePrompt,
  getAnalytics 
} = require('../controllers/promptController');

// Input validation middleware
const validatePromptInput = (req, res, next) => {
  const { original } = req.body;
  
  if (!original || typeof original !== 'string' || original.trim().length === 0) {
    return res.status(400).json({
      error: 'Original prompt is required and must be a non-empty string',
      code: 'MISSING_ORIGINAL_PROMPT'
    });
  }
  
  next();
};

// Rate limiting would go here in production
// const rateLimit = require('express-rate-limit');

// Routes
router.post('/', validatePromptInput, createPrompt);
router.get('/', getPrompts);
router.get('/analytics', getAnalytics);
router.get('/:id', getPromptById);
router.delete('/:id', deletePrompt);

module.exports = router;
