// Advanced prompt optimization utility
export function optimizePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return '';
  
  let optimized = prompt;
  
  // Step 1: Remove common filler words and phrases
  const fillerPatterns = [
    /\bPlease\s+/gi,
    /\bKindly\s+/gi,
    /\bJust\s+/gi,
    /\bReally\s+/gi,
    /\bVery\s+/gi,
    /\bActually\s+/gi,
    /\bSimply\s+/gi,
    /\bLike\s+/gi,
    /\bBasically\s+/gi,
    /\bEssentially\s+/gi,
    /\bLiterally\s+/gi,
    /\bObviously\s+/gi
  ];
  
  fillerPatterns.forEach(pattern => {
    optimized = optimized.replace(pattern, '');
  });
  
  // Step 2: Simplify verbose constructions
  const verbosePatterns = [
    { pattern: /\bthat will\b/gi, replacement: '' },
    { pattern: /\bwhich will\b/gi, replacement: '' },
    { pattern: /\bthat\s+/gi, replacement: '' },
    { pattern: /\bwhich\s+/gi, replacement: '' },
    { pattern: /,?\s+supporting\s+/gi, replacement: ': ' },
    { pattern: /\bin order to\b/gi, replacement: 'to' },
    { pattern: /\bfor the purpose of\b/gi, replacement: 'to' },
    { pattern: /\bwith the ability to\b/gi, replacement: 'that can' },
    { pattern: /\bis capable of\b/gi, replacement: 'can' },
    { pattern: /\bmake sure to\b/gi, replacement: '' },
    { pattern: /\bensure that\b/gi, replacement: 'ensure' }
  ];
  
  verbosePatterns.forEach(({ pattern, replacement }) => {
    optimized = optimized.replace(pattern, replacement);
  });
  
  // Step 3: Convert passive to active voice where possible
  const passivePatterns = [
    { pattern: /\bis created by\b/gi, replacement: 'creates' },
    { pattern: /\bis handled by\b/gi, replacement: 'handles' },
    { pattern: /\bis managed by\b/gi, replacement: 'manages' },
    { pattern: /\bis processed by\b/gi, replacement: 'processes' }
  ];
  
  passivePatterns.forEach(({ pattern, replacement }) => {
    optimized = optimized.replace(pattern, replacement);
  });
  
  // Step 4: Consolidate whitespace and punctuation
  optimized = optimized
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\s+([,.!?;:])/g, '$1') // Remove space before punctuation
    .replace(/([,.!?;:])\s*([,.!?;:])/g, '$1 $2') // Fix punctuation spacing
    .trim();
  
  // Step 5: Ensure we haven't removed everything
  if (optimized.length === 0) {
    return prompt.trim();
  }
  
  return optimized;
}

// Token estimation utility
export function estimateTokens(text) {
  if (!text) return 0;
  
  // More sophisticated token estimation
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const punctuation = (text.match(/[.,!?;:()[\]{}]/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  
  // GPT-style token estimation
  // Words are typically 1-2 tokens, punctuation is usually 1 token
  const wordTokens = words.reduce((count, word) => {
    if (word.length <= 3) return count + 1;
    if (word.length <= 6) return count + 1.5;
    return count + 2;
  }, 0);
  
  return Math.ceil(wordTokens + punctuation * 0.5 + numbers * 0.75);
}

// Calculate optimization effectiveness
export function getOptimizationMetrics(original, optimized) {
  const originalTokens = estimateTokens(original);
  const optimizedTokens = estimateTokens(optimized);
  const tokensSaved = originalTokens - optimizedTokens;
  const savingsPercentage = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;
  
  return {
    originalTokens,
    optimizedTokens,
    tokensSaved,
    savingsPercentage,
    compressionRatio: originalTokens > 0 ? (optimizedTokens / originalTokens).toFixed(2) : 1
  };
}

// Quality score for optimization
export function calculateQualityScore(original, optimized, atomized = []) {
  let score = 100;
  
  // Penalize if optimized is too short compared to original
  const lengthRatio = optimized.length / original.length;
  if (lengthRatio < 0.3) score -= 20; // Too aggressive
  if (lengthRatio > 0.9) score -= 10; // Not optimized enough
  
  // Bonus for maintaining key technical terms
  const technicalTerms = original.match(/\b(API|REST|CRUD|database|authentication|validation|React|Node\.js|Express|MongoDB)\b/gi) || [];
  const preservedTerms = technicalTerms.filter(term => 
    optimized.toLowerCase().includes(term.toLowerCase())
  );
  
  const preservationRate = technicalTerms.length > 0 ? preservedTerms.length / technicalTerms.length : 1;
  score = score * preservationRate;
  
  // Bonus for atomization quality
  if (atomized.length > 0 && atomized.length <= 10) {
    score += 5; // Good atomization
  } else if (atomized.length > 10) {
    score -= 5; // Too many steps
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
