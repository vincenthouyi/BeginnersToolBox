import { useState } from 'react';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { encodeBase64, decodeBase64 } from '../../lib/base64';

export function Base64Tool() {
  const [input, setInput] = useLocalStorage('base64:input', '');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function encode() {
    setError('');
    try {
      setOutput(encodeBase64(input));
    } catch {
      setError('Encoding failed. Check your input.');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(decodeBase64(input));
    } catch {
      setError('Invalid Base64 string. Check your input.');
    }
  }

  function swap() {
    setInput(output);
    setOutput('');
    setError('');
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
        <button className="tool-btn" onClick={copyOutput} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
