import { useEffect, useRef, useState } from 'react';
import '../tools.css';
import './TunerTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { detectPitch, createEMASmoother } from '../../lib/pitch';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function frequencyToNote(freq: number, a4: number): { note: string; octave: number; cents: number } {
  const semitones = 12 * Math.log2(freq / a4);
  const rounded = Math.round(semitones);
  const cents = (semitones - rounded) * 100;
  const midi = 69 + rounded;
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { note: NOTE_NAMES[noteIndex], octave, cents };
}

type TunerState = 'idle' | 'listening' | 'error';

export function TunerTool() {
  const [a4, setA4] = useLocalStorage('tuner:a4', 440);
  const a4Ref = useRef(a4);
  useEffect(() => { a4Ref.current = a4; }, [a4]);

  const [tunerState, setTunerState] = useState<TunerState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [note, setNote] = useState('');
  const [octave, setOctave] = useState(4);
  const [frequency, setFrequency] = useState(0);
  const [cents, setCents] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const smootherRef = useRef(createEMASmoother(0.25));

  function stopTuner() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    smootherRef.current = createEMASmoother(0.25);
    setTunerState('idle');
    setNote('');
    setFrequency(0);
    setCents(0);
  }

  async function startTuner() {
    setErrorMsg('');

    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setTunerState('error');
      setErrorMsg('Microphone requires a secure context (HTTPS or localhost).');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setTunerState('error');
      setErrorMsg('Microphone access is not available in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buffer = new Float32Array(analyser.fftSize);
      setTunerState('listening');

      function tick() {
        if (!analyserRef.current || !audioCtxRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);

        const result = detectPitch(buffer, audioCtxRef.current.sampleRate);
        if (result !== null) {
          const smoothed = smootherRef.current(result.frequencyHz);
          const { note: n, octave: o, cents: c } = frequencyToNote(smoothed, a4Ref.current);
          setNote(n);
          setOctave(o);
          setFrequency(smoothed);
          setCents(c);
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      tick();
    } catch (err) {
      stopTuner();
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setTunerState('error');
        setErrorMsg('Microphone permission denied. Allow access and try again.');
      } else {
        setTunerState('error');
        setErrorMsg('Could not open microphone. Check your device settings.');
      }
    }
  }

  useEffect(() => () => stopTuner(), []);

  // Cents clamped to ±50 for display.
  const centsDisplay = Math.max(-50, Math.min(50, cents));
  // Map -50..+50 → 0..100 for needle position (50 = centre).
  const needlePercent = 50 + centsDisplay;

  // Colour: green when within ±5 cents, amber ±5-20, red beyond.
  const needleClass =
    Math.abs(centsDisplay) <= 5
      ? 'tuner-needle--in-tune'
      : Math.abs(centsDisplay) <= 20
        ? 'tuner-needle--close'
        : 'tuner-needle--out-of-tune';

  return (
    <div className="tool-layout tuner-layout">
      {/* Note display */}
      <div className="tuner-note-display">
        {note ? (
          <>
            <span className="tuner-note-name">{note}</span>
            <span className="tuner-note-octave">{octave}</span>
          </>
        ) : (
          <span className="tuner-note-placeholder">—</span>
        )}
      </div>

      {/* Hz readout */}
      <div className="tuner-hz">
        {frequency > 0 ? `${frequency.toFixed(1)} Hz` : '\u00a0'}
      </div>

      {/* Cents meter */}
      <div className="tuner-meter" aria-label={note ? `${Math.round(cents)} cents` : 'No pitch detected'}>
        <div className="tuner-meter__labels tuner-meter__labels--top">
          <span>&#9837;</span>
          <span>&#9837;</span>
          <span className="tuner-meter__center-label">&#9837;/&#9839;</span>
          <span>&#9839;</span>
          <span>&#9839;</span>
        </div>
        <div className="tuner-meter__track">
          {/* Centre line */}
          <div className="tuner-meter__centerline" />
          {/* Needle */}
          <div
            className={`tuner-meter__needle ${needleClass}`}
            style={{ left: `${needlePercent}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="tuner-meter__scale">
          <span>−50</span>
          <span>−25</span>
          <span>0</span>
          <span>+25</span>
          <span>+50</span>
        </div>
        <div className="tuner-cents-value">
          {note ? `${cents >= 0 ? '+' : ''}${Math.round(cents)} ¢` : '\u00a0'}
        </div>
      </div>

      {/* Start / Stop */}
      <div className="tuner-controls">
        {tunerState !== 'listening' ? (
          <button className="tool-btn tool-btn--primary tuner-btn" onClick={startTuner}>
            Start Tuner
          </button>
        ) : (
          <button className="tool-btn tuner-btn" onClick={stopTuner}>
            Stop
          </button>
        )}
      </div>

      {/* Error message */}
      {tunerState === 'error' && (
        <p className="tool-message tool-message--error tuner-error">{errorMsg}</p>
      )}

      {/* A4 calibration */}
      <div className="tuner-calibration">
        <label className="tool-label" htmlFor="tuner-a4">
          A4 reference: <strong>{a4} Hz</strong>
        </label>
        <input
          id="tuner-a4"
          type="range"
          min={430}
          max={450}
          step={1}
          value={a4}
          onChange={(e) => setA4(Number(e.target.value))}
          className="tuner-a4-slider"
          aria-label={`A4 reference pitch: ${a4} Hz`}
        />
        <div className="tuner-a4-range">
          <span>430</span>
          <span>440</span>
          <span>450</span>
        </div>
      </div>
    </div>
  );
}
