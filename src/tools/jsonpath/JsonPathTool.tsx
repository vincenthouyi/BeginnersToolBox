import { useState } from 'react';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSearchParams } from 'react-router-dom';
import { getShortSearchParam } from '../../lib/urlParams';
import { queryJsonPath } from '../../lib/jsonpath';

const PLACEHOLDER_JSON = `{
  "store": {
    "book": [
      { "title": "The Fellowship", "price": 9.99 },
      { "title": "Foundation", "price": 7.99 }
    ]
  }
}`;

export function JsonPathTool() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useLocalStorage('jsonpath:input', '');
  const [expression, setExpression] = useState<string>(
    () => getShortSearchParam(searchParams, 'expr') ?? ''
  );
  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState('');
  const [ran, setRan] = useState(false);
  const [copied, setCopied] = useState(false);

  function run() {
    const { matches, error: err } = queryJsonPath(input, expression);
    setResults(matches);
    setError(err ?? '');
    setRan(true);

    if (expression && expression.length <= 500) {
      setSearchParams({ expr: expression }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function copyOutput() {
    const text = results.map((r) => JSON.stringify(r, null, 2)).join('\n\n');
    navigator.clipboard.writeText(text);
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
            onChange={(e) => { setInput(e.target.value); setRan(false); setError(''); }}
            placeholder={PLACEHOLDER_JSON}
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Results</label>
          <div className="tool-output jsonpath-results" style={{ minHeight: 180 }}>
            {!ran && (
              <span style={{ color: 'var(--color-text-muted)' }}>
                Results will appear here after you click Run…
              </span>
            )}
            {ran && !error && results.length === 0 && (
              <span style={{ color: 'var(--color-text-muted)' }}>(no matches)</span>
            )}
            {ran && !error && results.length > 0 && results.map((r, i) => (
              <pre key={i} className="jsonpath-match">{JSON.stringify(r, null, 2)}</pre>
            ))}
          </div>
        </div>
      </div>

      <div className="tool-controls">
        <input
          className="tool-input jsonpath-expr-input"
          type="text"
          value={expression}
          onChange={(e) => { setExpression(e.target.value); setRan(false); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="JSONPath expression, e.g. $.store.book[*].title"
          spellCheck={false}
        />
        <button className="tool-btn tool-btn--primary" onClick={run}>Run</button>
        <button
          className="tool-btn"
          onClick={copyOutput}
          disabled={results.length === 0}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}
      {ran && !error && (
        <div className="tool-message">
          {results.length} match{results.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}
