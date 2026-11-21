// Shared constants for Lantern Lane, a spot-the-difference game.
// One canvas, two panels side by side: the left shows the scene as it is,
// the right shows the same scene with every difference applied. The player
// clicks a difference on either panel to mark it found.

export const CANVAS = { width: 1280, height: 720 };

// One scene panel: its size in scene coordinates and where it sits on the
// canvas. The two panels are the same size, 20 px apart.
export const PANEL = { width: 610, height: 520 };
export const PANEL_LEFT = { x: 20, y: 64 };
export const PANEL_RIGHT = { x: 650, y: 64 };
export const PANEL_GAP = 20;

// The heads-up bar at the top and the footer strip at the bottom.
export const HUD = { height: 56 };
export const FOOTER = { y: 584, height: 136 };

// How close a click must land to a difference's centre to count (scene px).
export const HIT_RADIUS = 24;

// A level: how many differences its scene hides, how long the player gets,
// and the score for each find.
export const LEVELS = [
  { scene: 0, name: 'Morning Market', differences: 8, seconds: 150, findScore: 100 },
  { scene: 1, name: 'Lantern Garden', differences: 10, seconds: 180, findScore: 100 },
  { scene: 2, name: 'Harbor Sunset', differences: 12, seconds: 210, findScore: 100 },
];

// Hints: how many a level grants, how long one lasts, and its cooldown.
export const HINTS_PER_LEVEL = 3;
export const HINT_SECONDS = 2.5;
export const HINT_COOLDOWN_SECONDS = 8;

// A wrong click costs this many seconds off the clock.
export const WRONG_CLICK_PENALTY_SECONDS = 3;

// Streak bonus: every third find in a row without a miss adds this.
export const STREAK_BONUS_EVERY = 3;
export const STREAK_BONUS_SCORE = 50;

// Stars on a finished level, by the share of the clock left.
export const STAR_THRESHOLDS = [0.5, 0.25, 0];

// Colours shared by the frame, the HUD and the markers.
export const COLORS = {
  frame: '#1c2433',
  panelBorder: '#3a4a63',
  panelBorderFound: '#7ee081',
  hudBackground: '#232c3d',
  hudText: '#f4ead8',
  accent: '#ffb347',
  accentDark: '#e08a1e',
  foundRing: '#ffd23f',
  foundRingOuter: '#ff9f1c',
  hintRing: '#7ee0ff',
  missMark: '#ff5a5a',
  button: '#ffb347',
  buttonText: '#231a0e',
  buttonDisabled: '#5a6478',
};
