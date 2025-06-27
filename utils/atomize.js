// utils/atomize.js
import { optimizePrompt } from './optimizePrompt';

export function atomizeProblem(problemStatement) {
  // Example: simple regex/heuristic; use NLP for production
  const modules = problemStatement
    .split(/,|and/gi)
    .map(str => str.trim())
    .filter(Boolean);
  return modules.map((mod, idx) => `Step ${idx + 1}: ${optimizePrompt(mod)}`);
}
