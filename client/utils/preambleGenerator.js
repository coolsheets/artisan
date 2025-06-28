// Analyze the problem type and complexity
export const analyzeProblemType = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  const words = prompt.split(/\s+/);
  
  // Define keyword patterns
  const patterns = {
    coding: [
      'code', 'programming', 'develop', 'build', 'create', 'implement', 'debug', 
      'function', 'class', 'component', 'api', 'database', 'algorithm', 'script',
      'react', 'javascript', 'python', 'java', 'nodejs', 'frontend', 'backend',
      'testing', 'deployment', 'git', 'docker', 'kubernetes', 'microservices'
    ],
    writing: [
      'write', 'article', 'blog', 'content', 'copy', 'documentation', 'email',
      'proposal', 'report', 'story', 'creative', 'marketing', 'technical writing',
      'communication', 'presentation', 'summary', 'review'
    ],
    analysis: [
      'analyze', 'research', 'compare', 'evaluate', 'assess', 'investigate',
      'study', 'examine', 'review', 'critique', 'audit', 'benchmark',
      'strategy', 'planning', 'decision', 'recommendation', 'insights'
    ],
    design: [
      'design', 'ui', 'ux', 'interface', 'mockup', 'wireframe', 'prototype',
      'visual', 'layout', 'branding', 'graphics', 'user experience'
    ]
  };
  
  // Score each category
  const scores = {};
  for (const [type, keywords] of Object.entries(patterns)) {
    scores[type] = keywords.filter(keyword => 
      lowerPrompt.includes(keyword)
    ).length;
  }
  
  // Determine primary type
  const primaryType = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );
  
  // Calculate complexity based on various factors
  const complexityFactors = {
    wordCount: Math.min(words.length / 10, 5), // More words = more complexity
    technicalTerms: (lowerPrompt.match(/\b(architecture|framework|integration|optimization|scalability|security|performance|testing|deployment|monitoring)\b/g) || []).length,
    scope: (lowerPrompt.match(/\b(full|complete|entire|comprehensive|end-to-end|production|enterprise)\b/g) || []).length,
    multiStep: (lowerPrompt.match(/\b(and|then|also|additionally|furthermore|moreover|including)\b/g) || []).length
  };
  
  const complexity = Math.min(
    Math.max(
      complexityFactors.wordCount + 
      complexityFactors.technicalTerms * 1.5 + 
      complexityFactors.scope * 2 + 
      complexityFactors.multiStep * 0.5,
      1
    ),
    10
  );
  
  // Extract key terms
  const keywords = Object.values(patterns).flat().filter(keyword => 
    lowerPrompt.includes(keyword)
  );
  
  return {
    type: primaryType,
    complexity: Math.round(complexity),
    keywords,
    scores
  };
};

// Generate TDD-appropriate instructions based on problem type
export const getTDDInstructions = (analysis) => {
  const { type, complexity } = analysis;
  
  const baseInstructions = {
    coding: `
## TDD APPROACH (Test-Driven Development):
1. **Red Phase**: Write failing tests first that define the expected behavior
2. **Green Phase**: Write minimal code to make tests pass
3. **Refactor Phase**: Improve code quality while keeping tests green
4. **Test Coverage**: Ensure comprehensive test coverage (unit, integration, e2e)
5. **Documentation**: Include inline documentation and usage examples`,

    writing: `
## VALIDATION APPROACH:
1. **Structure Check**: Verify logical flow and organization
2. **Content Quality**: Ensure accuracy, clarity, and completeness
3. **Audience Alignment**: Confirm content meets target audience needs
4. **Style Consistency**: Maintain consistent tone and formatting
5. **Fact Verification**: Cross-check all claims and statistics`,

    analysis: `
## VERIFICATION APPROACH:
1. **Data Sources**: Cite credible and current sources
2. **Methodology**: Use systematic analysis frameworks
3. **Bias Check**: Identify and mitigate potential biases
4. **Peer Review**: Structure for expert validation
5. **Actionable Insights**: Provide clear, implementable recommendations`,

    design: `
## DESIGN VALIDATION:
1. **User Testing**: Plan for usability testing and feedback
2. **Accessibility**: Ensure WCAG compliance and inclusive design
3. **Responsive Design**: Test across devices and screen sizes
4. **Brand Consistency**: Align with brand guidelines and standards
5. **Performance**: Consider loading times and optimization`
  };
  
  let instructions = baseInstructions[type] || baseInstructions.coding;
  
  // Add complexity-specific instructions
  if (complexity >= 7) {
    instructions += `
6. **Phased Delivery**: Break into manageable phases with clear milestones
7. **Risk Assessment**: Identify potential challenges and mitigation strategies
8. **Scalability Planning**: Design for future growth and changes`;
  }
  
  return instructions;
};

