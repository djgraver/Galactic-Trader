/* Galactic Trader Deluxe. Part 16: title screen and character generator, plus the pop-up sheets (help, rivals, ending). */
function openModal(html, wide) { var m = $('modal'); m.innerHTML = '<div class="sheet' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>'; m.hidden = false; var b = m.querySelector('button'); if (b) b.focus({ preventScroll: true }); }
function closeModal() { $('modal').hidden = true; $('modal').innerHTML = ''; }


/* ---------- the catch-phrase under the title: a different one every time ---------- */
var TAGS = ['Dark Matter? Ain\'t no matter to me.', 'Warp speed, Jim!', 'Buy low. Sell high. Panic in between.', 'It\'s not smuggling if nobody checks.', 'Space: the final frontier, and the final invoice.',
  'Live long and prosper. Prosper first.', 'My other ship is also overdue.', 'May the fares be with you.', 'To infinity, and a reasonable markup!', 'Houston, we have a profit.',
  'One small step for man, one giant leap for the tax man.', 'Don\'t panic. Do invoice.', 'Out of fuel, out of luck, out of excuses.', 'All your cargo are belong to us.', 'Make it so. Then make it cost more.',
  'The cargo is out there.', 'Resistance is futile. Interest is compound.', 'I find your lack of margin disturbing.', 'Never tell me the odds. Tell me the exchange rate.', 'Ask not what your cargo can do for you.',
  'Beam me up, I\'m over the weight limit.', 'A long time ago, in a galaxy far away, someone overcharged me.', 'Space is big. Prices are bigger.', 'The stars are a limit, but the tax is a ceiling.', 'Engage. Haggle. Repeat.',
  'It is a truth universally acknowledged that a trader in possession of crates must be in want of buyers.', 'Fortune favours the bold. Dividends favour the patient.', 'Wormholes: the cheap seats of the universe.', 'Dock, shop, flee.',
  'Not all who wander are lost. Some are carrying spices.', 'Trust me, I\'m a captain.', 'I came, I saw, I upsold.', 'To boldly sell what no one has sold before.', 'Gravity is a suggestion. Debt is forever.',
  'Hull integrity: optimistic.', 'Fuel is for the weak. Credit is for the brave.', 'Roads? Where we\'re going we need receipts.', 'Moon landing? I prefer moon selling.', 'Carry on, Captain. Carry more.',
  'If it\'s not on fire, it\'s underpriced.', 'Today\'s special: everything, at a premium.', 'Never gamble with a Void Station dealer. Gamble anyway.', 'Rise and shine, merchants!', 'There is no such thing as a free launch.',
  'Aim high. Load higher.', 'Where no trader has gone before, there\'s probably a toll.', 'Quantum leap of faith, classic markup.', 'The galaxy is your oyster. Please pay for the oyster.', 'Hello, void. It\'s me, your bank balance.'];
var TAGT = ['{I}? Ain\'t no {i} to me.', '{I} today, gone tomorrow.', 'Have {i}, will travel.', 'Nobody ever got rich selling less {i}.', 'Keep calm and corner the {i} market.', 'It\'s always {i} season somewhere.',
  'Next stop: {P}. Probably.', 'What happens on {P} stays on {P}, except the invoice.', '{P} or bust. Mostly bust.', 'I left my heart on {P} and my wallet on {Q}.', 'If you can read this, you are not on {P}.',
  'A fool and his {i} are soon parted.', 'Hot {i}! Get your hot {i}!'];
function tagline() {
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; }, t, item, pl, pl2;
  if (Math.random() < 0.28) {
    item = pick(GT.ITEMS).name; pl = pick(GT.PLANETS).name; pl2 = pick(GT.PLANETS).name;
    t = pick(TAGT).replace(/\{I\}/g, item).replace(/\{i\}/g, item.toLowerCase()).replace(/\{P\}/g, pl).replace(/\{Q\}/g, pl2);
  } else t = pick(TAGS);
  return t;
}

var SILLY = ['Barnaby Spudwick', 'Zelda Fizzlebottom', 'Gus', 'Mildred Quark', 'Nebula Nan', 'Doctor Chaos', 'Pixel', 'Bartholomew Void', 'Zorg', 'Mabel Thruster', 'Kevin', 'Captain Biscuit', 'Wanda Warp', 'Fig', 'Lord Gerald', 'Tilly Tentacle'];

