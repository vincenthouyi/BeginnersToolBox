import { useState } from 'react';
import '../tools.css';

export function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  function prettify() {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  }

  function minify() {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <div className="tool-layout">
      <div className="tool-row tool-row--split">
        <div className="tool-panel">
          <label className="tool-label">JSON Input</label>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); setOutput(''); }}
            placeholder={'{\n  "key": "value"\n}'}
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Output</label>
          <div className="tool-output" style={{ minHeight: 180 }}>
            {output
              ? output
              : <span style={{ color: 'var(--color-text-muted)' }}>Formatted JSON will appear here…</span>}
          </div>
        </div>
      </div>

      <div className="tool-controls">
        <button className="tool-btn tool-btn--primary" onClick={prettify}>Prettify</button>
        <button className="tool-btn tool-btn--primary" onClick={minify}>Minify</button>
        <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Indent:
          <select className="tool-select" value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
          </select>
        </label>
        <button className="tool-btn" onClick={copyOutput} disabled={!output}>Copy</button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
