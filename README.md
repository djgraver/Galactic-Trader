# Galactic Trader

A browser trading game in one self-contained HTML file. Fly between seven alien worlds, buy low, sell high, dodge trouble and reach 150,000 credits.

- `REQUIREMENTS.md` is the living requirements and change log. Read it first.
- `game/galactic-trader-5.html` is the current build (v5: space-themed Odd Jobs, sharper buildings, destination descriptions, new masculine, feminine and alien captain faces). `galactic-trader-4.html`, `galactic-trader-3.html`, `galactic-trader-deluxe.html` (v2) and `galactic-trader.html` (v1) are frozen.
- Source lives in `game/gt-*.js` and `game/gt-style*.css`. `python3 game/gt-build5.py` joins them into the HTML file.
- `node game/gt-sim.js` and `node game/gt-sim-multi.js` simulate the economy. `game/gtd-*.js` are Playwright browser tests (run after a build).
