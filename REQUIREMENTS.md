# Galactic Trader: Requirements (living document)

Status: v5 built (`game/galactic-trader-5.html`, title "Galactic Trader"). Keep this file updated with every change. All requirements below must be adhered to in every build. Read this file at the start of every session.

## Change log
- v1: Four-column browser game built from the original Google Doc. Published and approved ("plays well"). Frozen build: `game/galactic-trader.html` (source at commit `25fb5b5`).
- v2 Deluxe: 90s point-and-click comedy restyle. Locations replace the four columns. Added characters, name-based captain generator, flight screens, action mini-games, Day/Night theme. Frozen build: `game/galactic-trader-deluxe.html` (source at commit `cb09bb7`).
- v3 (`game/galactic-trader-3.html`, source at the commit tagged in git as the v3 release): Multiplayer (hot-seat, 1 to 4 captains, shared galaxy). Four ships (Gnat removed). Speed explained and given real effects. Letters and Vowels removed from the captain card (still tracked in `captain.hidden`). Property Booth became Real Estate. Rival "old" sprite removed from the street. Streets run away at about 28 degrees. Everything redrawn as 16-colour EGA pixel art with Sierra-style grey windows. The star map shows the current planet's description. Day or night is random on every arrival, and the toggle is gone. Every planet has its own alien architecture.
- v4 (`game/galactic-trader-4.html`, a new major version; v3 is frozen as `galactic-trader-3.html` and git tag `v3`):
  - **Look:** streets redrawn with real-looking buildings (storeys, windows, doors, awnings, roofs, signs); each planet has its own street shape, angle and ground (dirt, cobble, rail bed, tarmac, tile, plaza, boardwalk); King's Quest IV style colour with colour-based shadows; Odd Jobs is now a small post board (kiosk) on the street; ambient passers-by walk door to door (about one every 3 seconds, sometimes two) and birds flap slowly across the skyline.
  - **Layout:** fixed 16:10 frame; the star map no longer needs scrolling; every shop page fits the frame; Ship screen shows the ship with speech-bubble callouts for warp, fuel, cargo, cockpit and passenger cabins.
  - **Spaceport:** the round spaceport and tiny ship are gone. A "To Spaceport -->" sign on the street leads to the Spaceport page (the star map) with the ship on a landing pad under flashing lights, a cityscape and tiny people for scale.
  - **Title screen:** the subtitle is a random catch-phrase (40 of them, `TAGS` in `gt-16-start.js`).
  - **Bank:** Savings and Loans are two counters. Deposit All, Withdraw All, Repay All added. Interest is applied every jump (savings 0.75%, loans 1.25%).
  - **Economy:** facilities pay more (Broker 2.1%, Depot 8.5%, fees 0.57 to 0.71%) and cost less (price about 14 x benefit). Rivals are rubber-banded to the leader (each holds 78 to 96% of the leading captain's fortune with a little noise) and now win if they reach the target first (the player wins a same-jump tie); warnings appear at 70%, 85% and 95% of the target. Odd Jobs: Bronze unchanged, Silver goals x1.3, Gold goals x1.5.
  - **Back alley / smuggling:** Explore now fires about 50% of visits and 45% of those are a smuggler's offer (stake, payout, risk shown). Outcomes: win, big payout, permanent ship boost (cargo, warp, fuel or berth), nothing, caught (fine, -6 reputation), engine damage, robbed. Bad outcomes are about 40% (risk 30 / 40 / 52% by cargo, reduced by reputation), higher than ordinary events but not constant.
  - **Stock Exchange:** one company per world tied to that world's goods (7 tickers), 1% fee each way, small dividends each jump, price follows the home market plus news and your own trading. Holding 10 / 25 / 50 / 100 shares of a world's company cuts that world's tax by 10 / 20 / 30 / 40% of its base rate. Shares count toward net worth.
  - **Passengers:** each ship starts with few berths (Cutlass Runner 1, Wayfarer 2, Stargazer 3, Behemoth Barge 4); the Passenger Cabins upgrade adds berths. Set a fare on the Spaceport page; demand grows with reputation and fares that feel fair; advertising on the destination world multiplies interest for 6 jumps.
  - Balance (re-run `gt-sim.js ... human`): a competent solo player wins about 90% of games in about 79 to 97 jumps; computer rivals win the other ~10%.
- v5 (`game/galactic-trader-5.html`, build with `python3 game/gt-build5.py`; v4 is frozen as `galactic-trader-4.html`):
  - **Odd Jobs are space games.** Every known arcade idea is kept, redone in space: Crater Critters (whack-a-mole, Meridoa), Hyperlane Dash (lane runner, Karth-Osu), Rock Sorter (belt sorter, Ferrox), Orbit Hop (frogger, Kryndor Spire), Asteroid Blaster (asteroids, Nihil Station), Tractor Catch (kaboom, Quellin Reach), Gate Glider (flappy, Halcyra). Rules, scoring and difficulty are unchanged. The sabotage game's guard is now an alien. Source: `gt-19b-space.js` (it re-skins the games from `gt-18-mg.js` and `gt-19-mg2.js`).
  - **Buildings are more defined.** Walls are flat two-tone with a solid shaded side instead of a noisy dither; the shadowed side of the street is shaded solid; every building has a black outline, a bright rim on its lit edges and a dark bevel on the shadow edges; signs are painted after shading so the text stays readable.
  - **Target planet description restored.** On the Spaceport page the Trip plan shows the selected destination's description (it was lost in v4). While a destination is selected the "You are at" blurb is hidden to make room; it comes back when nothing is selected.
  - **New captain faces** (`gt-11b-faces.js`). People-shaped species (Human-ish, Zorpian, Mothkin, Lizardfolk) are now masculine or feminine, decided by the name: masculine faces get square or long jaws, heavy brows (three angles), stubble, moustache, goatee or full beard; feminine faces get oval, heart or round faces, arched brows, lashes, eyeliner, coloured lips, blush and earrings. New hair: long, bob, bun, ponytail, curls (feminine) and swept, crew, slick, shaggy (masculine). Five new alien species with their own faces: Tentaclid (tentacled dome, bar pupils), Greylien (big black almond eyes), Monoclon (one huge eye, horns, tusks), Mantoid (compound eyes, mandibles, antennae), Gravelkin (stone head, glowing eyes, moss). The random features (eyes, nose, mouth, pupils, size) and accessories (monocle, eye patch, bow tie, scarf, goggles, glasses, plaster) still roll as before. Named shopkeepers and rivals have fixed genders (`NP.GEN`); a few cast members are now aliens (Claim Agent Slate, Fivefingers, The Whisperer, Captain Ilyx Orro). Torsos are broader for masculine and narrower for feminine captains.

## 1. Platform and delivery
- Browser game in a single self-contained HTML file (`game/galactic-trader-4.html`). Locked to a 1280 x 800 (16:10) stage that is scaled to fit the window and centred on black, so an ultrawide monitor gets black side bars and never scrolls. Below about 700px wide the stage turns fluid for phones.
- Source is split into parts concatenated by `game/gt-build4.py` into one file. The engine (parts 1 to 7, 10) is Node-testable.
- Fonts from Google Fonts (Press Start 2P for headings, VT323 for text) with monospace fallbacks. Sound via WebAudio, off until the player interacts, mutable (SND button).
- One look only (EGA). There is no theme switch. Night or day is part of each planet visit (section 10).
- Multiplayer is hot-seat: one device, captains pass it around. Online play is not built yet (section 17).

## 2. Goal and rules
- Win: reach 150,000 credits of net worth (credits + bank - loan). Multiplayer offers a Quick race to 50,000.
- Lose: credits at 0 or less with no cargo. Win and lose are checked only at the end of a jump.
- Start: 2,500 credits, chosen ship, start planet Kryndor Spire.
- End screen shows detailed stats: items bought and sold, spend and earnings per item, tax paid, tax discount from reputation and facilities, broker edge, gains and losses from events, interest earned and paid, rival fees, odd job earnings, gambling net, jumps, events, hazards dodged, explores, encounters, fuel bought, tows, facilities, upgrades, sabotage attempts, rivals assisted, reputation now/peak/low. Multiplayer shows a standings table and a report card per captain.
- Info (?) popup explains resources, mechanics, speed, multiplayer and win/lose.

## 3. Items (7)
Rations, Metals, Medical, Spices, Circuitry, Dark Matter, Artifacts. Base prices 24, 52, 95, 160, 260, 460, 780. Each has a market depth (400, 260, 160, 100, 72, 40, 20).

## 4. Planets (7 types, one each)
Agrarian (Meridoa), Megacity (Kryndor Spire), Mining (Ferrox), Science (Quellin Reach), Gas Giant (Halcyra), Void Station (Nihil Station), Ruin (Karth-Osu).
- Tax per planet: 3%, 6.5%, 4%, 7%, 1.5%, 4%, 4% (varies by planet).
- Fuel sold on about half the planets (Ferrox, Kryndor Spire, Nihil Station, Halcyra).
- Ship upgrades sold only on some planets.
- Exactly one gambling planet (Nihil Station), mentioned in its description.
- Each planet has a description, a street, its own architecture and its own cast of shopkeepers.

## 5. Economy (the crux)
- Price = base x planet multiplier x supply factor x shocks. Producers are cheap, consumers pay more. Buy on one side of the map, sell on the other.
- Buying and selling move the price and stock per unit. Stock drifts back toward target.
- Random market modifiers (shortage, glut, festival, scandal).
- Trend arrow shown for about 75% of items, "?" for the rest.
- Planet tax reduced by facilities (5% per facility owned, extra 12% if one is on this planet, cap 60%) and by reputation (up to 40% off, penalty when negative).
- Trades are logged in detail, including tax and discount, and the credits saved.
- Fuel cost per jump = ceil(distance x 0.5 / sqrt(effective speed)). Emergency tow (400c) when stranded.
- Balance verified by simulation (`game/gt-sim.js`, `game/gt-sim-multi.js`): a competent solo player wins in about 76 to 86 jumps (median 79). Mini-game income shortens this by about 10% for good play and about 20% for perfect play. The Quick race (50,000c) takes about 48 jumps. Re-run both simulators after any economy change.
- Shared markets (multiplayer): markets are deepened by 60% for every extra captain, so a 2-captain game takes about 82 rounds and a 4-captain game about 87 rounds, close to solo. Without that, four captains emptying the same shelves stretch a game to about 147 rounds.

## 6. Market
- Buy, Max, quantity field, Sell, All buttons. Greyed out when unavailable.
- Value fields reset to 0 or 1 after each transaction or jump.

## 7. Bank
- Two separate counters. Savings: deposit and withdraw with value fields plus Deposit All and Withdraw All; pays 0.75% every jump. Loans: Take Loan is 1,000c per click, cap 10,000c; repay with a value field or Repay All; costs 1.25% every jump.

## 8. Ships (4, named, with stats)
Wayfarer, Behemoth Barge, Stargazer, Cutlass Runner. Each has cargo, warp speed, fuel capacity (PC), and a description. Chosen on the setup screen with name entry and a Launch button. (The Gnat was removed in v3.)

## 9. Travel and speed
- Star map: black starry background, current planet larger and bold, selected destination line, rival diamonds and other captains' markers, trip summary (distance, fuel, turns), fuel warning, Jump button. A panel beside it shows the current planet's description, tax, fuel and shipyard.
- Travel events about 30% of jumps, at least 20 types (26 built). "Departed" and "Arrived" logged.
- Flight transition screen for every jump: liftoff, warp, any event as a comic card, arrival splash. Skippable.
- Flight log: newest first, "[Turn x]", green for gains, red for losses, verbose and colourful, scrollable with a limited display (60 lines) and a full log page.
- **What speed does** (shown on the setup screen, ship page, shipyard, trip plan and help):
  1. Fuel economy: burn per jump falls with the square root of speed (warp 1.0 is 100%).
  2. Dodging: each 0.1 of warp above 0.9 gives a 2.5% chance to outrun a bad travel event, capped at 45%. A dodge is logged and shown as a "Nice flying" card.
  3. Initiative: in a shared game the fastest ship moves first each round, so it gets first pick of the markets.
  4. Getaway: sabotaging a rival succeeds a little more often with a fast ship (up to +12%).
  - Engine damage lowers warp for a few jumps, so all four effects drop with it. The Warp Engine upgrade adds +0.2.

## 10. Locations
Each planet street has clickable buildings. The player's captain walks to the place, then it opens as a full page with a shopkeeper who talks.
- Market, Bank, Stock Exchange, Shipyard (upgrades: cargo, speed, fuel, passenger cabins, where offered; a fuel upgrade adds empty space), Fuel Dock (where sold), Cantina, Back Alley, **Real Estate** (facility offers, was the Property Booth), Odd Jobs post board (a small kiosk, not a full building), Spaceport (star map, reached with the "To Spaceport -->" sign), Parlour of Thin Hours (gambling planet only).
- Closed buildings are shown as closed where a planet lacks them.
- A sentence line at the bottom describes what is under the pointer.
- **The street** is a one-point perspective boulevard running away at about 28 degrees, with buildings on both sides and the shopfronts getting smaller with distance. No rival or "old" character stands in the street. Other captains' ships appear on the pad in a shared game.
- **Day or night** is chosen at random on every arrival (and at the start). It changes the sky, palette and lit windows. It is not switchable.
- **Architecture:** every planet has its own building shapes, ornaments, palette and skyline (mushroom and barn farms on Meridoa, stepped ruins on Karth-Osu, smokestacks and derricks on Ferrox, glass towers on Kryndor Spire, ring-station pods on Nihil Station, bubble domes on Quellin Reach, balloon pods on Halcyra).

## 11. Events and encounters
- Explore (Back Alley): about 25% chance of an event, at least 10 outcomes per planet, once per visit.
- Seek Encounter (Cantina): about 30%, a unique named character per planet, at least 10 outcomes, once per visit.
- Facilities offered about 20% on arrival (Broker, Depot, Factory, Warehouse, Hotel). Price about 20 times the benefit. Raises reputation. Can be bought after selling cargo. In a shared game only one captain can own the facility on a given world.
- Rival events about 20% when a rival is docked: Sabotage, Assist or Ignore, with reputation effects. Auto-Ignore if assisting without funds. Shows "TraderName is currently docked here." plus mood. Sabotage is played as a sneaking mini-game.
- Rivals (computer-run): Zara Vex, Old Brannock, Captain Ilyx Orro, Mox Tallow. In a shared game they are shared by all captains.
- Reputation gives luck that tilts good and bad outcomes.

## 12. Gambling
One planet, popup or page, odds shown qualitatively only. Four exotic, confusing games with mood shifts. Stakes 50, 250, 1,000, 5,000. Expected return is about 0.90 to 0.96, never above 1.

## 13. Characters
- Named shopkeepers for market, bank, shipyard, fuel and cantina on every planet, plus a Real Estate agent, an Odd Jobs boss and rivals.
- Player captain generator from the entered name. Same name gives the same captain. Name sets species, hat, title, catchphrase, backstory, and a fate chart (lucky number, species, smells faintly of, destiny grade). Reroll button. Letters and vowels are counted behind the scenes (`captain.hidden`) and are not shown.
- Species: human, zorp, blorb, mothkin, bot, lizard (v1 to v4), plus squid (Tentaclid), gray (Greylien), cyclops (Monoclon), mantis (Mantoid) and stone (Gravelkin) from v5. Human, zorp, mothkin and lizard are masculine or feminine; the rest are neutral. About half of the name rolls are people and half are aliens.

## 14. Mini-games (action, Odd Jobs board)
- One play per visit. Rating Flop, Bronze, Silver or Gold. Pay as a share of net worth scale: 0, 8%, 20%, 40%. Gold gives +1 reputation.
- Crater Critters (Meridoa), Hyperlane Dash (Karth-Osu), Rock Sorter (Ferrox), Orbit Hop (Kryndor Spire), Asteroid Blaster (Nihil Station), Tractor Catch (Quellin Reach), Gate Glider (Halcyra), plus the Dock Sneak game for sabotage. All are space-themed versions of well-known arcade games (v5).
- Quitting mid-game ends it with the current score.
- Every frame is redrawn on a 320 x 200 grid and snapped to the 16 EGA colours.

## 15. Multiplayer (v3)
- 1 to 4 captains on one device. Setup screen: number of captains, race length (Quick 50,000c or Full career 150,000c), then for each captain a name, a captain portrait (reroll) and a ship.
- Everyone shares one galaxy: markets, price events, fuel prices and the computer rivals. One captain's trades move prices for the next. Facilities are exclusive per world.
- Play goes in rounds. In a round each living captain gets one visit and one jump. The fastest ship goes first (ties by seat). A "pass the controls" screen shows the round, the order, the captain's place and warp speeds, and who else is docked there. A round bar under the menu shows the order.
- The galaxy ticks (markets, price events, rivals) once per round after the last captain has jumped. Interest, damage and fees stay per captain.
- When a captain reaches the target, the round still finishes so everyone has the same number of turns. The richest captain who reached the target wins.
- A captain who runs out of credits and cargo is ruined and sits out. The rest play on. If everyone is ruined, nobody wins.
- Leaderboard on the Spaceport lists every captain and the computer rivals.

## 16. Style (v3)
- 90s adventure-game look in the vein of Day of the Tentacle, Leisure Suit Larry and King's Quest IV: VGA/EGA pixel art, hard pixels, 1-pixel black outlines, ordered dithering, no anti-aliasing.
- Everything is drawn in the 16 EGA colours (`gt-21-px.js`): scenes, shop banners, planets, the star map, ships, portraits, item icons and mini-games. Night uses the same art with a darker palette and glowing windows.
- Interface: white Sierra-style menu bar, grey bevelled windows with black outlines, yellow selection, pixel fonts, square corners, black status strip with the sentence line.
- Pages that use vector art (portraits, ships, icons) are shrunk and snapped to EGA at runtime (`PX.svg`).
- Jokes in every shop sign, line and event.

## 17. Open ideas
- Online multiplayer (each captain on their own device) with a shared game code and the same turn rules.
- Player-versus-player actions when two captains dock together (sabotage, trade, gift).
- Save and load a game.
- More mini-game variety and difficulty settings.
- Larger play area for mini-games on phones.
