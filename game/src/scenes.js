// The three scenes. Each one is drawn twice per frame: the left panel with
// no differences applied, the right panel with every difference applied.
// A scene is a function draw(ctx, mods) plus a list of its differences,
// each with the spot to click (x, y, r in scene coordinates) and a label.
// A difference is a small, deliberate change to one element: something
// missing, recoloured, moved or added. The scene draws the base version
// unless its id is in `mods`, in which case it draws the changed version.

import { PANEL } from './config.js';

// ---- small drawing helpers -------------------------------------------------

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Georgia, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// A five-point star.
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// A simple bird: two arcs like a gull in flight.
function bird(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x - 8 * scale, y, 8 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 8 * scale, y, 8 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

// A soft cloud made of three circles.
function cloud(ctx, x, y, scale, fill) {
  circle(ctx, x, y, 18 * scale, fill);
  circle(ctx, x + 16 * scale, y - 6 * scale, 14 * scale, fill);
  circle(ctx, x + 32 * scale, y, 16 * scale, fill);
  rect(ctx, x - 18 * scale, y, 50 * scale, 12 * scale, fill);
}

// ---- scene 1: Morning Market ----------------------------------------------

const MARKET_DIFFERENCES = [
  { id: 'sun-glasses', x: 72, y: 62, r: 26, label: 'the sun wears sunglasses' },
  { id: 'apple-missing', x: 268, y: 352, r: 18, label: 'an apple is missing from the stall' },
  { id: 'cat-tail', x: 548, y: 408, r: 20, label: 'the cat holds its tail up' },
  { id: 'balloon-missing', x: 438, y: 148, r: 18, label: 'a balloon is missing' },
  { id: 'sign-fruit', x: 312, y: 252, r: 20, label: 'the sign shows a different fruit' },
  { id: 'window-curtain', x: 65, y: 237, r: 18, label: 'a window curtain is drawn' },
  { id: 'bird-missing', x: 424, y: 56, r: 16, label: 'a bird is missing from the sky' },
  { id: 'flower-color', x: 158, y: 442, r: 18, label: 'a flower changed colour' },
];

function drawMarket(ctx, mods) {
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#aee2ff');
  sky.addColorStop(1, '#fff3c4');
  rect(ctx, 0, 0, PANEL.width, 340, sky);
  circle(ctx, 72, 62, 34, '#ffd93b');
  circle(ctx, 72, 62, 26, '#ffe98a');
  // Difference: the sun wears sunglasses on the changed side.
  if (mods.has('sun-glasses')) {
    roundRect(ctx, 48, 52, 48, 16, 7, '#22242e');
    line(ctx, 72, 60, 72, 60, '#22242e', 1);
    circle(ctx, 58, 60, 4, '#ffffff');
    circle(ctx, 86, 60, 4, '#ffffff');
  }
  cloud(ctx, 190, 52, 1, 'rgba(255,255,255,0.9)');
  cloud(ctx, 470, 84, 0.8, 'rgba(255,255,255,0.85)');
  bird(ctx, 350, 72, 1, '#4a5568');
  // Difference: one bird is missing on the changed side.
  if (!mods.has('bird-missing')) bird(ctx, 424, 56, 0.9, '#4a5568');

  // Background buildings.
  rect(ctx, 30, 190, 110, 150, '#e8b4a0');
  rect(ctx, 30, 190, 110, 14, '#c98d76');
  rect(ctx, 470, 170, 110, 170, '#a0c4e8');
  rect(ctx, 470, 170, 110, 14, '#7ba3cf');
  // Windows: one has a curtain on the changed side.
  for (const [wx, wy] of [[52, 222], [96, 222], [52, 272], [96, 272]]) {
    rect(ctx, wx, wy, 26, 30, '#fff8e0');
    line(ctx, wx + 13, wy, wx + 13, wy + 30, '#c98d76', 2);
  }
  if (mods.has('window-curtain')) {
    rect(ctx, 52, 222, 26, 30, '#e2607f');
    rect(ctx, 52, 222, 26, 8, '#c24a68');
  }
  for (const [wx, wy] of [[492, 202], [536, 202], [492, 252], [536, 252]]) {
    rect(ctx, wx, wy, 26, 30, '#fff8e0');
    line(ctx, wx + 13, wy, wx + 13, wy + 30, '#7ba3cf', 2);
  }
  // A shop sign on the blue building.
  roundRect(ctx, 486, 300, 78, 26, 6, '#fff8e0');
  text(ctx, 'BAKERY', 525, 314, 13, '#5a4a3a');

  // Cobblestone street.
  rect(ctx, 0, 340, PANEL.width, 180, '#c9b8a3');
  ctx.fillStyle = '#b39d88';
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const ox = (row % 2) * 26;
      ctx.beginPath();
      ctx.ellipse(26 + col * 52 + ox, 372 + row * 40, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Market stall: posts, striped awning, counter, produce.
  rect(ctx, 196, 210, 10, 190, '#8a5a3b');
  rect(ctx, 414, 210, 10, 190, '#8a5a3b');
  for (let i = 0; i < 6; i += 1) {
    poly(ctx, [[192 + i * 38, 210], [230 + i * 38, 210], [222 + i * 38, 246], [200 + i * 38, 246]], i % 2 === 0 ? '#e2607f' : '#fff8e0');
  }
  rect(ctx, 192, 246, 228, 10, '#c24a68');
  rect(ctx, 188, 320, 236, 76, '#a9744f');
  rect(ctx, 188, 320, 236, 10, '#8a5a3b');
  // Produce: apples, oranges, carrots, pumpkins.
  circle(ctx, 232, 332, 13, '#e23b3b');
  circle(ctx, 258, 330, 13, '#e23b3b');
  // Difference: one apple is missing on the changed side.
  if (!mods.has('apple-missing')) circle(ctx, 268, 352, 13, '#e23b3b');
  circle(ctx, 292, 332, 13, '#ff8c1a');
  circle(ctx, 318, 330, 13, '#ff8c1a');
  circle(ctx, 344, 332, 13, '#ff8c1a');
  poly(ctx, [[368, 348], [378, 318], [388, 348]], '#ff7f2a');
  poly(ctx, [[392, 348], [402, 318], [412, 348]], '#ff7f2a');
  ellipse(ctx, 372, 352, 20, 12, '#e8821e');
  // Sign on the stall: an apple or an orange, by difference.
  roundRect(ctx, 288, 232, 48, 36, 6, '#fff8e0');
  if (mods.has('sign-fruit')) {
    circle(ctx, 312, 250, 11, '#ff8c1a');
    circle(ctx, 312, 238, 3, '#3a7d2c');
  } else {
    circle(ctx, 312, 250, 11, '#e23b3b');
    circle(ctx, 312, 238, 3, '#3a7d2c');
  }
  text(ctx, 'MARKET', 312, 368, 15, '#5a3a22');

  // Balloons tied to the stall.
  line(ctx, 438, 246, 438, 176, '#5a4a3a', 2);
  // Difference: one balloon is missing on the changed side.
  if (!mods.has('balloon-missing')) circle(ctx, 438, 148, 16, '#e2607f');
  circle(ctx, 466, 168, 16, '#4a90d9');
  circle(ctx, 414, 168, 14, '#7bc96f');

  // Bicycle leaning on the left.
  circle(ctx, 84, 462, 26, '#333a45');
  circle(ctx, 84, 462, 20, '#f4ead8');
  circle(ctx, 150, 462, 26, '#333a45');
  circle(ctx, 150, 462, 20, '#f4ead8');
  line(ctx, 84, 462, 118, 420, '#c24a68', 4);
  line(ctx, 150, 462, 118, 420, '#c24a68', 4);
  line(ctx, 118, 420, 138, 420, '#333a45', 4);
  line(ctx, 84, 462, 150, 462, '#c24a68', 3);

  // Flower pot: its bloom changes colour on the changed side.
  poly(ctx, [[140, 470], [176, 470], [170, 500], [146, 500]], '#c96f4a');
  line(ctx, 158, 470, 158, 446, '#3a7d2c', 3);
  circle(ctx, 150, 442, 8, mods.has('flower-color') ? '#ffd23f' : '#e2607f');
  circle(ctx, 166, 442, 8, mods.has('flower-color') ? '#ffd23f' : '#e2607f');
  circle(ctx, 158, 436, 8, mods.has('flower-color') ? '#ffd23f' : '#e2607f');

  // Cat on a crate, right side. Its tail is up on the changed side.
  rect(ctx, 478, 428, 64, 46, '#b08968');
  line(ctx, 478, 442, 542, 442, '#8a6a4a', 3);
  ellipse(ctx, 510, 414, 26, 20, '#f2a541');
  circle(ctx, 492, 392, 14, '#f2a541');
  poly(ctx, [[482, 382], [488, 366], [496, 380]], '#f2a541');
  poly(ctx, [[500, 380], [508, 366], [512, 382]], '#f2a541');
  circle(ctx, 487, 390, 2.5, '#22242e');
  circle(ctx, 497, 390, 2.5, '#22242e');
  if (mods.has('cat-tail')) {
    line(ctx, 534, 420, 548, 388, '#f2a541', 5);
  } else {
    line(ctx, 534, 420, 556, 428, '#f2a541', 5);
  }

  // Dog sniffing near the stall.
  ellipse(ctx, 560, 486, 30, 18, '#8a6a4a');
  circle(ctx, 586, 474, 13, '#8a6a4a');
  poly(ctx, [[576, 464], [582, 452], [588, 464]], '#8a6a4a');
  circle(ctx, 590, 472, 2.5, '#22242e');
  line(ctx, 534, 488, 522, 496, '#8a6a4a', 4);
}

export { MARKET_DIFFERENCES, drawMarket };

// ---- scene 2: Lantern Garden ----------------------------------------------

const GARDEN_DIFFERENCES = [
  { id: 'lantern-color', x: 300, y: 244, r: 20, label: 'a lantern changed colour' },
  { id: 'fish-missing', x: 340, y: 478, r: 18, label: 'a koi fish is missing' },
  { id: 'frog-eye', x: 420, y: 428, r: 18, label: 'the frog winks' },
  { id: 'flower-missing', x: 120, y: 380, r: 16, label: 'a flower is missing' },
  { id: 'moon-crater', x: 520, y: 70, r: 24, label: 'the moon has an extra crater' },
  { id: 'bridge-plank', x: 305, y: 362, r: 18, label: 'a bridge plank changed colour' },
  { id: 'firefly-missing', x: 180, y: 150, r: 14, label: 'a firefly is missing' },
  { id: 'birdhouse-door', x: 560, y: 312, r: 18, label: 'the birdhouse door is open' },
  { id: 'butterfly-color', x: 90, y: 250, r: 16, label: 'a butterfly changed colour' },
  { id: 'lily-missing', x: 480, y: 472, r: 18, label: 'a lily pad is missing' },
];

function drawGarden(ctx, mods) {
  // Dusk sky, moon and stars.
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#3b2d5c');
  sky.addColorStop(0.6, '#b85c7a');
  sky.addColorStop(1, '#f2a65a');
  rect(ctx, 0, 0, PANEL.width, 340, sky);
  circle(ctx, 520, 70, 30, '#fdf6d8');
  circle(ctx, 510, 62, 6, '#e8dcc0');
  circle(ctx, 530, 78, 4, '#e8dcc0');
  // Difference: an extra crater on the changed side.
  if (mods.has('moon-crater')) circle(ctx, 522, 58, 5, '#e8dcc0');
  for (const [sx, sy] of [[60, 40], [140, 90], [240, 36], [330, 70], [430, 30], [580, 130], [40, 150]]) {
    star(ctx, sx, sy, 4, '#fff8d0');
  }
  // Fireflies: one is missing on the changed side.
  circle(ctx, 90, 190, 4, '#ffe98a');
  if (!mods.has('firefly-missing')) circle(ctx, 180, 150, 4, '#ffe98a');
  circle(ctx, 260, 210, 4, '#ffe98a');

  // Trees left and right.
  rect(ctx, 66, 250, 16, 110, '#5a3d2b');
  circle(ctx, 74, 230, 52, '#2e6b34');
  circle(ctx, 40, 260, 36, '#3a7d2c');
  circle(ctx, 110, 260, 36, '#2e6b34');
  rect(ctx, 520, 250, 16, 110, '#5a3d2b');
  circle(ctx, 528, 230, 50, '#2e6b34');
  circle(ctx, 496, 258, 34, '#3a7d2c');
  circle(ctx, 560, 258, 34, '#2e6b34');

  // A line of lanterns strung between the trees; the middle one changes
  // colour on the changed side.
  line(ctx, 74, 210, 528, 210, '#3a2b1a', 3);
  for (const [lx, colour] of [[150, '#e2607f'], [300, '#e2607f'], [450, '#ffb347']]) {
    line(ctx, lx, 210, lx, 226, '#3a2b1a', 2);
    ellipse(ctx, lx, 244, 16, 20, colour);
    rect(ctx, lx - 16, 238, 32, 4, '#c24a68');
    rect(ctx, lx - 16, 250, 32, 4, '#c24a68');
  }
  if (mods.has('lantern-color')) {
    ellipse(ctx, 300, 244, 16, 20, '#4a90d9');
    rect(ctx, 284, 238, 32, 4, '#2e5a8a');
    rect(ctx, 284, 250, 32, 4, '#2e5a8a');
  }

  // Grass bank above the pond.
  rect(ctx, 0, 330, PANEL.width, 60, '#3a7d2c');
  rect(ctx, 0, 330, PANEL.width, 8, '#2e6b34');

  // The pond.
  const pond = ctx.createLinearGradient(0, 390, 0, 520);
  pond.addColorStop(0, '#4a90d9');
  pond.addColorStop(1, '#2e5a8a');
  rect(ctx, 0, 390, PANEL.width, 130, pond);
  // Ripples.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [rx, ry, rw] of [[120, 420, 40], [330, 440, 50], [500, 420, 36]]) {
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Koi fish: one is missing on the changed side.
  ellipse(ctx, 200, 452, 22, 10, '#ff8c1a');
  poly(ctx, [[222, 452], [234, 442], [234, 462]], '#ff8c1a');
  circle(ctx, 184, 449, 2.5, '#22242e');
  if (!mods.has('fish-missing')) {
    ellipse(ctx, 340, 478, 20, 9, '#fdf6d8');
    poly(ctx, [[360, 478], [371, 469], [371, 487]], '#fdf6d8');
    circle(ctx, 326, 475, 2.5, '#22242e');
  }
  ellipse(ctx, 90, 486, 18, 8, '#e2607f');
  poly(ctx, [[108, 486], [118, 478], [118, 494]], '#e2607f');

  // Lily pads: one is missing on the changed side.
  ellipse(ctx, 140, 470, 26, 10, '#2e6b34');
  ellipse(ctx, 260, 500, 24, 9, '#3a7d2c');
  if (!mods.has('lily-missing')) ellipse(ctx, 480, 472, 26, 10, '#2e6b34');
  // A frog on a pad; it winks on the changed side.
  ellipse(ctx, 420, 428, 24, 16, '#5aa843');
  circle(ctx, 404, 412, 9, '#5aa843');
  circle(ctx, 436, 412, 9, '#5aa843');
  circle(ctx, 404, 410, 3, '#22242e');
  if (mods.has('frog-eye')) {
    line(ctx, 430, 410, 442, 410, '#22242e', 2);
  } else {
    circle(ctx, 436, 410, 3, '#22242e');
  }
  ellipse(ctx, 420, 440, 14, 5, '#7bc96f');

  // Stone bridge over the pond.
  poly(ctx, [[240, 390], [370, 390], [350, 330], [260, 330]], '#b8a88f');
  for (let i = 0; i < 5; i += 1) {
    const px = 262 + i * 20;
    const plankColour = mods.has('bridge-plank') && i === 2 ? '#e2607f' : '#8a7a63';
    rect(ctx, px, 336, 16, 52, plankColour);
  }
  line(ctx, 250, 336, 360, 336, '#5a4a3a', 3);
  line(ctx, 250, 384, 360, 384, '#5a4a3a', 3);

  // Flowers along the bank: one is missing on the changed side.
  for (const [fx, fy, fc] of [[40, 372, '#e2607f'], [90, 378, '#ffb347'], [170, 372, '#e2607f'], [470, 374, '#ffb347'], [560, 372, '#e2607f']]) {
    line(ctx, fx, 396, fx, 376, '#2e6b34', 3);
    circle(ctx, fx, 370, 7, fc);
  }
  if (!mods.has('flower-missing')) {
    line(ctx, 120, 396, 120, 382, '#2e6b34', 3);
    circle(ctx, 120, 376, 7, '#e2607f');
  }

  // Butterfly: its wings change colour on the changed side.
  const wing = mods.has('butterfly-color') ? '#4a90d9' : '#ff8c1a';
  ellipse(ctx, 82, 246, 10, 14, wing);
  ellipse(ctx, 98, 246, 10, 14, wing);
  line(ctx, 90, 236, 90, 260, '#22242e', 2);

  // Birdhouse on a pole, right side. Its door is open on the changed side.
  rect(ctx, 556, 300, 8, 90, '#8a5a3b');
  poly(ctx, [[540, 300], [580, 300], [560, 276]], '#c24a68');
  rect(ctx, 544, 300, 32, 30, '#a9744f');
  if (mods.has('birdhouse-door')) {
    rect(ctx, 554, 308, 12, 14, '#2b1d12');
    circle(ctx, 554, 315, 3, '#ffd23f');
  } else {
    circle(ctx, 560, 315, 6, '#2b1d12');
  }
}

// ---- scene 3: Harbor Sunset -----------------------------------------------

const HARBOR_DIFFERENCES = [
  { id: 'sail-color', x: 168, y: 340, r: 22, label: 'a sail changed colour' },
  { id: 'gull-missing', x: 280, y: 70, r: 16, label: 'a seagull is missing' },
  { id: 'buoy-missing', x: 450, y: 482, r: 16, label: 'a buoy is missing' },
  { id: 'flag-direction', x: 542, y: 150, r: 18, label: 'the flag points the other way' },
  { id: 'crate-missing', x: 120, y: 452, r: 18, label: 'a crate is missing from the pier' },
  { id: 'fish-missing', x: 320, y: 420, r: 16, label: 'a jumping fish is missing' },
  { id: 'lighthouse-beam', x: 450, y: 170, r: 22, label: 'the lighthouse beam is on' },
  { id: 'wave-extra', x: 200, y: 402, r: 18, label: 'an extra wave crest' },
  { id: 'rope-coil', x: 60, y: 492, r: 16, label: 'a rope coil is on the pier' },
  { id: 'anchor', x: 180, y: 482, r: 16, label: 'an anchor is on the pier' },
  { id: 'cabin-window', x: 380, y: 392, r: 16, label: 'a cabin window is lit' },
  { id: 'cloud-shape', x: 380, y: 60, r: 20, label: 'a cloud has a different shape' },
];

function drawHarbor(ctx, mods) {
  // Sunset sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ff9e5e');
  sky.addColorStop(0.6, '#ff7e7e');
  sky.addColorStop(1, '#b85c7a');
  rect(ctx, 0, 0, PANEL.width, 300, sky);
  circle(ctx, 480, 210, 38, '#ffd93b');
  circle(ctx, 480, 210, 30, '#ffe98a');
  cloud(ctx, 100, 80, 1, 'rgba(255,255,255,0.85)');
  // Difference: the far cloud has another shape on the changed side.
  if (mods.has('cloud-shape')) {
    circle(ctx, 380, 60, 22, 'rgba(255,255,255,0.85)');
    circle(ctx, 402, 52, 16, 'rgba(255,255,255,0.85)');
    circle(ctx, 358, 54, 14, 'rgba(255,255,255,0.85)');
  } else {
    cloud(ctx, 360, 60, 0.9, 'rgba(255,255,255,0.85)');
  }
  bird(ctx, 150, 100, 1, '#4a3a4a');
  // Difference: one gull is missing on the changed side.
  if (!mods.has('gull-missing')) bird(ctx, 280, 70, 0.9, '#4a3a4a');
  bird(ctx, 420, 110, 1, '#4a3a4a');

  // The sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 520);
  sea.addColorStop(0, '#3d7ea6');
  sea.addColorStop(1, '#1d4a6b');
  rect(ctx, 0, 300, PANEL.width, 220, sea);
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255,217,59,0.5)';
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, 440 + (i % 2) * 40, 320 + i * 34, 60 - i * 8, 4);
  }
  // Waves.
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  for (const [wx, wy, ww] of [[90, 350, 60], [300, 380, 70], [520, 360, 55], [140, 460, 65], [380, 470, 60]]) {
    ctx.beginPath();
    ctx.ellipse(wx, wy, ww, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Difference: an extra wave crest on the changed side.
  if (mods.has('wave-extra')) {
    ctx.beginPath();
    ctx.ellipse(200, 402, 44, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sailboat 1 (left): its sail changes colour on the changed side.
  line(ctx, 150, 300, 150, 380, '#5a3d2b', 4);
  poly(ctx, [[150, 302], [150, 372], [196, 372]], mods.has('sail-color') ? '#e2607f' : '#fdf6d8');
  poly(ctx, [[146, 310], [146, 372], [108, 372]], '#fdf6d8');
  ellipse(ctx, 150, 380, 46, 12, '#8a5a3b');
  rect(ctx, 138, 366, 24, 14, '#6b4a2f');

  // Sailboat 2 (right) with a cabin; its window is lit on the changed side.
  line(ctx, 380, 320, 380, 400, '#5a3d2b', 4);
  poly(ctx, [[380, 322], [380, 392], [424, 392]], '#fdf6d8');
  poly(ctx, [[376, 330], [376, 392], [340, 392]], '#fdf6d8');
  ellipse(ctx, 380, 400, 44, 11, '#8a5a3b');
  rect(ctx, 368, 386, 24, 14, '#6b4a2f');
  rect(ctx, 374, 390, 10, 8, mods.has('cabin-window') ? '#ffd23f' : '#2b1d12');

  // Rowboat.
  ellipse(ctx, 520, 424, 34, 10, '#a9744f');
  line(ctx, 500, 424, 486, 402, '#5a3d2b', 3);
  line(ctx, 540, 424, 554, 402, '#5a3d2b', 3);

  // A jumping fish: missing on the changed side.
  if (!mods.has('fish-missing')) {
    ellipse(ctx, 320, 420, 16, 7, '#7bc96f');
    poly(ctx, [[334, 420], [344, 412], [344, 428]], '#7bc96f');
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(320, 438, 26, 6, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Buoys: one is missing on the changed side.
  ellipse(ctx, 250, 462, 12, 9, '#e2607f');
  rect(ctx, 244, 446, 12, 10, '#e2607f');
  if (!mods.has('buoy-missing')) {
    ellipse(ctx, 450, 482, 12, 9, '#ffb347');
    rect(ctx, 444, 466, 12, 10, '#ffb347');
  }
  ellipse(ctx, 80, 472, 12, 9, '#e2607f');
  rect(ctx, 74, 456, 12, 10, '#e2607f');

  // Lighthouse, right side, with a flag and (on the changed side) a beam.
  rect(ctx, 524, 180, 34, 200, '#fdf6d8');
  for (let i = 0; i < 4; i += 1) {
    rect(ctx, 524, 200 + i * 48, 34, 22, i % 2 === 0 ? '#e2607f' : '#fdf6d8');
  }
  rect(ctx, 518, 160, 46, 22, '#3a4a63');
  circle(ctx, 541, 171, 8, '#ffd23f');
  line(ctx, 541, 160, 541, 128, '#3a4a63', 3);
  // Difference: the flag points the other way on the changed side.
  if (mods.has('flag-direction')) {
    poly(ctx, [[541, 128], [512, 136], [541, 144]], '#e2607f');
  } else {
    poly(ctx, [[541, 128], [570, 136], [541, 144]], '#e2607f');
  }
  if (mods.has('lighthouse-beam')) {
    ctx.fillStyle = 'rgba(255,210,63,0.35)';
    ctx.beginPath();
    ctx.moveTo(524, 171);
    ctx.lineTo(380, 140);
    ctx.lineTo(380, 200);
    ctx.closePath();
    ctx.fill();
  }

  // The pier, bottom left, with crates, a fisherman, a rope and an anchor.
  rect(ctx, 0, 440, 210, 80, '#8a6a4a');
  for (let i = 0; i < 5; i += 1) line(ctx, 0, 452 + i * 16, 210, 452 + i * 16, '#6b4a2f', 3);
  rect(ctx, 30, 470, 20, 20, '#5a3d2b');
  // Difference: one crate is missing on the changed side.
  if (!mods.has('crate-missing')) rect(ctx, 104, 428, 34, 34, '#a9744f');
  rect(ctx, 140, 440, 30, 30, '#8a5a3b');
  // Difference: a rope coil appears on the changed side.
  if (mods.has('rope-coil')) {
    circle(ctx, 60, 492, 12, '#d9c9a3');
    circle(ctx, 60, 492, 6, '#8a7a63');
  }
  // Difference: an anchor appears on the changed side.
  if (mods.has('anchor')) {
    line(ctx, 180, 470, 180, 500, '#3a4a63', 4);
    line(ctx, 168, 478, 192, 478, '#3a4a63', 4);
    ctx.beginPath();
    ctx.arc(180, 494, 8, 0, Math.PI);
    ctx.strokeStyle = '#3a4a63';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  // Fisherman with a rod.
  circle(ctx, 196, 412, 12, '#f2c9a0');
  rect(ctx, 186, 424, 20, 30, '#4a90d9');
  line(ctx, 200, 424, 236, 380, '#5a3d2b', 3);
  line(ctx, 236, 380, 236, 420, '#e8e0d0', 1);
  circle(ctx, 236, 424, 3, '#e2607f');
}

// ---- the registry -----------------------------------------------------------

export const SCENES = [
  { name: 'Morning Market', draw: drawMarket, differences: MARKET_DIFFERENCES },
  { name: 'Lantern Garden', draw: drawGarden, differences: GARDEN_DIFFERENCES },
  { name: 'Harbor Sunset', draw: drawHarbor, differences: HARBOR_DIFFERENCES },
];
