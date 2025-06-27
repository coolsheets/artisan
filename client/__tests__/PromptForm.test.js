import { render, screen, fireEvent } from '@testing-library/react';
import PromptForm from '../components/PromptForm';

test('renders PromptForm and optimizes input', async () => {
  render(<PromptForm onNewPrompt={() => {}} />);
  fireEvent.change(screen.getByPlaceholderText(/describe/i), { target: { value: 'Please write a Node.js API for users.' } });
  fireEvent.click(screen.getByText(/generate/i));
  expect(await screen.findByText(/Node.js API for users/)).toBeInTheDocument();
});
