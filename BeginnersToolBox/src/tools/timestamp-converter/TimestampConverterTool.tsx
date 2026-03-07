import { useState } from 'react';
import '../tools.css';
import './TimestampConverterTool.css';

function formatDate(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

function formatLocal(d: Date): string {
  return d.toLocaleString();
}

export function TimestampConverterTool() {
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [tsResult, setTsResult] = useState<{ unix: number; utc: string; local: string } | null>(null);
  const [dateResult, setDateResult] = useState<{ unix: number; utc: string; local: string } | null>(null);
  const [tsError, setTsError] = useState('');
  const [dateError, setDateError] = useState('');

  function convertTimestamp() {
    setTsError('');
    const raw = tsInput.trim();
    if (!raw) { setTsError('Enter a timestamp'); return; }
    let num = parseInt(raw, 10);
    if (isNaN(num)) { setTsError('Not a valid number'); return; }
    // Auto-detect milliseconds (13+ digit = ms)
    if (raw.length >= 13) num = Math.round(num / 1000) * 1000;
    else num = num * 1000;
    const d = new Date(num);
    if (isNaN(d.getTime())) { setTsError('Invalid timestamp'); return; }
    setTsResult({ unix: num / 1000, utc: formatDate(d), local: formatLocal(d) });
  }

  function convertDate() {
    setDateError('');
    const raw = dateInput.trim();
    if (!raw) { setDateError('Enter a date/time string'); return; }
    const d = new Date(raw);
    if (isNaN(d.getTime())) { setDateError('Could not parse date. Try ISO 8601: 2024-01-15T12:00:00Z'); return; }
    setDateResult({ unix: Math.floor(d.getTime() / 1000), utc: formatDate(d), local: formatLocal(d) });
  }

  function useNow() {
    const now = new Date();
    setTsInput(String(Math.floor(now.getTime() / 1000)));
    setTsResult(null);
    setTsError('');
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="tool-layout">
      {/* Timestamp → Date */}
      <div className="ts-section">
        <label className="tool-label">Unix Timestamp → Date</label>
        <div className="tool-field-row">
          <input
            className="tool-input"
            value={tsInput}
            onChange={(e) => { setTsInput(e.target.value); setTsError(''); setTsResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && convertTimestamp()}
            placeholder="e.g. 1700000000 or 1700000000000"
          />
          <button className="tool-btn tool-btn--primary" onClick={convertTimestamp}>Convert</button>
          <button className="tool-btn" onClick={useNow}>Now</button>
        </div>
        {tsError && <div className="tool-message tool-message--error">{tsError}</div>}
        {tsResult && (
          <div className="ts-result-grid">
            <TsRow label="Unix (s)" value={String(tsResult.unix)} onCopy={copyText} />
            <TsRow label="UTC" value={tsResult.utc} onCopy={copyText} />
            <TsRow label="Local" value={tsResult.local} onCopy={copyText} />
          </div>
        )}
      </div>

      <hr className="ts-divider" />

      {/* Date → Timestamp */}
      <div className="ts-section">
        <label className="tool-label">Date / Time String → Unix Timestamp</label>
        <div className="tool-field-row">
          <input
            className="tool-input"
            value={dateInput}
            onChange={(e) => { setDateInput(e.target.value); setDateError(''); setDateResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && convertDate()}
            placeholder="e.g. 2024-01-15T12:00:00Z or Jan 15, 2024"
          />
          <button className="tool-btn tool-btn--primary" onClick={convertDate}>Convert</button>
        </div>
        {dateError && <div className="tool-message tool-message--error">{dateError}</div>}
        {dateResult && (
          <div className="ts-result-grid">
            <TsRow label="Unix (s)" value={String(dateResult.unix)} onCopy={copyText} />
            <TsRow label="Unix (ms)" value={String(dateResult.unix * 1000)} onCopy={copyText} />
            <TsRow label="UTC" value={dateResult.utc} onCopy={copyText} />
            <TsRow label="Local" value={dateResult.local} onCopy={copyText} />
          </div>
        )}
      </div>
    </div>
  );
}

function TsRow({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="ts-row">
      <span className="ts-row-label">{label}</span>
      <code className="ts-row-value">{value}</code>
      <button className="tool-copy-btn" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
    </div>
  );
}