/* ---------- setup: one to four captains ---------- */
function setupInit() { ui.setup = { n: 1, cur: 0, target: 150000, p: [0, 1, 2, 3].map(function () { return { name: '', salt: 0, ship: 'wayfarer' }; }) }; }
function sp() { return ui.setup.p[ui.setup.cur]; }
function capOf(p, k) { return CH.fromName(p.name || 'Captain ' + (k + 1), p.salt); }
function capCard() {
  var c = capOf(sp(), ui.setup.cur);
  return UI.portrait(c) + '<div class="cn">' + esc(c.name) + '</div><div class="cj" style="font-size:9px;color:var(--orange);font-family:var(--display)">' + esc(c.title) + '</div>' +
    '<p style="margin:6px 0;font-style:italic;font-size:13px">&ldquo;' + esc(c.catch) + '&rdquo;</p><p style="margin:0 0 8px;font-size:12px;text-align:left">' + esc(c.story) + '</p><div class="fate" style="text-align:left">' + c.fate.map(function (r) { return '<span>' + r[0] + '</span><b>' + esc(String(r[1])) + '</b>'; }).join('') + '</div>';
}
function refreshCap() { var el = $('capcard'); if (el) el.innerHTML = capCard(); var tb = $('rost-' + ui.setup.cur); if (tb) tb.innerHTML = rosterBtn(ui.setup.cur); PX.hydrate(document); }
function rosterBtn(k) { var p = ui.setup.p[k], c = capOf(p, k); return '<span class="rn">' + (k + 1) + '</span><span class="rp">' + UI.portrait(c) + '</span><span class="rt"><b>' + esc(p.name || 'Captain ' + (k + 1)) + '</b><i>' + esc((GT.SHIPS.filter(function (x) { return x.id === p.ship; })[0] || {}).name || '') + '</i></span>'; }

function renderStart() {
  if (!ui.setup) setupInit();
  var st = ui.setup, cur = sp(), mx = { cargo: 75, speed: 2.2, fuel: 190 }, h = '<div class="in"><div><div class="mega">Galactic Trader</div><button class="sub tagbtn" id="tagline" data-act="tag" data-label="Click for another catch-phrase">&ldquo;' + esc(ui.tag || (ui.tag = tagline())) + '&rdquo;</button></div>';
  h += '<div class="panel setup"><div class="seg"><span class="lab">Captains</span>';
  for (var n = 1; n <= GT.MAX_PLAYERS; n++) h += '<button class="chipbtn" data-act="players-' + n + '" aria-pressed="' + (st.n === n) + '">' + n + '</button>';
  h += '</div><div class="seg"><span class="lab">Race to</span>';
  GT.TARGETS.forEach(function (tg) { h += '<button class="chipbtn wide" data-act="target-' + tg.win + '" data-label="' + esc(tg.blurb) + '" aria-pressed="' + (st.target === tg.win) + '">' + tg.name + ' ' + fmt(tg.win) + 'c</button>'; });
  h += '</div></div>';
  if (st.n > 1) {
    h += '<div class="roster" role="tablist" aria-label="Captains">';
    for (var k = 0; k < st.n; k++) h += '<button class="rost" id="rost-' + k + '" data-act="cap-' + k + '" aria-pressed="' + (k === st.cur) + '" role="tab">' + rosterBtn(k) + '</button>';
    h += '</div>';
  }
  h += '<div class="creator"><div class="cast"><div class="card" id="capcard">' + capCard() + '</div></div><div style="display:flex;flex-direction:column;gap:14px;min-width:0">';
  h += '<div class="panel" style="color:var(--fg)"><h3 class="hd">' + (st.n > 1 ? 'Captain ' + (st.cur + 1) + ': who are you?' : 'Who are you?') + '</h3><div class="row" style="justify-content:flex-start"><input id="in-name" type="text" maxlength="20" placeholder="Type your name" value="' + esc(cur.name) + '" autocomplete="off" aria-label="Captain name" style="flex:1;min-width:160px"><button class="btn gold" data-act="randname">Random</button><button class="btn pink" data-act="reroll" data-label="Reroll your look">Reroll look</button></div><p class="dim" style="margin:6px 0 0;font-size:12px">Your name decides your species, hat, title and destiny. The same name always makes the same captain, unless you reroll.</p></div>';
  h += '<div class="panel" style="color:var(--fg)"><h3 class="hd">Pick your ship</h3><div class="ships" role="group" aria-label="Choose your ship">';
  GT.SHIPS.forEach(function (sh) {
    function m(l, v, k) { return '<span>' + l + '</span><span class="bar"><i style="width:' + Math.round(v / mx[k] * 100) + '%"></i></span><span>' + (k === 'speed' ? v.toFixed(1) : v) + '</span>'; }
    h += '<button class="ship" data-act="pick-' + sh.id + '" aria-pressed="' + (cur.ship === sh.id) + '"><div>' + UI.shipPic(sh.id, sh.hue, 64, 40, 2) + '</div><div class="sn">' + esc(sh.name) + '</div><div class="mini">' + m('Cargo', sh.cargo, 'cargo') + m('Speed', sh.speed, 'speed') + m('Fuel', sh.fuel, 'fuel') + '</div><div class="spd">' + speedBlurb(sh.speed) + '</div><div class="sd">' + esc(sh.desc) + '</div></button>';
  });
  h += '</div><p class="dim" style="margin:8px 0 0;font-size:12px"><b>Speed</b> cuts fuel burn, lets you outrun trouble on the road' + (st.n > 1 ? ' and decides who moves first each round' : '') + '.</p></div><div class="row" style="justify-content:space-between"><span class="dim" style="color:#cfc3ff;font-size:13px;max-width:520px">' + (st.n > 1 ? 'Pass the device between captains. All of you trade the same markets, so every sale moves prices for the rest. First to ' + fmt(st.target) + 'c wins the race (the round finishes first).' : 'Visit the market, the bank, the shipyard and more. Take odd jobs for pocket money. Reach ' + fmt(st.target) + ' credits before the dark swallows your last coin.') + '</span><button class="btn big pink" data-act="launch" style="font-size:34px;height:56px">Launch!</button></div></div></div></div>';
  var el = $('start'); el.innerHTML = h; el.hidden = false; el.scrollTop = 0; PX.hydrate(el);
}

