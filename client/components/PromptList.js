export default function PromptList({ prompts }) {
  if (!prompts.length) return null;
  return (
    <div style={{
      marginTop: '30px',
      width: '100%'
    }}>
      <h2 style={{
        fontSize: 'clamp(18px, 4vw, 24px)',
        marginBottom: '20px',
        color: '#333',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '10px'
      }}>
        Generated Prompts History
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {prompts.map((p, idx) => (
          <div key={idx} style={{
            padding: 'clamp(12px, 2.5vw, 20px)',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: '1.5'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#495057' }}>Original:</strong>
              <div style={{ 
                marginTop: '5px',
                padding: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                wordWrap: 'break-word'
              }}>
                {p.original}
              </div>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#28a745' }}>Optimized:</strong>
              <div style={{ 
                marginTop: '5px',
                padding: '8px',
                backgroundColor: '#d4edda',
                borderRadius: '4px',
                border: '1px solid #c3e6cb',
                wordWrap: 'break-word'
              }}>
                {p.optimized}
              </div>
            </div>
            
            {p.atomized && p.atomized.length > 0 && (
              <div>
                <strong style={{ color: '#007bff' }}>Atomized Steps:</strong>
                <ul style={{
                  marginTop: '8px',
                  marginBottom: '0',
                  paddingLeft: 'clamp(16px, 3vw, 20px)',
                  backgroundColor: '#cce7ff',
                  padding: '8px clamp(16px, 3vw, 20px)',
                  borderRadius: '4px',
                  border: '1px solid #99d3ff'
                }}>
                  {p.atomized.map((a, i) => (
                    <li key={i} style={{ 
                      marginBottom: '5px',
                      wordWrap: 'break-word'
                    }}>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
