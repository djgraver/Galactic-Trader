/* Galactic Trader. Part 7b: encounters for the last three planets. */
(function () {
  var G = function (t, f) { return GT.mk(1, t, f); }, B = function (t, f) { return GT.mk(-1, t, f); }, N = function (t, f) { return GT.mk(0, t, f); };
  var gm = [0.6, 1.6], bm = [-1.4, -0.5];
  GT.ENCOUNTER.nihil = { who: 'Sixfingers Ness, Free-Port Broker', list: [
    G('Ness leans in and says she has "a friend who needs a thing moved, no questions". It is a very light thing and a very heavy payment.', { cr: [0.8, 1.8] }),
    G('Ness sells you a crate of dark-matter vials "from a bankrupt lab". The labels say one thing and the vials hum another, but the buyer at the next dock does not ask.', { gain: { item: 'darkmatter', v: [0.7, 1.5] } }),
    G('Ness lets you in on a rumour about a shipwreck. You find it, it is real, and the wreck is unguarded and generous.', { cr: gm }),
    G('Ness has a cousin who runs a "fuel co-op". She does not specify the rules, but your tank is fuller afterwards.', { fuel: [10, 24] }),
    G('Ness introduces you to the Free Port\'s "quiet council", who regard you as someone who understands things. Doors open.', { rep: 3, cr: [0.2, 0.6] }),
    G('Ness tips you off to a customs sweep. You hide your goods, others do not, and you are the only one to profit from the confusion.', { cr: [0.5, 1.3], rep: 1 }),
    B('Ness sells you a "guaranteed" map to a hidden cache. The cache is real. It is also a trap, and the trap works.', { cr: bm }),
    B('Ness takes a "handling fee" for the introduction, a "discretion fee" for the silence, and a "convenience fee" for the convenience of paying.', { cr: [-1.2, -0.5] }),
    B('Ness\'s "courier" is a pickpocket, and a very good one. A crate you swore you hadn\'t left alone is lighter by the morning.', { lose: [0.07, 0.17], rep: -1 }),
    N('Ness pours you a drink the colour of a bruise and says, "To the long dark." You drink to it. Her people nod, and you are marked as safe.', { rep: 2 })
  ] };
  GT.ENCOUNTER.quellin = { who: 'Dr. Imre Quill, Disgraced Physicist', list: [
    G('Dr. Quill needs a test subject for an experiment on "luck gradients". The side effect is a sudden, unexplained surplus in your accounts.', { cr: [0.7, 1.7] }),
    G('Quill has a prototype that turns fuel into slightly more fuel. It does not work, except when it does, and you leave with a full tank.', { fuel: [12, 24] }),
    G('Quill passes you a case of "unfinished" circuit cores that are, on inspection, flawless. He is too busy sulking to notice.', { gain: { item: 'circuitry', v: [0.7, 1.5] } }),
    G('Quill is being sued by his former colleagues and needs someone to hold a sealed box for a week. He pays in advance, with a generous bonus.', { cr: gm }),
    G('Quill publishes a footnote crediting "the merchant from Dock Four" for a key observation. Your name appears in a journal nobody reads, but everyone cites.', { rep: 3 }),
    G('Quill shares a sample of experimental medicine. It is untested, probably fine, and worth a small fortune on the right dock.', { gain: { item: 'medical', v: [0.6, 1.4] } }),
    B('Quill\'s experiment goes slightly wrong. Your ship now has a faint hum in the wrong key, and the engine coils agree.', { dmg: [0.4, 6] }),
    B('Quill borrows "a small sum" for equipment. He swears to repay it "in a time loop or two".', { cr: bm }),
    B('Quill\'s "harmless" teleportation device moves some of your cargo to somewhere. He is not sure where.', { lose: [0.07, 0.18] }),
    N('Quill explains his theory of everything over lunch. It makes sense for about nine minutes. The staff are impressed you stayed.', { rep: 2 })
  ] };
  GT.ENCOUNTER.halcyra = { who: 'Captain Ruka Windlass, Cloud-Diver', list: [
    G('Captain Windlass offers you a seat on a storm-dive. You come back damp, delighted and carrying a canister of bottled gas she insists you "keep for the ride".', { gain: { item: 'darkmatter', v: [0.6, 1.4] } }),
    G('Windlass needs ballast for a delivery run and pays by the kilo. You are, apparently, the right weight.', { cr: gm }),
    G('Windlass bets you can\'t hold your breath during a pressure-dive. You can, barely, and she pays up with a flourish.', { cr: [0.6, 1.5] }),
    G('Windlass tells you about a hidden fuel bladder drifting in the cloud-deck. You skim it off, no questions asked.', { fuel: [12, 26] }),
    G('Windlass\' crew adopt you as "honorary ballast". Their word carries weight on every platform in the sky.', { rep: 3, cr: [0.2, 0.6] }),
    G('Windlass loans you a navigator for the next jump. Her charts save you a good deal of time and trouble on the way.', { fuel: [6, 14], cr: [0.2, 0.5] }),
    B('Windlass\' dive goes wrong. A downdraft slams your ship into a platform strut, and the repair bill is stormy.', { cr: [-0.8, -0.3], dmg: [0.3, 5] }),
    B('Windlass wins the bet. She is delighted, you are poorer, and there is a rematch scheduled for next season.', { cr: bm }),
    B('Windlass\'s "express delivery" of your cargo to the dock is a little too express. A crate is lost to the clouds.', { lose: [0.06, 0.16] }),
    N('Windlass shows you the horizon from the top of a platform spire. She says every captain should see it once. Her crew agree.', { rep: 2 })
  ] };
})();
