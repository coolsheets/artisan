import { atomizeProblem } from '../utils/atomize';

describe('atomizeProblem utility', () => {
  it('splits simple comma-separated tasks', () => {
    const input = 'Create user model, setup authentication, implement CRUD operations';
    const result = atomizeProblem(input);
    expect(result).toEqual([
      'Step 1: Create user model',
      'Step 2: setup authentication',
      'Step 3: implement CRUD operations'
    ]);
  });

  it('splits tasks with "and" connectors', () => {
    const input = 'Setup database and create models and implement API routes';
    const result = atomizeProblem(input);
    expect(result).toEqual([
      'Step 1: Setup database',
      'Step 2: create models',
      'Step 3: implement API routes'
    ]);
  });

  it('handles mixed separators', () => {
    const input = 'Create user authentication, setup database and implement validation';
    const result = atomizeProblem(input);
    expect(result).toEqual([
      'Step 1: Create user authentication',
      'Step 2: setup database',
      'Step 3: implement validation'
    ]);
  });

  it('handles empty or invalid inputs', () => {
    expect(atomizeProblem('')).toEqual([]);
    expect(atomizeProblem(null)).toEqual([]);
    expect(atomizeProblem(undefined)).toEqual([]);
    expect(atomizeProblem(123)).toEqual([]);
  });

  it('filters out empty segments', () => {
    const input = 'Task 1,, Task 2, , Task 3';
    const result = atomizeProblem(input);
    expect(result).toEqual([
      'Step 1: Task 1',
      'Step 2: Task 2',
      'Step 3: Task 3'
    ]);
  });

  it('trims whitespace from segments', () => {
    const input = '  Create API  ,  Setup tests  and   Deploy app  ';
    const result = atomizeProblem(input);
    expect(result).toEqual([
      'Step 1: Create API',
      'Step 2: Setup tests',
      'Step 3: Deploy app'
    ]);
  });

  it('handles single task without separators', () => {
    const input = 'Build a complete MERN stack application';
    const result = atomizeProblem(input);
    expect(result).toEqual(['Step 1: Build a complete MERN stack application']);
  });

  it('handles case-insensitive "and" splitting', () => {
    const input = 'Task 1 AND Task 2 And Task 3';
    const result = atomizeProblem(input);
    expect(result).toEqual([
      'Step 1: Task 1',
      'Step 2: Task 2',
      'Step 3: Task 3'
    ]);
  });
});
