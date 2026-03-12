import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../tools.css';
import './MetronomeTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const CLICK_FREQ_NORMAL = 880;    // A5 — regular beat
const CLICK_FREQ_ACCENT = 1320;   // E6 — accented beat 1
const CLICK_FREQ_COUNTDOWN = 660; // E5 — countdown beep
const LOOKAHEAD_MS = 25;          // Scheduler poll interval
const SCHEDULE_AHEAD_S = 0.1;     // How far ahead to schedule audio

const COUNTDOWN_OPTIONS = [0, 3, 5, 10] as const;
type CountdownOption = (typeof COUNTDOWN_OPTIONS)[number];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function scheduleClick(ctx: AudioContext, time: number, isAccent: boolean, vol: number) {
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

function scheduleCountdownBeep(ctx: AudioContext, time: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = CLICK_FREQ_COUNTDOWN;
  gain.gain.setValueAtTime(vol * 0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  osc.start(time);
  osc.stop(time + 0.06);
}

export function MetronomeTool() {
  const [searchParams] = useSearchParams();

  const [bpm, setBpm] = useLocalStorage('metro:bpm', 120);
  const [beatsPerBar, setBeatsPerBar] = useLocalStorage('metro:beats', 4);
  const [accentBeat1, setAccentBeat1] = useLocalStorage('metro:accent', true);
  const [volume, setVolume] = useLocalStorage('metro:volume', 0.8);
  const [countdown, setCountdown] = useLocalStorage<CountdownOption>('metro:countdown', 0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownDisplay, setCountdownDisplay] = useState(0);
  const [showResumeHint, setShowResumeHint] = useState(false);

  // Audio scheduling refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);

  // State tracking refs (safe to read in lifecycle handlers with empty deps)
  const isActiveRef = useRef(false);   // any activity: countdown or playing
  const isPlayingRef = useRef(false);  // scheduler specifically running
  const pausedByBgRef = useRef(false); // paused because page was hidden

  // Live refs — always current values, safe in audio closures
  const bpmRef = useRef(bpm);
  const volumeRef = useRef(volume);
  const beatsPerBarRef = useRef(beatsPerBar);
  const accentBeat1Ref = useRef(accentBeat1);
  const countdownRef = useRef(countdown);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { beatsPerBarRef.current = beatsPerBar; }, [beatsPerBar]);
  useEffect(() => { accentBeat1Ref.current = accentBeat1; }, [accentBeat1]);
  useEffect(() => { countdownRef.current = countdown; }, [countdown]);

  // Stable ref to startScheduler — updated each render, safe to call from lifecycle handlers
  const startSchedulerRef = useRef<() => void>(() => {});

  // Apply URL params on mount (override localStorage if params present)
  useEffect(() => {
    const bpmStr = searchParams.get('bpm');
    if (bpmStr !== null) {
      const n = Number(bpmStr);
      if (isFinite(n) && n > 0) setBpm(clamp(Math.round(n), 30, 240));
    }
    const beatsStr = searchParams.get('beats');
    if (beatsStr !== null) {
      const n = Number(beatsStr);
      if (isFinite(n) && n > 0) setBeatsPerBar(clamp(Math.round(n), 2, 8));
    }
    const accentStr = searchParams.get('accent');
    if (accentStr === '0') setAccentBeat1(false);
    else if (accentStr === '1') setAccentBeat1(true);

    const volStr = searchParams.get('vol');
    if (volStr !== null) {
      const n = Number(volStr);
      if (isFinite(n)) setVolume(clamp(n, 0, 1));
    }
    const cdStr = searchParams.get('countdown');
    if (cdStr !== null) {
      const n = Number(cdStr);
      if (isFinite(n)) {
        const clamped = clamp(Math.round(n), 0, 10);
        const valid = ([...COUNTDOWN_OPTIONS].reverse().find(o => o <= clamped) ?? 0) as CountdownOption;
        setCountdown(valid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerBarRef.current;
      nextNoteTimeRef.current += secPerBeat;
    }
    timerIdRef.current = window.setTimeout(runScheduler, LOOKAHEAD_MS);
  }

  function startScheduler() {
    const ctx = audioCtxRef.current!;
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    runScheduler();
    setIsPlaying(true);
    isPlayingRef.current = true;
  }

  // Keep ref pointing at latest version (functions use refs so any version works, but keep fresh)
  startSchedulerRef.current = startScheduler;

  function stopScheduler() {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }

  async function ensureAudioCtx(): Promise<AudioContext> {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { /* resume on next user gesture */ }
    }
    return ctx;
  }

  async function start() {
    setShowResumeHint(false);
    isActiveRef.current = true;
    const ctx = await ensureAudioCtx();
    const cdSecs = countdownRef.current;

    if (cdSecs > 0) {
      // Schedule all countdown beeps at once via AudioContext (drift-free)
      const now = ctx.currentTime;
      for (let i = 0; i < cdSecs; i++) {
        scheduleCountdownBeep(ctx, now + i, volumeRef.current);
      }
      // Update visual display each second via setTimeout
      setCountdownActive(true);
      setCountdownDisplay(cdSecs);
      for (let i = 1; i < cdSecs; i++) {
        const remaining = cdSecs - i;
        setTimeout(() => setCountdownDisplay(remaining), i * 1000);
      }
      // Start metronome after countdown (stored in timerIdRef so stopScheduler clears it)
      timerIdRef.current = window.setTimeout(() => {
        timerIdRef.current = null;
        setCountdownActive(false);
        setCountdownDisplay(0);
        startScheduler();
      }, cdSecs * 1000);
    } else {
      startScheduler();
    }
  }

  function stop() {
    stopScheduler();
    setIsPlaying(false);
    isPlayingRef.current = false;
    isActiveRef.current = false;
    setCountdownActive(false);
    setCountdownDisplay(0);
    pausedByBgRef.current = false;
    setCurrentBeat(-1);
    setShowResumeHint(false);
  }

  // iOS/mobile: handle backgrounding and bfcache restoration
  useEffect(() => {
    function tryResume() {
      // Guard: only resume if we actually paused due to background
      if (!pausedByBgRef.current || !isActiveRef.current) return;
      pausedByBgRef.current = false; // clear first to prevent double-resume from pageshow + visibilitychange
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      ctx.resume().then(() => {
        if (isActiveRef.current) startSchedulerRef.current();
      }).catch(() => {
        // AudioContext blocked — show hint; user tap will resume
        setShowResumeHint(true);
      });
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        if (isActiveRef.current) {
          // Stop timers cleanly; keep isActiveRef true so we can resume
          stopScheduler();
          setCountdownActive(false);
          setCountdownDisplay(0);
          pausedByBgRef.current = true;
        }
      } else if (document.visibilityState === 'visible') {
        tryResume();
      }
    }

    function onPageShow(e: PageTransitionEvent) {
      // Handles bfcache restore on iOS Safari (visibilitychange may not fire)
      if (e.persisted) tryResume();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    };
     
  }, []);

  async function resumeAudio() {
    setShowResumeHint(false);
    const ctx = audioCtxRef.current;
    if (ctx) {
      await ctx.resume();
      if (isActiveRef.current) startSchedulerRef.current();
    }
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

  const activeOrCountdown = isPlaying || countdownActive;

  return (
    <div className="tool-layout" onClick={showResumeHint ? resumeAudio : undefined}>
      {showResumeHint && (
        <div className="metro-resume-hint">Tap to resume audio</div>
      )}

      {/* Visual display */}
      <div className="metro-display">
        {countdownActive ? (
          <div className="metro-countdown">{countdownDisplay}</div>
        ) : (
          <>
            <div className="metro-bpm-number">{bpm}</div>
            <div className="metro-bpm-label">BPM</div>
          </>
        )}
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
          onClick={activeOrCountdown ? stop : start}
        >
          {activeOrCountdown ? '⏹ Stop' : '▶ Start'}
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

      {/* Countdown */}
      <div className="tool-field-row">
        <label className="tool-label" style={{ minWidth: 110 }}>
          Countdown
        </label>
        <select
          value={countdown}
          onChange={(e) => setCountdown(Number(e.target.value) as CountdownOption)}
          className="tool-select metro-countdown-select"
        >
          {COUNTDOWN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n === 0 ? 'None' : `${n}s`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
