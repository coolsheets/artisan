export function optimizePrompt(prompt) {
  // Simple demo logic, expand as needed
  return prompt
    .replace(/Please\s+/i, '')
    .replace(/that will|which will|that|which/g, '')
    .replace(/,?\s+supporting\s+/g, ': ')
    .replace(/\b(?:just|really|very|actually|simply|like|basically|please|kindly)\b/gi, '')
    .trim();
}
