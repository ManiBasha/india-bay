// Player businesses from a chai stall to a franchise, and renting out homes for passive income.
// Income builds up with Bay time (capped at one game day) until you collect it.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P;
  const LEVELS = [['Chai stall', 50000, 120], ['Chai cafe', 150000, 400], ['Chai chain', 500000, 1200], ['Chai franchise', 2000000, 4000]];
  const now = () => bb.gameMin() / 60;
  function accrued(b) { return Math.round(Math.min(24, Math.max(0, now() - b.since)) * LEVELS[b.lvl][2] * bb.CFG.priceMul); }
  function rentRate(id) { const h = bb.homeById(id); return Math.round(h.price * .012 * bb.CFG.priceMul); }
  function rentAccrued(id) { const r = P().rent[id]; return Math.round(Math.min(7, Math.max(0, (now() - r.since) / 24)) * rentRate(id)); }
  // Beta v1.01.22: collect everything into the bank in one tap, or let it go to the bank by itself
  function toBank(a, why) { const p = P(); p.bank += a; p.stats.earned += a; bb.emit('earn', { n: a, why, bank: true }); }
  function collectAll(quiet) { const p = P(); let tot = 0;
    for (const b of p.biz) { const a = accrued(b); if (a > 0) { tot += a; b.since = now(); } }
    for (const h of p.homes) if (p.rent[h]) { const a = rentAccrued(h); if (a > 0) { tot += a; p.rent[h].since = now(); } }
    if (tot > 0) { toBank(tot, 'business'); bb.save(); if (!quiet) bb.toast(`🏦 Collected ${bb.inr(tot)} into your bank`, '#3ddc97'); else bb.toast(`🏦 Business income ${bb.inr(tot)} went to your bank`, '#3ddc97'); }
    else if (!quiet) bb.toast('Nothing to collect yet', '#d6c8e4'); return tot; }
  const auto = () => !!(P().extra && P().extra.autoCollect);
  // auto collect: once every game hour or so, when there is something waiting
  setInterval(() => { if (!bb.started || !auto()) return; const p = P(); let w = 0; for (const b of p.biz) w += accrued(b); for (const h of p.homes) if (p.rent[h]) w += rentAccrued(h);
    const hourly = p.biz.reduce((s, b) => s + LEVELS[b.lvl][2] * bb.CFG.priceMul, 0) || 1; if (w >= hourly * 3 || (w > 0 && p.homes.some(h => p.rent[h] && rentAccrued(h) >= rentRate(h)))) collectAll(true); }, 30000);
  function sheet() { const p = P(); const pp = bb.ppos(); const z = bb.zoneAt(pp.x, pp.z, 100);
    const biz = p.biz.map((b, i) => { const L = LEVELS[b.lvl], nx = LEVELS[b.lvl + 1]; return bb.rowHtml('c' + i, `${L[0]} · ${bb.esc(b.city)}`, `${bb.inr(L[2] * bb.CFG.priceMul)} per game hour · ${bb.inr(accrued(b))} waiting`, 'Collect') + (nx ? bb.rowHtml('u' + i, `Upgrade to ${nx[0]}`, `${bb.inr(nx[2] * bb.CFG.priceMul)} per game hour`, bb.inr(bb.cost('biz.' + (b.lvl + 1), nx[1])), 'ghost') : ''); }).join('');
    const rent = p.homes.map(h => { const r = p.rent[h]; const H = bb.homeById(h); return r ? bb.rowHtml('r' + h, `${bb.esc(H.name)} · rented`, `${bb.inr(rentRate(h))} per game day · ${bb.inr(rentAccrued(h))} waiting`, 'Collect') + bb.rowHtml('e' + h, 'End the rental', 'You can live there again', 'End', 'ghost') : bb.rowHtml('t' + h, `Rent out ${bb.esc(H.name)}`, `Tenants pay ${bb.inr(rentRate(h))} per game day · you cannot stay there while rented`, 'Rent out', 'ghost'); }).join('');
    bb.openSheet('Business', 'Passive income builds up with Bay time', (p.biz.length || Object.keys(p.rent).length ? bb.rowHtml('all', '🏦 Collect all into the bank', `${bb.inr(p.biz.reduce((t, b) => t + accrued(b), 0) + p.homes.reduce((t, h) => t + (p.rent[h] ? rentAccrued(h) : 0), 0))} waiting from all businesses and rents`, 'Collect all') + `<div class="row"><div class="nm">🔁 Auto collect<small>${auto() ? 'On · income goes straight to your bank' : 'Off · collect by hand'}</small></div><button class="buy ${auto() ? '' : 'ghost'}" data-id="auto">${auto() ? 'On' : 'Off'}</button></div>` : '') + `<h3 style="font-family:var(--f-display);margin:4px 0">Chai business</h3>${biz || '<p class="note">No business yet.</p>'}${z ? bb.rowHtml('new', `Open a chai stall in ${bb.esc(z.name)}`, `Earns ${bb.inr(LEVELS[0][2] * bb.CFG.priceMul)} per game hour`, bb.inr(bb.cost('biz.0', LEVELS[0][1]))) : '<p class="note">Go to a city to open a stall there.</p>'}
      <h3 style="font-family:var(--f-display);margin:14px 0 4px">Rent your homes</h3>${rent || '<p class="note">Buy a home at Sapna Homes first.</p>'}<p class="note">Hiring other players, wages and BayPay arrive with online play.</p>`,
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; const k = id[0], r = id.slice(1);
        if (id === 'all') { collectAll(false); return sheet(); }
        if (id === 'auto') { p.extra = p.extra || {}; p.extra.autoCollect = !p.extra.autoCollect; bb.toast(p.extra.autoCollect ? '🔁 Auto collect on · income goes to your bank' : 'Auto collect off', '#3ddc97'); if (p.extra.autoCollect) collectAll(true); bb.save(); return sheet(); }
        if (id === 'new') { if (!bb.spend(bb.cost('biz.0', LEVELS[0][1]), true)) return; p.biz.push({ city: z.name, lvl: 0, since: now() }); bb.toast(`Your chai stall in ${z.name} is open`, '#3ddc97'); bb.emit('biz'); }
        else if (k === 'c') { const b = p.biz[+r]; const a = accrued(b); if (a <= 0) { bb.toast('Nothing to collect yet', '#d6c8e4'); return; } bb.earn(a, 'business'); b.since = now(); bb.toast(`Collected ${bb.inr(a)}`, '#3ddc97'); }
        else if (k === 'u') { const b = p.biz[+r]; const nx = LEVELS[b.lvl + 1]; if (!bb.spend(bb.cost('biz.' + (b.lvl + 1), nx[1]), true)) return; const a = accrued(b); if (a) bb.earn(a, 'business'); b.lvl++; b.since = now(); bb.toast(`Upgraded to ${nx[0]}`, '#3ddc97'); }
        else if (k === 't') { p.rent[r] = { since: now() }; bb.toast('Tenants moved in', '#3ddc97'); }
        else if (k === 'r') { const a = rentAccrued(r); if (a <= 0) { bb.toast('Rent not due yet', '#d6c8e4'); return; } bb.earn(a, 'rent'); p.rent[r].since = now(); bb.toast(`Rent collected · ${bb.inr(a)}`, '#3ddc97'); }
        else if (k === 'e') { const a = rentAccrued(r); if (a) bb.earn(a, 'rent'); delete p.rent[r]; bb.toast('Rental ended', '#3ddc97'); }
        bb.save(); sheet(); }); }
  bb.BUSINESS = { collectAll, sheet };
  bb.addApp({ id: 'business', label: 'Business', icon: '☕', group: 'menu', fn: sheet });
  bb.addApp({ id: 'baypay', label: 'BayPay', icon: '💸', smart: true, fn: () => bb.openSheet('BayPay', 'Pay friends in the game', '<p class="note" style="font-size:14px">BayPay sends in-game rupees to friends once online play and friends lists arrive. In-game money is never sold for real money.</p>') });
});
