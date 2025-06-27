export default function PromptList({ prompts }) {
  if (!prompts.length) return null;
  return (
    <div>
      <h2>Generated Prompts</h2>
      <ul>
        {prompts.map((p, idx) => (
          <li key={idx}>
            <b>Original:</b> {p.original} <br/>
            <b>Optimized:</b> {p.optimized}
            {p.atomized && p.atomized.length > 0 && (
              <ul>
                {p.atomized.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
