const Prompt = require('../models/Prompt');

// Utility function for token counting (more sophisticated than model's simple version)
const estimateTokenCount = (text) => {
  if (!text) return 0;
  // More accurate token estimation using word count and punctuation
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  return Math.ceil((words.length + punctuation * 0.5) * 1.3);
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+="[^"]*"/gi, '') // Remove on* event handlers
    .trim();
};

exports.createPrompt = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { original, optimized, atomized } = req.body;

    // Input validation
    if (!original || typeof original !== 'string' || original.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Original prompt is required and must be a non-empty string',
        code: 'MISSING_ORIGINAL_PROMPT'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      original: sanitizeInput(original),
      optimized: optimized ? sanitizeInput(optimized) : undefined,
      atomized: Array.isArray(atomized) 
        ? atomized.map(item => sanitizeInput(item)).filter(item => item.length > 0)
        : []
    };

    // Additional business logic validations
    if (sanitizedData.original.length > 5000) {
      return res.status(400).json({
        error: 'Original prompt exceeds maximum length of 5000 characters',
        code: 'PROMPT_TOO_LONG'
      });
    }

    if (sanitizedData.atomized.length > 50) {
      return res.status(400).json({
        error: 'Cannot have more than 50 atomized steps',
        code: 'TOO_MANY_STEPS'
      });
    }

    // Create prompt with metadata
    const promptData = {
      ...sanitizedData,
      metadata: {
        userAgent: req.get('User-Agent') || 'Unknown',
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
        processingTime: Date.now() - startTime
      }
    };

    const prompt = new Prompt(promptData);
    await prompt.save();

    // Calculate and include token analysis in response
    const response = {
      ...prompt.toObject(),
      tokenAnalysis: {
        originalTokens: prompt.tokenCount.original,
        optimizedTokens: prompt.tokenCount.optimized,
        tokensSaved: prompt.getTokenSavings(),
        savingsPercentage: prompt.getSavingsPercentage()
      },
      processingTime: Date.now() - startTime
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating prompt:', error);

    // Handle different types of errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry detected',
        code: 'DUPLICATE_ENTRY'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error while creating prompt',
      code: 'INTERNAL_ERROR'
    });
  }
};

exports.getPrompts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Build query filters
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { original: { $regex: req.query.search, $options: 'i' } },
        { optimized: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filters.createdAt = {};
      if (req.query.dateFrom) {
        filters.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filters.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    // Execute query with pagination
    const [prompts, total] = await Promise.all([
      Prompt.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean for better performance
      Prompt.countDocuments(filters)
    ]);

    // Add token analysis to each prompt
    const promptsWithAnalysis = prompts.map(prompt => ({
      ...prompt,
      tokenAnalysis: {
        originalTokens: prompt.tokenCount?.original || 0,
        optimizedTokens: prompt.tokenCount?.optimized || 0,
        tokensSaved: (prompt.tokenCount?.original || 0) - (prompt.tokenCount?.optimized || 0),
        savingsPercentage: prompt.tokenCount?.original 
          ? Math.round(((prompt.tokenCount.original - (prompt.tokenCount.optimized || 0)) / prompt.tokenCount.original) * 100)
          : 0
      }
    }));

    const response = {
      prompts: promptsWithAnalysis,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching prompts',
      code: 'FETCH_ERROR'
    });
  }
};

exports.getPromptById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid prompt ID format',
        code: 'INVALID_ID'
      });
    }

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json({
        error: 'Prompt not found',
        code: 'PROMPT_NOT_FOUND'
      });
    }

    const response = {
      ...prompt.toObject(),
      tokenAnalysis: {
        originalTokens: prompt.tokenCount.original,
        optimizedTokens: prompt.tokenCount.optimized,
        tokensSaved: prompt.getTokenSavings(),
        savingsPercentage: prompt.getSavingsPercentage()
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching prompt by ID:', error);
    res.status(500).json({
      error: 'Internal server error while fetching prompt',
      code: 'FETCH_BY_ID_ERROR'
    });
  }
};

exports.deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid prompt ID format',
        code: 'INVALID_ID'
      });
    }

    const prompt = await Prompt.findByIdAndDelete(id);

    if (!prompt) {
      return res.status(404).json({
        error: 'Prompt not found',
        code: 'PROMPT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Prompt deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({
      error: 'Internal server error while deleting prompt',
      code: 'DELETE_ERROR'
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Prompt.getAnalytics();
    
    // Add additional analytics
    const recentPrompts = await Prompt.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('original createdAt tokenCount.original tokenCount.optimized');

    const response = {
      ...analytics,
      recentActivity: recentPrompts.map(prompt => ({
        id: prompt._id,
        preview: prompt.original.substring(0, 100) + (prompt.original.length > 100 ? '...' : ''),
        createdAt: prompt.createdAt,
        tokensSaved: (prompt.tokenCount.original || 0) - (prompt.tokenCount.optimized || 0)
      })),
      generatedAt: new Date()
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      error: 'Internal server error while generating analytics',
      code: 'ANALYTICS_ERROR'
    });
  }
};
