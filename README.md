# Galactic Trader

A browser trading game in one self-contained HTML file. Fly between seven alien worlds, buy low, sell high, dodge trouble and reach 150,000 credits.

- `REQUIREMENTS.md` is the living requirements and change log. Read it first.
- `game/galactic-trader-3.html` is the current build (v3: multiplayer, EGA pixel art). `galactic-trader-deluxe.html` is v2 and `galactic-trader.html` is v1, both frozen.
- Source lives in `game/gt-*.js` and `game/gt-style*.css`. `python3 game/gt-build3.py` joins them into the HTML file.
- `node game/gt-sim.js` and `node game/gt-sim-multi.js` simulate the economy. `game/gtd-*.js` are Playwright browser tests (run after a build).
