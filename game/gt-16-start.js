/* Galactic Trader Deluxe. Part 16: title screen and character generator, plus the pop-up sheets (help, rivals, ending). */
function openModal(html, wide) { var m = $('modal'); m.innerHTML = '<div class="sheet' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>'; m.hidden = false; var b = m.querySelector('button'); if (b) b.focus({ preventScroll: true }); }
function closeModal() { $('modal').hidden = true; $('modal').innerHTML = ''; }

var SILLY = ['Barnaby Spudwick', 'Zelda Fizzlebottom', 'Gus', 'Mildred Quark', 'Nebula Nan', 'Doctor Chaos', 'Pixel', 'Bartholomew Void', 'Zorg', 'Mabel Thruster', 'Kevin', 'Captain Biscuit', 'Wanda Warp', 'Fig', 'Lord Gerald', 'Tilly Tentacle'];

function capCard() {
  var c = ui.cap;
  return CH.portrait(c) + '<div class="cn">' + esc(c.name) + '</div><div class="cj" style="font-size:15px;color:var(--orange);font-family:var(--display);letter-spacing:.06em">' + esc(c.title) + '</div>' +
    '<p style="margin:6px 0;font-style:italic;font-size:13px">&ldquo;' + esc(c.catch) + '&rdquo;</p><p style="margin:0 0 8px;font-size:12px;text-align:left">' + esc(c.story) + '</p><div class="fate" style="text-align:left">' + c.fate.map(function (r) { return '<span>' + r[0] + '</span><b>' + esc(String(r[1])) + '</b>'; }).join('') + '</div>';
}
function refreshCap() { ui.cap = CH.fromName(ui.name, ui.salt); var el = $('capcard'); if (el) el.innerHTML = capCard(); }

function renderStart() {
  var mx = { cargo: 75, speed: 2.2, fuel: 190 }, h = '<div class="in"><div><div class="mega">Galactic Trader</div><div class="sub">DELUXE &middot; A SPACE MERCHANT COMEDY &middot; REACH 150,000c</div></div>';
  ui.cap = CH.fromName(ui.name, ui.salt);
  h += '<div class="creator"><div class="cast"><div class="card" id="capcard">' + capCard() + '</div></div><div style="display:flex;flex-direction:column;gap:14px;min-width:0">';
  h += '<div class="panel" style="color:var(--fg)"><h3 class="hd">Who are you?</h3><div class="row" style="justify-content:flex-start"><input id="in-name" type="text" maxlength="20" placeholder="Type your name" value="' + esc(ui.name) + '" autocomplete="off" aria-label="Captain name" style="flex:1;min-width:160px"><button class="btn gold" data-act="randname">Random</button><button class="btn pink" data-act="reroll" data-label="Reroll your look">Reroll look</button></div><p class="dim" style="margin:6px 0 0;font-size:13px">Your name decides your species, hat, title, backstory and fate. Same name, same captain. Not happy? Reroll.</p></div>';
  h += '<div class="panel" style="color:var(--fg)"><h3 class="hd">Pick your ship</h3><div class="ships" role="group" aria-label="Choose your ship">';
  GT.SHIPS.forEach(function (sh) {
    function m(l, v, k) { return '<span>' + l + '</span><span class="bar"><i style="width:' + Math.round(v / mx[k] * 100) + '%"></i></span><span>' + (k === 'speed' ? v.toFixed(1) : v) + '</span>'; }
    h += '<button class="ship" data-act="pick-' + sh.id + '" aria-pressed="' + (ui.ship === sh.id) + '"><div>' + UI.shipSVG(sh.id, sh.hue) + '</div><div class="sn">' + esc(sh.name) + '</div><div class="mini">' + m('Cargo', sh.cargo, 'cargo') + m('Speed', sh.speed, 'speed') + m('Fuel', sh.fuel, 'fuel') + '</div><div class="sd">' + esc(sh.desc) + '</div></button>';
  });
  h += '</div></div><div class="row" style="justify-content:space-between"><span class="dim" style="color:#cfc3ff;font-size:13px;max-width:520px">Visit the market, the bank, the shipyard and more. Take odd jobs for pocket money. Reach 150,000 credits before the dark swallows your last coin.</span><button class="btn big pink" data-act="launch" style="font-size:34px;height:56px">Launch!</button></div></div></div></div>';
  var el = $('start'); el.innerHTML = h; el.hidden = false; el.scrollTop = 0;
}

var INFO = '<h2>How to play</h2>' +
  '<h4>The goal</h4><p>Build your fortune to <b>150,000 credits</b>. Your wealth is your credits plus your bank deposit, minus any loan. You lose if you have <b>zero or fewer credits and an empty hold</b>. Both are checked only when a planet jump finishes, so a bad day is not final until you jump.</p>' +
  '<h4>Visiting places</h4><p>Every world has a street. Click a building to walk there: the <b>Market</b> to trade, the <b>Bank</b> for deposits and loans, the <b>Shipyard</b> for upgrades (some worlds only), the <b>Fuel Dock</b> (about half the worlds), the <b>Cantina</b> to seek an encounter, the <b>Back Alley</b> to explore, the <b>Property Booth</b> for facility offers, the <b>Odd Jobs</b> board for action mini-games, and the <b>Launch Pad</b> to pick a world and jump. Right-click a building (or press and hold) to look at it.</p>' +
  '<h4>Resources</h4><ul><li><b>Credits (c):</b> the cash you carry. The bank holds the rest.</li><li><b>Fuel (PC):</b> every jump burns fuel. Faster engines burn less.</li><li><b>Cargo:</b> seven goods: Rations, Metals, Medical, Spices, Circuitry, Dark Matter and Artifacts. Your hold has a fixed size.</li><li><b>Reputation:</b> grows when you buy facilities, sabotage rivals successfully, help them, and win Gold at odd jobs. It cuts your tax and tilts luck toward good outcomes. It falls when you are caught or fail.</li></ul>' +
  '<h4>Trading</h4><ul><li>Each world makes some goods cheaply, so their price is low there. Buy where a good is abundant and sell on the far side of the map, where it is scarce.</li><li>Buying drains stock and raises the price. Selling floods the market and lowers it. Markets slowly recover, and random shortages and gluts also move them.</li><li>The trend shows today\'s price against the item\'s base price. About one item in four has no report, shown as a question mark.</li><li>Every trade is taxed. Facilities and reputation reduce the rate.</li></ul>' +
  '<h4>Travel, events and encounters</h4><ul><li>Pick a world on the Launch Pad map and press Jump. Roughly 3 trips in 10 meet an event on the way.</li><li>On each visit you may <b>Explore</b> the alley once and <b>Seek an Encounter</b> at the cantina once. Each world has its own characters.</li><li>A bigger fuel tank starts empty. Stuck without the fuel for any jump? A tug will drag you to a fuel dock, for a fee.</li></ul>' +
  '<h4>Odd jobs</h4><p>Each world has one action mini-game, playable once per visit. Your rating (Flop, Bronze, Silver, Gold) sets a small payout that grows with your wealth. Gold also earns a point of reputation. It is pocket money, not a business plan.</p>' +
  '<h4>Facilities</h4><p>About 1 trip in 5 brings an offer to buy a facility on the world you reach. It stands while you are docked, so sell cargo first if you need the money. Brokers improve trades, depots cut fuel costs, and factories, warehouses and hotels collect fees from rivals. A facility costs about 20 times the benefit it brings per jump, and owning one raises your reputation.</p>' +
  '<h4>Bank</h4><p>Deposits earn 3% and loans cost 5%. Interest is added every 4 jumps. You can take a loan of 1,000c at a time.</p>' +
  '<h4>Rivals</h4><p>Four rival traders roam the map. When you share a world with one, you may get to <b>Sabotage</b> (a sneaky mini-game), <b>Assist</b> or <b>Ignore</b> them.</p>' +
  '<h4>Gambling</h4><p>One world runs a strange parlour. Nobody explains the rules, and the odds are only described in words. The house keeps an edge in the long run.</p>' +
  '<h4>Day and Night</h4><p>The DAY / NIGHT button switches the colour scheme. SND turns the beeps on or off.</p>' +
  '<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Got it</button></div>';

function compModal() {
  var pe = S.pending, c = S.comps[pe.ci], r = NP.rival(pe.ci), nw = GT.networth(S), att = c.wealth > nw * 1.3 ? 'They look you over with open scorn.' : c.wealth < nw * 0.7 ? 'They watch you with careful, hungry respect.' : 'They give you a polite and professional nod.';
  openModal('<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:120px;flex:none;background:var(--paper);border:4px solid var(--ink);border-radius:14px;padding:4px">' + CH.portrait(r) + '</div><div style="min-width:0"><h2>A rival at the dock</h2><p><b>' + esc(c.name) + '</b>, ' + esc(c.title) + ', is currently docked here. They are ' + pe.mood + '. ' + att + '</p><p class="dim" style="font-size:13px;margin-top:4px">Their ship: cargo ' + c.cargo + ', warp ' + c.speed.toFixed(1) + '.</p></div></div>' +
    '<div class="acts"><button class="btn pink" data-act="comp-sabotage">Sabotage</button><button class="btn green" data-act="comp-assist">Assist (about ' + fmt(GT.compAssistCost(S)) + 'c or some fuel)</button><button class="btn blue" data-act="comp-ignore">Ignore</button></div>' +
    '<p class="dim" style="font-size:12px">Sabotage is a sneaky mini-game: the better you do, the better the odds. If you cannot afford to assist, you will ignore them instead.</p>');
}

function endModal() {
  var o = S.over, st = S.stats, h = '<h2 class="' + (o.won ? 'win' : 'lose') + '">' + (o.won ? 'You made your fortune!' : 'You are ruined!') + '</h2><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:110px;flex:none">' + CH.portrait(S.char) + '</div><p><b>' + esc(S.name) + '</b>, ' + esc(S.char.title) + ', after <b>' + st.jumps + ' jumps</b> (turn ' + o.turn + '). ' + esc(o.why) + '<br><i class="dim">' + (o.won ? 'The ' + esc(S.char.title) + ' is now insufferable at parties.' : 'The ' + esc(S.char.title) + ' will be remembered, mostly as a warning.') + '</i></p></div>';
  var tb = 0, ts = 0, sp = 0, er = 0;
  h += '<h4>Goods traded</h4><div style="overflow-x:auto"><table><tr><th>Item</th><th class="r">Bought</th><th class="r">Spent</th><th class="r">Sold</th><th class="r">Earned</th></tr>';
  GT.ITEMS.forEach(function (it, i) { tb += st.bought[i]; ts += st.sold[i]; sp += st.spent[i]; er += st.earned[i]; h += '<tr><td>' + it.name + '</td><td class="r">' + st.bought[i] + '</td><td class="r">' + fmt(st.spent[i]) + 'c</td><td class="r">' + st.sold[i] + '</td><td class="r">' + fmt(st.earned[i]) + 'c</td></tr>'; });
  h += '<tr><td><b>Total</b></td><td class="r"><b>' + tb + '</b></td><td class="r"><b>' + fmt(sp) + 'c</b></td><td class="r"><b>' + ts + '</b></td><td class="r"><b>' + fmt(er) + 'c</b></td></tr></table></div>';
  function r(a, b, cls) { return '<div class="row"><span class="dim">' + a + '</span><b class="num ' + (cls || '') + '">' + b + '</b></div>'; }
  h += '<div class="cols2"><div><h4>Money</h4>' + r('Final net worth', fmt(GT.networth(S)) + 'c') + r('Peak net worth', fmt(st.peak) + 'c') + r('Tax paid', fmt(st.tax) + 'c') + r('Tax discount from reputation', fmt(st.taxSavedRep) + 'c', 'good') + r('Tax discount from facilities', fmt(st.taxSavedFac) + 'c', 'good') + r('Broker price edge', fmt(st.brokerEdge) + 'c', 'good') + r('Gained from events', fmt(st.eventGain) + 'c', 'good') + r('Lost to events', fmt(st.eventLoss) + 'c', 'bad') + r('Bank interest earned', fmt(st.interestEarned) + 'c', 'good') + r('Loan interest paid', fmt(st.interestPaid) + 'c', 'bad') + r('Rival fees collected', fmt(st.feeIncome) + 'c', 'good') + r('Odd job earnings', fmt(st.jobGain) + 'c', 'good') + r('Gambling net', (st.gambleNet >= 0 ? '+' : '-') + fmt(Math.abs(st.gambleNet)) + 'c', st.gambleNet >= 0 ? 'good' : 'bad') + '</div>' +
    '<div><h4>Journey</h4>' + r('Jumps made', st.jumps) + r('Events met on the road', st.events) + r('Worlds explored', st.explores) + r('Encounters sought', st.encounters) + r('Odd jobs done', st.jobs + ' (' + st.jobGold + ' Gold)') + r('Fuel bought', st.fuelBought + ' PC for ' + fmt(st.fuelSpent) + 'c') + r('Tows needed', st.tows) + r('Facilities bought', st.facilitiesBought + ' (' + GT.facCount(S) + ' kept)') + r('Spent on ship upgrades', fmt(st.upgradesSpent) + 'c') + r('Sabotage attempts', st.sabotage + ' (' + st.sabotageWon + ' worked)') + r('Rivals assisted', st.assists) + r('Reputation', S.rep + ' now, peak ' + st.repPeak + ', low ' + st.repLow) + r('Gambling rounds', st.gambleRounds) + '</div></div>';
  openModal(h + '<div class="row" style="justify-content:flex-end"><button class="btn blue" data-act="close">Look around</button><button class="btn pink" data-act="new">Play again</button></div>', true);
}

function logModal() {
  var shown = GT.CFG.LOG_SHOWN + ui.more, h = '<div class="row"><h2>Flight log</h2><button class="btn" data-act="close">Close</button></div><div class="log" id="biglog">' + logHTML(shown) + '</div>';
  if (S.log.length > shown) h += '<button class="btn gold" data-act="more">Show older entries (' + (S.log.length - shown) + ')</button>';
  openModal(h, true);
}
