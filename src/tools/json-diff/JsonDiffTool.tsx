import { useState } from 'react';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { diffJson, formatDiff } from '../../lib/jsonDiff';

export function JsonDiffTool() {
  const [left, setLeft] = useLocalStorage('json-diff:left', '');
  const [right, setRight] = useLocalStorage('json-diff:right', '');
  const [sortKeys, setSortKeys] = useLocalStorage('json-diff:sort-keys', false);

  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function handleDiff() {
    setError('');
    setOutput('');
    try {
      const entries = diffJson(left.trim(), right.trim(), { sortKeys });
      setOutput(formatDiff(entries));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to diff JSON.');
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="tool-layout">
      <div className="tool-row tool-row--split">
        <div className="tool-panel">
          <label className="tool-label">Left (original)</label>
          <textarea
            className="tool-textarea"
            value={left}
            onChange={(e) => { setLeft(e.target.value); setOutput(''); setError(''); }}
            placeholder='{"name": "Alice"}'
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Right (modified)</label>
          <textarea
            className="tool-textarea"
            value={right}
            onChange={(e) => { setRight(e.target.value); setOutput(''); setError(''); }}
            placeholder='{"name": "Bob"}'
            spellCheck={false}
          />
        </div>
      </div>

      <div className="tool-controls">
        <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => { setSortKeys(e.target.checked); setOutput(''); setError(''); }}
          />
          Sort keys before diff
        </label>

        <button className="tool-btn tool-btn--primary" onClick={handleDiff}>
          Diff
        </button>

        <button className="tool-btn" onClick={handleCopy} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}

      {output && (
        <div className="tool-panel">
          <label className="tool-label">Result</label>
          <div className="tool-output json-diff-output">
            {output.split('\n').map((line, i) => {
              const cls =
                line.startsWith('+') ? 'json-diff-line--added'
                : line.startsWith('-') ? 'json-diff-line--removed'
                : line.startsWith('~') ? 'json-diff-line--changed'
                : '';
              return (
                <div key={i} className={`json-diff-line ${cls}`}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
