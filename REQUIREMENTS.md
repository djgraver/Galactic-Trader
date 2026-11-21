# Galactic Trader: Requirements (living document)

Status: v10 built (`game/galactic-trader-10.html`, title "Galactic Trader"). Keep this file updated with every change. All requirements below must be adhered to in every build. Read this file at the start of every session.

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
- v6 (`game/galactic-trader-6.html`, build with `python3 game/gt-build6.py`; v5 is frozen as `galactic-trader-5.html`): **graphics overhaul** away from the EGA look, toward smooth 256-colour VGA painting in the spirit of Solar Winds, Descent and Homeworld. No rules, economy or layout changes. Inspiration and links are stored in the Project doc `graphics-inspiration.md`.
  - **VGA painter** (`gt-27-vga.js`). The sixteen colour roles keep their names but are now hand-picked painted colours (deep navy-black, steel, coral, gold, aqua...). When a pixel buffer goes on screen, ordered dither blocks are detected exactly (any 4x4 block that splits along the Bayer grid) and blended into smooth gradients, then an edge-keeping bilateral blur melts leftover stipple while keeping outlines and text crisp. Night still uses the darker palette and glowing windows.
  - **Vector art kept in 256 colours** (`PX.quant`): portraits, ships and icons get an airbrushed key light (top left) instead of being snapped to 16 colours. Portraits are drawn at double resolution (96x156) with thinner outlines and an extra volume pass (`PX.emboss`) so faces and shoulders read as rounded and lit.
  - **Painted ships** (`gt-28-ships.js`): four new hulls with metal gradients, panel seams, rivets, liveries and decals, glowing cockpit glass and engine flames, drawn at double pixel density (ship page, spaceport pad, pickers).
  - **Mini-games and warp** (`gt-29-mgvga.js`): 256-colour output, airbrushed highlights on balls, boxes and polygons, and a soft coloured nebula behind every starfield.
  - **Interface paint** (`gt-style6.css`, loaded last): deep-space backdrop with nebula glows and a faint cyan lattice; steel bevelled panels, gradient buttons, gunmetal picture frames with a glow, metallic menu bar and status strip, chrome title lettering. Layout is unchanged.
  - Street walls shade with a smooth side gradient instead of a banded checker; shop banners use a soft wall gradient with pilasters instead of speckle.
