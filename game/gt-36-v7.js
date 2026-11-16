/* Galactic Trader 7. Part 36: the v7 rules. Loaded last of the engine parts. No DOM in here.
   Richer side money (odd jobs, the alley, shares, the Parlour), a calmer price ladder for big orders, a livelier market, a bigger loan book,
   staying in port for a turn, and crew wages (pay on time and the crew are happy; ignore them and they strike). */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt, C = GT.CFG;

  /* ---------- numbers ---------- */
  GT.JOB_PAY = [0, 0.4, 1.0, 2.0];                 /* five times the v6 payout */
  C.LOAN_CAP = 15000;
  C.ELASTICITY = 0.22;                              /* was 0.35: a big order moves the price much less */
  C.VOL_MULT = 1.5; C.SHOCK_KEEP = 0.84; C.MOD_CHANCE = 0.085;   /* a livelier market */
  C.ENCOUNTER = 0.75;                               /* the cantina booth is rarely empty now */
  C.ALLEY_MULT = 3; C.SMUGGLE_PAY = 3; C.SMUGGLE_STAKE = 1.5;
  GT.STK.DRIFT = 1.009; GT.STK.DIV = 0.006;         /* shares grow faster and pay a better dividend */
  GT.RIVAL_FOLLOW = [0.81, 0.88, 0.94, 0.985];     /* everyone earns faster in v7, so the rivals stay a little closer on your heels */
  /* deeper markets for the pricey goods, so a hold full of them is worth hauling */
  [[4, 80], [5, 46], [6, 24]].forEach(function (x) { GT.ITEMS[x[0]].depth = x[1]; });
  /* the Parlour pays out a little more often (about 96p back per credit, up from about 90p) */
  var odds = { ledger: [0.18, 0.20, 0.52, 0.10], moth: [0.65, 0.18, 0.11, 0.06], orchard: [0.19, 0.16, 0.53, 0.12], seven: [0.915, 0.068, 0.017] };
  GT.GAMES.forEach(function (g) { var o = odds[g.id]; if (o) g.out.forEach(function (x, k) { x[1] = o[k]; }); });

  /* ---------- the alley pays three times as well ---------- */
  var baseExplore = GT.explore;
  GT.alleyBoost = function (e) {
    if (!e || e.g <= 0) return e; var c = {}, k, m = C.ALLEY_MULT; for (k in e) c[k] = e[k];
    if (e.cr) c.cr = [e.cr[0] * (e.cr[0] > 0 ? m : 1), e.cr[1] * (e.cr[1] > 0 ? m : 1)];
    if (e.gain) c.gain = { item: e.gain.item, v: [e.gain.v[0] * m, e.gain.v[1] * m] };
    return c;
  };
  var basePick = GT.pickEntry, inAlley = false;
  GT.pickEntry = function (list, s) { var e = basePick(list, s); return inAlley ? GT.alleyBoost(e) : e; };
  GT.explore = function (s, chance) { inAlley = true; try { return baseExplore(s, chance); } finally { inAlley = false; } };
  var baseMake = GT.smuggleMake;
  GT.smuggleMake = function (s, cargo) {
    var o = baseMake(s, cargo);
    o.stake = Math.round(o.stake * C.SMUGGLE_STAKE / 5) * 5; o.pay = Math.round(o.pay * C.SMUGGLE_PAY / 5) * 5;
    return o;
  };

  /* ---------- more faces in the cantina: a pool of regulars shared by every world ---------- */
  var G = function (t, f) { return GT.mk(1, t, f); }, B = function (t, f) { return GT.mk(-1, t, f); }, N = function (t, f) { return GT.mk(0, t, f); };
  GT.REGULARS = [
    G('A retired quartermaster slides you a napkin with three numbers on it. They turn out to be a locker, and the locker turns out to be full.', { cr: [0.7, 1.6] }),
    G('Two pilots are arguing about the fastest lane to the rim. You settle it with a napkin map and they pay your tab, and then some.', { cr: [0.4, 1.0], rep: 1 }),
    G('The house band needs a tambourine. You are terrible at it. The crowd loves it and passes a hat.', { cr: [0.5, 1.2], rep: 1 }),
    G('A broker with a hangover sells you her "worthless" crate so she can catch a shuttle. It is not worthless.', { gain: { item: 'any', v: [0.7, 1.5] } }),
    G('A fuel-dock hand owes the barkeep a favour and the barkeep owes you one. Three favours later your tank is fuller.', { fuel: [10, 20] }),
    G('You win an arm-wrestling match against a very small alien with a very large reputation. Word gets round.', { rep: 3, cr: [0.2, 0.6] }),
    G('A nervous courier asks you to hold a parcel for five minutes. He never returns. The parcel is full of circuitry.', { gain: { item: 'circuitry', v: [0.5, 1.1] } }),
    G('The barkeep is short-staffed. You pull pints for an hour and discover you are very good at tips.', { cr: [0.5, 1.3] }),
    N('An old spacer tells you the secret of the universe. You forget it by morning, but you remember she was kind.', { rep: 1 }),
    N('You join a table of off-duty customs officers. You learn nothing, lose nothing and laugh a great deal.', { rep: 2 }),
    B('A charming stranger teaches you a dice game called "Gravity". Gravity, it turns out, always wins.', { cr: [-1.1, -0.4] }),
    B('Someone spikes the punch with engine coolant. Your crew spend the night in the infirmary, and it bills by the bucket.', { cr: [-0.7, -0.3] }),
    B('A bar fight breaks out over the correct plural of "nebula". You are fined for throwing the first dictionary.', { cr: [-0.6, -0.2], rep: -1 }),
    B('You wake up with a tattoo of a rival\'s logo and a receipt for it.', { cr: [-0.5, -0.2], rep: -1 })
  ];
  GT.REGULAR_WHO = ['A retired quartermaster', 'The house band', 'A stranger at the bar', 'The barkeep', 'A table of off-duty pilots', 'An old spacer in the corner booth'];
  var baseEncounter = GT.encounter;
  GT.encounter = function (s, chance) {
    if (s.visit.encountered || s.over || s.pending) return false;
    if (GT.rand() >= (chance !== undefined ? chance : C.ENCOUNTER)) return baseEncounter(s, 0);
    /* four times in ten the booth is taken by a regular and not by the local character */
    if (GT.rand() < 0.4) {
      s.visit.encountered = true; s.stats.encounters++; s.stats.events++;
      var ev = GT.pickEntry(GT.REGULARS, s), fx = GT.applyEffect(s, ev);
      GT.log(s, '<b>At the bar:</b> ' + ev.t + fx.detail, fx.kind, fx.money);
      return true;
    }
    return baseEncounter(s, 1);
  };

  /* ---------- the bank: borrow everything the cap allows in one go ---------- */
  GT.loanRoom = function (s) { return Math.max(0, Math.floor((C.LOAN_CAP - s.loan) / C.LOAN_STEP) * C.LOAN_STEP); };
  GT.takeLoanAll = function (s) {
    var n = GT.loanRoom(s); if (n <= 0 || s.over) return 0;
    s.loan += n; s.credits += n;
    GT.log(s, 'Borrowed everything the bank would lend: <b>' + fmt(n) + 'c</b> at ' + (C.LOAN_RATE * 100) + '% interest. You now owe ' + fmt(s.loan) + 'c.', 'info');
    return n;
  };

  /* ---------- crew wages ----------
     Every 5 to 15 turns the crew ask for their pay. Pay on the spot and they are delighted (+2 reputation); pay within the next two turns and they are content (+1).
     After that they strike: the ship cannot leave (you can only end the turn) until they are paid. A captain who truly cannot pay (pocket plus bank) may plead poverty:
     the crew take half of what is in your pocket, think less of you (-5 reputation) and go back to work. */
  GT.WAGE = { MIN: 5, MAX: 15, GRACE: 2, RATE: [0.45, 0.7], FLOOR: 100 };
  function newWage(s) { return { next: s.turn + GT.RI(GT.WAGE.MIN, GT.WAGE.MAX), due: 0, asked: 0, strike: false, paid: 0, total: 0, strikes: 0, mood: 'content' }; }
  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) { var s = baseNew(shipId, name, char); s.wage = newWage(s); s.stats.waits = 0; return s; };
  GT.wageDue = function (s) { return s.wage && s.wage.due > 0 ? s.wage.due : 0; };
  GT.onStrike = function (s) { return !!(s.wage && s.wage.strike); };
  GT.wageDeadline = function (s) { return s.wage.asked + GT.WAGE.GRACE; };
  GT.wageTick = function (s) {
    var w = s.wage; if (!w || s.over) return;
    if (!w.due && s.turn >= w.next) {
      w.due = Math.max(GT.WAGE.FLOOR, Math.round(GT.scale(s) * R(GT.WAGE.RATE[0], GT.WAGE.RATE[1]) / 5) * 5); w.asked = s.turn;
      GT.log(s, '<b>Payday!</b> The crew line up outside your cabin, caps in hand, and ask for their wages: <b>' + fmt(w.due) + 'c</b>. Pay at the Spaceport within ' + GT.WAGE.GRACE + ' turns, or they will down tools.', 'event');
    } else if (w.due && !w.strike && s.turn > GT.wageDeadline(s)) {
      w.strike = true; w.strikes++; w.mood = 'on strike'; GT.addRep(s, -2);
      GT.log(s, '<b>Strike!</b> The crew have not been paid. They sit on the cargo ramp with placards ("NO PAY, NO WARP") and the ship is going nowhere until you find <b>' + fmt(w.due) + 'c</b>. <span class="fx">(-2 reputation)</span>', 'loss');
    }
  };
  GT.canPayWages = function (s) { return GT.wageDue(s) > 0 && s.credits >= s.wage.due && !s.over; };
  GT.payWages = function (s) {
    if (!GT.canPayWages(s)) return false;
    var w = s.wage, n = w.due, rep = w.strike ? 0 : s.turn === w.asked ? 2 : 1, was = w.strike;
    s.credits -= n; w.total += n; w.paid++; w.due = 0; w.strike = false; w.next = s.turn + GT.RI(GT.WAGE.MIN, GT.WAGE.MAX); w.mood = was ? 'grumbling' : rep === 2 ? 'delighted' : 'happy';
    if (rep) GT.addRep(s, rep);
    GT.log(s, (was ? 'You pay the strikers. The placards go back in the locker and the crew go back to work, muttering.' : rep === 2 ? 'You pay the crew on the spot. Somebody starts a cheer and the cook bakes a cake shaped like your ship.' : 'You pay the crew. They count it twice and seem pleased.') + ' <b>-' + fmt(n) + 'c</b>' + (rep ? ' <span class="fx">(+' + rep + ' reputation)</span>' : ''), 'loss', -n);
    return true;
  };
  /* only a captain who cannot raise the money (pocket plus bank) may plead; the crew take half of what is in the pocket */
  GT.canPlead = function (s) { return GT.onStrike(s) && s.credits + s.bank < s.wage.due && !s.over; };
  GT.pleadWages = function (s) {
    if (!GT.canPlead(s)) return false;
    var w = s.wage, n = Math.max(0, Math.floor(s.credits / 2));
    s.credits -= n; w.total += n; w.due = 0; w.strike = false; w.next = s.turn + GT.RI(GT.WAGE.MIN, GT.WAGE.MAX); w.mood = 'sulking'; GT.addRep(s, -5);
    GT.log(s, 'You turn out your pockets in front of the whole crew. They take half of what there is' + (n ? ' (<b>-' + fmt(n) + 'c</b>)' : ' (nothing)') + ', sigh, and go back to work. Sailors talk. <span class="fx">(-5 reputation)</span>', 'loss', -n);
    return true;
  };
  var baseCanJump = GT.canJump, baseJump = GT.jump;
  GT.canJump = function (s, to) { return !GT.onStrike(s) && baseCanJump(s, to); };
  GT.jump = function (s, to, towed, opts) {
    if (GT.onStrike(s)) return false;
    var ok = baseJump(s, to, towed, opts); if (ok) GT.wageTick(s);
    return ok;
  };

  /* ---------- end the turn without flying ----------
     A day passes in port. Markets move, the bank pays and charges interest, shares pay dividends and rivals carry on trading.
     The alley, the cantina and the jobs board only refresh when you land somewhere new. */
  GT.canWait = function (s) { return !!s && !s.over && !s.pending; };
  GT.wait = function (s) {
    if (!GT.canWait(s)) return false;
    var pl = GT.PLANETS[s.loc];
    GT.log(s, GT.onStrike(s) ? 'The ship sits on the pad with its ramp down while the strike drags on. A day passes on <b>' + pl.name + '</b>.' : 'You stay in port on <b>' + pl.name + '</b> and let a day go by.', 'info');
    s.turn++; s.stats.waits = (s.stats.waits || 0) + 1;
    s.ship.damage.forEach(function (d) { d.turns--; });
    s.ship.damage = s.ship.damage.filter(function (d) { return d.turns > 0; });
    if (!s.multi) { GT.tickMarkets(s); GT.tickComps(s); }
    GT.interest(s); if (GT.stockDividends) GT.stockDividends(s);
    GT.rollTrends(s); s.visit.night = !s.visit.night; s.visit.haggle = 0;
    s.mods.forEach(function (m) { if (m.p === s.loc && m.turns === m.t0 - 1) GT.log(s, m.text, 'info'); });
    GT.wageTick(s);
    s.stats.peak = Math.max(s.stats.peak, GT.networth(s));
    GT.checkEnd(s);
    return true;
  };
})();
