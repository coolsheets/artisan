import { generatePreamble, analyzeProblemType, getTDDInstructions, getModelSpecificInstructions } from '../utils/preambleGenerator';

describe('Preamble Generator', () => {
  describe('analyzeProblemType', () => {
    it('should identify coding problems', () => {
      const codingPrompts = [
        'Create a React component',
        'Debug this JavaScript function',
        'Build a REST API',
        'Write a Python script for data processing'
      ];
      
      codingPrompts.forEach(prompt => {
        const result = analyzeProblemType(prompt);
        expect(result.type).toBe('coding');
        expect(result.complexity).toBeGreaterThan(0);
      });
    });

    it('should identify writing problems', () => {
      const writingPrompts = [
        'Write a blog post about AI',
        'Create marketing copy for a product',
        'Draft a technical documentation',
        'Compose an email to stakeholders'
      ];
      
      writingPrompts.forEach(prompt => {
        const result = analyzeProblemType(prompt);
        expect(result.type).toBe('writing');
        expect(result.complexity).toBeGreaterThan(0);
      });
    });

    it('should identify analysis problems', () => {
      const analysisPrompts = [
        'Analyze market trends',
        'Compare different solutions',
        'Research best practices',
        'Evaluate performance metrics'
      ];
      
      analysisPrompts.forEach(prompt => {
        const result = analyzeProblemType(prompt);
        expect(result.type).toBe('analysis');
        expect(result.complexity).toBeGreaterThan(0);
      });
    });

    it('should calculate complexity correctly', () => {
      const simplePrompt = 'Write hello world';
      const complexPrompt = 'Build a full-stack e-commerce application with user authentication, payment processing, inventory management, and real-time notifications';
      
      const simple = analyzeProblemType(simplePrompt);
      const complex = analyzeProblemType(complexPrompt);
      
      expect(complex.complexity).toBeGreaterThan(simple.complexity);
    });
  });

  describe('getTDDInstructions', () => {
    it('should provide TDD instructions for coding problems', () => {
      const analysis = { type: 'coding', complexity: 7, keywords: ['react', 'component'] };
      const instructions = getTDDInstructions(analysis);
      
      expect(instructions).toContain('Test-Driven Development');
      expect(instructions).toContain('failing tests');
      expect(instructions).toContain('Red Phase');
    });

    it('should provide validation instructions for writing problems', () => {
      const analysis = { type: 'writing', complexity: 5, keywords: ['blog', 'article'] };
      const instructions = getTDDInstructions(analysis);
      
      expect(instructions).toContain('VALIDATION APPROACH');
      expect(instructions).toContain('Content Quality');
    });

    it('should provide verification instructions for analysis problems', () => {
      const analysis = { type: 'analysis', complexity: 6, keywords: ['research', 'compare'] };
      const instructions = getTDDInstructions(analysis);
      
      expect(instructions).toContain('VERIFICATION APPROACH');
      expect(instructions).toContain('Data Sources');
    });
  });

  describe('getModelSpecificInstructions', () => {
    it('should provide Claude-specific instructions', () => {
      const instructions = getModelSpecificInstructions('claude');
      
      expect(instructions).toContain('Claude');
      expect(instructions).toContain('step-by-step');
      expect(instructions).toContain('reasoning');
    });

    it('should provide GPT-4 specific instructions', () => {
      const instructions = getModelSpecificInstructions('gpt-4');
      
      expect(instructions).toContain('GPT-4');
      expect(instructions).toContain('structured');
      expect(instructions).toContain('format');
    });

    it('should provide generic instructions for unknown models', () => {
      const instructions = getModelSpecificInstructions('unknown-model');
      
      expect(instructions).toContain('GENERAL AI OPTIMIZATION');
      expect(instructions).toContain('clear, specific instructions');
    });
  });

  describe('generatePreamble', () => {
    it('should generate complete preamble for coding task', () => {
      const prompt = 'Create a React component for user authentication';
      const preamble = generatePreamble(prompt, 'claude');
      
      expect(preamble).toContain('CONTEXT');
      expect(preamble).toContain('REQUIREMENTS');
      expect(preamble).toContain('TDD APPROACH');
      expect(preamble).toContain('DELIVERABLES');
      expect(preamble).toContain('React component');
      expect(preamble).toContain('authentication');
    });

    it('should generate complete preamble for writing task', () => {
      const prompt = 'Write a technical blog post about microservices';
      const preamble = generatePreamble(prompt, 'gpt-4');
      
      expect(preamble).toContain('CONTEXT');
      expect(preamble).toContain('REQUIREMENTS');
      expect(preamble).toContain('VALIDATION');
      expect(preamble).toContain('DELIVERABLES');
      expect(preamble).toContain('blog post');
      expect(preamble).toContain('microservices');
    });

    it('should include one-shot solution instructions', () => {
      const prompt = 'Build a calculator app';
      const preamble = generatePreamble(prompt);
      
      expect(preamble).toContain('one-shot solution');
      expect(preamble).toContain('complete');
      expect(preamble).toContain('production-ready');
    });

    it('should scale instructions based on complexity', () => {
      const simplePrompt = 'Add two numbers';
      const complexPrompt = 'Build a distributed microservices architecture with event sourcing, CQRS, and real-time analytics dashboard';
      
      const simplePreamble = generatePreamble(simplePrompt);
      const complexPreamble = generatePreamble(complexPrompt);
      
      expect(complexPreamble.length).toBeGreaterThan(simplePreamble.length);
      expect(complexPreamble).toContain('architecture');
      expect(complexPreamble).toContain('patterns');
    });
  });
});