- v7 (`game/galactic-trader-7.html`, build with `python3 game/gt-build7.py`; v6 is frozen as `galactic-trader-6.html`). Rules live in `gt-36-v7.js`, interface in `gt-37-v7ui.js`, NPC looks in `gt-38-npc.js`, styles in `gt-style7.css`.
  - **End turn without flying** (`GT.wait`, button on the Spaceport). A day passes in port: markets tick, interest and dividends are paid, rivals trade on, day and night swap, crew wages advance. The alley, cantina and jobs board only refresh on landing somewhere new (so jobs cannot be farmed). In a shared game it passes the seat.
  - **Crew wages** (`GT.WAGE`). Every 5 to 15 turns the crew ask for pay (0.45 to 0.7 of the stage scale, minimum 100c). Paid the same turn: +2 reputation ("delighted"); paid within 2 more turns: +1. After that they **strike** (-2 reputation): no jump and no tow, only End turn, until paid. A captain whose pocket plus bank cannot cover it may plead poverty: the crew take half the pocket, -5 reputation, strike over (so there is no dead end). Shown on the Spaceport, in the status strip and on the arrival card.
  - **Money:** Odd Jobs pay 5x (`GT.JOB_PAY = [0, 0.4, 1.0, 2.0]` of the stage scale). Back-alley good outcomes pay 3x and smuggling runs pay 3x for 1.5x the stake. Shares drift up faster (0.9% a turn, was 0.55%) and pay a 0.6% dividend (was 0.25%). The Parlour returns about 96p per credit (was about 90p). Loan cap 15,000c with a **Borrow All** button.
  - **Market:** big orders move the price much less (`ELASTICITY` 0.22, was 0.35), pricey goods have deeper stock (Circuitry 80, Dark Matter 46, Artifacts 24), and the market is livelier (price noise x1.5, shortages and gluts 8.5% a turn per world, was 5%). Rivals follow a little closer (`RIVAL_FOLLOW`) because everyone earns faster.
  - **Cantina:** an encounter now happens 75% of the time (was 30%), and 4 in 10 of them are one of 14 new bar regulars shared by all worlds.
  - **Spaceport** shows the cargo hold (all seven goods with counts) and the crew panel. Layout: map and pad picture 500px wide on the left with the hold below; trip plan, crew and standings on the right.
  - **Warp screen:** three caption lines over 6.6 seconds (about 2.2 seconds each, typed faster) so they can be read; was five lines in 5.4 seconds.
  - **16:9 stage:** 1440 x 810, which is exactly 1920 x 1080 at 1.333x (was 1280 x 800, 16:10).
  - **Theme tune** "Trade Winds" (`MUSIC` in `gt-37-v7ui.js`): an original 8-bit march, two square voices, triangle bass and noise drum, synthesised with Web Audio (no files). It starts on the first click or key on the title screen (browsers block sound before that), has its own on/off button there, obeys SND, and stops at Launch.
  - **Graphics, second pass:** true colour mixes in the pixel engine (`PX.mix`, buffers are 16-bit): gradients, shading and skies are smooth paint, not dot patterns; a per-pixel pass (`PX.undither`) cleans up leftover checker and dot screens; glowing things spill light at night (`PX.bloom`); scenes get a soft vignette. The warp screen has a nebula; the hangar has a nebula backdrop, steel read-outs and cyan pointer beams.
  - **Ships redrawn** (`gt-28-ships.js`): each has its own silhouette. Wayfarer: lifting body with wing nacelles, dish and company stripe. Behemoth Barge: spine, eight containers, drive block, crane and bridge. Stargazer: needle hull, habitat ring, solar fields, big dish, blue ion drive. Cutlass Runner: blade hull, forward-swept wings, twin afterburners, shark teeth. Running lights, hull numbers and hazard paint on all.
  - **NPCs** (`gt-38-npc.js`): every shopkeeper portrait has a workplace behind them tinted by their world (vault, shelves, hangar, fuel tank, office window, ticker board, bar, notice board, parlour curtains), the clothes of the job (banker's suit, apron, overalls, hi-vis, lanyard, braces, croupier's vest), a tool of the trade (eyeshade, goggles, headset, pencil) and one or two personal marks from their name (scar, freckles, mole, tattoo, war paint, earrings, toothpick, cigar, cyber eye, bandage). Captains get a cockpit and epaulettes; rivals a silver set.
  - Balance (`gt-sim.js 40 220 human gt-5-travel.js gt-10-extras.js gt-36-v7.js`): a competent solo player now wins about 90% to 100% of games in about 53 to 64 turns without odd jobs and about 43 to 50 with them (v6: 77 to 99). The game is deliberately quicker and more generous.
  - Tests: `gtd-v7t.js` covers end turn, wages, strike, plead, Borrow All, the tune, the caption timing, the Spaceport fit and the shared-game end turn.
