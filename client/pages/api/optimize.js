import { optimizePrompt } from '../../utils/optimizePrompt';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = JSON.parse(req.body);
    const optimized = optimizePrompt(prompt);
    res.status(200).json({ optimized });
  } else {
    res.status(405).end();
  }
}
