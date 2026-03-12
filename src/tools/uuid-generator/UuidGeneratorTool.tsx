import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../tools.css';
import './UuidGeneratorTool.css';
import { getEnumSearchParam, getShortSearchParam } from '../../lib/urlParams';

type IdType = 'uuid' | 'ulid';
const ID_TYPES: readonly IdType[] = ['uuid', 'ulid'] as const;
const MAX_COUNT = 20;
const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateUuid(): string {
  return crypto.randomUUID();
}

function generateUlid(): string {
  const now = Date.now();
  const parts: string[] = new Array(26);
  // Encode 48-bit timestamp into first 10 base32 chars
  let t = now;
  for (let i = 9; i >= 0; i--) {
    parts[i] = ULID_ENCODING[t & 0x1f];
    t = Math.floor(t / 32);
  }
  // Encode 80 random bits into remaining 16 base32 chars
  const rndBytes = new Uint8Array(10);
  crypto.getRandomValues(rndBytes);
  let bitBuf = 0;
  let bitCount = 0;
  let byteIdx = 0;
  for (let i = 10; i < 26; i++) {
    while (bitCount < 5) {
      bitBuf = (bitBuf << 8) | rndBytes[byteIdx++];
      bitCount += 8;
    }
    parts[i] = ULID_ENCODING[(bitBuf >> (bitCount - 5)) & 0x1f];
    bitCount -= 5;
  }
  return parts.join('');
}

function generateIds(type: IdType, count: number): string[] {
  return Array.from({ length: count }, () =>
    type === 'uuid' ? generateUuid() : generateUlid()
  );
}

export function UuidGeneratorTool() {
  const [searchParams] = useSearchParams();
  const [idType, setIdType] = useState<IdType>('uuid');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    const nextType = getEnumSearchParam(searchParams, 'type', ID_TYPES);
    const nextCountStr = getShortSearchParam(searchParams, 'count');

    let type = idType;
    let cnt = count;

    if (nextType !== null) {
      type = nextType;
      setIdType(nextType);
    }
    if (nextCountStr !== null) {
      const parsed = parseInt(nextCountStr, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        cnt = Math.min(parsed, MAX_COUNT);
        setCount(cnt);
      }
    }

    if (nextType !== null || nextCountStr !== null) {
      setResults(generateIds(type, cnt));
    }
    // Intentionally only reacts to URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleGenerate() {
    setResults(generateIds(idType, count));
  }

  function handleCopy(value: string, idx: number) {
    navigator.clipboard.writeText(value);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }

  function handleCopyAll() {
    navigator.clipboard.writeText(results.join('\n'));
    setCopied(-1);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="tool-layout">
      <div className="tool-controls">
        <div className="uuid-type-toggles">
          {ID_TYPES.map((t) => (
            <button
              key={t}
              className={`uuid-type-btn${idType === t ? ' uuid-type-btn--active' : ''}`}
              onClick={() => setIdType(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <label className="tool-label" style={{ alignSelf: 'center' }}>Count</label>
        <input
          className="tool-input"
          type="number"
          min={1}
          max={MAX_COUNT}
          value={count}
          onChange={(e) => {
            const v = Math.min(MAX_COUNT, Math.max(1, parseInt(e.target.value) || 1));
            setCount(v);
          }}
          style={{ maxWidth: 72 }}
        />
        <button className="tool-btn tool-btn--primary" onClick={handleGenerate}>
          Generate
        </button>
      </div>

      {results.length > 0 && (
        <div className="uuid-results">
          <div className="uuid-results-header">
            <span className="tool-label">{results.length} {idType.toUpperCase()}(s)</span>
            <button className="tool-copy-btn" onClick={handleCopyAll}>
              {copied === -1 ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="uuid-result-item">
              <code className="uuid-result-value">{r}</code>
              <button className="tool-copy-btn" onClick={() => handleCopy(r, i)}>
                {copied === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