- v8 (`game/galactic-trader-8.html`, build with `python3 game/gt-build8.py`; v7 is frozen as `galactic-trader-7.html`): **full graphic overhaul to a late-90s space-sim look** (Descent, Wing Commander) and a **new theme tune**. No rule changes.
  - **SVGA output** (`gt-41-svga.js`): no visible pixels. Every indexed picture (streets, banners, pad, planets) is scaled up 4x with an edge-following scaler (Scale2x with a colour tolerance, twice), softened slightly and given film grain on full scenes. Vector art (portraits, goods, crowd) is rasterised at three times the old size with the airbrushed light and no palette reduction. `image-rendering` is no longer pixelated anywhere.
  - **3D ships** (`gt-40-3d.js`): a small flat-shaded, depth-sorted polygon engine (`G3`) with diffuse light, a specular glint, rim light, glowing faces and engine flames. The four ships are polygon models built from lathes, boxes and plates. They turn slowly in the hangar (live canvas; call-outs point at the projected part positions), bank through the warp screen, and appear as stills on the pad, in the pickers and in scenes. Respects reduced motion.
  - **Cockpit interface** (`gt-style8.css`): dark titanium panels with a lit edge, glowing cyan headings and amber read-outs, machined buttons, inset green-on-black input fields, monitor frames with a glass sheen around pictures, instrument-style status strip. Text colours of the older sheets are remapped to the new read-out colours when the sheets are joined (`recolor` in the build script). `gtd-contrast.js` checks every page for text too close to its background.
  - **Type**: Orbitron (headings) and Rajdhani (text), SIL Open Font License, embedded as base64 (`gt-fonts8.css`). The page no longer fetches anything from the network.
  - **Nav display** (`UI.mapSVG` in `gt-42-v8ui.js`): the star map is a vector targeting screen: nebula, grid and range rings, shaded planets with bands, glow and rings, corner brackets on the current and selected world, an animated route line.
  - **Mini-games and warp** draw at full resolution and full colour (the 320 x 200 step and palette snap are gone).
  - **Theme tune** "Deep Lanes" (`MUSIC` in `gt-42-v8ui.js`), replacing the 8-bit march: a tracker-style piece at 124 BPM in D minor with filtered saw pads and lead, octave bass, an arpeggio through an echo and a drum machine, 40 bars looping. Same controls as before (starts on the first click or key on the title screen, Theme button, SND, stops at Launch).

- v9 (`game/galactic-trader-9.html`, build with `python3 game/gt-build9.py`; v8 is frozen as `galactic-trader-8.html`): **the streets are redone as a 3D town square, with its own architecture on every world**. No rule changes.
  - **Town engine** (`TW` in `gt-43-town.js`): a small perspective renderer for low-polygon solids (boxes, tapered blocks, gable roofs, cylinders, domes, barrel vaults, lathed shapes), with flat sun shading, ground shadows by day, painted decals for windows, doors, wall textures and signs, and an emissive pass so windows, signs and lamps glow at night. The picture is drawn once per world and time of day at 1280x800 and cached (`SC.hubKey`).
  - **Layout** (`SC.town` in `gt-44-worlds.js`): every building stands on its own with clear ground around it, in two staggered rows (five slots at the back, four lower ones at the front) so nothing in front hides a door behind. Each building carries its shop name on a sign; closed ones are grey and read CLOSED or NO FUEL. The Odd Jobs board is a kiosk at the front left, lamp posts stand between buildings, and a TO SPACEPORT sign at the foot of the picture is the way out. The click areas are the outline of each building; walking, the crowd and the hover labels work as before.
  - **Seven kits** (`KIT` in `gt-44-worlds.js`): Meridoa has red barns, clapboard farmhouses with gable roofs, silos and a windmill among green fields; Karth-Osu has sandstone step pyramids, colonnades, mastabas and an obelisk in the dunes; Ferrox has a quonset shed, a saw-tooth workshop, tank farms, stacked cabins, a control tower and a pit-head on red rock; Kryndor Spire has glass towers with setbacks, a gold drum bank, neon shopfronts and a holo billboard on a neon grid; Nihil Station has hull pods, a hangar tube, a vault drum, cargo containers and the purple parlour dome on a deck in open space; Quellin Reach has white lab domes, an observatory, an igloo and a dish on pink snow; Halcyra has cone-roofed pavilions, towers and gas-bag balloons on round pads on a deck above the clouds.

