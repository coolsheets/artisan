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
