# Galactic Trader

A browser trading game in one self-contained HTML file. Fly between seven alien worlds, buy low, sell high, dodge trouble and reach 150,000 credits, then play on if you like.

- `REQUIREMENTS.md` is the living requirements and change log. Read it first.
- `game/galactic-trader-11.html` is the current build (v11: play on after the race, slower quest and job money, keyboard-only mini-games, three sabotage games, separate quest slots, SHIP and PLANETS pop-ups, new top bar). `galactic-trader-10.html` (quests, bar interiors, Defence Grid), `galactic-trader-9.html` (3D town squares), `galactic-trader-8.html` (late-90s space-sim graphics), `galactic-trader-7.html` down to `galactic-trader-3.html`, `galactic-trader-deluxe.html` (v2) and `galactic-trader.html` (v1) are frozen.
- Source lives in `game/gt-*.js` and `game/gt-style*.css`. `python3 game/gt-build11.py` joins them into the HTML file.
- `node game/gt-sim.js` and `node game/gt-sim-multi.js` simulate the economy; `node game/gt-mgsim.js` plays the mini-games with bots. `node game/gtq-test.js` and `node game/gtq11-test.js` test the engine. `game/gtd-*.js` are Playwright browser tests (run after a build).