- v10 (`game/galactic-trader-10.html`, build with `python3 game/gt-build10.py`; v9 is frozen as `galactic-trader-9.html`): **quests, a bar interior on every world, a fairer and livelier economy, a Defence Grid, new mini-games, turned faces, directional warp and an end report for abandoned games.**
  - **The Ninth Lane** (`GT.MAIN` in `gt-46-quests.js`): a seven-chapter main quest. It starts on any world from turn 4 (Captain Odile Marrow and her Precursor star-chart), then Karth-Osu (Archivist Quill; 8 Medical, a fee, or a forged permit for shady captains), Nihil Station (Madame Vane's vault; 15 NULL shares, 20 reputation, a card game or a price), Quellin Reach (the decoder; 4 Dark Matter and share the find, or pay to keep it secret; gives **Lane Sense**, +0.2 warp), Ferrox (a lane anchor; 10 Rations plus labour, the Reach's design if shared, or a bought anchor; gives **Lane Anchor**, +1 Defence Grid level), Halcyra (race Captain Ilyx Orro, which needs warp 1.8 or Defence Grid 2; offer to split, which makes her a gentler rival; or cut her fuel line; all burn 60 PC), and the Ark (choose **Precursor Drive** +0.5 warp, **Fold Hold** +25 cargo, or **Aegis Lattice** Defence Grid 3 and +40 PC tank, plus bullion and the title Lanefinder). Choices are flags that change later scenes, requirements and the epilogue. Each chapter opens as a dialog with the quest-giver's portrait when you land on its world; "Not now" puts it off until you open it from the QUESTS button or the hub tracker.
  - **Contracts** (`GT.makeContract`): two (three at 30+ reputation) per visit on every Odd Jobs board: haul goods to a world that imports them (paid 1.3 to 1.5 times its price), courier a parcel (takes 1 to 3 hold space), arrive holding some shares, survey a far world, or run fuel to a world without a dock. Up to three at once, delivered automatically on landing (or as soon as you buy the goods there), with deadlines; a missed or abandoned job costs 2 reputation.
  - **Guild notices** (`GT.REPQ`): one-time quests unlocked by reputation: 10+ The Guild's First Test (Guild Card: 10% off base tax everywhere), 25+ The Envoy's Pouch (two-world treaty run), 50+ The Admiralty Charter (+1 Defence Grid level), 75+ Hero of the Lanes (land on all seven worlds in 16 turns; 2% better prices everywhere); -10 or lower A Favour for the Syndicate, -30 or lower The Big Score. A failed guild quest cannot be retried.
  - **Quest screens** (`gt-47-v10ui.js`): QUESTS button in the top bar (story, jobs, guild notices, finished), a tracker panel in the hub, contracts and notices on the Odd Jobs board.
  - **Shares** (`gt-45-v10.js`): your own trades never move a share price; no fee to buy, 0.5% to sell, quotes are flat (what you see is what you pay). Prices follow the company's home market, the trade in its goods anywhere (every crate bought is a sale for the company), shortages and gluts of its goods, sector-wide news and frequent company news. Growth 1.6% a jump (was 0.9%) and dividend 0.9% a jump (was 0.6%).
  - **Market:** slightly livelier (volatility x1.6, was 1.5) but predictable. A world that imports an item (multiplier 1.15 or more, tagged "pays well") never drops much below its normal price and has a 3% chance each jump of a demand spike (x1.3 to x1.6); a world that makes an item (0.75 or less, "made here") stays cheap and sometimes dumps it (x0.58 to x0.74). Spikes and dumps are logged as rumours. Shortages now land on importers and gluts on producers.
  - **Property** costs about a fifth more (price 17 times the old benefit, was 14) and returns 2.4 times as much: brokers 3.5% each (cap 14%), depots 14% each (cap 50%), fee buildings 2.4 times the fees and earning on your current worth, fees pile up for 20 jumps. Owning property cuts tax 8% per building plus 20% on its own world (cap 75%).
  - **Crew wages** are about twice as high (0.9 to 1.4 times the stage scale, at least 250c). **Odd jobs** pay 0, 0.6, 1.5 and 3.0 times the scale (half as much again as v9). The cantina always has someone to talk to.
  - **Defence Grid:** a three-level shipyard upgrade (2,400c, then x1.85) sold at every shipyard, turning aside 45%, 70% or 90% of bad travel events. Shown on the ship page; the warp shows a blue lattice flaring round the ship.
  - **Balance** (`node game/gt-sim.js 40 220 human gt-5-travel.js gt-10-extras.js gt-36-v7.js gt-45-v10.js gt-46-quests.js`): the trading bot alone wins in a median 40 to 58 jumps by ship (v9: 53 to 64); buying offered property (FAC=1) and putting surplus into shares (STK=0.1) brings that to about 30 to 40. Quests come on top. Rival rubber-banding still keeps the race close.
  - **Cantina** (`gt-50-bars.js`): a rendered room for each world, built with the town engine: The Muddy Boot (plank saloon, barrels, hay, window on the fields), The Sand Trap (sandstone arches, rugs, urns, an arched window on the dunes), The Drill Bit (corrugated steel, pipes, hazard paint), Level 413 Lounge (black glass and neon), The Long Dark (hull plates and a round viewport on space), The Cafeteria (white tiles, vending machines, a snowy view) and The Storm Eye (an open terrace over the clouds under a striped awning). The cantina character stands behind the bar, two regulars stand by the tables, and the bar's name glows over the shelves.
  - **Faces** (`gt-49-faces.js`): portraits are turned between about 15 and 32 degrees left or right (about one in seven still faces front), following real three-quarter views: features slide toward the turn and the nose most of all, the far side narrows, only the near ear shows, the back of the skull shows on the near side, the eyes look the way the head turns. Street sprites and the small HUD face still face front.
  - **Market table:** one grid for the header and the rows, so Goods, Price, Stock, Trend, Buy, Qty and Sell sit over their columns.
  - **Warp** (`gt-48-flight.js`): the star streaks pour out of the direction of travel on the star map, the ship turns to face that way (with a heading compass), the world you left slides away behind and the next grows from the vanishing point. The ship's computer lines come from pools (departures, chatter, trouble, good news, the Defence Grid, dodges, arrivals) and are not repeated until a pool runs dry. Only real travel events interrupt the warp; interest, dividends and rumours go on the arrival card (top five, the rest in the log).
  - **Mini-games** (`gt-51-mg10.js`): all eight redrawn at twice the resolution as lit, glowing space scenes with particles and scrolling star layers, your own 3D ship flying Hyperlane Dash (now a perspective warp tunnel), Asteroid Blaster and Gate Glider. Gate Glider's gates now follow a flying line and its rock clusters keep off it. Goals (Bronze/Silver/Gold): Crater Critters 130/300/495, Hyperlane Dash 220/450/720, Rock Sorter 110/260/435, Orbit Hop 40/95/150, Asteroid Blaster 140/340/570, Tractor Catch 140/340/570, Gate Glider 110/230/370; checked with skill-modelled bots (`node game/gt-mgsim.js`, bots in `gt-mgbots.js`) so a great run reaches Gold.
  - **End report:** tabbed, one tab per captain, with quest, contract, wage and Defence Grid stats. NEW during a game now shows the report first ("Voyage abandoned"), with Back to the voyage or Start a new game.
  - Tests: `node game/gtq-test.js` (quest and economy engine), `gtd-quests.js`, `gtd-warp.js`, `gtd-bars.js`, `gtd-faces.js`, `gtd-mg10.js`, `gtd-towns.js`, plus the earlier suite.