function infoHTML() { var WIN = fmt(GT.CFG.WIN); return '<h2>How to play</h2>' +
  '<h4>The goal</h4><p>Build your fortune to <b>' + WIN + ' credits</b>. Your wealth is your credits plus your bank deposit, minus any loan. You lose if you have <b>zero or fewer credits and an empty hold</b>. Both are checked only when a planet jump finishes, so a bad day is not final until you jump.</p>' +
  '<h4>Visiting places</h4><p>Every world has a street. Click a building to walk there: the <b>Market</b> to trade, the <b>Bank</b> for deposits and loans, the <b>Shipyard</b> for upgrades (some worlds only), the <b>Fuel Dock</b> (about half the worlds), the <b>Cantina</b> to seek an encounter, the <b>Back Alley</b> to explore, the <b>Real Estate</b> office for facility offers, the <b>Odd Jobs</b> board for action mini-games, and the <b>Launch Pad</b> to pick a world and jump. Right-click a building (or press and hold) to look at it.</p>' +
  '<h4>Resources</h4><ul><li><b>Credits (c):</b> the cash you carry. The bank holds the rest.</li><li><b>Fuel (PC):</b> every jump burns fuel. Faster engines burn less.</li><li><b>Cargo:</b> seven goods: Rations, Metals, Medical, Spices, Circuitry, Dark Matter and Artifacts. Your hold has a fixed size.</li><li><b>Reputation:</b> grows when you buy facilities, sabotage rivals successfully, help them, and win Gold at odd jobs. It cuts your tax and tilts luck toward good outcomes. It falls when you are caught or fail.</li></ul>' +
  '<h4>Trading</h4><ul><li>Each world makes some goods cheaply, so their price is low there. Buy where a good is abundant and sell on the far side of the map, where it is scarce.</li><li>Buying drains stock and raises the price. Selling floods the market and lowers it. Markets slowly recover, and random shortages and gluts also move them.</li><li>The trend shows today\'s price against the item\'s base price. About one item in four has no report, shown as a question mark.</li><li>Every trade is taxed. Facilities and reputation reduce the rate.</li></ul>' +
  '<h4>Travel, events and encounters</h4><ul><li>Pick a world on the Launch Pad map and press Jump. Roughly 3 trips in 10 meet an event on the way.</li><li>On each visit you may <b>Explore</b> the alley once and <b>Seek an Encounter</b> at the cantina once. Each world has its own characters.</li><li>A bigger fuel tank starts empty. Stuck without the fuel for any jump? A tug will drag you to a fuel dock, for a fee.</li></ul>' +
  '<h4>Odd jobs</h4><p>Each world has one action mini-game, playable once per visit. Your rating (Flop, Bronze, Silver, Gold) sets a small payout that grows with your wealth. Gold also earns a point of reputation. It is pocket money, not a business plan.</p>' +
  '<h4>Facilities</h4><p>About 1 trip in 5 brings an offer to buy a facility on the world you reach. It stands while you are docked, so sell cargo first if you need the money. Brokers improve trades, depots cut fuel costs, and factories, warehouses and hotels collect fees from rivals. A facility costs about 20 times the benefit it brings per jump, and owning one raises your reputation.</p>' +
  '<h4>Bank</h4><p>Deposits earn 3% and loans cost 5%. Interest is added every 4 jumps. You can take a loan of 1,000c at a time.</p>' +
  '<h4>Rivals</h4><p>Four rival traders roam the map. When you share a world with one, you may get to <b>Sabotage</b> (a sneaky mini-game), <b>Assist</b> or <b>Ignore</b> them.</p>' +
  '<h4>Gambling</h4><p>One world runs a strange parlour. Nobody explains the rules, and the odds are only described in words. The house keeps an edge in the long run.</p>' +
  '<h4>Speed</h4><p>Your ship\'s <b>warp speed</b> does four jobs. <b>Fuel:</b> every jump burns less fuel, in proportion to the square root of speed. <b>Dodging:</b> each 0.1 of warp above 0.9 gives a 2.5% chance to outrun a bad event on the road (up to 45%). <b>Turn order:</b> in a shared game the fastest ship moves first each round, so it gets the first pick of the markets. <b>Getaway:</b> quick ships sabotage rivals more cleanly. Engine damage cuts warp for a few jumps, and the Warp Engine upgrade adds 0.2.</p>' +
  '<h4>Day and Night</h4><p>Each time you land, the sun is either up or down. It is only for atmosphere. SND turns the beeps on or off.</p>' +
  '<h4>Two to four captains</h4><p>Captains take turns in rounds on one shared device. Everyone trades the same markets, so one captain\'s big sale moves the price for the next. A round is one visit and one jump for each captain, fastest ship first. Only one captain can own the facility on any given world. When someone reaches the target, the round finishes, and the richest captain wins. A captain who runs out of credits and cargo is out of the race.</p>' +
  '<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Got it</button></div>'; }

