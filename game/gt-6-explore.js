/* Galactic Trader. Part 6: exploration outcomes, ten per planet. Each is rolled only when the 25% chance fires. */
(function () {
  var G = function (t, f) { return GT.mk(1, t, f); }, B = function (t, f) { return GT.mk(-1, t, f); }, N = function (t, f) { return GT.mk(0, t, f); };
  var gm = [0.6, 1.6], bm = [-1.4, -0.5];
  GT.EXPLORE = {
    meridoa: [
      G('The village market is in full cry. A grain-wife presses a bag of coin into your hand for carrying her honey crates to the dock.', { cr: gm }),
      G('You find an abandoned orchard where the spice-pods have gone wild. Your pockets are soon fragrant and full.', { gain: { item: 'spices', v: [0.6, 1.3] } }),
      G('A harvest festival drags you into a dance. By dawn you are crowned Barley Lord, and presented with a purse.', { cr: [0.5, 1.3], rep: 2 }),
      G('A rain-singer hears your tank rattle and tops you up with fuel from a hidden tank, no questions asked.', { fuel: [10, 20] }),
      G('A farmer\'s boy shows you a shortcut through the terraces and a hidden stash of ration tins left by his grandfather.', { gain: { item: 'rations', v: [0.5, 1.1] } }),
      B('A scarecrow-drone mistakes you for a crow and chases you through the maize, then bills you for damages.', { cr: bm }),
      B('You wander into pollen season. It clogs your intakes and your lungs, and the repair shop sells you a filter at harvest prices.', { dmg: [0.3, 5], cr: [-0.4, -0.2] }),
      B('You nap under a tree and wake to find a flock of goats have eaten the lid of your cargo crate and some of its contents.', { lose: [0.05, 0.13] }),
      B('A friendly local sells you a "famous Meridoan hat". It dissolves in the first rain, and so does your pride.', { cr: [-0.5, -0.2], rep: -1 }),
      N('You watch the three suns set over the fields. A farmer waves, and the crew stand a little taller for the rest of the day.', { rep: 1 })
    ],
    karthosu: [
      G('Under a collapsed archway you find a sealed urn of tomb-silver that the diggers missed. You sell it quietly the same afternoon.', { cr: [0.8, 1.8] }),
      G('A digger\'s widow sells you her late husband\'s whole stash of relics because she says the ghosts talk too loudly.', { gain: { item: 'artifacts', v: [0.7, 1.4] } }),
      G('A tomb-guardian automaton wakes, bows, and hands you a coin from a dead empire. It is worth far more than it looks.', { cr: [0.6, 1.5] }),
      G('You help a trapped surveyor out of a sinkhole. Her team grants you a share of their finds and a good word.', { cr: [0.3, 0.9], rep: 3 }),
      G('The wind uncovers a buried fuel cache with an expired lock and a very forgiving seal. You take what you need.', { fuel: [8, 18] }),
      B('A sandstorm rolls over the dig site and you spend an afternoon scrubbing grit from every vent and joint in your hull.', { dmg: [0.3, 5] }),
      B('You pick up a pretty relic and a ghost-sickness hits. The healers charge by the hour.', { cr: bm }),
      B('A rival digger "finds" your best cargo box and walks off with half of it.', { lose: [0.08, 0.2] }),
      B('The floor of a chamber gives way. You climb out with a sprained ankle, a missing wallet and a story you do not tell.', { cr: [-0.8, -0.3], rep: -1 }),
      N('You find a mural of a vanished merchant queen counting coin. You swear she winked at you.', { rep: 1 })
    ],
    ferrox: [
      G('A foreman spots you eyeing a heap of slag and lets you haul away a few crates of high-grade ore for free.', { gain: { item: 'metals', v: [0.7, 1.5] } }),
      G('A struck vein of platinum in Shaft Nine. You sell the finder\'s tip for a tidy sum to a man in a nice coat.', { cr: gm }),
      G('You win a game of "drill roulette" in a miners\' bar. Don\'t ask what the rules were.', { cr: [0.5, 1.4] }),
      G('A hoist driver is behind on his quota and begs you to help carry. He pays in fuel pellets from the company tank.', { fuel: [10, 20], rep: 1 }),
      G('An old prospector hands you a map to a dead mine "for luck". The first crate in the dust is full of copper bars.', { gain: { item: 'metals', v: [0.5, 1.2] } }),
      B('A slag cart rolls down the ramp and gets you square in the cargo bay. Your goods are fine. Your paint is not. The dock charges for the cleaning.', { cr: [-0.6, -0.2] }),
      B('A tunnel collapse closes the road. You pay a hauler triple fare to dig you out and your hold is lighter by the time you reach the dock.', { cr: [-1.0, -0.4], lose: [0.03, 0.08] }),
      B('Dust gets into your engine mounts and they grind for days. Nobody warns you about the dust.', { dmg: [0.3, 6] }),
      B('A mining-union man shakes you down for "union dues", a rate he invents on the spot.', { cr: bm }),
      N('You ride the ore lift to the bottom of the world and back. Your ears are still ringing, but the miners buy you a drink.', { rep: 1 })
    ],
    kryndor: [
      G('A traffic warden mistakes your ship for a diplomatic one and waves you through three checkpoints. Down the line a clerk tips you for the courtesy.', { cr: [0.4, 1.1], rep: 1 }),
      G('You catch a falling briefcase on the 400th floor. Inside is a bonus cheque and a thank-you from its terrified owner.', { cr: [0.8, 1.8] }),
      G('A circuitry vendor is closing his stall and dumps his last crates on you for a song.', { gain: { item: 'circuitry', v: [0.7, 1.4] } }),
      G('You turn out to be the one-millionth visitor to the Spire Tower observation deck. There are balloons and a cash prize.', { cr: [0.6, 1.5] }),
      G('A skybus driver, grateful for a spare ticket, fills your tank from a company pump in the VIP lane.', { fuel: [10, 20] }),
      B('A street-corner "tax adjuster" calculates you owe a lot of money, and sounds very official about it.', { cr: bm }),
      B('You step into the wrong lift, wait twelve hours in a maintenance shaft, and miss a delivery deadline.', { cr: [-0.7, -0.3], rep: -1 }),
      B('Pickpocket drones swarm through the market and strip a crate of your goods before the guards notice.', { lose: [0.06, 0.15] }),
      B('A vending machine charges you "convenience fees" for the convenience of paying.', { cr: [-0.5, -0.2] }),
      N('You dine in the Spire\'s revolving restaurant. The view is magnificent. The bill is enormous. The compliments are worth something.', { cr: [-0.3, -0.1], rep: 2 })
    ],
    nihil: [
      G('You find a dropped credit chit in a dim corridor. The owner is nowhere in sight, and the station does not ask.', { cr: [0.5, 1.3] }),
      G('A maintenance worker needs a hand with a stuck airlock. Her gratitude comes as spare dark-matter vials from the reactor bay.', { gain: { item: 'darkmatter', v: [0.6, 1.3] } }),
      G('A card shark loses to your beginner\'s luck at a corridor table. He pays up with a sigh and a bow.', { cr: [0.7, 1.6] }),
      G('An engineer vents the old fuel tank before refilling it. You are nearby with an empty tank and no shame.', { fuel: [10, 22] }),
      G('A shy cartographer sells you a "map of places that do not exist". One of them does, and it pays a bounty for finding it.', { cr: [0.5, 1.2], rep: 1 }),
      B('The gravity plates flip for a moment as you cross a corridor. Your bags are scattered over three decks.', { lose: [0.05, 0.12] }),
      B('A dock droid misreads your parking tag and bills you for six days of "long stay".', { cr: bm }),
      B('You are shushed out of the Quiet Deck for humming. A fine is levied for "disturbing the void".', { cr: [-0.5, -0.2], rep: -1 }),
      B('An air-scrubber malfunction leaves a film on your engine intake that takes days to burn off.', { dmg: [0.3, 5] }),
      N('You spend an hour at the viewing port, watching the black. For a moment you are not sure which of you is looking.', { rep: 1 })
    ],
    quellin: [
      G('A lab assistant needs a courier and you are standing in the right corridor. She pays upfront for a box she will not discuss.', { cr: gm }),
      G('You volunteer for a "harmless" sensory study. The only effect is a free lunch, a stipend and a cryptic compliment.', { cr: [0.4, 1.1], rep: 1 }),
      G('A discarded prototype rolls out of a dumpster. It is broken, but its circuit core is worth a small fortune.', { gain: { item: 'circuitry', v: [0.7, 1.4] } }),
      G('The lab\'s medical stores are throwing out surplus kits that are still two years from expiry. You carry off an armful.', { gain: { item: 'medical', v: [0.6, 1.3] } }),
      G('An absent-minded botanist leaves her coolant tank unattended. You know where fuel goes, and so does she.', { fuel: [9, 18] }),
      B('A quantum fault makes your wallet briefly exist in two places. The wrong one is chosen.', { cr: bm }),
      B('Your ship goes through the lab\'s "decontamination gate" and comes out with its warp coil rearranged. Not in a good way.', { dmg: [0.4, 6] }),
      B('A research cat knocks over a crate of your goods. The cat is fine. The goods are not.', { lose: [0.05, 0.13] }),
      B('The cafeteria serves something with "novel proteins". The crew\'s digestive recovery costs you a day\'s pay.', { cr: [-0.5, -0.2] }),
      N('You overhear a lecture on the heat death of the universe. It makes your credit balance feel appropriately small.', { rep: 1 })
    ],
    halcyra: [
      G('A skimmer pilot lets you ride shotgun through a lightning belt. At the end she pays you a "ballast fee" for the extra weight.', { cr: gm }),
      G('A gas-tender tops up your tank from a surplus bottle and says it is about to expire. It looks fine to you.', { fuel: [12, 24] }),
      G('A storm leaves a drifting canister at the platform\'s edge. Inside, bottled dark matter, sealed and humming.', { gain: { item: 'darkmatter', v: [0.7, 1.4] } }),
      G('You win the skimmer-crew\'s weekly "name the storm" contest. The prize is cash, and the name sticks.', { cr: [0.5, 1.3], rep: 1 }),
      G('A friendly cloud-diver shows you a hidden platform garden and sells you a bundle of high-air spices for next to nothing.', { gain: { item: 'spices', v: [0.5, 1.2] } }),
      B('A lightning strike jolts your hull while you are visiting the upper deck. The coils sing for days.', { dmg: [0.3, 6] }),
      B('A wind-shear drops you into a bad drift. The pilot charges you for the rescue, and the passage back is hard on the tank.', { cr: [-0.8, -0.3], fuel: [-8, -3] }),
      B('A gas-bar bartender sells you a drink that is half storm and half regret. You wake up lighter in the wallet.', { cr: bm }),
      B('A falling ring-shard dents a cargo hatch and some of your goods drift out into the clouds.', { lose: [0.06, 0.15] }),
      N('You watch a storm the size of a planet tear itself apart at the edge of the platform. The skimmer crews raise a toast to you.', { rep: 1 })
    ]
  };
})();
