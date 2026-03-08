import { useMemo } from 'react';
import '../tools.css';
import './RegexTesterTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function RegexTesterTool() {
  const [pattern, setPattern] = useLocalStorage('regex:pattern', '(\\w+)\\s+(\\w+)');
  const [flags, setFlags] = useLocalStorage('regex:flags', 'g');
  const [testStr, setTestStr] = useLocalStorage('regex:testStr', 'Hello World\nFoo Bar\nBaz Qux');

  const result = useMemo(() => {
    if (!pattern) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches: Array<{ match: string; index: number; groups: string[] }> = [];
      if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        re.lastIndex = 0;
        while ((m = re.exec(testStr)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: Array.from(m).slice(1).map((g) => g ?? '') });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        const m = re.exec(testStr);
        if (m) matches.push({ match: m[0], index: m.index, groups: Array.from(m).slice(1).map((g) => g ?? '') });
      }
      return { matches, re, error: null };
    } catch (e) {
      return { matches: [], re: null, error: e instanceof Error ? e.message : 'Invalid regex' };
    }
  }, [pattern, flags, testStr]);

  const error = result?.error ?? null;

  // Build highlighted text
  const highlighted = useMemo(() => {
    if (!result || result.matches.length === 0) return null;
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const m of result.matches) {
      if (m.index > last) parts.push(<span key={`t${last}`}>{testStr.slice(last, m.index)}</span>);
      parts.push(<mark key={`m${m.index}`} className="regex-match">{m.match}</mark>);
      last = m.index + m.match.length;
    }
    if (last < testStr.length) parts.push(<span key="end">{testStr.slice(last)}</span>);
    return parts;
  }, [result, testStr]);

  return (
    <div className="tool-layout">
      <div className="tool-field">
        <label className="tool-label">Regular Expression</label>
        <div className="regex-input-row">
          <span className="regex-delim">/</span>
          <input
            className="tool-input"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="pattern"
            spellCheck={false}
          />
          <span className="regex-delim">/</span>
          <input
            className="tool-input"
            style={{ maxWidth: 80 }}
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
            placeholder="flags"
            spellCheck={false}
          />
        </div>
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}

      <div className="tool-row tool-row--split">
        <div className="tool-panel">
          <label className="tool-label">Test String</label>
          <textarea
            className="tool-textarea"
            style={{ minHeight: 200 }}
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            spellCheck={false}
            placeholder="Enter text to test against…"
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">
            Highlighted Matches
            {result && <span className="regex-count"> ({result.matches.length} match{result.matches.length !== 1 ? 'es' : ''})</span>}
          </label>
          <div className="tool-output regex-highlighted" style={{ minHeight: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {result && result.matches.length > 0
              ? highlighted
              : <span style={{ color: 'var(--color-text-muted)' }}>
                  {result && !result.error ? 'No matches' : 'Enter a pattern above…'}
                </span>}
          </div>
        </div>
      </div>

      {result && result.matches.length > 0 && (
        <div className="tool-panel">
          <label className="tool-label">Match Details</label>
          <div className="regex-match-list">
            {result.matches.map((m, i) => (
              <div key={i} className="regex-match-item">
                <span className="regex-match-num">#{i + 1}</span>
                <code className="regex-match-value">&quot;{m.match}&quot;</code>
                <span className="regex-match-pos">@ {m.index}</span>
                {m.groups.length > 0 && (
                  <span className="regex-match-groups">
                    groups: {m.groups.map((g, j) => <code key={j}>&quot;{g}&quot;</code>)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
