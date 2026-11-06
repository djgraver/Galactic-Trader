/* Galactic Trader. Part 5: travel events (26 kinds) and rival banter.
   Shorthand: G good, B bad, N neutral. cr = money in multiples of the stage scale, fuel = PC, lose = share of cargo, gain = free goods, dmg = [warp lost, jumps]. */
GT.mk = function (g, t, fx) { fx = fx || {}; fx.g = g; fx.t = t; return fx; };
(function () {
  var G = function (t, f) { return GT.mk(1, t, f); }, B = function (t, f) { return GT.mk(-1, t, f); }, N = function (t, f) { return GT.mk(0, t, f); };
  GT.TRAVEL = [
    G('You stumble on a derelict freighter drifting cold between stars. Her strongbox is still sealed, and so is her captain\'s sense of humour.', { cr: [0.7, 1.7] }),
    G('A solar wind catches your sails at just the right angle and shoves you along like a gentle giant.', { fuel: [8, 18] }),
    G('A lost cargo pod tumbles past your viewport, stamped with a dead company\'s logo. You hook it in with a grin.', { gain: { item: 'any', v: [0.6, 1.4] } }),
    G('A tourist liner has lost its charter pilot and hails you with a bag of credits and a tragic story about the buffet.', { cr: [0.9, 1.8] }),
    G('You skim a comet\'s tail and the scoops fill with clean, glittering ice.', { fuel: [10, 20] }),
    G('A space whale sings beside your hull for an hour and sheds a lump of ambergris. The Spice Guild will weep with joy.', { cr: [0.8, 1.9], rep: 1 }),
    G('A distress call from a stalled prospector. You tow them to safety, and their grateful crew press a purse into your hands.', { cr: [0.5, 1.3], rep: 3 }),
    G('A gravity slingshot around a dead star saves you a tank\'s worth of burn. You pretend you planned it.', { fuel: [6, 12] }),
    G('A pirate crew challenges you to cards. They are astonishingly bad at cards.', { cr: [0.6, 1.4] }),
    G('A patrol convoy shares its route charts over the radio, and mentions your name to the next dock.', { cr: [0.2, 0.5], rep: 2 }),
    G('A stowaway crawls out of the vents. She is a gifted engineer who repays her passage by tuning your coils.', { cr: [0.3, 0.8], rep: 1 }),
    G('A drifting prospector sells you a "lucky rock" for pocket change. It is full of metal ore.', { gain: { item: 'metals', v: [0.7, 1.5] } }),
    N('A green comet crosses your bow. The crew make wishes, and the cook insists it is a good omen.', { rep: 1 }),
    B('A pirate cutter slides alongside and politely asks for a "docking tax". Their guns are less polite.', { cr: [-1.5, -0.6] }),
    B('A micrometeor shower rattles the hull like gravel in a tin. One coil takes a pounding.', { dmg: [0.3, 6] }),
    B('A hatch seal fails in the dark and a few crates tumble out into the void. You wave goodbye.', { lose: [0.05, 0.14] }),
    B('A customs cruiser pings you in empty space and fines you for a "mislabelled manifest". It was not mislabelled.', { cr: [-1.1, -0.4] }),
    B('The fuel line sneezes. By the time you find the leak the gauge has dropped a notch.', { fuel: [-14, -6] }),
    B('A friendly voice on the radio offers "wholesale navigation insurance". It was not wholesale, and it was not insurance.', { cr: [-1.3, -0.5] }),
    B('Half the crew come down with space-sickness. You pay their medical bills and bleach the corridors.', { cr: [-0.5, -0.2] }),
    B('A gravity eddy spins the ship like a coin on a table, and the burn to straighten out costs you dearly.', { fuel: [-16, -8] }),
    B('Smugglers dock alongside during your sleep cycle and "borrow" a handful of crates.', { lose: [0.1, 0.24] }),
    B('An engine coil burns out with a sound like a dying cello. Your warp speed suffers for a few jumps.', { dmg: [0.4, 6] }),
    B('The navigation computer sulks and plots the long way round. You notice only after burning the extra fuel.', { fuel: [-12, -5] }),
    B('A quarantine buoy snags you for a "routine" inspection that takes three days and a bribe.', { cr: [-1.0, -0.4] }),
    B('A rogue AI hails you from an abandoned relay and proposes a "mutually beneficial exchange". You lose the exchange.', { cr: [-0.9, -0.3], rep: -1 })
  ];
  GT.SNARK = [
    'Nice ship. Did it come with the dents, or did you add those yourself?', 'Walk on, little merchant. The adults are talking to their money.',
    'I\'d say good luck, but you seem to be using all of it up.', 'Don\'t strain yourself. Counting past ten is hard.',
    'They let anyone have a trading licence these days.', 'Enjoy the scenery. It is the only thing you will profit from.',
    'My cargo hold is bigger than your ambition.', 'Did your mother pack that lunch, or did you lose a bet?'
  ];
})();
