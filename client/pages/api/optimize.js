import { optimizePrompt } from '../../utils/optimizePrompt';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    const optimized = optimizePrompt(prompt);
    res.status(200).json({ optimized });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