function compModal() {
  var pe = S.pending, c = S.comps[pe.ci], r = NP.rival(pe.ci), nw = GT.networth(S), att = c.wealth > nw * 1.3 ? 'They look you over with open scorn.' : c.wealth < nw * 0.7 ? 'They watch you with careful, hungry respect.' : 'They give you a polite and professional nod.';
  openModal('<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:120px;flex:none;background:var(--paper);border:4px solid var(--ink);border-radius:14px;padding:4px">' + UI.portrait(r) + '</div><div style="min-width:0"><h2>A rival at the dock</h2><p><b>' + esc(c.name) + '</b>, ' + esc(c.title) + ', is currently docked here. They are ' + pe.mood + '. ' + att + '</p><p class="dim" style="font-size:13px;margin-top:4px">Their ship: cargo ' + c.cargo + ', warp ' + c.speed.toFixed(1) + '.</p></div></div>' +
    '<div class="acts"><button class="btn pink" data-act="comp-sabotage">Sabotage</button><button class="btn green" data-act="comp-assist">Assist (about ' + fmt(GT.compAssistCost(S)) + 'c or some fuel)</button><button class="btn blue" data-act="comp-ignore">Ignore</button></div>' +
    '<p class="dim" style="font-size:12px">Sabotage is a sneaky mini-game: the better you do, the better the odds. If you cannot afford to assist, you will ignore them instead.</p>');
}

