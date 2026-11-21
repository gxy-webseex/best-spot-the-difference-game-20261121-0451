// Lantern Lane — a spot-the-difference game. The entry point: it sizes the
// canvas, wires input and sound, runs the game loop, and honours ?shot= so
// the screenshots show fixed, real frames of the game.

import { CANVAS } from './config.js';
import { attachInput } from './input.js';
import { draw } from './render.js';
import { stageShot } from './shots.js';
import { SCREEN_LEVEL_COMPLETE, SCREEN_PLAY, createState, tick } from './state.js';
import { playSound } from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const state = shot !== null ? stageShot(shot) : createState();

// The canvas is fixed at the game's resolution; CSS scales it to the window.
function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CANVAS.width * dpr;
  canvas.height = CANVAS.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

let lastScreen = state.screen;

attachInput(canvas, state, (event) => {
  if (event === 'found') playSound('found', state.muted);
  else if (event === 'miss') playSound('miss', state.muted);
  else if (event === 'hint') playSound('hint', state.muted);
  else playSound('click', state.muted);
  if (state.screen === SCREEN_LEVEL_COMPLETE && lastScreen !== SCREEN_LEVEL_COMPLETE) {
    playSound('win', state.muted);
  }
  lastScreen = state.screen;
});

// Announce the counter for screen readers, throttled to once a second.
let lastAnnounced = -1;
function announce() {
  if (state.screen !== SCREEN_PLAY) return;
  const left = state.found.size;
  if (left === lastAnnounced) return;
  lastAnnounced = left;
  status.textContent = `Found ${left} differences. ${state.timeLeft | 0} seconds left.`;
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  // A staged screenshot never advances its clock: the frame stays fixed.
  if (shot === null) tick(state, dt);
  draw(ctx, state);
  announce();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
