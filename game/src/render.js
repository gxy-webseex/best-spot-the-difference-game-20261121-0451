// Everything the player sees: the frame, the two panels, the markers on
// found differences, the heads-up bar and the screens. Rendering never
// changes state; it only reads it.

import { CANVAS, COLORS, FOOTER, HUD, PANEL, PANEL_LEFT, PANEL_RIGHT } from './config.js';
import { SCENES } from './scenes.js';
import {
  SCREEN_GAME_OVER,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PLAY,
  SCREEN_TITLE,
  currentLevel,
  currentScene,
} from './state.js';

// ---- frame -----------------------------------------------------------------

function drawBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS.height);
  g.addColorStop(0, '#2a3348');
  g.addColorStop(1, '#1c2433');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLORS.hudBackground;
  ctx.fillRect(0, 0, CANVAS.width, HUD.height);
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(0, HUD.height - 3, CANVAS.width, 3);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔍 Lantern Lane', 20, HUD.height / 2 + 1);
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'center';
  const level = currentLevel(state);
  ctx.fillText(`Level ${state.levelIndex + 1} · ${level.name}`, 470, HUD.height / 2 + 1);
  ctx.fillText(`⭐ ${state.score}`, 700, HUD.height / 2 + 1);
  const timeColour = state.timeLeft <= 30 ? '#ff7b7b' : COLORS.hudText;
  ctx.fillStyle = timeColour;
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  ctx.fillText(`⏱ ${mins}:${String(secs).padStart(2, '0')}`, 840, HUD.height / 2 + 1);
  ctx.fillStyle = COLORS.hudText;
  ctx.fillText(`💡 ${state.hintsLeft}`, 950, HUD.height / 2 + 1);
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = COLORS.accent;
  const left = level.differences - state.found.size;
  ctx.fillText(`Found ${state.found.size}/${level.differences} · ${left} left`, 1120, HUD.height / 2 + 1);
}

// One panel: the scene drawn into its rectangle, with a border. `mods` is
// the set of differences to apply (empty on the left, all of them on the
// right). `markers` are the found differences to ring on this panel.
function drawPanel(ctx, scene, origin, mods, markers, hinted, hintPulse) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(origin.x, origin.y, PANEL.width, PANEL.height);
  ctx.clip();
  ctx.translate(origin.x, origin.y);
  scene.draw(ctx, mods);
  ctx.restore();
  // The frame around the panel.
  ctx.strokeStyle = COLORS.panelBorder;
  ctx.lineWidth = 3;
  ctx.strokeRect(origin.x, origin.y, PANEL.width, PANEL.height);
  // Rings on every difference already found.
  for (const diff of markers) {
    const cx = origin.x + diff.x;
    const cy = origin.y + diff.y;
    ctx.strokeStyle = COLORS.foundRing;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.foundRingOuter;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r + 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.foundRing;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', cx, cy - diff.r - 16);
  }
  // A pulsing hint ring on the one difference a hint is showing.
  if (hinted) {
    const cx = origin.x + hinted.x;
    const cy = origin.y + hinted.y;
    ctx.strokeStyle = COLORS.hintRing;
    ctx.lineWidth = 3 + Math.sin(hintPulse) * 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, hinted.r + 8 + Math.sin(hintPulse) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// The footer: the message line, the hint button and the controls.
function drawFooter(ctx, state) {
  const y = FOOTER.y;
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const message = state.now < state.messageUntil ? state.message : 'Click a difference on either picture — or move the crosshair with the arrow keys and press Enter.';
  ctx.fillText(message, CANVAS.width / 2, y + 22);
  // Hint button.
  const hintReady = state.screen === SCREEN_PLAY && state.hintsLeft > 0 && state.hintCooldown <= 0;
  const bx = CANVAS.width / 2 - 90;
  const by = y + 44;
  ctx.fillStyle = hintReady ? COLORS.button : COLORS.buttonDisabled;
  ctx.beginPath();
  ctx.roundRect(bx, by, 180, 44, 10);
  ctx.fill();
  ctx.fillStyle = hintReady ? COLORS.buttonText : '#d8d2c4';
  ctx.font = 'bold 18px Georgia, serif';
  const hintLabel = state.hintCooldown > 0 ? `Hint (${Math.ceil(state.hintCooldown)}s)` : `💡 Hint (${state.hintsLeft})`;
  ctx.fillText(hintLabel, CANVAS.width / 2, by + 23);
  ctx.fillStyle = '#9aa5b8';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('H hint · M mute · R restart · Enter start', CANVAS.width / 2, y + 112);
}

// The keyboard crosshair, drawn over the panel it sits on.
function drawCursor(ctx, state) {
  const cursor = state.cursor;
  // Work out which panel the cursor is over: it lives in scene coordinates,
  // and the player moves it between panels with the left/right arrows.
  const panel = cursor.panel === 'right' ? PANEL_RIGHT : PANEL_LEFT;
  const cx = panel.x + cursor.x;
  const cy = panel.y + cursor.y;
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy);
  ctx.lineTo(cx - 8, cy);
  ctx.moveTo(cx + 8, cy);
  ctx.lineTo(cx + 18, cy);
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx, cy - 8);
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx, cy + 18);
  ctx.stroke();
}

