let ctx: AudioContext | null = null;
let sfxVol = 0.7;

export function setSfxVolume(v: number) { sfxVol = v; }

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(
  freq: number, endFreq: number, dur: number,
  vol: number, type: OscillatorType = "square", delay = 0
) {
  const c = getCtx();
  if (!c || sfxVol === 0) return;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  const t = c.currentTime + delay;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  gain.gain.setValueAtTime(vol * sfxVol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

export function playShoot() {
  tone(900, 200, 0.07, 0.12, "square");
}

export function playShootShotgun() {
  for (let i = 0; i < 3; i++) {
    tone(700 + i * 100, 150 + i * 30, 0.06, 0.08, "square", i * 0.02);
  }
}

export function playShootSniper() {
  tone(1200, 100, 0.15, 0.2, "sawtooth");
}

export function playShootPlasma() {
  tone(400, 800, 0.05, 0.1, "sine");
  tone(300, 600, 0.08, 0.08, "sine", 0.02);
}

export function playEnemyHit() {
  tone(600, 200, 0.05, 0.08, "sawtooth");
}

export function playEnemyDeath(type: string) {
  if (type === "tank") {
    tone(300, 60, 0.25, 0.16, "sawtooth");
    tone(200, 50, 0.2,  0.1,  "square", 0.05);
  } else if (type === "bomber") {
    tone(200, 40, 0.35, 0.2, "sawtooth");
    tone(150, 30, 0.3,  0.14,"square", 0.05);
  } else if (type === "speeder") {
    tone(800, 200, 0.08, 0.1, "square");
  } else {
    tone(500, 100, 0.12, 0.12, "sawtooth");
  }
}

export function playPlayerHit() {
  tone(300, 120, 0.14, 0.18, "sawtooth");
}

export function playPowerUp() {
  tone(440, 880,  0.1, 0.14, "sine");
  tone(660, 1320, 0.1, 0.1,  "sine", 0.1);
}

export function playCoinPickup() {
  tone(880,  1760, 0.06, 0.1, "sine");
  tone(1100, 2200, 0.05, 0.08,"sine", 0.06);
}

export function playGameOver() {
  tone(400, 100, 0.5, 0.18, "sawtooth");
  tone(300, 80,  0.5, 0.14, "sawtooth", 0.1);
}

export function playLevelComplete() {
  tone(440,  880,  0.12, 0.15, "sine");
  tone(550,  1100, 0.12, 0.12, "sine", 0.12);
  tone(660,  1320, 0.12, 0.1,  "sine", 0.24);
  tone(880,  1760, 0.2,  0.15, "sine", 0.36);
}

export function playWaveStart() {
  tone(300, 600, 0.15, 0.13, "sine");
  tone(400, 800, 0.15, 0.1,  "sine", 0.15);
  tone(500, 1000,0.15, 0.09, "sine", 0.3);
}

export function playZoneDamage() {
  tone(200, 150, 0.07, 0.07, "sawtooth");
}

export function playPurchase() {
  tone(660, 880,  0.08, 0.12, "sine");
  tone(880, 1100, 0.08, 0.1,  "sine", 0.08);
}

export function initAudio() {
  getCtx();
}
