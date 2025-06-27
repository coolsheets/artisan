export function atomizeProblem(problemStatement) {
  return problemStatement
    .split(/,| and /gi)
    .map(s => s.trim())
    .filter(Boolean);
}
