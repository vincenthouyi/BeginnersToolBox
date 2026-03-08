import { useState } from 'react';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function UrlEncoderTool() {
  const [input, setInput] = useLocalStorage('url:input', '');
  const [mode, setMode] = useLocalStorage<'component' | 'full'>('url:mode', 'component');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function encode() {
    setError('');
    try {
      setOutput(mode === 'component' ? encodeURIComponent(input) : encodeURI(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Encoding failed');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(mode === 'component' ? decodeURIComponent(input) : decodeURI(input));
    } catch {
      setError('Invalid URL-encoded string. Check your input.');
    }
  }

  function swap() {
    setInput(output);
    setOutput('');
    setError('');
  }

  return (
    <div className="tool-layout">
      <div className="tool-controls">
        <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Mode:
          <select
            className="tool-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'component' | 'full')}
          >
            <option value="component">Component (encodeURIComponent)</option>
            <option value="full">Full URL (encodeURI)</option>
          </select>
        </label>
      </div>

      <div className="tool-row tool-row--split">
        <div className="tool-panel">
          <label className="tool-label">Input</label>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder="Enter text or encoded URL…"
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Output</label>
          <div className="tool-output">
            {output || <span style={{ color: 'var(--color-text-muted)' }}>Result will appear here…</span>}
          </div>
        </div>
      </div>

      <div className="tool-controls">
        <button className="tool-btn tool-btn--primary" onClick={encode}>Encode →</button>
        <button className="tool-btn tool-btn--primary" onClick={decode}>← Decode</button>
        <button className="tool-btn" onClick={swap} disabled={!output}>↕ Swap</button>
        <button className="tool-btn" onClick={() => output && navigator.clipboard.writeText(output)} disabled={!output}>Copy</button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
