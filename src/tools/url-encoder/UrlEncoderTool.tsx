import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getEnumSearchParam, getShortSearchParam } from '../../lib/urlParams';

export function UrlEncoderTool() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useLocalStorage('url:input', '');
  const [mode, setMode] = useLocalStorage<'component' | 'full'>('url:mode', 'component');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const nextText = getShortSearchParam(searchParams, 'text');
    const nextScope = getEnumSearchParam(searchParams, 'scope', ['component', 'full'] as const);
    const nextOp = getEnumSearchParam(searchParams, 'op', ['encode', 'decode'] as const);

    if (nextText !== null) {
      setInput(nextText);
      setOutput('');
      setError('');
    }

    if (nextScope) {
      setMode(nextScope);
    }

    if (nextText !== null && nextOp) {
      // Auto-run conversion when both are provided.
      if (nextOp === 'encode') {
        try {
          setOutput(nextScope === 'full' ? encodeURI(nextText) : encodeURIComponent(nextText));
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Encoding failed');
        }
      } else {
        try {
          setOutput(nextScope === 'full' ? decodeURI(nextText) : decodeURIComponent(nextText));
        } catch {
          setError('Invalid URL-encoded string. Check your input.');
        }
      }
    }
    // Intentionally only reacts to URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
        <button className="tool-btn" onClick={() => { if (output) { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } }} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
