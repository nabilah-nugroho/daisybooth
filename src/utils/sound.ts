let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playCountdownBeep(isFinal = false): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isFinal ? 880 : 620, now);

  gain.gain.setValueAtTime(0.065, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}

/**
 * Subtle, tactile two-curtain mechanical camera shutter sound
 * synthesized via filtered noise bursts + soft body thump.
 */
export function playShutterSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Curtain 1: crisp short mechanical click
  const click1 = ctx.createBufferSource();
  click1.buffer = createNoiseBuffer(ctx, 0.028);
  const filter1 = ctx.createBiquadFilter();
  filter1.type = 'bandpass';
  filter1.frequency.setValueAtTime(2200, now);
  filter1.Q.setValueAtTime(1.4, now);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.14, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
  click1.connect(filter1);
  filter1.connect(gain1);
  gain1.connect(ctx.destination);
  click1.start(now);

  // Subtle shutter mirror thump
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = 'triangle';
  thump.frequency.setValueAtTime(190, now);
  thump.frequency.exponentialRampToValueAtTime(68, now + 0.045);
  thumpGain.gain.setValueAtTime(0.09, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  thump.start(now);
  thump.stop(now + 0.055);

  // Curtain 2: softer closing snap 48ms later
  const t2 = now + 0.048;
  const click2 = ctx.createBufferSource();
  click2.buffer = createNoiseBuffer(ctx, 0.026);
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'bandpass';
  filter2.frequency.setValueAtTime(1550, t2);
  filter2.Q.setValueAtTime(1.6, t2);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.1, t2);
  gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.026);
  click2.connect(filter2);
  filter2.connect(gain2);
  gain2.connect(ctx.destination);
  click2.start(t2);
}

/**
 * Soft instant-printer paper glide sound when the finished strip emerges.
 */
export function playPrintSlideSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 1.6;

  // Soft filtered paper friction noise
  const paper = ctx.createBufferSource();
  paper.buffer = createNoiseBuffer(ctx, duration);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(900, now);
  band.frequency.linearRampToValueAtTime(650, now + duration);
  band.Q.setValueAtTime(1.2, now);

  const paperGain = ctx.createGain();
  paperGain.gain.setValueAtTime(0.001, now);
  paperGain.gain.linearRampToValueAtTime(0.038, now + 0.18);
  paperGain.gain.setValueAtTime(0.032, now + duration - 0.35);
  paperGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  paper.connect(band);
  band.connect(paperGain);
  paperGain.connect(ctx.destination);
  paper.start(now);

  // Gentle pastel chime at completion
  const chimeTime = now + duration + 0.15;
  const chime = ctx.createOscillator();
  const chimeGain = ctx.createGain();
  chime.type = 'sine';
  chime.frequency.setValueAtTime(784, chimeTime);
  chime.frequency.setValueAtTime(1046.5, chimeTime + 0.09);
  chimeGain.gain.setValueAtTime(0.045, chimeTime);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.34);
  chime.connect(chimeGain);
  chimeGain.connect(ctx.destination);
  chime.start(chimeTime);
  chime.stop(chimeTime + 0.35);
}
