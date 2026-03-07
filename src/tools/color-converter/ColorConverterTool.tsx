import { useState } from 'react';
import '../tools.css';
import './ColorConverterTool.css';

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  function hue(t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  return [Math.round(hue(hn + 1 / 3) * 255), Math.round(hue(hn) * 255), Math.round(hue(hn - 1 / 3) * 255)];
}

interface ColorState {
  hex: string;
  r: number; g: number; b: number;
  h: number; s: number; l: number;
}

function fromHex(hex: string): ColorState | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);
  return { hex: hex.toLowerCase(), r, g, b, h, s, l };
}

export function ColorConverterTool() {
  const [color, setColor] = useState<ColorState>(fromHex('#7c6af7')!);
  const [hexInput, setHexInput] = useState('#7c6af7');
  const [rgbInput, setRgbInput] = useState({ r: '124', g: '106', b: '247' });
  const [hslInput, setHslInput] = useState({ h: '248', s: '89', l: '69' });
  const [error, setError] = useState('');

  function applyHex(raw: string) {
    setError('');
    const val = raw.startsWith('#') ? raw : '#' + raw;
    const c = fromHex(val);
    if (!c) { setError('Invalid HEX color'); return; }
    setColor(c);
    setRgbInput({ r: String(c.r), g: String(c.g), b: String(c.b) });
    setHslInput({ h: String(c.h), s: String(c.s), l: String(c.l) });
  }

  function applyRgb() {
    setError('');
    const r = parseInt(rgbInput.r), g = parseInt(rgbInput.g), b = parseInt(rgbInput.b);
    if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) { setError('RGB values must be 0–255'); return; }
    const hex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);
    setColor({ hex, r, g, b, h, s, l });
    setHexInput(hex);
    setHslInput({ h: String(h), s: String(s), l: String(l) });
  }

  function applyHsl() {
    setError('');
    const h = parseInt(hslInput.h), s = parseInt(hslInput.s), l = parseInt(hslInput.l);
    if (isNaN(h) || h < 0 || h > 360) { setError('H must be 0–360'); return; }
    if ([s, l].some((v) => isNaN(v) || v < 0 || v > 100)) { setError('S and L must be 0–100'); return; }
    const [r, g, b] = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);
    setColor({ hex, r, g, b, h, s, l });
    setHexInput(hex);
    setRgbInput({ r: String(r), g: String(g), b: String(b) });
  }

  return (
    <div className="tool-layout">
      <div className="color-preview-row">
        <div className="color-swatch" style={{ background: color.hex }} />
        <div className="color-info">
          <span className="color-hex-display">{color.hex.toUpperCase()}</span>
          <span className="color-sub">rgb({color.r}, {color.g}, {color.b})</span>
          <span className="color-sub">hsl({color.h}°, {color.s}%, {color.l}%)</span>
        </div>
        <input
          type="color"
          className="color-native-picker"
          value={color.hex}
          onChange={(e) => {
            setHexInput(e.target.value);
            applyHex(e.target.value);
          }}
          title="Pick a color"
        />
      </div>

      {error && <div className="tool-message tool-message--error">{error}</div>}

      <div className="color-fields">
        <div className="tool-field">
          <label className="tool-label">HEX</label>
          <div className="tool-field-row">
            <input
              className="tool-input"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => applyHex(hexInput)}
              onKeyDown={(e) => e.key === 'Enter' && applyHex(hexInput)}
              placeholder="#rrggbb"
              spellCheck={false}
            />
            <button className="tool-btn" onClick={() => applyHex(hexInput)}>Apply</button>
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">RGB</label>
          <div className="tool-field-row">
            {(['r', 'g', 'b'] as const).map((ch) => (
              <input
                key={ch}
                className="tool-input"
                style={{ maxWidth: 72 }}
                value={rgbInput[ch]}
                onChange={(e) => setRgbInput((prev) => ({ ...prev, [ch]: e.target.value }))}
                onBlur={applyRgb}
                onKeyDown={(e) => e.key === 'Enter' && applyRgb()}
                placeholder={ch.toUpperCase()}
              />
            ))}
            <button className="tool-btn" onClick={applyRgb}>Apply</button>
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">HSL</label>
          <div className="tool-field-row">
            {[
              { key: 'h', placeholder: 'H (0–360)' },
              { key: 's', placeholder: 'S (0–100)' },
              { key: 'l', placeholder: 'L (0–100)' },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                className="tool-input"
                style={{ maxWidth: 96 }}
                value={hslInput[key as 'h' | 's' | 'l']}
                onChange={(e) => setHslInput((prev) => ({ ...prev, [key]: e.target.value }))}
                onBlur={applyHsl}
                onKeyDown={(e) => e.key === 'Enter' && applyHsl()}
                placeholder={placeholder}
              />
            ))}
            <button className="tool-btn" onClick={applyHsl}>Apply</button>
          </div>
        </div>

        <div className="tool-field">
          <label className="tool-label">CSS Values (click to copy)</label>
          <div className="color-copy-list">
            {[
              { label: 'HEX', value: color.hex.toUpperCase() },
              { label: 'RGB', value: `rgb(${color.r}, ${color.g}, ${color.b})` },
              { label: 'HSL', value: `hsl(${color.h}, ${color.s}%, ${color.l}%)` },
            ].map(({ label, value }) => (
              <button key={label} className="color-copy-item" onClick={() => navigator.clipboard.writeText(value)}>
                <span className="color-copy-label">{label}</span>
                <code className="color-copy-value">{value}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