// ---- screens ----------------------------------------------------------------

function drawTitle(ctx, state) {
  drawBackground(ctx);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔍 Lantern Lane', CANVAS.width / 2, 150);
  ctx.font = '26px Georgia, serif';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText('A spot-the-difference game', CANVAS.width / 2, 210);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '19px Georgia, serif';
  ctx.fillText('Two pictures, side by side — almost the same.', CANVAS.width / 2, 280);
  ctx.fillText('Find every difference before the clock runs out.', CANVAS.width / 2, 314);
  ctx.fillText('Three scenes, 30 differences, hints when you are stuck.', CANVAS.width / 2, 348);
  // The three scenes, named, as a preview of the hunt.
  ctx.font = 'bold 18px Georgia, serif';
  SCENES.forEach((scene, i) => {
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(`${i + 1}. ${scene.name} — ${scene.differences.length} differences`, CANVAS.width / 2, 408 + i * 32);
  });
  ctx.fillStyle = COLORS.button;
  ctx.beginPath();
  ctx.roundRect(CANVAS.width / 2 - 130, 540, 260, 56, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.buttonText;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('▶  Start playing', CANVAS.width / 2, 569);
  ctx.fillStyle = '#9aa5b8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Mouse: click a difference · Keyboard: arrows + Enter · H hint · M mute', CANVAS.width / 2, 640);
}

function drawOverlay(ctx, title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(16,20,30,0.72)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  const boxW = 640;
  const boxH = 300;
  const bx = (CANVAS.width - boxW) / 2;
  const by = (CANVAS.height - boxH) / 2;
  ctx.fillStyle = '#232c3d';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, CANVAS.width / 2, by + 56);
  ctx.font = '20px Georgia, serif';
  lines.forEach((lineText, i) => {
    ctx.fillText(lineText, CANVAS.width / 2, by + 116 + i * 34);
  });
  ctx.fillStyle = COLORS.button;
  ctx.beginPath();
  ctx.roundRect(CANVAS.width / 2 - 130, by + boxH - 76, 260, 52, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.buttonText;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(buttonLabel, CANVAS.width / 2, by + boxH - 49);
}

// ---- the frame --------------------------------------------------------------

export function draw(ctx, state) {
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state);
    return;
  }
  const scene = currentScene(state);
  const allDiffs = new Set(scene.differences.map((d) => d.id));
  const foundList = scene.differences.filter((d) => state.found.has(d.id));
  const hinted = state.hinted
    ? scene.differences.find((d) => d.id === state.hinted) ?? null
    : null;

  drawBackground(ctx);
  drawHud(ctx, state);
  drawPanel(ctx, scene, PANEL_LEFT, new Set(), foundList, hinted, state.now * 6);
  drawPanel(ctx, scene, PANEL_RIGHT, allDiffs, foundList, hinted, state.now * 6);
  // Panel labels, as small chips inside the top-left corner of each panel.
  for (const [origin, label] of [[PANEL_LEFT, 'Original'], [PANEL_RIGHT, 'Changed']]) {
    ctx.fillStyle = 'rgba(28,36,51,0.75)';
    ctx.beginPath();
    ctx.roundRect(origin.x + 8, origin.y + 8, 86, 26, 7);
    ctx.fill();
    ctx.fillStyle = COLORS.hudText;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, origin.x + 20, origin.y + 22);
  }
  drawFooter(ctx, state);
  if (state.screen === SCREEN_PLAY && !state.hideCursor) drawCursor(ctx, state);

  if (state.screen === SCREEN_LEVEL_COMPLETE) {
    const level = currentLevel(state);
    const last = state.levelIndex + 1 >= 3;
    drawOverlay(
      ctx,
      last ? '🎉 All levels complete!' : `✅ ${level.name} complete!`,
      [
        `Stars: ${'★'.repeat(state.stars)}${'☆'.repeat(3 - state.stars)}`,
        `Level score ${state.levelScore} · Total ${state.score}`,
        last ? 'You found all 30 differences.' : 'Ready for the next scene?',
      ],
      last ? '↺  Play again' : '▶  Next level',
    );
  } else if (state.screen === SCREEN_GAME_OVER) {
    drawOverlay(
      ctx,
      '⏰ Time ran out!',
      [
        `You found ${state.found.size} of ${currentLevel(state).differences} differences in ${currentLevel(state).name}.`,
        `Score ${state.score} · Total found ${state.totalFound}`,
        'The differences are still out there.',
      ],
      '↺  Try again',
    );
  }
}
