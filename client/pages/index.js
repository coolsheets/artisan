import { useState } from 'react';
import PromptForm from '../components/PromptForm';
import PromptList from '../components/PromptList';

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  return (
    <div>
      <h1>Prompt Generator (MERN + Next.js)</h1>
      <PromptForm onNewPrompt={prompt => setPrompts([prompt, ...prompts])} />
      <PromptList prompts={prompts} />
    </div>
  );
}
