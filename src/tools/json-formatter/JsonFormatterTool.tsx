import { useState } from 'react';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { sortJsonKeysDeep } from '../../lib/json';

/**
 * Tokenises already-validated (prettified) JSON and wraps tokens in
 * <span> elements for syntax colouring.  HTML special chars are escaped
 * so there is no XSS risk from the input.
 */
function highlightJson(json: string): string {
  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Matches: quoted strings (optionally followed by a colon → key),
  //          boolean literals, null, and numbers.
  const re =
    /"(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g;

  let result = '';
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(json)) !== null) {
    if (m.index > last) {
      result += `<span class="json-punct">${esc(json.slice(last, m.index))}</span>`;
    }

    const token = m[0];
    const isKey = m[1] !== undefined; // group 1: optional trailing colon

    let cls: string;
    if (isKey) {
      cls = 'json-key';
    } else if (token[0] === '"') {
      cls = 'json-str';
    } else if (token === 'true' || token === 'false') {
      cls = 'json-bool';
    } else if (token === 'null') {
      cls = 'json-null';
    } else {
      cls = 'json-num';
    }

    result += `<span class="${cls}">${esc(token)}</span>`;
    last = m.index + token.length;
  }

  if (last < json.length) {
    result += `<span class="json-punct">${esc(json.slice(last))}</span>`;
  }

  return result;
}

export function JsonFormatterTool() {
  const [input, setInput] = useLocalStorage('json:input', '');
  const [indent, setIndent] = useLocalStorage<number>('json:indent', 2);
  const [output, setOutput] = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [error, setError] = useState('');
  const [sortKeys, setSortKeys] = useLocalStorage<boolean>('json:sortKeys', false);
  const [copied, setCopied] = useState(false);

  function prettify() {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const normalized = sortKeys ? sortJsonKeysDeep(parsed) : parsed;
      const formatted = JSON.stringify(normalized, null, indent);
      setOutput(formatted);
      setHighlighted(highlightJson(formatted));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
      setHighlighted('');
    }
  }

  function minify() {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const normalized = sortKeys ? sortJsonKeysDeep(parsed) : parsed;
      const formatted = JSON.stringify(normalized);
      setOutput(formatted);
      setHighlighted(highlightJson(formatted));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
      setHighlighted('');
    }
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
          <label className="tool-label">JSON Input</label>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); setOutput(''); setHighlighted(''); }}
            placeholder={'{\n  "key": "value"\n}'}
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Output</label>
          <div className="tool-output" style={{ minHeight: 180 }}>
            {highlighted
              ? <span dangerouslySetInnerHTML={{ __html: highlighted }} />
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
        <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
          />
          Sort keys (recursive)
        </label>
        <button className="tool-btn" onClick={copyOutput} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
