import { useState } from 'react';
import PromptForm from '../components/PromptForm';
import PromptList from '../components/PromptList';

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  
  const handleNewPrompt = (prompt) => {
    setPrompts([prompt, ...prompts]);
  };
  
  const clearAllPrompts = () => {
    setPrompts([]);
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Prompt Generator (MERN + Next.js)</h1>
      <p style={{ 
        fontSize: '16px', 
        lineHeight: '1.5', 
        color: '#666', 
        marginBottom: '30px',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        This application helps you create optimized AI prompts for maximum effectiveness and minimal token usage. 
        Enter your project description or problem statement, and get both a concise optimized version and 
        step-by-step atomized prompts for complex tasks. Perfect for developers, writers, and AI enthusiasts 
        who want to craft better prompts for ChatGPT, Claude, and other AI systems.
      </p>
      <PromptForm 
        onNewPrompt={handleNewPrompt} 
        onClearAll={clearAllPrompts}
      />
      <PromptList prompts={prompts} />
    </div>
  );
}
