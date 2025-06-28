import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptForm from '../components/PromptForm';

// Mock the ImageUpload component
jest.mock('../components/ImageUpload', () => {
  return function MockImageUpload({ onImageAnalysis }) {
    return (
      <div data-testid="mock-image-upload">
        <button 
          onClick={() => onImageAnalysis({
            fileInfo: {
              filename: 'test-image.jpg',
              mimetype: 'image/jpeg'
            },
            analysis: {
              technical: {
                width: 800,
                height: 600,
                format: 'jpeg'
              },
              content: {
                likelyScene: 'landscape',
                brightness: 'balanced',
                colorTone: 'blue',
                possibleSubjects: ['sky', 'ocean', 'beach']
              }
            },
            promptSuggestions: {
              descriptive: 'A landscape image with blue tones showing sky and ocean',
              contextPrompt: 'I\'m working with a landscape image that shows sky and ocean'
            }
          })}
        >
          Mock Upload Image
        </button>
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('PromptForm Component with Image Support', () => {
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

  it('renders image upload button', () => {
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    expect(screen.getByText(/add image/i)).toBeInTheDocument();
  });

  it('toggles image upload section when button clicked', async () => {
    const user = userEvent.setup();
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    // Initially image upload is hidden
    expect(screen.queryByTestId('mock-image-upload')).not.toBeInTheDocument();
    
    // Click to show image upload
    const toggleButton = screen.getByText(/add image/i);
    await user.click(toggleButton);
    
    expect(screen.getByTestId('mock-image-upload')).toBeInTheDocument();
    expect(screen.getByText(/hide image upload/i)).toBeInTheDocument();
    
    // Click to hide image upload
    await user.click(toggleButton);
    expect(screen.queryByTestId('mock-image-upload')).not.toBeInTheDocument();
  });

  it('processes image analysis and updates prompt', async () => {
    const user = userEvent.setup();
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    // Show image upload
    const toggleButton = screen.getByText(/add image/i);
    await user.click(toggleButton);
    
    // Upload image
    const uploadButton = screen.getByText(/mock upload image/i);
    await user.click(uploadButton);
    
    // Check if prompt was updated with image context
    const textarea = screen.getByPlaceholderText('Describe your project/problem...');
    expect(textarea.value).toContain('working with a landscape image that shows sky and ocean');
    
    // Check if suggestions are shown
    expect(screen.getByText(/suggested prompts/i)).toBeInTheDocument();
  });

  it('includes image data in generated prompt', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ optimized: 'Test optimized prompt with image context' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ atomized: ['Step 1: Analyze image', 'Step 2: Create content'] })
      });
    
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    // Show and use image upload
    await user.click(screen.getByText(/add image/i));
    await user.click(screen.getByText(/mock upload image/i));
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /generate/i }));
    
    await waitFor(() => {
      expect(mockOnNewPrompt).toHaveBeenCalledWith(expect.objectContaining({
        imageAnalysis: expect.objectContaining({
          analysis: expect.objectContaining({
            content: expect.objectContaining({
              possibleSubjects: expect.arrayContaining(['sky', 'ocean'])
            })
          })
        })
      }));
    });
  });

  it('clears image data when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<PromptForm onNewPrompt={mockOnNewPrompt} onClearAll={mockOnClearAll} />);
    
    // Show and use image upload
    await user.click(screen.getByText(/add image/i));
    await user.click(screen.getByText(/mock upload image/i));
    
    // Verify image analysis is shown
    expect(screen.getByText(/suggested prompts/i)).toBeInTheDocument();
    
    // Clear form
    await user.click(screen.getByRole('button', { name: /clear/i }));
    
    // Check that image data is cleared
    expect(screen.queryByText(/suggested prompts/i)).not.toBeInTheDocument();
  });
});
