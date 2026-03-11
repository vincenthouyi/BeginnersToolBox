import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../tools.css';
import './TimestampConverterTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getEnumSearchParam, getShortSearchParam } from '../../lib/urlParams';

function formatDate(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

function formatLocal(d: Date): string {
  return d.toLocaleString();
}

export function TimestampConverterTool() {
  const [searchParams] = useSearchParams();
  const [tsInput, setTsInput] = useLocalStorage('ts:tsInput', '');
  const [dateInput, setDateInput] = useLocalStorage('ts:dateInput', '');
  const [tsResult, setTsResult] = useState<{ unix: number; utc: string; local: string } | null>(null);
  const [dateResult, setDateResult] = useState<{ unix: number; utc: string; local: string } | null>(null);
  const [tsError, setTsError] = useState('');
  const [dateError, setDateError] = useState('');

  function convertTimestamp(override?: string) {
    const activeInput = override ?? tsInput;
    setTsError('');
    const raw = activeInput.trim();
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

  useEffect(() => {
    const nextTs = getShortSearchParam(searchParams, 'ts');
    const nextUnit = getEnumSearchParam(searchParams, 'unit', ['s', 'ms'] as const);

    if (nextTs !== null) {
      const normalized = nextTs;

      // If unit=ms and input looks like seconds, convert to ms for consistency.
      if (nextUnit === 'ms' && normalized.length < 13) {
        const parsed = parseInt(normalized, 10);
        if (!isNaN(parsed)) {
          const ms = String(parsed * 1000);
          setTsInput(ms);
          setTsResult(null);
          setTsError('');
          convertTimestamp(ms);
          return;
        }
      }

      // If unit=s and input looks like ms, convert to seconds.
      if (nextUnit === 's' && normalized.length >= 13) {
        const parsed = parseInt(normalized, 10);
        if (!isNaN(parsed)) {
          const s = String(Math.floor(parsed / 1000));
          setTsInput(s);
          setTsResult(null);
          setTsError('');
          convertTimestamp(s);
          return;
        }
      }

      setTsInput(normalized);
      setTsResult(null);
      setTsError('');
      convertTimestamp(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          <button className="tool-btn tool-btn--primary" onClick={() => convertTimestamp()}>Convert</button>
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