## 1. Platform and delivery
- Browser game in a single self-contained HTML file (`game/galactic-trader-4.html`). Locked to a 1440 x 810 (16:9, 1080p at 1.333x; v7) stage that is scaled to fit the window and centred on black, so an ultrawide monitor gets black side bars and never scrolls. Below about 700px wide the stage turns fluid for phones.
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
- Planet tax reduced by facilities (v10: 8% per facility owned, extra 20% if one is on this planet, cap 75%) and by reputation (up to 40% off, penalty when negative).
- Trades are logged in detail, including tax and discount, and the credits saved.
- Fuel cost per jump = ceil(distance x 0.5 / sqrt(effective speed)). Emergency tow (400c) when stranded.
- Balance verified by simulation (`game/gt-sim.js`, `game/gt-sim-multi.js`): a competent solo player wins in about 76 to 86 jumps (median 79). Mini-game income shortens this by about 10% for good play and about 20% for perfect play. The Quick race (50,000c) takes about 48 jumps. Re-run both simulators after any economy change.
- Shared markets (multiplayer): markets are deepened by 60% for every extra captain, so a 2-captain game takes about 82 rounds and a 4-captain game about 87 rounds, close to solo. Without that, four captains emptying the same shelves stretch a game to about 147 rounds.

## 6. Market
- Buy, Max, quantity field, Sell, All buttons. Greyed out when unavailable.
- Value fields reset to 0 or 1 after each transaction or jump.