function endModal(seat) {
  var G0 = G, win = G0.over, multi = G0.multi; if (seat === undefined) seat = win && win.winner >= 0 ? win.winner : S.seat;
  var P = G0.players[seat], o = P.over, st = P.stats, h = '', why;
  if (multi) {
    var top = win.winner >= 0 ? G0.players[win.winner] : null;
    h += '<h2 class="' + (top ? 'win' : 'lose') + '">' + (top ? esc(top.name) + ' wins the race!' : 'Everyone is ruined!') + '</h2><p class="dim" style="margin:0 0 6px">' + (top ? 'After ' + win.round + ' rounds, ' + esc(top.name) + ' finished richest and reached the target of ' + fmt(G0.target) + 'c.' : 'Nobody has a credit or a crate left. The cantinas are very quiet.') + '</p>';
    h += '<table class="stand"><tr><th>#</th><th>Captain</th><th>Ship</th><th class="r">Jumps</th><th class="r">Worth</th></tr>';
    GT.standings(G0).forEach(function (p, k) { var sh = GT.SHIPS.filter(function (x) { return x.id === p.shipId; })[0]; h += '<tr class="' + (p.seat === seat ? 'me' : '') + '"><td>' + (k + 1) + '</td><td><button class="linkbtn" data-act="endp-' + p.seat + '">' + esc(p.name) + '</button>' + (top && p === top ? ' &#9733;' : '') + (p.over && !p.over.won ? ' <span class="bad">ruined</span>' : '') + '</td><td>' + esc(sh.name) + '</td><td class="r">' + p.stats.jumps + '</td><td class="r">' + fmt(GT.networth(p)) + 'c</td></tr>'; });
    h += '</table><div class="dim" style="font-size:12px;margin:4px 0 8px">Click a captain\'s name for their full report card.</div>';
    why = o ? o.why : 'Still trading when the race ended, with ' + fmt(GT.networth(P)) + ' credits.';
    h += '<h3 class="hd" style="margin-top:6px">' + esc(P.name) + '</h3>';
    h += '<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:110px;flex:none">' + UI.portrait(P.char) + '</div><p><b>' + esc(P.name) + '</b>, ' + esc(P.char.title) + ', after <b>' + st.jumps + ' jumps</b>. ' + esc(why) + '</p></div>';
  } else {
    h += '<h2 class="' + (o.won ? 'win' : 'lose') + '">' + (o.won ? 'You made your fortune!' : 'You are ruined!') + '</h2><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:110px;flex:none">' + UI.portrait(P.char) + '</div><p><b>' + esc(P.name) + '</b>, ' + esc(P.char.title) + ', after <b>' + st.jumps + ' jumps</b> (turn ' + o.turn + '). ' + esc(o.why) + '<br><i class="dim">' + (o.won ? 'The ' + esc(P.char.title) + ' is now insufferable at parties.' : 'The ' + esc(P.char.title) + ' will be remembered, mostly as a warning.') + '</i></p></div>';
  }
  var tb = 0, ts = 0, sp = 0, er = 0;
  h += '<h4>Goods traded</h4><div style="overflow-x:auto"><table><tr><th>Item</th><th class="r">Bought</th><th class="r">Spent</th><th class="r">Sold</th><th class="r">Earned</th></tr>';
  GT.ITEMS.forEach(function (it, i) { tb += st.bought[i]; ts += st.sold[i]; sp += st.spent[i]; er += st.earned[i]; h += '<tr><td>' + it.name + '</td><td class="r">' + st.bought[i] + '</td><td class="r">' + fmt(st.spent[i]) + 'c</td><td class="r">' + st.sold[i] + '</td><td class="r">' + fmt(st.earned[i]) + 'c</td></tr>'; });
  h += '<tr><td><b>Total</b></td><td class="r"><b>' + tb + '</b></td><td class="r"><b>' + fmt(sp) + 'c</b></td><td class="r"><b>' + ts + '</b></td><td class="r"><b>' + fmt(er) + 'c</b></td></tr></table></div>';
  function r(a, b, cls) { return '<div class="row"><span class="dim">' + a + '</span><b class="num ' + (cls || '') + '">' + b + '</b></div>'; }
  h += '<div class="cols2"><div><h4>Money</h4>' + r('Final net worth', fmt(GT.networth(P)) + 'c') + r('Peak net worth', fmt(st.peak) + 'c') + r('Tax paid', fmt(st.tax) + 'c') + r('Tax discount from reputation', fmt(st.taxSavedRep) + 'c', 'good') + r('Tax discount from facilities', fmt(st.taxSavedFac) + 'c', 'good') + r('Broker price edge', fmt(st.brokerEdge) + 'c', 'good') + r('Gained from events', fmt(st.eventGain) + 'c', 'good') + r('Lost to events', fmt(st.eventLoss) + 'c', 'bad') + r('Bank interest earned', fmt(st.interestEarned) + 'c', 'good') + r('Loan interest paid', fmt(st.interestPaid) + 'c', 'bad') + r('Rival fees collected', fmt(st.feeIncome) + 'c', 'good') + r('Odd job earnings', fmt(st.jobGain) + 'c', 'good') + r('Gambling net', (st.gambleNet >= 0 ? '+' : '-') + fmt(Math.abs(st.gambleNet)) + 'c', st.gambleNet >= 0 ? 'good' : 'bad') + '</div>' +
    '<div><h4>Journey</h4>' + r('Jumps made', st.jumps) + r('Events met on the road', st.events) + r('Worlds explored', st.explores) + r('Encounters sought', st.encounters) + r('Odd jobs done', st.jobs + ' (' + st.jobGold + ' Gold)') + r('Fuel bought', st.fuelBought + ' PC for ' + fmt(st.fuelSpent) + 'c') + r('Tows needed', st.tows) + r('Facilities bought', st.facilitiesBought + ' (' + GT.facCount(P) + ' kept)') + r('Spent on ship upgrades', fmt(st.upgradesSpent) + 'c') + r('Sabotage attempts', st.sabotage + ' (' + st.sabotageWon + ' worked)') + r('Rivals assisted', st.assists) + r('Hazards outrun', st.evaded || 0) + r('Reputation', P.rep + ' now, peak ' + st.repPeak + ', low ' + st.repLow) + r('Gambling rounds', st.gambleRounds) + '</div></div>';
  h += PORT.stats(P);
  openModal(h + '<div class="row" style="justify-content:flex-end"><button class="btn blue" data-act="close">Look around</button><button class="btn pink" data-act="new">Play again</button></div>', true); PX.hydrate($('modal'));
}

