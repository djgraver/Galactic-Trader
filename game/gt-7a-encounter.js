/* Galactic Trader. Part 7a: encounters with one named character per planet, ten outcomes each (first four planets). */
(function () {
  var G = function (t, f) { return GT.mk(1, t, f); }, B = function (t, f) { return GT.mk(-1, t, f); }, N = function (t, f) { return GT.mk(0, t, f); };
  var gm = [0.6, 1.6], bm = [-1.4, -0.5];
  GT.ENCOUNTER = GT.ENCOUNTER || {};
  GT.ENCOUNTER.meridoa = { who: 'Mother Orla Thistledown, Harvest Mystic', list: [
    G('Mother Orla reads the husks in your palm and says "Gold follows you, child, and so does a goat". Her fee is a blessing, and she presses a few coins on you for luck.', { cr: [0.5, 1.4], rep: 1 }),
    G('Orla anoints your hull with barley-water and murmurs to the engine. It purrs, and you find a full ration crate in the airlock.', { gain: { item: 'rations', v: [0.6, 1.3] } }),
    G('Orla grins. "The soil remembers kindness." She waves you to the shed, where a forgotten crate of spice-seeds sits waiting.', { gain: { item: 'spices', v: [0.6, 1.3] } }),
    G('Orla tells your fortune: "Trade east, sell west, say nothing to anyone." You do exactly that, and a stranger pays you a hefty finder\'s fee.', { cr: gm }),
    G('Orla and her sister-mystics bind a ribbon of green around your fuel line. By morning the tank is fuller than you left it.', { fuel: [10, 22] }),
    G('Orla names you a Friend of the Furrow before the village. Doors open, tabs are waived, and your name travels.', { rep: 3, cr: [0.2, 0.6] }),
    B('Orla asks for "a small offering to the crop gods". The offering turns out to be rather large, and the crop gods are unavailable for comment.', { cr: bm }),
    B('You laugh at Orla\'s omen. She curses you with "a year of sour milk". It is only a day, but your cargo does go off.', { lose: [0.05, 0.13], rep: -1 }),
    B('Orla\'s ritual goes wrong and the compost-cauldron explodes. Your hull is splattered, and the repair crew bill you for the stains and the dents.', { cr: [-0.7, -0.3], dmg: [0.3, 4] }),
    N('Orla sits with you, shares tea, and says nothing for an hour. You leave feeling oddly lighter and much more welcome.', { rep: 2 })
  ] };
  GT.ENCOUNTER.karthosu = { who: 'Veshti the Ghost-Reader, Dust Archivist', list: [
    G('Veshti translates a fragment on your wall and tells you where a tomb vault was left unsealed. A day\'s digging later, you have a sack of relics.', { gain: { item: 'artifacts', v: [0.6, 1.3] } }),
    G('Veshti whispers to the dust, and the dust whispers back the combination to a sealed chest. She takes a modest commission, and you take the rest.', { cr: [0.7, 1.7] }),
    G('Veshti has a client who wants "something very old and very quiet". You oblige, and the commission is generous.', { cr: gm }),
    G('Veshti trades you an old navigator\'s starchart and a flask of "ghost-fuel", a legendary tomb-oil that burns forever.', { fuel: [12, 24] }),
    G('Veshti introduces you to the Digger\'s Guild, who regard you as "a person of discretion". Your name is spoken at the right tables.', { rep: 3 }),
    G('Veshti reads your future in a bowl of sand. "You will meet someone with a debt to you." A guilt-ridden digger finds you that same hour and pays what he owes.', { cr: [0.4, 1.1], rep: 1 }),
    B('Veshti reads aloud from a cursed scroll for "authenticity". A very bad week follows. A coil in your engine goes dark.', { dmg: [0.4, 6] }),
    B('Veshti\'s "genuine pre-imperial vase" turns out to be a cooking pot. She has already left the planet by the time you notice.', { cr: bm }),
    B('Veshti asks you to carry a "sealed document" through customs. The inspectors confiscate it and some of your cargo with it.', { lose: [0.07, 0.17], rep: -1 }),
    N('Veshti shares an old merchant\'s proverb in an extinct language. You do not understand it, but it sounds wise, and the diggers nod respectfully.', { rep: 2 })
  ] };
  GT.ENCOUNTER.ferrox = { who: 'Spanner Okoro, Master Mechanic', list: [
    G('Spanner takes one look at your drive and sighs. Ten minutes and a wrench later it hums like new, and he refuses payment, except for a favour: you carry a crate for him, for good money.', { cr: [0.5, 1.3], rep: 1 }),
    G('Spanner opens a crate of "spare parts that fell off a truck". You offload them on the next dock for a bundle.', { gain: { item: 'metals', v: [0.7, 1.5] } }),
    G('Spanner hotwires a pump on the company line and shares the spoils. "Don\'t tell the foreman."', { fuel: [10, 22] }),
    G('Spanner buys you a round, then wins a bet on your behalf against a loud foreman. You split the pot.', { cr: gm }),
    G('Spanner\'s apprentices rebuild your coil housing between shifts. It runs far cooler, and the crew call it "the Okoro treatment".', { rep: 2, cr: [0.2, 0.5] }),
    G('Spanner recommends you to a captain who needs a shipment moved fast. The pay is excellent, and the captain remembers you.', { cr: [0.6, 1.5], rep: 1 }),
    B('Spanner "adjusts" your engine mount and it never feels the same again. He insists it is a feature.', { dmg: [0.3, 6] }),
    B('Spanner has a very good deal on "genuine alloy plate". It rusts before you leave the dock.', { cr: bm }),
    B('Spanner leaves a wrench in your cargo bay. It falls into a crate at launch and it takes a while to find which crate.', { lose: [0.05, 0.12], cr: [-0.3, -0.1] }),
    N('Spanner talks for an hour about the soul of a machine. You do not follow, but his crew are touched when you listen.', { rep: 2 })
  ] };
  GT.ENCOUNTER.kryndor = { who: 'Councillor Lysandra Prowl, Deputy of Trade', list: [
    G('Councillor Prowl "waives a clerical fee" and quietly slips a rebate into your account. It is probably not legal, and she is probably running for something.', { cr: [0.7, 1.7] }),
    G('Prowl invites you to a fundraiser, and a donor, charmed by your accent, buys a half-share in your next shipment at a premium.', { cr: gm, rep: 1 }),
    G('Prowl hands you a "Trade Facilitator\'s Pass", a sticker that makes customs officers wave and smile. It gives your goods a boost.', { rep: 3, cr: [0.2, 0.6] }),
    G('Prowl needs a "neutral courier" for a sealed folder to a friend. The fee is large, the folder is heavy, and she never says what it is.', { cr: [0.8, 1.8] }),
    G('Prowl\'s aide slips you a fuel voucher from the "Transit Fund". It is perfectly legal, in a way that has not yet been tested.', { fuel: [10, 22] }),
    G('Prowl mentions your ship in a public address as "an example of small-business grit". The cameras linger. The tips follow.', { rep: 3, cr: [0.3, 0.8] }),
    B('Prowl proposes a "voluntary contribution to the Spire Beautification Fund". Declining does not seem advisable.', { cr: bm }),
    B('Prowl\'s opponents have you audited for "suspicious associations". The auditors are very thorough and mostly right.', { cr: [-1.2, -0.5], rep: -2 }),
    B('Prowl\'s new "Cargo Safety Ordinance" requires a hold inspection at once. A few crates do not pass, and are impounded.', { lose: [0.06, 0.16] }),
    N('Prowl lectures you on supply lines for an hour. You nod politely. Somewhere in there is something quotable, and you end up in the news.', { rep: 2 })
  ] };
})();
