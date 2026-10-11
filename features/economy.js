// Player businesses from a chai stall to a franchise, and renting out homes for passive income.
// Income builds up with Bay time (capped at one game day) until you collect it.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P;
  const LEVELS = [['Chai stall', 50000, 120], ['Chai cafe', 150000, 400], ['Chai chain', 500000, 1200], ['Chai franchise', 2000000, 4000]];
  const now = () => bb.gameMin() / 60;
  function accrued(b) { return Math.round(Math.min(24, Math.max(0, now() - b.since)) * LEVELS[b.lvl][2] * bb.CFG.priceMul); }
  function rentRate(id) { const h = bb.homeById(id); return Math.round(h.price * .012 * bb.CFG.priceMul); }
  function rentAccrued(id) { const r = P().rent[id]; return Math.round(Math.min(7, Math.max(0, (now() - r.since) / 24)) * rentRate(id)); }
  function sheet() { const p = P(); const pp = bb.ppos(); const z = bb.zoneAt(pp.x, pp.z, 100);
    const biz = p.biz.map((b, i) => { const L = LEVELS[b.lvl], nx = LEVELS[b.lvl + 1]; return bb.rowHtml('c' + i, `${L[0]} · ${bb.esc(b.city)}`, `${bb.inr(L[2] * bb.CFG.priceMul)} per game hour · ${bb.inr(accrued(b))} waiting`, 'Collect') + (nx ? bb.rowHtml('u' + i, `Upgrade to ${nx[0]}`, `${bb.inr(nx[2] * bb.CFG.priceMul)} per game hour`, bb.inr(bb.price(nx[1])), 'ghost') : ''); }).join('');
    const rent = p.homes.map(h => { const r = p.rent[h]; const H = bb.homeById(h); return r ? bb.rowHtml('r' + h, `${bb.esc(H.name)} · rented`, `${bb.inr(rentRate(h))} per game day · ${bb.inr(rentAccrued(h))} waiting`, 'Collect') + bb.rowHtml('e' + h, 'End the rental', 'You can live there again', 'End', 'ghost') : bb.rowHtml('t' + h, `Rent out ${bb.esc(H.name)}`, `Tenants pay ${bb.inr(rentRate(h))} per game day · you cannot stay there while rented`, 'Rent out', 'ghost'); }).join('');
    bb.openSheet('Business', 'Passive income builds up with Bay time', `<h3 style="font-family:var(--f-display);margin:4px 0">Chai business</h3>${biz || '<p class="note">No business yet.</p>'}${z ? bb.rowHtml('new', `Open a chai stall in ${bb.esc(z.name)}`, `Earns ${bb.inr(LEVELS[0][2] * bb.CFG.priceMul)} per game hour`, bb.inr(bb.price(LEVELS[0][1]))) : '<p class="note">Go to a city to open a stall there.</p>'}
      <h3 style="font-family:var(--f-display);margin:14px 0 4px">Rent your homes</h3>${rent || '<p class="note">Buy a home at Sapna Homes first.</p>'}<p class="note">Hiring other players, wages and BayPay arrive with online play.</p>`,
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; const k = id[0], r = id.slice(1);
        if (id === 'new') { if (!bb.spend(bb.price(LEVELS[0][1]), true)) return; p.biz.push({ city: z.name, lvl: 0, since: now() }); bb.toast(`Your chai stall in ${z.name} is open`, '#3ddc97'); bb.emit('biz'); }
        else if (k === 'c') { const b = p.biz[+r]; const a = accrued(b); if (a <= 0) { bb.toast('Nothing to collect yet', '#d6c8e4'); return; } bb.earn(a, 'business'); b.since = now(); bb.toast(`Collected ${bb.inr(a)}`, '#3ddc97'); }
        else if (k === 'u') { const b = p.biz[+r]; const nx = LEVELS[b.lvl + 1]; if (!bb.spend(bb.price(nx[1]), true)) return; const a = accrued(b); if (a) bb.earn(a, 'business'); b.lvl++; b.since = now(); bb.toast(`Upgraded to ${nx[0]}`, '#3ddc97'); }
        else if (k === 't') { p.rent[r] = { since: now() }; bb.toast('Tenants moved in', '#3ddc97'); }
        else if (k === 'r') { const a = rentAccrued(r); if (a <= 0) { bb.toast('Rent not due yet', '#d6c8e4'); return; } bb.earn(a, 'rent'); p.rent[r].since = now(); bb.toast(`Rent collected · ${bb.inr(a)}`, '#3ddc97'); }
        else if (k === 'e') { const a = rentAccrued(r); if (a) bb.earn(a, 'rent'); delete p.rent[r]; bb.toast('Rental ended', '#3ddc97'); }
        bb.save(); sheet(); }); }
  bb.addApp({ id: 'business', label: 'Business', icon: '☕', group: 'menu', fn: sheet });
  bb.addApp({ id: 'baypay', label: 'BayPay', icon: '💸', smart: true, fn: () => bb.openSheet('BayPay', 'Pay friends in the game', '<p class="note" style="font-size:14px">BayPay sends in-game rupees to friends once online play and friends lists arrive. In-game money is never sold for real money.</p>') });
});
