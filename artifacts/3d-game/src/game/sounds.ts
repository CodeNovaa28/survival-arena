let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  frequency: number,
  endFrequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "square",
  delay = 0
) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  const t = c.currentTime + delay;
  osc.frequency.setValueAtTime(frequency, t);
  osc.frequency.exponentialRampToValueAtTime(endFrequency, t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

export function playShoot() {
  tone(900, 180, 0.08, 0.12, "square");
}

export function playEnemyHit() {
  tone(600, 200, 0.06, 0.1, "sawtooth");
}

export function playEnemyDeath(type: string) {
  if (type === "tank") {
    tone(300, 60, 0.25, 0.18, "sawtooth");
    tone(200, 50, 0.2, 0.1, "square", 0.05);
  } else if (type === "bomber") {
    tone(200, 40, 0.35, 0.22, "sawtooth");
    tone(150, 30, 0.3, 0.15, "square", 0.05);
  } else {
    tone(500, 100, 0.12, 0.13, "sawtooth");
  }
}

export function playPlayerHit() {
  tone(300, 120, 0.15, 0.2, "sawtooth");
}

export function playPowerUp() {
  tone(440, 880, 0.1, 0.15, "sine");
  tone(660, 1320, 0.1, 0.1, "sine", 0.1);
}

export function playGameOver() {
  tone(400, 100, 0.5, 0.2, "sawtooth");
  tone(300, 80, 0.5, 0.15, "sawtooth", 0.1);
}

export function playWaveStart() {
  tone(300, 600, 0.15, 0.15, "sine");
  tone(400, 800, 0.15, 0.12, "sine", 0.15);
  tone(500, 1000, 0.15, 0.1, "sine", 0.3);
}

export function playZoneDamage() {
  tone(200, 150, 0.08, 0.08, "sawtooth");
}

export function initAudio() {
  getCtx();
}
