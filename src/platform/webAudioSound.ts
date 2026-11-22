// Kurze Soundeffekte, direkt mit der Web Audio API erzeugt – keine Audiodateien nötig.

import type { Sfx, SoundPort } from '../app/ports.ts';

let ctx: AudioContext | null = null;
let enabled = true;

function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(a: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number, endFreq?: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(a.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

/** Leises mechanisches Klicken: kurzer gefilterter Rauschimpuls */
function click(a: AudioContext, t: number) {
  const len = Math.floor(a.sampleRate * 0.025);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 1800;
  const g = a.createGain();
  g.gain.value = 0.18;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

function play(s: Sfx) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  switch (s) {
    case 'key':
      click(a, t);
      break;
    case 'error': // sanftes "Glitch", nicht schrill
      tone(a, 220, t, 0.12, 'square', 0.04, 120);
      break;
    case 'segment':
      tone(a, 660, t, 0.08, 'triangle', 0.08, 990);
      break;
    case 'done':
      [523, 659, 784].forEach((f, i) => tone(a, f, t + i * 0.09, 0.18, 'triangle', 0.12));
      break;
    case 'badge':
      [784, 988, 1175, 1568].forEach((f, i) => tone(a, f, t + i * 0.07, 0.25, 'sine', 0.1));
      break;
    case 'message':
      // leises Funk-Pling: zwei kurze Töne aufwärts
      [988, 1319].forEach((f, i) => tone(a, f, t + i * 0.08, 0.12, 'sine', 0.06));
      break;
    case 'fail':
      [392, 330, 262].forEach((f, i) => tone(a, f, t + i * 0.12, 0.2, 'triangle', 0.08));
      break;
  }
}

export const webAudioSound: SoundPort = { play, setEnabled: setSoundEnabled };
