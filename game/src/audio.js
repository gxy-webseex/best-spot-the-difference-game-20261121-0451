// Sound effects, synthesized with WebAudio — no audio files to ship.
// Every sound is a few short notes on a sine or triangle wave, so the game
// stays silent until the player first interacts (the browser's rule).

let context = null;

function ensureContext() {
  if (context === null) {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function note(ctx, frequency, start, duration, type, volume) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// Play a short sequence of notes. `muted` silences everything.
export function playSound(kind, muted) {
  if (muted) return;
  const ctx = ensureContext();
  if (ctx === null) return;
  const now = ctx.currentTime;
  if (kind === 'found') {
    // A bright two-note chime, rising.
    note(ctx, 660, now, 0.12, 'sine', 0.25);
    note(ctx, 990, now + 0.09, 0.18, 'sine', 0.25);
  } else if (kind === 'miss') {
    // A low, short buzz.
    note(ctx, 160, now, 0.15, 'triangle', 0.18);
  } else if (kind === 'hint') {
    // A sparkle: three quick high notes.
    note(ctx, 880, now, 0.08, 'sine', 0.18);
    note(ctx, 1174, now + 0.07, 0.08, 'sine', 0.18);
    note(ctx, 1568, now + 0.14, 0.12, 'sine', 0.18);
  } else if (kind === 'click') {
    note(ctx, 520, now, 0.06, 'sine', 0.15);
  } else if (kind === 'win') {
    // A little fanfare: four notes up the scale.
    const scale = [523, 659, 784, 1046];
    scale.forEach((freq, i) => note(ctx, freq, now + i * 0.11, 0.22, 'triangle', 0.22));
  }
}