## 7. Bank
- Two separate counters. Savings: deposit and withdraw with value fields plus Deposit All and Withdraw All; pays 0.75% every jump. Loans: Take Loan is 1,000c per click or Borrow All, cap 15,000c (v7); repay with a value field or Repay All; costs 1.25% every jump.

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
- Seek Encounter (Cantina): always someone to talk to (v10; v7 was 75%, earlier 30%), plus a shared pool of bar regulars, a unique named character per planet, at least 10 outcomes, once per visit.
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
- One play per visit. Rating Flop, Bronze, Silver or Gold. Pay as a share of net worth scale: 0, 0.6, 1.5 and 3.0 times the scale (v10). Gold gives +1 reputation.
- Crater Critters (Meridoa), Hyperlane Dash (Karth-Osu), Rock Sorter (Ferrox), Orbit Hop (Kryndor Spire), Asteroid Blaster (Nihil Station), Tractor Catch (Quellin Reach), Gate Glider (Halcyra), plus the Dock Sneak game for sabotage. All are space-themed versions of well-known arcade games (v5).
- Quitting mid-game ends it with the current score.
- v10: drawn at 1280 x 800 (logic on a 640 x 400 field), lit space art with particles; see the v10 change log for goals.

## 15. Multiplayer (v3)
- 1 to 4 captains on one device. Setup screen: number of captains, race length (Quick 50,000c or Full career 150,000c), then for each captain a name, a captain portrait (reroll) and a ship.
- Everyone shares one galaxy: markets, price events, fuel prices and the computer rivals. One captain's trades move prices for the next. Facilities are exclusive per world.
- Play goes in rounds. In a round each living captain gets one visit and one jump. The fastest ship goes first (ties by seat). A "pass the controls" screen shows the round, the order, the captain's place and warp speeds, and who else is docked there. A round bar under the menu shows the order.
- The galaxy ticks (markets, price events, rivals) once per round after the last captain has jumped. Interest, damage and fees stay per captain.
- When a captain reaches the target, the round still finishes so everyone has the same number of turns. The richest captain who reached the target wins.
- A captain who runs out of credits and cargo is ruined and sits out. The rest play on. If everyone is ruined, nobody wins.
- Leaderboard on the Spaceport lists every captain and the computer rivals.

## 16. Style (v8)
- Late-90s space sim (Descent, Wing Commander): smooth SVGA pictures, real polygon ships, a dark cockpit interface with glowing read-outs, techno type. v3 to v5 were 16-colour EGA, v6 and v7 256-colour VGA pixel art.
- Scenes are still painted from 16 colour roles and true mixes in small buffers (`gt-21-px.js`, `gt-27-vga.js`), then scaled and smoothed by `gt-41-svga.js`. Night uses a darker palette, glowing windows and bloom.
- Ships are 3D models (`gt-40-3d.js`); characters and goods are vector art rendered smooth; the star map is vector.
- Jokes in every shop sign, line and event.

- v9 streets: each world's town is a 3D-rendered square of free-standing buildings in that world's own architecture (see the v9 change log). New buildings must stay separate from their neighbours, carry a readable sign, and match the kit of their world.

- v10: bar interiors use the same town engine (camera moved with `TW.setCam`). Quest dialogs show the giver's portrait large beside the scene and the choices as full-width buttons with their cost and any reason they are locked.

## 17. Open ideas
- Online multiplayer (each captain on their own device) with a shared game code and the same turn rules.
- Player-versus-player actions when two captains dock together (sabotage, trade, gift).
- Save and load a game.
- More mini-game variety and difficulty settings.
- Larger play area for mini-games on phones.
