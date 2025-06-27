import { optimizePrompt } from '../utils/optimizePrompt';

describe('optimizePrompt utility', () => {
  it('removes filler words correctly', () => {
    const input = 'Please write a function that will handle user authentication';
    const expected = 'write a function handle user authentication';
    expect(optimizePrompt(input)).toBe(expected);
  });

  it('removes multiple filler words', () => {
    const input = 'Please just really help me write a simple API that basically handles users';
    const expected = 'help me write a API handles users';
    expect(optimizePrompt(input)).toBe(expected);
  });

  it('handles empty or invalid inputs', () => {
    expect(optimizePrompt('')).toBe('');
    expect(optimizePrompt(null)).toBe('');
    expect(optimizePrompt(undefined)).toBe('');
    expect(optimizePrompt(123)).toBe('');
  });

  it('preserves essential technical terms', () => {
    const input = 'Create a RESTful API with CRUD operations for users';
    const result = optimizePrompt(input);
    expect(result).toContain('RESTful API');
    expect(result).toContain('CRUD operations');
  });

  it('handles complex sentences with multiple clauses', () => {
    const input = 'Please create a Node.js application that will support user authentication and that handles data validation';
    const result = optimizePrompt(input);
    expect(result).not.toContain('Please');
    expect(result).not.toContain('that will');
    expect(result).toContain('Node.js application');
  });

  it('maintains sentence structure while removing fluff', () => {
    const input = 'Build a React component that renders user profiles';
    const result = optimizePrompt(input);
    expect(result).toBe('Build a React component renders user profiles');
  });

  it('handles edge cases with only filler words', () => {
    const input = 'Please just really actually';
    const result = optimizePrompt(input);
    expect(result.trim()).toBe('');
  });
});
