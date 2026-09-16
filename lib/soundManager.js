// lib/soundManager.js
// Procedural audio system using Web Audio API — no audio files needed.

let audioCtx = null;
let ambientGain = null;
let ambientSource = null;
let ambientOscillators = [];
let lastTypingTime = 0;

function getCtx() {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/** Pink noise buffer for atmospheric sound (sounds more natural than white noise) */
function makePinkNoiseBuffer(ctx, seconds = 3) {
  const n = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
  }
  return buf;
}

/** Short noise burst for typing SFX — quill-on-parchment feel */
export function playTypingSound() {
  const now = Date.now();
  if (now - lastTypingTime < 90) return; // throttle to max ~11/sec
  lastTypingTime = now;

  const ctx = getCtx();
  if (!ctx) return;

  try {
    const n = Math.floor(ctx.sampleRate * 0.035);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2800 + Math.random() * 1200;
    filter.Q.value = 4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime);
  } catch (e) {}
}

/** Mystical arpeggio when AI finishes responding — each persona has its own chord */
const PERSONA_NOTES = {
  ember_keeper:    [293.66, 349.23, 440.00], // D minor (warm, mournful)
  oathbound_knight:[261.63, 392.00, 523.25], // C power chord (noble, strong)
  hollow_scholar:  [277.18, 329.63, 415.30], // C#dim (mysterious, unsettling)
  grave_prophet:   [233.08, 311.13, 466.16], // Bb minor (ominous, prophetic)
  old_smith:       [261.63, 329.63, 392.00], // C major (solid, dependable)
  moonlit_duelist: [293.66, 369.99, 493.88], // Dmaj7 (bittersweet, elegant)
};

export function playResponseSound(personaId) {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = PERSONA_NOTES[personaId] || PERSONA_NOTES.ember_keeper;

  notes.forEach((freq, i) => {
    try {
      const delay = i * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const reverb = ctx.createConvolver();

      // Simple reverb impulse
      const rn = Math.floor(ctx.sampleRate * 1.5);
      const rb = ctx.createBuffer(2, rn, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const rd = rb.getChannelData(c);
        for (let j = 0; j < rn; j++) rd[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / rn, 2);
      }
      reverb.buffer = rb;

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + delay + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.7);

      osc.connect(gain);
      gain.connect(reverb);
      reverb.connect(ctx.destination);
      gain.connect(ctx.destination); // dry signal

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.7);
    } catch (e) {}
  });
}

/** Ambient configs per scene type */
const AMBIENT_CONFIGS = {
  fire:   { filterType: 'lowpass',  freq: 700,  Q: 0.8, lfoFreq: 7,   lfoAmt: 0.4, vol: 0.13, lfoTarget: 'gain' },
  wind:   { filterType: 'bandpass', freq: 600,  Q: 1.5, lfoFreq: 0.25,lfoAmt: 400, vol: 0.10, lfoTarget: 'freq' },
  cave:   { filterType: 'lowpass',  freq: 300,  Q: 1.0, lfoFreq: 0.1, lfoAmt: 0.3, vol: 0.07, lfoTarget: 'gain' },
  tomb:   { filterType: 'lowpass',  freq: 120,  Q: 2.0, lfoFreq: 0.05,lfoAmt: 0.2, vol: 0.07, lfoTarget: 'gain' },
  forge:  { filterType: 'bandpass', freq: 900,  Q: 0.5, lfoFreq: 4.5, lfoAmt: 0.5, vol: 0.11, lfoTarget: 'gain' },
  forest: { filterType: 'highpass', freq: 2500, Q: 1.0, lfoFreq: 0.4, lfoAmt: 600, vol: 0.08, lfoTarget: 'freq' },
};

export function startAmbient(ambientType) {
  stopAmbient();

  const ctx = getCtx();
  if (!ctx) return;

  const cfg = AMBIENT_CONFIGS[ambientType];
  if (!cfg) return;

  try {
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(ctx.destination);

    // Noise source
    const src = ctx.createBufferSource();
    src.buffer = makePinkNoiseBuffer(ctx, 4);
    src.loop = true;
    ambientSource = src;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = cfg.filterType;
    filter.frequency.value = cfg.freq;
    filter.Q.value = cfg.Q;

    // LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = cfg.lfoFreq;
    lfoGain.gain.value = cfg.lfoAmt;
    lfo.connect(lfoGain);

    if (cfg.lfoTarget === 'freq') {
      lfoGain.connect(filter.frequency);
    } else {
      lfoGain.connect(ambientGain.gain);
    }

    src.connect(filter);
    filter.connect(ambientGain);
    src.start();
    lfo.start();
    ambientOscillators.push(lfo);

    // For tomb/cave: add a low drone
    if (ambientType === 'tomb' || ambientType === 'cave') {
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.frequency.value = ambientType === 'tomb' ? 42 : 68;
      drone.type = 'sine';
      droneGain.gain.value = 0.04;
      drone.connect(droneGain);
      droneGain.connect(ctx.destination);
      drone.start();
      ambientOscillators.push(drone);
    }

    // Fade in
    ambientGain.gain.linearRampToValueAtTime(cfg.vol, ctx.currentTime + 2.0);
  } catch (e) {
    console.warn('[SoundManager] Ambient audio error:', e);
  }
}

export function stopAmbient() {
  try {
    if (ambientSource) {
      try { ambientSource.stop(); } catch (e) {}
      ambientSource = null;
    }
    ambientOscillators.forEach(o => { try { o.stop(); } catch (e) {} });
    ambientOscillators = [];

    if (ambientGain) {
      const ctx = getCtx();
      if (ctx) {
        ambientGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      }
      ambientGain = null;
    }
  } catch (e) {}
}

export function setAmbientEnabled(enabled, ambientType) {
  if (enabled) startAmbient(ambientType);
  else stopAmbient();
}