// Generate model-specific optimization instructions
export const getModelSpecificInstructions = (modelType) => {
  const instructions = {
    claude: `
## CLAUDE-SPECIFIC OPTIMIZATION:
- Leverage Claude's strength in step-by-step reasoning and analysis
- Use clear, structured prompts with explicit role definitions
- Request detailed explanations and thought processes
- Utilize Claude's excellent code review and debugging capabilities
- Ask for multiple approaches and trade-off analysis`,

    'gpt-4': `
## GPT-4 SPECIFIC OPTIMIZATION:
- Structure requests with clear formatting and examples
- Use system messages for role and context setting
- Leverage GPT-4's creative problem-solving abilities
- Request structured outputs (JSON, markdown, tables)
- Utilize its strong plugin and tool integration capabilities`,

    'gemini': `
## GEMINI SPECIFIC OPTIMIZATION:
- Leverage multimodal capabilities when applicable
- Use clear, conversational prompting style
- Request factual verification and source attribution
- Utilize its strong reasoning for complex problems
- Ask for real-time information when relevant`,

    generic: `
## GENERAL AI OPTIMIZATION:
- Use clear, specific instructions with examples
- Break complex tasks into smaller components
- Provide context and constraints explicitly
- Request validation and error checking
- Ask for alternative approaches and recommendations`
  };
  
  return instructions[modelType] || instructions.generic;
};

// Generate a comprehensive preamble for one-shot solutions
export const generatePreamble = (prompt, modelType = 'generic') => {
  const analysis = analyzeProblemType(prompt);
  const tddInstructions = getTDDInstructions(analysis);
  const modelInstructions = getModelSpecificInstructions(modelType);
  
  const preamble = `# COMPREHENSIVE ONE-SHOT SOLUTION PREAMBLE

## CONTEXT:
You are an expert ${analysis.type} specialist tasked with delivering a complete, production-ready solution. This is a one-shot request requiring a comprehensive response that anticipates edge cases, follows best practices, and includes all necessary components.

**Original Request**: "${prompt}"

**Problem Analysis**:
- Type: ${analysis.type}
- Complexity Level: ${analysis.complexity}/10
- Key Focus Areas: ${analysis.keywords.slice(0, 5).join(', ')}

## REQUIREMENTS:
1. **Completeness**: Provide a fully functional, production-ready solution
2. **Best Practices**: Follow industry standards and established patterns
3. **Error Handling**: Include comprehensive error handling and edge cases
4. **Documentation**: Provide clear documentation and usage examples
5. **Maintainability**: Write clean, well-structured, and maintainable code
6. **Performance**: Consider optimization and efficiency
7. **Security**: Implement appropriate security measures where applicable

${tddInstructions}

${modelInstructions}

## ONE-SHOT SOLUTION REQUIREMENTS:
- **Complete Implementation**: Include all files, configurations, and dependencies
- **Production Ready**: Code should be deployment-ready with proper error handling
- **Well Documented**: Include README, inline comments, and usage examples
- **Tested Solution**: Include test cases and validation strategies
- **Extensible Design**: Structure for easy future modifications and enhancements

## DELIVERABLES STRUCTURE:
1. **Executive Summary**: Brief overview of the solution approach
2. **Implementation**: Complete code with all necessary files
3. **Configuration**: All config files, environment variables, and setup instructions
4. **Testing**: Test cases and validation procedures
5. **Documentation**: README, API docs, and usage examples
6. **Deployment**: Deployment instructions and considerations
7. **Maintenance**: Future enhancement suggestions and maintenance guidelines

## FINAL VALIDATION CHECKLIST:
- [ ] Solution addresses all aspects of the original request
- [ ] Code follows established best practices and patterns
- [ ] Comprehensive error handling and edge case coverage
- [ ] Complete documentation and examples provided
- [ ] Testing strategy implemented and validated
- [ ] Security considerations addressed
- [ ] Performance optimizations applied where relevant
- [ ] Solution is maintainable and extensible

---

**Now, provide your comprehensive one-shot solution following the above guidelines.**`;

  return preamble;
};

// Helper function to estimate token count for different models
export const estimateTokens = (text) => {
  // Rough estimation: ~4 characters per token for most models
  return Math.ceil(text.length / 4);
};

// Generate a concise preamble for simpler tasks
export const generateConcisePreamble = (prompt, modelType = 'generic') => {
  const analysis = analyzeProblemType(prompt);
  
  if (analysis.complexity <= 3) {
    return `# SOLUTION REQUEST

**Task**: ${prompt}

**Requirements**:
- Provide a complete, working solution
- Include error handling and best practices
- Add brief documentation/comments
- Ensure production readiness

**Deliver**: Ready-to-use solution with clear instructions.`;
  }
  
  return generatePreamble(prompt, modelType);
};
