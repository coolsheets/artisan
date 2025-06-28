import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '../components/ImageUpload';

// Mock fetch
global.fetch = jest.fn();
// Mock FileReader
global.FileReader = class {
  constructor() {
    this.readAsDataURL = jest.fn().mockImplementation(() => {
      this.onload({ target: { result: 'data:image/jpeg;base64,mockBase64Data' } });
    });
  }
};

describe('ImageUpload Component', () => {
  const mockOnImageAnalysis = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockOnImageAnalysis.mockClear();
    mockOnError.mockClear();
  });

  it('renders image upload area correctly', () => {
    render(<ImageUpload onImageAnalysis={mockOnImageAnalysis} onError={mockOnError} />);
    
    expect(screen.getByText(/drag & drop an image/i)).toBeInTheDocument();
    expect(screen.getByText(/jpg, png, gif, webp/i)).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    const user = userEvent.setup();
    render(<ImageUpload onImageAnalysis={mockOnImageAnalysis} onError={mockOnError} />);
    
    const fileInput = screen.getByText(/drag & drop an image/i).closest('div').querySelector('input');
    
    const invalidFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile]
    });
    
    await user.click(fileInput);
    
    expect(mockOnError).toHaveBeenCalledWith('Please select an image file (JPG, PNG, etc.)');
  });

  it('handles successful image upload', async () => {
    render(<ImageUpload onImageAnalysis={mockOnImageAnalysis} onError={mockOnError} />);
    
    const fileInput = screen.getByText(/drag & drop an image/i).closest('div').querySelector('input');
    
    const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [validFile]
    });
    
    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ 
          success: true, 
          data: { 
            analysis: { content: { possibleSubjects: ['sky', 'ocean'] } } 
          } 
        })
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ 
          success: true, 
          data: { descriptive: 'A landscape image with blue tones' } 
        })
      });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/imageUpload', expect.anything());
    });
    
    await waitFor(() => {
      expect(mockOnImageAnalysis).toHaveBeenCalledWith(expect.objectContaining({ 
        analysis: expect.objectContaining({ content: expect.anything() }) 
      }));
    });
  });

  it('handles API errors gracefully', async () => {
    render(<ImageUpload onImageAnalysis={mockOnImageAnalysis} onError={mockOnError} />);
    
    const fileInput = screen.getByText(/drag & drop an image/i).closest('div').querySelector('input');
    
    const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [validFile]
    });
    
    // Mock API error
    fetch.mockRejectedValueOnce(new Error('Server error'));
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Upload failed: Server error'));
    });
  });
});
