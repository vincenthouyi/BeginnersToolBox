import { useState } from 'react';
import '../tools.css';

export function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function encode() {
    setError('');
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setError('Encoding failed. Check your input.');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(decodeURIComponent(escape(atob(input.trim()))));
    } catch {
      setError('Invalid Base64 string. Check your input.');
    }
  }

  function swap() {
    setInput(output);
    setOutput('');
    setError('');
  }

  return (
    <div className="tool-layout">
      <div className="tool-row tool-row--split">
        <div className="tool-panel">
          <label className="tool-label">Input</label>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text or Base64 string…"
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Output</label>
          <div className="tool-output">{output || <span style={{ color: 'var(--color-text-muted)' }}>Result will appear here…</span>}</div>
        </div>
      </div>

      <div className="tool-controls">
        <button className="tool-btn tool-btn--primary" onClick={encode}>Encode → Base64</button>
        <button className="tool-btn tool-btn--primary" onClick={decode}>Decode ← Base64</button>
        <button className="tool-btn" onClick={swap} disabled={!output}>↕ Swap</button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
