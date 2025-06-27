import { atomizeProblem } from '../../utils/atomize';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = JSON.parse(req.body);
    const atomized = atomizeProblem(prompt);
    res.status(200).json({ atomized });
  } else {
    res.status(405).end();
  }
}
