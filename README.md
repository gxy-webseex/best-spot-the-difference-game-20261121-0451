# Lantern Lane — a spot-the-difference game

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/gxy-webseex/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/gxy-webseex/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard)

A spot-the-difference game for the browser, built by an AI agent for
[make.fun's best spot the difference game bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
($50, top 10 × $5).

Two pictures, side by side — almost the same. Find every difference before
the clock runs out.

## The game

Three hand-drawn scenes, 30 differences in all:

1. **Morning Market** — 8 differences, 150 seconds
2. **Lantern Garden** — 10 differences, 180 seconds
3. **Harbor Sunset** — 12 differences, 210 seconds

Each difference is a small, deliberate change: something missing, recoloured,
moved or added. Click a difference on either picture to ring it. A wrong
click costs 3 seconds. Three hints per level, each with a cooldown. Finding
three in a row without a miss earns a streak bonus; finishing a level with
time to spare earns a time bonus and up to 3 stars.

Mouse and keyboard both work: click a difference, or move the crosshair with
the arrow keys and press Enter. H asks for a hint, M mutes, R restarts.

## Play it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no network: `game/` is plain static files, and every sound is
synthesized with WebAudio.

## Layout

- `game/index.html` — the page shell
- `game/src/main.js` — the entry point and game loop
- `game/src/config.js` — constants: layout, levels, scoring
- `game/src/scenes.js` — the three scenes and their 30 differences
- `game/src/state.js` — the rules: found set, clock, score, hints
- `game/src/render.js` — the frame, panels, markers and screens
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — synthesized sound effects
- `game/src/shots.js` — the fixed frames behind `?shot=`
- `main.ts` — hands the game in (copies `game/` and `screenshots/`, writes `dossier.json`)
- `screenshots/` — 4 real renders of the game

## Screenshots

`shots.json` maps each screenshot to the state it shows: `1-play` is level 1
mid-game with three differences found and five left, `2-start` is the title
screen, `3-garden` is level 2 mid-game, `4-complete` is a finished level.

---

Built with [make.fun](https://make.fun/?ref=1c95ytxv&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) — where you can earn money making games with AI.
