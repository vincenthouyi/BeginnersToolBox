import { useState } from 'react';
import '../tools.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { convert, type InputFormat, type OutputFormat } from '../../lib/dataConverter';

type SupportedPair = `${InputFormat}->${OutputFormat}`;

const SUPPORTED_PAIRS = new Set<SupportedPair>([
  'json->yaml',
  'yaml->json',
  'json->csv',
  'csv->json',
]);

function isSupportedPair(from: InputFormat, to: OutputFormat): boolean {
  return SUPPORTED_PAIRS.has(`${from}->${to}` as SupportedPair);
}

export function DataConverterTool() {
  const [input, setInput] = useLocalStorage('data-converter:input', '');
  const [fromFmt, setFromFmt] = useLocalStorage<InputFormat>('data-converter:from', 'json');
  const [toFmt, setToFmt] = useLocalStorage<OutputFormat>('data-converter:to', 'yaml');
  const [jsonIndent, setJsonIndent] = useLocalStorage<2 | 4>('data-converter:indent', 2);
  const [csvDelimiter, setCsvDelimiter] = useLocalStorage<',' | ';' | '\t'>('data-converter:delimiter', ',');

  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const supported = isSupportedPair(fromFmt, toFmt);
  const showJsonIndent = toFmt === 'json';
  const showCsvDelimiter = fromFmt === 'csv' || toFmt === 'csv';

  function handleConvert() {
    setError('');
    setOutput('');
    if (!supported) {
      setError(`Conversion from ${fromFmt.toUpperCase()} to ${toFmt.toUpperCase()} is not supported.`);
      return;
    }
    try {
      const result = convert(input, fromFmt, toFmt, { jsonIndent, csvDelimiter });
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.');
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    setError('');
    setOutput('');
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
          <label className="tool-label">Input</label>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste your data here…"
            spellCheck={false}
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Output</label>
          <div className="tool-output" style={{ minHeight: 180 }}>
            {output
              ? <span style={{ whiteSpace: 'pre-wrap' }}>{output}</span>
              : <span style={{ color: 'var(--color-text-muted)' }}>Converted output will appear here…</span>}
          </div>
        </div>
      </div>

      <div className="tool-controls">
        <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          From:
          <select
            className="tool-select"
            value={fromFmt}
            onChange={(e) => { setFromFmt(e.target.value as InputFormat); setOutput(''); setError(''); }}
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="csv">CSV</option>
          </select>
        </label>

        <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          To:
          <select
            className="tool-select"
            value={toFmt}
            onChange={(e) => { setToFmt(e.target.value as OutputFormat); setOutput(''); setError(''); }}
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="csv">CSV</option>
          </select>
        </label>

        {showJsonIndent && (
          <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            JSON indent:
            <select
              className="tool-select"
              value={jsonIndent}
              onChange={(e) => setJsonIndent(Number(e.target.value) as 2 | 4)}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        )}

        {showCsvDelimiter && (
          <label className="tool-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            CSV delimiter:
            <select
              className="tool-select"
              value={csvDelimiter}
              onChange={(e) => setCsvDelimiter(e.target.value as ',' | ';' | '\t')}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={'\t'}>Tab</option>
            </select>
          </label>
        )}

        <button
          className="tool-btn tool-btn--primary"
          onClick={handleConvert}
          disabled={!supported}
          title={!supported ? `${fromFmt.toUpperCase()} → ${toFmt.toUpperCase()} is not supported` : undefined}
        >
          Convert
        </button>

        <button className="tool-btn" onClick={handleCopy} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {!supported && (
        <div className="tool-message tool-message--error">
          {`${fromFmt.toUpperCase()} → ${toFmt.toUpperCase()} is not supported. Supported conversions: JSON ↔ YAML, JSON ↔ CSV.`}
        </div>
      )}

      {error && <div className="tool-message tool-message--error">{error}</div>}
    </div>
  );
}
