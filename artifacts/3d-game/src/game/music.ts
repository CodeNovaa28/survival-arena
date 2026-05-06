// Generative ambient music via Web Audio API
// A-minor pentatonic, ~85 BPM, dark electronic vibe

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let running = false;
let scheduleTimer: ReturnType<typeof setTimeout> | null = null;

// Pentatonic notes in Hz (A minor: A C D E G)
const BASS_NOTES = [55, 65.41, 73.42, 82.41, 110];   // A1–A2
const PAD_NOTES  = [110, 130.81, 164.81, 220, 261.63]; // A2–C4

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return ctx;
}

function buildMaster(volume: number) {
  const c = getCtx();
  if (masterGain) { masterGain.disconnect(); }
  masterGain = c.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(c.destination);
  return masterGain;
}

function playBassNote(freq: number, startTime: number, dur: number, vol = 0.25) {
  const c = getCtx();
  if (!masterGain) return;

  const osc  = c.createOscillator();
  const gain = c.createGain();
  const filt = c.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, startTime);
  filt.type = "lowpass";
  filt.frequency.setValueAtTime(400, startTime);
  filt.Q.value = 2;

  osc.connect(filt);
  filt.connect(gain);
  gain.connect(masterGain);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.06);
  gain.gain.setValueAtTime(vol, startTime + dur - 0.1);
  gain.gain.linearRampToValueAtTime(0, startTime + dur);

  osc.start(startTime);
  osc.stop(startTime + dur + 0.05);
}

function playPadChord(notes: number[], startTime: number, dur: number, vol = 0.08) {
  const c = getCtx();
  if (!masterGain) return;
  notes.forEach((freq, i) => {
    const osc  = c.createOscillator();
    const gain = c.createGain();
    const filt = c.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = (i % 2 === 0 ? 5 : -5); // slight chorus
    filt.type = "lowpass";
    filt.frequency.value = 1200;

    osc.connect(filt);
    filt.connect(gain);
    gain.connect(masterGain!);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.8);
    gain.gain.setValueAtTime(vol, startTime + dur - 1.0);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);

    osc.start(startTime);
    osc.stop(startTime + dur + 0.1);
  });
}

function playKick(startTime: number, vol = 0.18) {
  const c = getCtx();
  if (!masterGain) return;
  const osc  = c.createOscillator();
  const gain = c.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(180, startTime);
  osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.15);

  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

  osc.connect(gain);
  gain.connect(masterGain!);
  osc.start(startTime);
  osc.stop(startTime + 0.2);
}

function playHihat(startTime: number, vol = 0.04) {
  const c = getCtx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src  = c.createBufferSource();
  const filt = c.createBiquadFilter();
  const gain = c.createGain();

  src.buffer = buf;
  filt.type = "highpass";
  filt.frequency.value = 8000;

  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

  src.connect(filt);
  filt.connect(gain);
  gain.connect(masterGain!);
  src.start(startTime);
}

// Chord progressions (indices into PAD_NOTES)
const CHORD_PROGRESSIONS = [
  [0, 2, 4],
  [0, 1, 3],
  [1, 3, 4],
  [0, 2, 3],
];

const BASS_SEQUENCE = [0, 0, 1, 0, 2, 1, 0, 3];

let beatCount = 0;
let barCount  = 0;
const BEAT_DUR = 60 / 85; // ~0.706 seconds per beat at 85 BPM
const BAR_BEATS = 4;

function scheduleBeat() {
  if (!running || !ctx) return;
  const c = ctx;
  const t = c.currentTime;

  // Kick on beats 1 and 3
  if (beatCount % BAR_BEATS === 0 || beatCount % BAR_BEATS === 2) {
    playKick(t);
  }
  // Hi-hat on every beat
  playHihat(t);

  // Bass note on beat 1 of bar
  if (beatCount % BAR_BEATS === 0) {
    const bassNote = BASS_NOTES[BASS_SEQUENCE[barCount % BASS_SEQUENCE.length]];
    playBassNote(bassNote, t, BEAT_DUR * BAR_BEATS * 0.95);

    // Pad chord on every 2 bars
    if (barCount % 2 === 0) {
      const chord = CHORD_PROGRESSIONS[barCount % CHORD_PROGRESSIONS.length];
      playPadChord(chord.map((i) => PAD_NOTES[i]), t, BEAT_DUR * BAR_BEATS * 2 * 0.9);
    }
    barCount++;
  }

  beatCount++;
  scheduleTimer = setTimeout(scheduleBeat, BEAT_DUR * 1000);
}

export function startMusic(volume: number) {
  if (running) return;
  running = true;
  const c = getCtx();
  if (c.state === "suspended") c.resume();
  buildMaster(volume * 0.6);
  beatCount = 0;
  barCount  = 0;
  scheduleBeat();
}

export function stopMusic() {
  running = false;
  if (scheduleTimer) { clearTimeout(scheduleTimer); scheduleTimer = null; }
}

export function setMusicVolume(volume: number) {
  if (masterGain) masterGain.gain.value = volume * 0.6;
  if (volume > 0 && !running) startMusic(volume);
  if (volume === 0) stopMusic();
}

export function initMusic(volume: number) {
  if (volume > 0) startMusic(volume);
}
