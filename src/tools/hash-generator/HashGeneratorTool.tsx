import { useState } from 'react';
import '../tools.css';
import './HashGeneratorTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
const ALGORITHMS: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function computeHash(text: string, algo: Algorithm): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface HashResult {
  algo: Algorithm;
  hex: string;
}

export function HashGeneratorTool() {
  const [input, setInput] = useLocalStorage('hash:input', '');
  const [selectedArr, setSelectedArr] = useLocalStorage<Algorithm[]>('hash:selected', ALGORITHMS);
  const selected = new Set(selectedArr);
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    if (!input) return;
    setLoading(true);
    const algos = ALGORITHMS.filter((a) => selected.has(a));
    const hashes = await Promise.all(algos.map(async (a) => ({ algo: a, hex: await computeHash(input, a) })));
    setResults(hashes);
    setLoading(false);
  }

  function toggleAlgo(algo: Algorithm) {
    setSelectedArr((prev) => {
      const set = new Set(prev);
      if (set.has(algo)) { if (set.size > 1) set.delete(algo); }
      else set.add(algo);
      return ALGORITHMS.filter((a) => set.has(a));
    });
  }

  function handleCopy(hex: string, algo: string) {
    navigator.clipboard.writeText(hex);
    setCopied(algo);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="tool-layout">
      <div className="tool-panel">
        <label className="tool-label">Input Text</label>
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash…"
          spellCheck={false}
          rows={4}
        />
      </div>

      <div className="tool-controls">
        <div className="hash-algo-toggles">
          {ALGORITHMS.map((a) => (
            <button
              key={a}
              className={`hash-algo-btn${selected.has(a) ? ' hash-algo-btn--active' : ''}`}
              onClick={() => toggleAlgo(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <button
          className="tool-btn tool-btn--primary"
          onClick={generate}
          disabled={!input || loading}
        >
          {loading ? 'Computing…' : 'Generate Hashes'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="hash-results">
          {results.map((r) => (
            <div key={r.algo} className="hash-result-item">
              <div className="hash-result-header">
                <span className="hash-result-algo">{r.algo}</span>
                <button className="tool-copy-btn" onClick={() => handleCopy(r.hex, r.algo)}>
                  {copied === r.algo ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <code className="hash-result-value">{r.hex}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
