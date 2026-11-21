// The screenshot scenes behind ?shot=play|start|garden|complete. Each one
// sets the real game state to a fixed, readable frame — the same state a
// player reaches by playing — so the screenshots show the game as it is:
// two panels side by side, rings on the differences already found, several
// still unfound, and the counter of how many remain.

import { LEVELS } from './config.js';
import { SCENES } from './scenes.js';
import { SCREEN_LEVEL_COMPLETE, SCREEN_PLAY, SCREEN_TITLE, createState, startLevel } from './state.js';

// Mark the first `count` differences of the current level as found, and set
// the clock and score to fixed values, so the frame is the same every run.
function stagePlay(state, foundCount, timeLeft, score) {
  const scene = SCENES[LEVELS[state.levelIndex].scene];
  state.found = new Set(scene.differences.slice(0, foundCount).map((d) => d.id));
  state.timeLeft = timeLeft;
  state.score = score;
  state.levelScore = score;
  state.hintsLeft = 2;
  state.screen = SCREEN_PLAY;
  state.message = `${scene.differences.length - foundCount} differences still to find — look closely!`;
  state.messageUntil = state.now + 60;
  state.cursor = { x: 305, y: 260, panel: 'left' };
}

// Set `state` to the named scene and return the screen to draw over it.
export function stageShot(name) {
  const state = createState();
  state.now = 12; // a fixed clock, so the hint pulse and messages are steady
  state.hideCursor = true; // a staged frame is not being played by keyboard
  if (name === 'start') {
    state.screen = SCREEN_TITLE;
    return state;
  }
  if (name === 'garden') {
    startLevel(state, 1);
    stagePlay(state, 2, 121, 200);
    return state;
  }
  if (name === 'complete') {
    startLevel(state, 0);
    const scene = SCENES[0];
    state.found = new Set(scene.differences.map((d) => d.id));
    state.timeLeft = 84;
    state.score = 1068;
    state.levelScore = 1068;
    state.stars = 3;
    state.screen = SCREEN_LEVEL_COMPLETE;
    state.message = 'Morning Market complete!';
    return state;
  }
  // The default shot is the cover: level 1 mid-game, three found, five left.
  startLevel(state, 0);
  stagePlay(state, 3, 96, 300);
  return state;
}
