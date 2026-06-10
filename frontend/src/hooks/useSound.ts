/**
 * useSound — Web Audio API sound engine for AlgoRace.
 *
 * Ports the original JavaFX MIDI SoundManager (Vibraphone, program 11) to the
 * browser using OscillatorNodes with sine/triangle waves + exponential decay
 * to produce the same short, resonant, pleasant tones.
 *
 * Gracefully degrades: if AudioContext is unavailable or suspended the app
 * continues silently. All paths are wrapped in try/catch.
 *
 * Throttle timings mirror the Java implementation:
 *   - compare: 95 ms
 *   - swap:    120 ms
 *   - UI:      45 ms
 */

import { useCallback, useEffect, useRef } from 'react';
import type { AudioSettings } from './useAudioSettings';

// MIDI note → frequency (Hz): f = 440 * 2^((n-69)/12)
function midiToHz(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

export type SoundName =
  | 'click'
  | 'compare'
  | 'swap'
  | 'start'
  | 'raceComplete'
  | 'winner'
  | 'searchHit'
  | 'searchMiss'
  | 'pathFound';

interface ChordDef {
  notes: number[];   // MIDI note numbers
  duration: number;  // ms
  type: OscillatorType;
  velocity: number;  // 0–1 gain multiplier (maps Java's 0–127 velocity)
  throttleMs?: number;
}

// Sound catalogue — directly ported from SoundManager.java MIDI calls
const SOUNDS: Record<SoundName, ChordDef | ChordDef[]> = {
  // playChord(100, 60, 64, 67) — C4 E4 G4, vibraphone click
  click: { notes: [60, 64, 67], duration: 100, type: 'sine', velocity: 0.55, throttleMs: 45 },

  // playChord(80, 72, 79) — C5 G5, soft high ping
  compare: { notes: [72, 79], duration: 80, type: 'sine', velocity: 0.35, throttleMs: 95 },

  // playChord(120, 50, 57, 62) — D3 A3 D4, bass thud
  swap: { notes: [50, 57, 62], duration: 120, type: 'triangle', velocity: 0.5, throttleMs: 120 },

  // playSequence([[60,64],[67,72]], 120) — rising two-chord sequence
  start: [
    { notes: [60, 64], duration: 120, type: 'sine', velocity: 0.55 },
    { notes: [67, 72], duration: 120, type: 'sine', velocity: 0.6 },
  ],

  // playSequence([[60,64,67],[67,72,76]], 150) — warm resolution
  raceComplete: [
    { notes: [60, 64, 67], duration: 150, type: 'sine', velocity: 0.5 },
    { notes: [67, 72, 76], duration: 150, type: 'sine', velocity: 0.55 },
  ],

  // playSequence([[60,64],[64,67],[67,72,76,79]], 180) — three-chord fanfare
  winner: [
    { notes: [60, 64], duration: 180, type: 'sine', velocity: 0.55 },
    { notes: [64, 67], duration: 180, type: 'sine', velocity: 0.6 },
    { notes: [67, 72, 76, 79], duration: 280, type: 'sine', velocity: 0.65 },
  ],

  // Search hit: bright ding — C5 E5
  searchHit: { notes: [72, 76], duration: 100, type: 'sine', velocity: 0.5 },

  // Search miss: soft descending — C4 Eb4
  searchMiss: { notes: [60, 63], duration: 80, type: 'triangle', velocity: 0.3 },

  // Path found: gentle resolution — E4 G4 C5 then G4 C5 E5
  pathFound: [
    { notes: [64, 67, 72], duration: 160, type: 'sine', velocity: 0.5 },
    { notes: [67, 72, 76], duration: 200, type: 'sine', velocity: 0.55 },
  ],
};

function playChord(
  ctx: AudioContext,
  masterGain: GainNode,
  chord: ChordDef,
  effectsVolume: number,
  startTime: number
): number {
  const gainNode = ctx.createGain();
  gainNode.connect(masterGain);
  const durationSec = chord.duration / 1000;
  const peakGain = chord.velocity * effectsVolume;
  gainNode.gain.setValueAtTime(peakGain, startTime);
  // Exponential decay to simulate vibraphone resonance
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

  for (const note of chord.notes) {
    const osc = ctx.createOscillator();
    osc.type = chord.type;
    osc.frequency.setValueAtTime(midiToHz(note), startTime);
    // Slight detune per note for vibraphone width
    osc.detune.setValueAtTime((chord.notes.indexOf(note) - 1) * 2, startTime);
    osc.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.05);
  }

  return startTime + durationSec;
}

export function useSound(settings: AudioSettings) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const throttleRef = useRef<Partial<Record<SoundName, number>>>({});

  // Update master gain whenever masterVolume changes
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        settings.masterVolume,
        masterGainRef.current.context.currentTime,
        0.05
      );
    }
  }, [settings.masterVolume]);

  const ensureCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
        const gain = ctxRef.current.createGain();
        gain.gain.setValueAtTime(settings.masterVolume, ctxRef.current.currentTime);
        gain.connect(ctxRef.current.destination);
        masterGainRef.current = gain;
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume().catch(() => {/* graceful */});
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, [settings.masterVolume]);

  const play = useCallback(
    (name: SoundName) => {
      if (!settings.soundEnabled) return;
      try {
        const def = SOUNDS[name];

        // Throttle check for single-chord sounds
        if (!Array.isArray(def) && def.throttleMs) {
          const last = throttleRef.current[name] ?? 0;
          const now = performance.now();
          if (now - last < def.throttleMs) return;
          throttleRef.current[name] = now;
        }

        const ctx = ensureCtx();
        if (!ctx || !masterGainRef.current) return;

        const chords = Array.isArray(def) ? def : [def];
        let t = ctx.currentTime + 0.01; // small scheduling buffer

        for (const chord of chords) {
          t = playChord(ctx, masterGainRef.current, chord, settings.effectsVolume, t);
          t += 0.02; // tiny gap between sequence chords
        }
      } catch {
        // Sound is optional — never crash
      }
    },
    [settings.soundEnabled, settings.effectsVolume, ensureCtx]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        ctxRef.current?.close();
      } catch {/* ignore */}
    };
  }, []);

  return { play };
}
