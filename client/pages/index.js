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
      <PromptForm 
        onNewPrompt={handleNewPrompt} 
        onClearAll={clearAllPrompts}
      />
      <PromptList prompts={prompts} />
    </div>
  );
}