/* ---------- hot-seat: pass the device ---------- */
function orderHTML() {
  return '<ol class="order">' + G.order.map(function (k) { var p = G.players[k], sh = GT.SHIPS.filter(function (x) { return x.id === p.shipId; })[0]; return '<li class="' + (p === S ? 'now' : '') + '"><b>' + esc(p.name) + '</b> <span class="dim">' + esc(sh.name) + ', warp ' + GT.effSpeed(p).toFixed(1) + '</span></li>'; }).join('') + '</ol>';
}
function passScreen() {
  var el = $('pass'), c = S.char, sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0], first = G.cur === 0;
  var h = '<div class="in"><div class="panel pass"><div class="sub" style="text-align:center">ROUND ' + G.round + ' &middot; TURN ' + (G.cur + 1) + ' OF ' + G.order.length + '</div><h2 class="hd" style="text-align:center;margin:4px 0">Pass the controls to</h2>';
  h += '<div class="passcap"><div class="cast"><div class="card">' + UI.portrait(c) + '<div class="cn">' + esc(S.name) + '</div><div class="cj">' + esc(c.title) + '</div></div></div><div style="min-width:0;flex:1">';
  h += '<p style="margin:0 0 6px">At <b>' + esc(plan().name) + '</b> in the <b>' + esc(sh.name) + '</b>. Credits <b class="num">' + fmt(S.credits) + 'c</b>, worth <b class="num">' + fmt(GT.networth(S)) + 'c</b> of ' + fmt(G.target) + 'c.</p>';
  h += '<h4 style="margin:6px 0 2px">' + (first ? 'This round, fastest ship first' : 'Turn order this round') + '</h4>' + orderHTML() + '<p class="dim" style="font-size:12px;margin:4px 0 0">Faster ships go first and get first pick of the markets.</p>';
  var oth = GT.othersHere(S); if (oth.length) h += '<p class="dim" style="font-size:12px;margin:6px 0 0">Also docked here: ' + oth.map(function (p) { return esc(p.name); }).join(', ') + '. You share this market, so mind the prices.</p>';
  h += '</div></div><div class="acts" style="justify-content:center;margin-top:12px"><button class="btn big pink" data-act="pass-ok">I am ' + esc(S.name) + '. Start my turn!</button></div></div></div>';
  el.innerHTML = h; el.hidden = false; el.scrollTop = 0; PX.hydrate(el); SFX.play('pop');
}
function notice(html, next) { ui.afterNotice = next || null; openModal(html + '<div class="row" style="justify-content:flex-end"><button class="btn pink" data-act="notice-ok">Onward</button></div>'); }

function logModal() {
  var shown = GT.CFG.LOG_SHOWN + ui.more, h = '<div class="row"><h2>Flight log</h2><button class="btn" data-act="close">Close</button></div><div class="log" id="biglog">' + logHTML(shown) + '</div>';
  if (S.log.length > shown) h += '<button class="btn gold" data-act="more">Show older entries (' + (S.log.length - shown) + ')</button>';
  openModal(h, true);
}
