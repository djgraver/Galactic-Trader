# Galactic Trader: Requirements (living document)

Status: v2 "Galactic Trader Deluxe" built. Keep this file updated with every change. All requirements below must be adhered to in every build.

## Change log
- v1: Four-column browser game built from the original Google Doc. Published and approved ("plays well").
- v2 Deluxe: 90s point-and-click comedy restyle. Locations replace the four columns. Added characters, name-based captain generator, flight screens, action mini-games, Day/Night theme.

## 1. Platform and delivery
- Browser game in a single self-contained HTML file. Works on desktop and phone width, with no horizontal page scroll.
- Source is split into parts concatenated by a build script into one file. Engine is Node-testable.
- Fonts from Google Fonts with fallbacks. Sound via WebAudio, off until the player interacts, mutable.
- Theme: Day or Night, following the device or host setting by default, switchable in game. (Replaces the v1 dark/light selector.)

## 2. Goal and rules
- Win: reach 150,000 credits of net worth (credits + bank - loan).
- Lose: credits at 0 or less with no cargo. Win and lose are checked only at the end of a jump.
- Start: 2,500 credits, chosen ship, start planet Kryndor Spire.
- End screen shows detailed stats: items bought and sold, spend and earnings per item, tax paid, tax discount from reputation and facilities, broker edge, gains and losses from events, interest earned and paid, rival fees, odd job earnings, gambling net, jumps, events, explores, encounters, fuel bought, tows, facilities, upgrades, sabotage attempts, rivals assisted, reputation now/peak/low.
- Info (?) popup explains resources, mechanics and win/lose.

## 3. Items (7)
Rations, Metals, Medical, Spices, Circuitry, Dark Matter, Artifacts. Base prices 24, 52, 95, 160, 260, 460, 780. Each has a market depth (400, 260, 160, 100, 72, 40, 20).

## 4. Planets (7 types, one each)
Agrarian (Meridoa), Megacity (Kryndor Spire), Mining (Ferrox), Science (Quellin Reach), Gas Giant (Halcyra), Void Station (Nihil Station), Ruin (Karth-Osu).
- Tax per planet: 3%, 6.5%, 4%, 7%, 1.5%, 4%, 4% (varies by planet).
- Fuel sold on about half the planets (Ferrox, Kryndor Spire, Nihil Station, Halcyra).
- Ship upgrades sold only on some planets.
- Exactly one gambling planet (Nihil Station), mentioned in its description.
- Each planet has a description, a street scene, and its own cast of shopkeepers.

## 5. Economy (the crux)
- Price = base x planet multiplier x supply factor x shocks. Producers are cheap, consumers pay more. Buy on one side of the map, sell on the other.
- Buying and selling move the price and stock per unit. Stock drifts back toward target.
- Random market modifiers (shortage, glut, festival, scandal).
- Trend arrow shown for about 75% of items, "?" for the rest.
- Planet tax reduced by facilities (5% per facility owned, extra 12% if one is on this planet, cap 60%) and by reputation (up to 40% off, penalty when negative).
- Trades are logged in detail, including tax and discount, and the credits saved.
- Fuel cost per jump = ceil(distance x 0.5 / sqrt(effective speed)). Emergency tow (400c) when stranded.
- Balance verified by simulation: a competent player wins in roughly 77 to 108 jumps. Mini-game income shortens this by about 10% for good play and about 20% for perfect play. Re-run the simulation after any economy change.

## 6. Market
- Buy, Max, quantity field, Sell, All buttons. Greyed out when unavailable.
- Value fields reset to 0 or 1 after each transaction or jump.

## 7. Bank
- Deposit interest 3%, loan interest 5%, applied every 4 jumps.
- Take Loan: static 1,000c per click, loan cap 10,000c. Repay with a value field. Deposit and withdraw with value fields.

## 8. Ships (5, named, with stats)
Wayfarer, Gnat, Barge, Stargazer, Cutlass. Each has cargo, warp speed, fuel capacity (PC), and a description. Chosen on the start screen with name entry and a Launch button.

## 9. Travel
- Star map: black starry background, current planet larger and bold, selected destination line, trip summary (distance, fuel, turns), fuel warning, Jump button.
- Travel events about 30% of jumps, at least 20 types (26 built). "Departed" and "Arrived" logged.
- Flight transition screen for every jump: liftoff, warp, any event as a comic card, arrival splash. Skippable.
- Flight log: newest first, "[Turn x]", green for gains, red for losses, verbose and colourful, scrollable with a limited display (60 lines) and a full log page.

## 10. Locations (v2)
Each planet street has clickable buildings. The player's captain walks to the place, then it opens as a full page with a shopkeeper who talks.
- Market, Bank, Shipyard (upgrades: cargo, speed, fuel, where offered; a fuel upgrade adds empty space), Fuel Dock (where sold), Cantina, Back Alley, Property Booth, Odd Jobs board, Launch Pad (star map), Parlour of Thin Hours (gambling planet only).
- Closed buildings are shown as closed where a planet lacks them.
- A sentence line at the bottom describes what is under the pointer.

## 11. Events and encounters
- Explore (Back Alley): about 25% chance of an event, at least 10 outcomes per planet, once per visit.
- Seek Encounter (Cantina): about 30%, a unique named character per planet, at least 10 outcomes, once per visit.
- Facilities offered about 20% on arrival (Broker, Depot, Factory, Warehouse, Hotel). Price about 20 times the benefit. Raises reputation. Can be bought after selling cargo.
- Rival events about 20% when a rival is docked: Sabotage, Assist or Ignore, with reputation effects. Auto-Ignore if assisting without funds. Shows "TraderName is currently docked here." plus mood. Sabotage is played as a sneaking mini-game.
- Rivals: Zara Vex, Old Brannock, Captain Ilyx Orro, Mox Tallow.
- Reputation gives luck that tilts good and bad outcomes.

## 12. Gambling
One planet, popup or page, odds shown qualitatively only. Four exotic, confusing games with mood shifts. Stakes 50, 250, 1,000, 5,000. Expected return is about 0.90 to 0.96, never above 1.

## 13. Characters
- Named shopkeepers for market, bank, shipyard, fuel and cantina on every planet, plus an Odd Jobs boss and rivals.
- Player captain generator from the entered name. Same name gives the same captain. Name sets species, hat, title, catchphrase, backstory, and a fate chart. Reroll button.
- Species: human, zorp, blorb, mothkin, bot, lizard.

## 14. Mini-games (action, Odd Jobs board)
- One play per visit. Rating Flop, Bronze, Silver or Gold. Pay as a share of net worth scale: 0, 8%, 20%, 40%. Gold gives +1 reputation.
- Pest Panic (Meridoa), Tomb Dash (Karth-Osu), Ore Sorter (Ferrox), Skybus Scramble (Kryndor Spire), Junk Blaster (Nihil Station), Quantum Catch (Quellin Reach), Cloud Skimmer (Halcyra).
- Quitting mid-game ends it with the current score.

## 15. Style
- 90s point-and-click comedy in the vein of Day of the Tentacle: thick ink outlines, bright palettes, wonky buildings, jokes in every shop sign, line and event.

## 16. Open ideas
- Save and load a game.
- Hot-reload state for open viewers on republish.
- More mini-game variety and difficulty settings.
- Larger play area for mini-games on phones.
