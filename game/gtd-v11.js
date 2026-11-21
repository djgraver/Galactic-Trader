// v11 checks: play on, quest slots, keyboard-only games, sabotage variety, the UI fixes and the new pop-ups.
const L = require('./gtd-lib.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(500); await t.boot('Mabel', 'wayfarer', 1); await p.waitForTimeout(400);

  /* ---- top bar and status strip ---- */
  const bar = await p.$$eval('#bar .ib', b => b.map(x => x.textContent.trim()));
  ok(bar.join(',') === 'SHIP,QUESTS,PLANETS,LOG,SOUND,NEW/QUIT,HELP', 'top bar reads ' + bar.join(','));
  const helpRight = await p.evaluate(() => { const b = [...document.querySelectorAll('#bar .ib')]; return b[b.length - 1].getBoundingClientRect().right > b[b.length - 2].getBoundingClientRect().right; });
  ok(helpRight, 'HELP is the right-most button');
  await p.click('#bSound'); ok((await p.textContent('#bSound')).trim() === 'MUTED', 'SOUND toggles to MUTED'); await p.click('#bSound');
  const strip = await p.textContent('#stats');
  ok(!/Warp|Worth|Turn|Round/.test(strip), 'status strip has no Warp, Worth or Turn: ' + strip.replace(/\s+/g, ' ').trim());
  const bankCol = await p.$eval('.bankchip b', b => getComputedStyle(b).color);
  ok(/rgb\(93, 255, 143\)/.test(bankCol), 'bank value is green (' + bankCol + ')');

  /* ---- SHIP and PLANETS are pop-ups ---- */
  await p.evaluate(() => { ui.page = 'market'; render(); });
  await p.click('[data-act="ship"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !$('modal').hidden && !!document.querySelector('#modal .hangar') && ui.page === 'market'), 'SHIP opens over the market');
  ok(/Turn\s*1/.test(await p.textContent('#modal .voyage')) && /Warp/.test(await p.textContent('#modal .voyage')), 'SHIP pop-up shows turn, warp and worth');
  await p.click('#modal [data-act="close"]'); ok(await p.evaluate(() => $('modal').hidden && ui.page === 'market'), 'closing SHIP leaves you in the market');
  await p.click('[data-act="planets"]'); await p.waitForTimeout(200);
  const here = await p.evaluate(() => S.loc), other = (here + 1) % 7;
  await p.click('#modal .ppmap .pl[data-i="' + other + '"]', { force: true }); await p.waitForTimeout(150);
  ok(await p.evaluate(o => V11.ppSel === o && ui.page === 'market' && ui.dest === null, other), 'clicking a world on the PLANETS map selects it, nothing else');
  ok((await p.textContent('#modal .ppR h3')).trim().toUpperCase() === (await p.evaluate(o => GT.PLANETS[o].name, other)).toUpperCase(), 'planet notes follow the selection');
  await p.keyboard.press('ArrowRight'); ok(await p.evaluate(o => V11.ppSel === (o + 1) % 7, other), 'arrow keys step through the worlds');
  await p.click('#modal [data-act="pp-dest"]'); ok(await p.evaluate(() => $('modal').hidden && ui.dest !== null), 'Plot a course sets the destination');
  await p.evaluate(() => { ui.dest = null; });

  /* ---- shops ---- */
  await p.evaluate(() => { ui.page = 'cantina'; render(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelector('.barrow [data-act=leave]').getBoundingClientRect().x < document.querySelector('.barview').getBoundingClientRect().x), 'cantina actions are on the left');
  await p.evaluate(() => { S.visit.explored = true; S.visit.smuggle = GT.smuggleMake(S); ui.page = 'alley'; render(); }); await p.waitForTimeout(200);
  const off = await p.evaluate(() => { const o = document.querySelector('.offer'); if (!o) return null; const cs = getComputedStyle(o); return cs.backgroundImage + '|' + cs.backgroundColor + '|' + getComputedStyle(o.querySelector('.otx') || o).color; });
  ok(off && !/rgb\(255, 255, 255\)\|/.test(off) && /gradient/.test(off), 'back-alley offer card is dark: ' + off);

  /* ---- quest slots: three contracts plus a guild quest ---- */
  const slots = await p.evaluate(() => {
    const Q = GT.Q(S); let n = 0;
    for (let k = 0; k < 12 && GT.contractsActive(S).length < 3; k++) { const c = GT.makeContract(S, 'parcel'); if (c && GT.acceptContract(S, c)) n++; }
    S.rep = 30; const q = GT.REPQ.filter(x => GT.repQuestState(S, x) === 'open')[0];
    const g = q ? GT.acceptRepQuest(S, q.id) : 'none';
    const q2 = GT.REPQ.filter(x => GT.repQuestState(S, x) === 'open')[0];
    const second = q2 ? GT.canAccept(S, GT.repContract(S, q2)) : 'none open';
    const extra = GT.canAccept(S, GT.makeContract(S, 'parcel'));
    return { n, g, second, extra, act: Q.active.length };
  });
  ok(slots.n === 3 && slots.g === true && slots.act === 4, 'three contracts and a guild quest at once: ' + JSON.stringify(slots));
  ok(slots.second !== true && /contract/.test(slots.extra), 'a second guild quest or a fourth contract is refused');

  /* ---- play on: solo win, mid-visit ---- */
  await p.evaluate(() => { ui.page = 'hub'; render(); S.over = { won: true, turn: S.turn, why: 'Test win.' }; settle(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!G.over && !!document.querySelector('#modal [data-act=playon]') && !document.querySelector('#modal [data-act=close]')), 'a mid-visit win ends the race and offers Play on');
  await t.shot('v11-win');
  await p.click('#modal [data-act=playon]'); await p.waitForTimeout(200);
  const po = await p.evaluate(() => ({ over: G.over, res: !!G.result, sover: S.over, modal: $('modal').hidden, log: S.log[0].text, chip: !!document.querySelector('.chip.playon') }));
  ok(!po.over && po.res && !po.sover && po.modal && /won the race/.test(po.log) && po.chip, 'Play on resumes, logs the win and shows a badge');
  const after = await p.evaluate(() => { const to = (S.loc + 1) % 7; S.ship.fuel = S.ship.fuelMax; S.credits = 9e6; S.comps[0].wealth = 9e9; const j = GT.jump(S, to); GT.checkEnd(S); GT.endTurn(G); return { j, over: S.over, gover: G.over }; });
  ok(after.j && !after.over && !after.gover, 'after playing on, neither more money nor a rival ends the game');
  await p.evaluate(() => act('new', { dataset: { sure: 1 } })); await p.waitForTimeout(200);
  ok(/Race result/.test(await p.textContent('#modal')), 'NEW/QUIT report remembers the race result');
  await p.evaluate(() => act('unabandon'));

  /* ---- ruin still ends the game, with no Play on ---- */
  await p.evaluate(() => { S.credits = 0; S.bank = 0; S.cargo.forEach(c => { c.qty = 0; }); S.quests.active = []; S.quests.parcels = 0; GT.checkEnd(S); settle(); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !!G.over && !document.querySelector('#modal [data-act=playon]') && !!document.querySelector('#modal [data-act=close]')), 'ruin ends play with Look around, not Play on');

  /* ---- hot-seat: a rival wins, everyone plays on ---- */
  await p.evaluate(() => { closeModal(); G = null; S = null; ui.setup.n = 2; ui.setup.p[0].name = 'Ann'; ui.setup.p[1].name = 'Bo'; startGame(); G.players.forEach(q => { q.quests.main.state = 'done'; }); });
  await p.evaluate(() => { $('pass').hidden = true; S.over = { won: true, turn: S.turn, why: 'Test.' }; settle(); }); await p.waitForTimeout(200);
  ok(/reaches/.test(await p.textContent('#modal')), 'hot-seat: a mid-visit winner gets the "round finishes" notice');
  await p.click('#modal [data-act=notice-ok]'); await p.waitForTimeout(200);
  await p.evaluate(() => { $('pass').hidden = true; afterJump(S); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!G.over && !!document.querySelector('#modal [data-act=playon]')), 'hot-seat: the race ends after the round with Play on');
  await p.click('#modal [data-act=playon]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !G.over && G.players.every(q => !q.over) && !$('pass').hidden), 'hot-seat: Play on hands the device to the next captain');

  /* ---- mini-games: keyboard only, three kinds of sabotage ---- */
  await p.evaluate(() => { $('pass').hidden = true; closeModal(); MG.run('debris', () => {}); }); await p.waitForTimeout(400);
  const kb = await p.evaluate(() => ({ cls: $('mg').classList.contains('kbonly'), pads: getComputedStyle(document.querySelector('#mg-pads')).display === 'none' }));
  ok(kb.cls && kb.pads, 'odd jobs are keyboard only on a desktop: ' + JSON.stringify(kb));
  const box = await p.$eval('#mg canvas', c => { const r = c.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await p.mouse.move(box[0], box[1]); await p.mouse.down(); await p.waitForTimeout(80);
  ok(await p.evaluate(() => !MG.inp.down && !MG.inp.mouse), 'the mouse does nothing in a game');
  await p.mouse.up(); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const kinds = await p.evaluate(() => { const seen = []; for (let k = 0; k < 3; k++) { const id = MG.pickSabotage(); seen.push(id); MG.sabCount = MG.sabCount || {}; } return seen; });
  ok(new Set(kinds).size === 3, 'sabotage rotates through three games: ' + kinds.join(', '));
  for (const id of ['hack', 'vent']) {
    await p.evaluate(i => { if (!$('mg').hidden) MG.quit && MG.quit(); MG.run(i, () => {}); }, id); await p.waitForTimeout(400);
    await p.keyboard.press('Space'); await p.waitForTimeout(1200);
    await t.shot('v11-' + id);
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  }
  console.log(t.errs.join('\n') || 'no page errors'); if (t.errs.length) fails++;
  console.log(fails ? fails + ' FAILED' : 'all v11 checks pass');
  await t.close(); process.exit(fails ? 1 : 0);
})();
