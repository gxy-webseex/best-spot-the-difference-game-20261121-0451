// Mouse and keyboard input. A click on either panel is translated into
// scene coordinates and handed to the state; the arrow keys move a crosshair
// between and across the panels, Enter selects where it sits, H asks for a
// hint, M mutes, R restarts.

import { FOOTER, PANEL, PANEL_LEFT, PANEL_RIGHT } from './config.js';
import {
  SCREEN_GAME_OVER,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PLAY,
  SCREEN_TITLE,
  clickAt,
  nextLevel,
  startGame,
  useHint,
} from './state.js';

const CURSOR_STEP = 24;

// Which panel (if any) a canvas point falls in, and its scene coordinates.
function panelAt(x, y) {
  for (const [panel, origin] of [['left', PANEL_LEFT], ['right', PANEL_RIGHT]]) {
    if (x >= origin.x && x < origin.x + PANEL.width && y >= origin.y && y < origin.y + PANEL.height) {
      return { panel, x: x - origin.x, y: y - origin.y };
    }
  }
  return null;
}

// Is the point on the hint button in the footer?
function hintButtonAt(x, y) {
  const bx = 640 - 90;
  const by = FOOTER.y + 44;
  return x >= bx && x <= bx + 180 && y >= by && y <= by + 44;
}

// Is the point on the title screen's start button, or on an overlay button?
function actionButtonAt(x, y, state) {
  if (state.screen === SCREEN_TITLE) {
    return x >= 640 - 130 && x <= 640 + 130 && y >= 540 && y <= 596;
  }
  if (state.screen === SCREEN_LEVEL_COMPLETE || state.screen === SCREEN_GAME_OVER) {
    const by = (720 - 300) / 2 + 300 - 76;
    return x >= 640 - 130 && x <= 640 + 130 && y >= by && y <= by + 52;
  }
  return false;
}

// Wire the canvas and the keyboard. `onEvent` is called with 'found',
// 'miss', 'hint' or 'click' so the caller can play a sound.
export function attachInput(canvas, state, onEvent) {
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (actionButtonAt(x, y, state)) {
      if (state.screen === SCREEN_TITLE) startGame(state);
      else if (state.screen === SCREEN_LEVEL_COMPLETE) nextLevel(state);
      else if (state.screen === SCREEN_GAME_OVER) startGame(state);
      onEvent('click');
      return;
    }
    if (state.screen === SCREEN_PLAY && hintButtonAt(x, y)) {
      const id = useHint(state);
      if (id !== null) onEvent('hint');
      return;
    }
    const hit = panelAt(x, y);
    if (hit === null) return;
    state.cursor = { x: hit.x, y: hit.y, panel: hit.panel };
    const outcome = clickAt(state, hit.x, hit.y);
    if (outcome !== null) onEvent(outcome.result);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (state.screen === SCREEN_TITLE) {
        startGame(state);
        onEvent('click');
      } else if (state.screen === SCREEN_LEVEL_COMPLETE) {
        nextLevel(state);
        onEvent('click');
      } else if (state.screen === SCREEN_GAME_OVER) {
        startGame(state);
        onEvent('click');
      } else if (state.screen === SCREEN_PLAY) {
        const outcome = clickAt(state, state.cursor.x, state.cursor.y);
        if (outcome !== null) onEvent(outcome.result);
      }
      return;
    }
    if (event.key === 'h' || event.key === 'H') {
      const id = useHint(state);
      if (id !== null) onEvent('hint');
      return;
    }
    if (event.key === 'm' || event.key === 'M') {
      state.muted = !state.muted;
      onEvent('click');
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      startGame(state);
      onEvent('click');
      return;
    }
    if (state.screen !== SCREEN_PLAY) return;
    const cursor = state.cursor;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (cursor.x - CURSOR_STEP < 0 && cursor.panel === 'right') {
        cursor.panel = 'left';
        cursor.x = PANEL.width - CURSOR_STEP;
      } else {
        cursor.x = Math.max(0, cursor.x - CURSOR_STEP);
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (cursor.x + CURSOR_STEP > PANEL.width && cursor.panel === 'left') {
        cursor.panel = 'right';
        cursor.x = CURSOR_STEP;
      } else {
        cursor.x = Math.min(PANEL.width, cursor.x + CURSOR_STEP);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      cursor.y = Math.max(0, cursor.y - CURSOR_STEP);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      cursor.y = Math.min(PANEL.height, cursor.y + CURSOR_STEP);
    }
  });
}
