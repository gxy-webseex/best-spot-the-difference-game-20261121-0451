// The game's state and rules: which screen is showing, what the player has
// found, the clock, the score and the hints. Rendering reads this; input
// writes to it through these functions, never by reaching into fields.

import { SCENES } from './scenes.js';
import {
  HINTS_PER_LEVEL,
  HINT_COOLDOWN_SECONDS,
  HINT_SECONDS,
  LEVELS,
  STREAK_BONUS_EVERY,
  STREAK_BONUS_SCORE,
  WRONG_CLICK_PENALTY_SECONDS,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_COMPLETE = 'level-complete';
export const SCREEN_GAME_OVER = 'game-over';

// A fresh state: the title screen, level 0 not yet started.
export function createState() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    score: 0,
    timeLeft: LEVELS[0].seconds,
    hintsLeft: HINTS_PER_LEVEL,
    hintCooldown: 0,
    hinted: null, // the difference id a hint is showing, or null
    hintUntil: 0,
    streak: 0,
    misses: 0,
    message: '',
    messageUntil: 0,
    cursor: { x: 305, y: 260, panel: 'left' }, // scene coordinates + which panel it sits on
    muted: false,
    hideCursor: false, // staged screenshots hide the keyboard crosshair
    now: 0, // seconds since the game started, advanced by tick()
    levelScore: 0,
    stars: 0,
    totalFound: 0,
  };
}

export function currentLevel(state) {
  return LEVELS[state.levelIndex];
}

export function currentScene(state) {
  return SCENES[currentLevel(state).scene];
}

export function differencesLeft(state) {
  return currentLevel(state).differences - state.found.size;
}

// Begin a new game from the title screen.
export function startGame(state) {
  state.levelIndex = 0;
  state.score = 0;
  state.totalFound = 0;
  startLevel(state, 0);
}

// Begin one level: a fresh found set, a full clock and fresh hints.
export function startLevel(state, levelIndex) {
  state.levelIndex = levelIndex;
  state.found = new Set();
  state.timeLeft = LEVELS[levelIndex].seconds;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintCooldown = 0;
  state.hinted = null;
  state.streak = 0;
  state.levelScore = 0;
  state.screen = SCREEN_PLAY;
  state.message = `${LEVELS[levelIndex].name} — find ${LEVELS[levelIndex].differences} differences!`;
  state.messageUntil = state.now + 3;
}

// Advance the clock and expire transient effects. Returns 'timeout' when the
// clock runs out, else null.
export function tick(state, dt) {
  state.now += dt;
  if (state.screen !== SCREEN_PLAY) return null;
  state.timeLeft -= dt;
  if (state.hintCooldown > 0) state.hintCooldown -= dt;
  if (state.hinted !== null && state.now >= state.hintUntil) state.hinted = null;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_GAME_OVER;
    state.message = 'Time ran out!';
    return 'timeout';
  }
  return null;
}

// The player clicked a spot (scene coordinates, on either panel). Returns
// 'found' with the difference, 'miss' when nothing is there, or null when
// the click cannot count (not playing, or the spot is already found).
export function clickAt(state, x, y) {
  if (state.screen !== SCREEN_PLAY) return null;
  const scene = currentScene(state);
  for (const diff of scene.differences) {
    if (state.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.add(diff.id);
      state.totalFound += 1;
      state.streak += 1;
      let gained = currentLevel(state).findScore;
      if (state.streak % STREAK_BONUS_EVERY === 0) gained += STREAK_BONUS_SCORE;
      state.score += gained;
      state.levelScore += gained;
      state.message = `Found it — ${diff.label}! +${gained}`;
      state.messageUntil = state.now + 2;
      if (state.found.size >= currentLevel(state).differences) {
        finishLevel(state);
      }
      return { result: 'found', diff, gained };
    }
  }
  // Nothing there: a miss costs time and breaks the streak.
  state.streak = 0;
  state.misses += 1;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_PENALTY_SECONDS);
  state.message = `Not there — ${WRONG_CLICK_PENALTY_SECONDS}s off the clock.`;
  state.messageUntil = state.now + 2;
  return { result: 'miss' };
}

// All differences found: stars by the clock left, then the level-complete
// screen (or the game-over screen when it was the last level).
export function finishLevel(state) {
  const share = state.timeLeft / currentLevel(state).seconds;
  state.stars = share >= 0.5 ? 3 : share >= 0.25 ? 2 : 1;
  state.score += Math.round(state.timeLeft) * 2; // time bonus
  state.screen = SCREEN_LEVEL_COMPLETE;
  state.message = state.levelIndex + 1 >= LEVELS.length
    ? 'You found them all — every level complete!'
    : `${currentLevel(state).name} complete!`;
}

// Move to the next level, or back to the title when the game is done.
export function nextLevel(state) {
  if (state.levelIndex + 1 >= LEVELS.length) {
    state.screen = SCREEN_TITLE;
    return;
  }
  startLevel(state, state.levelIndex + 1);
}

// Spend a hint: highlight one unfound difference for a few seconds.
// Returns the difference id, or null when no hint is available.
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return null;
  if (state.hintsLeft <= 0) {
    state.message = 'No hints left in this level.';
    state.messageUntil = state.now + 2;
    return null;
  }
  if (state.hintCooldown > 0) {
    state.message = 'Hint is recharging…';
    state.messageUntil = state.now + 2;
    return null;
  }
  const scene = currentScene(state);
  const remaining = scene.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hintCooldown = HINT_COOLDOWN_SECONDS;
  state.hinted = pick.id;
  state.hintUntil = state.now + HINT_SECONDS;
  state.message = 'Hint: look where the ring pulses.';
  state.messageUntil = state.now + 2;
  return pick.id;
}
