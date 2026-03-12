import { Fragment, useEffect, useRef, useState } from 'react';
import '../tools.css';
import './MusicBoxDesignerTool.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  createEmptyPattern,
  deserializePattern,
  serializePattern,
  toggleNote,
  DEFAULT_PITCHES,
  DEFAULT_STEPS,
  type MusicBoxPattern,
} from '../../lib/musicBox';

// Note frequencies (Hz) for Web Audio playback
const NOTE_FREQ: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.0,  A4: 440.0,  B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 783.99, A5: 880.0,  B5: 987.77, C6: 1046.5,
};

function playNote(ctx: AudioContext, freq: number, time: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
  osc.start(time);
  osc.stop(time + 0.8);
}

const EMPTY_GRID = createEmptyPattern().grid;

export function MusicBoxDesignerTool() {
  const [bpm, setBpm] = useLocalStorage('mbox:bpm', 120);
  const [volume, setVolume] = useLocalStorage('mbox:volume', 0.7);
  const [grid, setGrid] = useLocalStorage<boolean[][]>('mbox:grid', EMPTY_GRID);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [importError, setImportError] = useState('');
  const [exportText, setExportText] = useState('');
  const [showPanel, setShowPanel] = useState(false);

  // Audio scheduling refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);

  // Live refs that the scheduler reads
  const bpmRef = useRef(bpm);
  const volumeRef = useRef(volume);
  const gridRef = useRef(grid);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  function scheduleStep(ctx: AudioContext, stepIdx: number, time: number) {
    gridRef.current.forEach((row, pitchIdx) => {
      if (row[stepIdx]) {
        const freq = NOTE_FREQ[DEFAULT_PITCHES[pitchIdx]];
        if (freq) playNote(ctx, freq, time, volumeRef.current);
      }
    });
    const delay = Math.max(0, (time - ctx.currentTime) * 1000);
    setTimeout(() => setCurrentStep(stepIdx), delay);
  }

  function runScheduler() {
    const ctx = audioCtxRef.current!;
    // Each step is a 16th note = quarter-note duration / 4
    const secPerStep = 60 / bpmRef.current / 4;
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      scheduleStep(ctx, currentStepRef.current, nextNoteTimeRef.current);
      currentStepRef.current = (currentStepRef.current + 1) % DEFAULT_STEPS;
      nextNoteTimeRef.current += secPerStep;
    }
    timerIdRef.current = window.setTimeout(runScheduler, 25);
  }

  function startPlayback() {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    currentStepRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    runScheduler();
    setIsPlaying(true);
  }

  function stopPlayback() {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  }

  useEffect(
    () => () => {
      if (timerIdRef.current !== null) clearTimeout(timerIdRef.current);
      audioCtxRef.current?.close();
    },
    [],
  );

  function handleToggle(pitchIdx: number, stepIdx: number) {
    setGrid((prev) => toggleNote(prev, pitchIdx, stepIdx));
  }

  function handleClear() {
    setGrid(createEmptyPattern().grid);
  }

  function handleExport() {
    const pattern: MusicBoxPattern = {
      version: 1,
      bpm,
      steps: DEFAULT_STEPS,
      pitches: DEFAULT_PITCHES,
      grid,
    };
    setExportText(serializePattern(pattern));
    setImportError('');
    setShowPanel(true);
  }

  function handleImportChange(json: string) {
    setExportText(json);
    setImportError('');
    try {
      const p = deserializePattern(json);
      setGrid(p.grid);
      setBpm(p.bpm);
    } catch {
      setImportError('Invalid pattern JSON — paste a valid exported pattern.');
    }
  }

  // Display pitches from high → low (top of grid = highest pitch)
  const pitchesTopDown = [...DEFAULT_PITCHES].reverse();

  return (
    <div className="tool-layout">
      {/* Transport controls */}
      <div className="tool-controls">
        <button
          className="tool-btn tool-btn--primary"
          style={{ minWidth: 90 }}
          onClick={isPlaying ? stopPlayback : startPlayback}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>
        <button className="tool-btn" onClick={handleClear}>
          Clear
        </button>
        <div className="mbox-bpm-group">
          <label className="tool-label">BPM</label>
          <input
            type="number"
            min={30}
            max={240}
            value={bpm}
            onChange={(e) =>
              setBpm(Math.max(30, Math.min(240, Number(e.target.value))))
            }
            className="tool-input mbox-bpm-input"
          />
        </div>
      </div>

      {/* Step grid */}
      <div className="mbox-grid-wrapper">
        <div
          className="mbox-grid"
          style={{
            gridTemplateColumns: `52px repeat(${DEFAULT_STEPS}, 1fr)`,
          }}
        >
          {/* Header: step numbers */}
          <div className="mbox-cell mbox-cell--header" />
          {Array.from({ length: DEFAULT_STEPS }).map((_, si) => (
            <div
              key={si}
              className={[
                'mbox-cell mbox-cell--header',
                isPlaying && si === currentStep ? 'mbox-cell--playing' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {si + 1}
            </div>
          ))}

          {/* One row per pitch */}
          {pitchesTopDown.map((pitch) => {
            const pitchIdx = DEFAULT_PITCHES.indexOf(pitch);
            return (
              <Fragment key={pitch}>
                <div className="mbox-cell mbox-cell--label">{pitch}</div>
                {Array.from({ length: DEFAULT_STEPS }).map((_, si) => (
                  <button
                    key={si}
                    className={[
                      'mbox-cell mbox-cell--note',
                      grid[pitchIdx]?.[si] ? 'mbox-cell--on' : '',
                      isPlaying && si === currentStep
                        ? 'mbox-cell--step-active'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleToggle(pitchIdx, si)}
                    aria-label={`${pitch} step ${si + 1} ${grid[pitchIdx]?.[si] ? 'on' : 'off'}`}
                    aria-pressed={grid[pitchIdx]?.[si] ?? false}
                  />
                ))}
              </Fragment>
            );
          })}
        </div>
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
          className="mbox-slider"
        />
      </div>

      {/* Export / Import */}
      <div className="tool-controls">
        <button className="tool-btn" onClick={handleExport}>
          Export JSON
        </button>
        {showPanel && (
          <button className="tool-btn" onClick={() => setShowPanel(false)}>
            Hide
          </button>
        )}
      </div>

      {showPanel && (
        <div className="tool-field">
          <label className="tool-label">
            Pattern JSON — copy to save; paste to import
          </label>
          <textarea
            className="tool-textarea"
            value={exportText}
            onChange={(e) => handleImportChange(e.target.value)}
            rows={8}
            spellCheck={false}
          />
          {importError && (
            <div className="tool-message tool-message--error">{importError}</div>
          )}
        </div>
      )}
    </div>
  );
}
