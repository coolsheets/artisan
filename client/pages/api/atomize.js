import { atomizeProblem } from '../../utils/atomize';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    const atomized = atomizeProblem(prompt);
    res.status(200).json({ atomized });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
