import { useEffect, useRef, useState } from 'react';
import '../tools.css';
import './MetronomeTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const CLICK_FREQ_NORMAL = 880;   // A5 — regular beat
const CLICK_FREQ_ACCENT = 1320;  // E6 — accented beat 1
const LOOKAHEAD_MS = 25;         // Scheduler poll interval
const SCHEDULE_AHEAD_S = 0.1;    // How far ahead to schedule audio

function scheduleClick(
  ctx: AudioContext,
  time: number,
  isAccent: boolean,
  vol: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = isAccent ? CLICK_FREQ_ACCENT : CLICK_FREQ_NORMAL;
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time);
  osc.stop(time + 0.04);
}

export function MetronomeTool() {
  const [bpm, setBpm] = useLocalStorage('metro:bpm', 120);
  const [beatsPerBar, setBeatsPerBar] = useLocalStorage('metro:beats', 4);
  const [accentBeat1, setAccentBeat1] = useLocalStorage('metro:accent', true);
  const [volume, setVolume] = useLocalStorage('metro:volume', 0.8);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  // Audio scheduling refs (avoid stale closure issues)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);

  // Keep mutable "live" refs in sync with state
  const bpmRef = useRef(bpm);
  const volumeRef = useRef(volume);
  const beatsPerBarRef = useRef(beatsPerBar);
  const accentBeat1Ref = useRef(accentBeat1);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { beatsPerBarRef.current = beatsPerBar; }, [beatsPerBar]);
  useEffect(() => { accentBeat1Ref.current = accentBeat1; }, [accentBeat1]);

  function scheduleNote(time: number, beat: number) {
    const ctx = audioCtxRef.current!;
    scheduleClick(ctx, time, accentBeat1Ref.current && beat === 0, volumeRef.current);
    const delay = Math.max(0, (time - ctx.currentTime) * 1000);
    setTimeout(() => setCurrentBeat(beat), delay);
  }

  function runScheduler() {
    const ctx = audioCtxRef.current!;
    const secPerBeat = 60 / bpmRef.current;
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      scheduleNote(nextNoteTimeRef.current, currentBeatRef.current);
      currentBeatRef.current =
        (currentBeatRef.current + 1) % beatsPerBarRef.current;
      nextNoteTimeRef.current += secPerBeat;
    }
    timerIdRef.current = window.setTimeout(runScheduler, LOOKAHEAD_MS);
  }

  function start() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    runScheduler();
    setIsPlaying(true);
  }

  function stop() {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
  }

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timerIdRef.current !== null) clearTimeout(timerIdRef.current);
      audioCtxRef.current?.close();
    },
    [],
  );

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);
  function tapTempo() {
    const now = performance.now();
    const last = tapTimesRef.current[tapTimesRef.current.length - 1];
    if (last !== undefined && now - last > 3000) {
      tapTimesRef.current = [];
    }
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current = tapTimesRef.current.slice(-4);
    }
    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      setBpm(Math.max(30, Math.min(240, Math.round(60000 / avg))));
    }
  }

  return (
    <div className="tool-layout">
      {/* Visual display */}
      <div className="metro-display">
        <div className="metro-bpm-number">{bpm}</div>
        <div className="metro-bpm-label">BPM</div>
        <div className="metro-beat-row">
          {Array.from({ length: beatsPerBar }).map((_, i) => (
            <div
              key={i}
              className={[
                'metro-beat-dot',
                i === 0 && accentBeat1 ? 'metro-beat-dot--accent' : '',
                isPlaying && i === currentBeat ? 'metro-beat-dot--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
      </div>

      {/* BPM slider */}
      <div className="tool-field">
        <label className="tool-label">BPM — {bpm}</label>
        <input
          type="range"
          min={30}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="metro-slider"
        />
      </div>

      {/* Start / Stop + Tap Tempo */}
      <div className="tool-controls">
        <button
          className="tool-btn tool-btn--primary metro-toggle-btn"
          onClick={isPlaying ? stop : start}
        >
          {isPlaying ? '⏹ Stop' : '▶ Start'}
        </button>
        <button className="tool-btn" onClick={tapTempo}>
          Tap Tempo
        </button>
      </div>

      {/* Beats per bar */}
      <div className="tool-field-row">
        <label className="tool-label" style={{ minWidth: 110 }}>
          Beats per bar
        </label>
        <select
          value={beatsPerBar}
          onChange={(e) => setBeatsPerBar(Number(e.target.value))}
          className="tool-select"
        >
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Accent beat 1 */}
      <div className="tool-field-row">
        <label className="metro-checkbox-label">
          <input
            type="checkbox"
            checked={accentBeat1}
            onChange={(e) => setAccentBeat1(e.target.checked)}
            className="metro-checkbox"
          />
          Accent beat 1
        </label>
      </div>

      {/* Volume */}
      <div className="tool-field">
        <label className="tool-label">Volume — {Math.round(volume * 100)}%</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="metro-slider"
        />
      </div>
    </div>
  );
}
