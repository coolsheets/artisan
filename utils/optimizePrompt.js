// utils/optimizePrompt.js
export function optimizePrompt(prompt) {
  // Remove filler, keep only required instructions
  let concise = prompt
    .replace(/Please\s+/, '')
    .replace(/that will|which will|that|which/g, '')
    .replace(/,?\s+supporting\s+/g, ': ')
    .replace(/\b(?:just|really|very|actually|simply|like|basically|please|kindly)\b/gi, '')
    .trim();
  // Optionally, use AI for advanced rephrasing
  return concise;
}

// Example API route (pages/api/optimize.js in Next.js)
import { optimizePrompt } from '../../utils/optimizePrompt';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    const optimized = optimizePrompt(prompt);
    res.status(200).json({ optimized });
  } else {
    res.status(405).end();
  }
}
