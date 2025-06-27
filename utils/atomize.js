// utils/atomize.js
export function atomizeProblem(problemStatement) {
  // Example: simple regex/heuristic; use NLP for production
  const modules = problemStatement
    .split(/,|and/gi)
    .map(str => str.trim())
    .filter(Boolean);
  return modules.map((mod, idx) => ({
    name: `Module ${idx + 1}`,
    description: mod,
    optimizedPrompt: optimizePrompt(mod)
  }));
}
