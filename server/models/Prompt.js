const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
  original: { 
    type: String, 
    required: [true, 'Original prompt is required'],
    trim: true,
    maxlength: [5000, 'Original prompt cannot exceed 5000 characters'],
    minlength: [1, 'Original prompt cannot be empty']
  },
  optimized: { 
    type: String,
    trim: true,
    maxlength: [5000, 'Optimized prompt cannot exceed 5000 characters']
  },
  atomized: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 50;
      },
      message: 'Cannot have more than 50 atomized steps'
    }
  },
  tokenCount: {
    original: { type: Number, default: 0 },
    optimized: { type: Number, default: 0 }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    processingTime: Number
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware for token counting and sanitization
PromptSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Simple token estimation (rough approximation)
  if (this.original) {
    this.tokenCount.original = Math.ceil(this.original.split(/\s+/).length * 1.3);
  }
  if (this.optimized) {
    this.tokenCount.optimized = Math.ceil(this.optimized.split(/\s+/).length * 1.3);
  }
  
  next();
});

// Instance method to calculate token savings
PromptSchema.methods.getTokenSavings = function() {
  if (!this.tokenCount.optimized || !this.tokenCount.original) return 0;
  return this.tokenCount.original - this.tokenCount.optimized;
};

// Instance method to calculate savings percentage
PromptSchema.methods.getSavingsPercentage = function() {
  if (!this.tokenCount.original || this.tokenCount.original === 0) return 0;
  const savings = this.getTokenSavings();
  return Math.round((savings / this.tokenCount.original) * 100);
};

// Static method to get analytics
PromptSchema.statics.getAnalytics = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalPrompts: { $sum: 1 },
        avgOriginalTokens: { $avg: '$tokenCount.original' },
        avgOptimizedTokens: { $avg: '$tokenCount.optimized' },
        totalTokensSaved: { 
          $sum: { 
            $subtract: ['$tokenCount.original', '$tokenCount.optimized'] 
          } 
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalPrompts: 0,
    avgOriginalTokens: 0,
    avgOptimizedTokens: 0,
    totalTokensSaved: 0
  };
};

// Index for performance
PromptSchema.index({ createdAt: -1 });
PromptSchema.index({ 'tokenCount.original': 1 });

module.exports = mongoose.model('Prompt', PromptSchema);
