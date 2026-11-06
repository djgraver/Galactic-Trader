/* Galactic Trader Deluxe. Part 10: engine extras for odd jobs (mini-games). Rewards are small and capped so the tuned economy stays intact. */
(function () {
  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) {
    var s = baseNew(shipId, name);
    s.char = char || null;
    s.stats.jobs = 0; s.stats.jobGain = 0; s.stats.jobGold = 0;
    return s;
  };
  GT.RATINGS = ['Flop', 'Bronze', 'Silver', 'Gold'];
  /* Share of the stage scale paid out per rating. Simulated: a good player finishes about 10% sooner and a perfect one about 20% sooner, so trading stays the main event. */
  GT.JOB_PAY = [0, 0.08, 0.20, 0.40];
  GT.JOBS = {
    meridoa: { id: 'pests', name: 'Pest Panic', where: 'the Pumpkin Patch' },
    karthosu: { id: 'tomb', name: 'Tomb Dash', where: 'the Tomb Steps' },
    ferrox: { id: 'ore', name: 'Ore Sorter', where: 'the Conveyor Hall' },
    kryndor: { id: 'traffic', name: 'Skybus Scramble', where: 'the Skybus Lanes' },
    nihil: { id: 'debris', name: 'Junk Blaster', where: 'the Debris Deck' },
    quellin: { id: 'catch', name: 'Quantum Catch', where: 'Lab Four' },
    halcyra: { id: 'cloud', name: 'Cloud Skimmer', where: 'the Storm Deck' }
  };
  GT.job = function (s) { return GT.JOBS[GT.PLANETS[s.loc].id]; };
  GT.jobAvailable = function (s) { return !s.visit.flags.job && !s.over && !s.pending; };
  GT.jobFinish = function (s, rating, score) {
    s.visit.flags.job = true;
    var j = GT.job(s), S = GT.scale(s), money = Math.round(S * GT.JOB_PAY[rating] * GT.R(0.9, 1.1) / 5) * 5, rep = rating === 3 ? 1 : 0;
    s.credits += money; s.stats.jobs++; s.stats.jobGain += money; if (rating === 3) s.stats.jobGold++;
    if (rep) GT.addRep(s, rep);
    var verdict = ['They hand you a participation sticker.', 'A modest tip.', 'A decent payout.', 'A glorious payout and a round of applause.'][rating];
    GT.log(s, '<b>Odd jobs, ' + j.where + ' (' + j.name + '):</b> you scored ' + GT.fmt(score) + ', rated <b>' + GT.RATINGS[rating].toUpperCase() + '</b>. ' + verdict + (money ? ' <b>+' + GT.fmt(money) + 'c</b>' : '') + (rep ? ' <span class="fx">(+1 reputation)</span>' : ''), money > 0 ? 'gain' : 'info', money);
    return { money: money, rep: rep };
  };
})();
