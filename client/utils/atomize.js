export function atomizeProblem(problemStatement) {
  if (!problemStatement || typeof problemStatement !== 'string') return [];
  
  return problemStatement
    .split(/,| and /gi)
    .map(s => s.trim())
    .filter(Boolean)
    .map((step, idx) => `Step ${idx + 1}: ${step}`);
}
