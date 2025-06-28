import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptForm from '../components/PromptForm';

// Mock fetch
global.fetch = jest.fn();

describe('PromptForm Component', () => {
  const mockOnNewPrompt = jest.fn();
  const mockOnClearAll = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockOnNewPrompt.mockClear();
    mockOnClearAll.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    expect(screen.getByPlaceholderText('Describe your project/problem...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const submitButton = screen.getByRole('button', { name: /generate/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/please enter a prompt to optimize/i)).toBeInTheDocument();
  });

  it('processes form submission successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ optimized: 'Test optimized prompt' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ atomized: ['Step 1: Test step'] })
      });

    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const submitButton = screen.getByRole('button', { name: /generate & optimize/i });
    
    await user.type(textarea, 'Test prompt input');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Optimized Prompt:')).toBeInTheDocument();
      expect(screen.getByText('Test optimized prompt')).toBeInTheDocument();
      expect(screen.getByText('Atomized Prompts:')).toBeInTheDocument();
      expect(screen.getByText('🎯 One-Shot Solution Preamble')).toBeInTheDocument();
      expect(screen.getByText('💡 How to Use These Prompts')).toBeInTheDocument();
      expect(screen.getByText('🤖 Recommended AI Models')).toBeInTheDocument();
    });

    expect(mockOnNewPrompt).toHaveBeenCalledWith({
      original: 'Test prompt input',
      optimized: 'Test optimized prompt',
      atomized: ['Step 1: Test step'],
      preamble: expect.any(String),
      analysis: expect.any(Object)
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    fetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const submitButton = screen.getByRole('button', { name: /generate & optimize/i });
    
    await user.type(textarea, 'Test prompt');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error: api error/i)).toBeInTheDocument();
    });
  });

  it('clears all fields when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    
    await user.type(textarea, 'Test input');
    await user.click(clearButton);
    
    expect(textarea.value).toBe('');
    expect(mockOnClearAll).toHaveBeenCalled();
  });

  it('disables buttons during loading', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const submitButton = screen.getByRole('button', { name: /generate & optimize/i });
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    
    await user.type(textarea, 'Test prompt');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('generates and displays preamble with problem analysis', async () => {
    const user = userEvent.setup();
    
    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ optimized: 'Optimized coding prompt' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ atomized: ['Step 1: Setup', 'Step 2: Implementation'] })
      });

    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const submitButton = screen.getByRole('button', { name: /generate & optimize/i });
    
    await user.type(textarea, 'Create a React component for user authentication');
    await user.click(submitButton);
    
    await waitFor(() => {
      // Check for preamble section
      expect(screen.getByText('🎯 One-Shot Solution Preamble')).toBeInTheDocument();
      expect(screen.getByText(/Type:/)).toBeInTheDocument();
      expect(screen.getByText(/Complexity:/)).toBeInTheDocument();
      expect(screen.getByText(/Tokens:/)).toBeInTheDocument();
      expect(screen.getByText('📋 Copy')).toBeInTheDocument();
    });

    // Check that preamble contains expected content
    const preambleSection = screen.getByText('🎯 One-Shot Solution Preamble').closest('div');
    expect(preambleSection).toBeInTheDocument();
  });

  it('copy button works for preamble', async () => {
    const user = userEvent.setup();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue()
      }
    });
    
    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ optimized: 'Test optimized' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ atomized: ['Test step'] })
      });

    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const submitButton = screen.getByRole('button', { name: /generate & optimize/i });
    
    await user.type(textarea, 'Test prompt for copy functionality');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('📋 Copy')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('📋 Copy');
    await user.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('COMPREHENSIVE ONE-SHOT SOLUTION PREAMBLE'));
  });

  it('shows appropriate AI model recommendations based on prompt content', async () => {
    const user = userEvent.setup();
    
    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ optimized: 'Write a JavaScript function' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ atomized: ['Step 1: Define function'] })
      });

    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    const submitButton = screen.getByRole('button', { name: /generate & optimize/i });
    
    await user.type(textarea, 'Help me write code for a JavaScript function');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Primary: Claude 3.5 Sonnet')).toBeInTheDocument();
      expect(screen.getByText(/code generation/i)).toBeInTheDocument();
    });
  });
});
