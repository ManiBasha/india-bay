// Jobs: food delivery, auto taxi, cab, truck, bus and dabbawala, through the job agent (5% cut) or freelance.
// Also the RTO office: licences with a short road-rules quiz.
window.BBFeatures.push(function (bb) {
  const W = bb.WORLD, P = () => bb.P;
  const JOBS = {
    delivery: { name: 'Food delivery', veh: ['cycle', 'bike', 'sportsbike'], unlock: 'Start', rate: .32, icon: '🍱', desc: 'Pick up from restaurants, deliver hot' },
    auto: { name: 'Auto taxi', veh: ['auto'], unlock: 'Start', rate: .3, icon: '🛺', desc: 'Short city rides' },
    cab: { name: 'Cab (app style)', veh: ['car', 'sedan', 'taxi', 'suv'], unlock: 'Car licence and 3.5★ in any job', rate: .45, icon: '🚕', desc: 'Better fares, pickier riders' },
    truck: { name: 'Truck delivery', veh: ['truck'], unlock: 'Heavy licence', rate: .2, icon: '🚚', desc: 'City to city cargo, company truck' },
    bus: { name: 'Bus driver', veh: ['bus'], unlock: 'Heavy licence', rate: 0, icon: '🚌', desc: 'Fixed route and stops, company bus' },
    dabba: { name: 'Dabbawala', veh: ['cycle', 'foot'], unlock: 'Start', rate: .35, icon: '🥡', desc: 'Home tiffin to office, by noon, on cycle or local train' }
  };
  let J = null; let freelance = false; let nextOfferT = 0; let hail = null;
  const rating = t => (P().ratings[t] != null ? P().ratings[t] : 3);
  const bestRating = () => Math.max(3, ...Object.values(P().ratings || { a: 3 }));
  function unlocked(t) { const p = P(); if (t === 'cab') return p.lic.lmv && bestRating() >= 3.5; if (t === 'truck' || t === 'bus') return p.lic.heavy; return true; }
  function needVeh(t) { const v = bb.player.mode === 'drive' ? bb.player.veh : null; const ok = JOBS[t].veh; if (ok.includes('foot') && bb.player.mode === 'foot') return true; return v && ok.includes(v.type); }
  function zoneHere() { const p = bb.ppos(); return bb.zoneAt(p.x, p.z, 120) || W.zones.find(z => z.id === 'mumbai'); }
  function spotIn(z, avoid) { for (let k = 0; k < 30; k++) { const i = Math.floor(Math.random() * z.nx), j = Math.floor(Math.random() * z.nz); const bx = z.x0 + i * 80 + 40, bz = z.z0 + j * 80 + 40; const side = bb.mpick(['n', 's', 'e', 'w']); const [x, zz] = bb.edgePos(bx, bz, side, bb.MR(-20, 20), 33);
      if (!bb.drivable(x, zz) || bb.isWater(bx, bz)) continue; if (avoid && Math.hypot(x - avoid.x, zz - avoid.z) < Math.min(300, z.nx * 40)) continue; return { x, z: zz }; } return { x: z.x0 + 40, z: z.z0 - 8 }; }
  const PLACE = ['Main market', 'Station road', 'Old bazaar', 'College gate', 'Hospital chowk', 'Temple lane', 'Bus depot', 'Tech park', 'Housing society', 'Cinema hall', 'Circle', 'Ghat road'];
  const nameAt = (z) => `${bb.mpick(PLACE)}, ${z.name}`;
  function payFor(dist, t, x, z) { const r = rating(t); return Math.round((26 + dist * JOBS[t].rate) * (0.8 + 0.1 * r) * bb.fareMultAt(x, z)); }
  function newJob(t) { const z = zoneHere(); const pp = bb.ppos(); let from, to, timer, pay, extra = {};
    if (t === 'delivery') { const rest = bb.pois.filter(p => p.type === 'food' && p.zone === z).sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z)); const r = rest[Math.floor(Math.random() * Math.min(3, rest.length))] || { x: pp.x + 40, z: pp.z, name: 'Restaurant' };
      from = { x: r.x, z: r.z, name: r.name }; const d = spotIn(z, from); to = Object.assign(d, { name: nameAt(z) }); }
    else if (t === 'truck') { const big = W.zones.filter(q => q.size !== 'small' && q.id !== z.id); const dz = bb.mpick(big); from = Object.assign(spotIn(z), { name: `${z.name} goods depot` }); to = Object.assign(spotIn(dz), { name: `${dz.name} warehouse` }); }
    else if (t === 'bus') { const stops = []; let last = pp; for (let i = 0; i < 5; i++) { const s = spotIn(z, last); stops.push(Object.assign(s, { name: `Stop ${i + 1} · ${bb.mpick(PLACE)}` })); last = s; } extra.stops = stops; extra.i = 0; from = stops[0]; to = stops[stops.length - 1]; }
    else if (t === 'dabba') { from = Object.assign(spotIn(z), { name: `Home tiffin · ${bb.mpick(['Sharma', 'Patil', 'Desai', 'Iyer', 'Khan', 'Shah'])} family` }); const mum = W.zones.find(q => q.id === 'mumbai'); const off = z.id === 'mumbai' ? bb.mpick([{ x: 2980, z: 8752, name: 'CSMT offices' }, { x: 2820, z: 8292, name: 'BKC office tower' }, { x: 2900, z: 8836, name: 'Churchgate offices' }]) : Object.assign(spotIn(z, from), { name: `Office block, ${z.name}` }); to = off; }
    else { const p0 = hail ? hail : Object.assign(spotIn(z), { name: nameAt(z) }); from = p0; let dz = z; if (Math.random() < .15) { const near = W.zones.filter(q => q !== z && Math.hypot(q.x0 - z.x0, q.z0 - z.z0) < 1600); if (near.length) dz = bb.mpick(near); } to = Object.assign(spotIn(dz, from), { name: nameAt(dz) }); }
    const dist = Math.hypot(to.x - from.x, to.z - from.z); timer = t === 'bus' ? 240 : t === 'truck' ? Math.round(dist / 14 + 90) : Math.round(dist / (t === 'delivery' || t === 'dabba' ? 6 : 9) + 30);
    pay = t === 'bus' ? 0 : payFor(dist, t, from.x, from.z);
    J = { t, stage: t === 'bus' ? 'route' : 'pickup', from, to, timer, pay, dist, crashes: 0, agent: !freelance, extra, started: performance.now() };
    if (t === 'truck' || t === 'bus') companyVehicle(t);
    bb.toast(`${JOBS[t].name}: ${J.stage === 'route' ? 'drive your route' : 'pick up at ' + from.name}`, '#ffc93c'); bb.emit('jobStart', J); }
  function companyVehicle(t) { const v0 = bb.player.veh; if (v0 && v0.type === t) return; const pp = bb.ppos(); const r = bb.nearestRoadPoint(pp.x, pp.z, 300); if (!r) return; const e = r.e; const nx = e.dz, nz = -e.dx;
    const v = bb.makeVeh(t, r.x + nx * (e.w / 2 + 2.4), r.z + nz * (e.w / 2 + 2.4), Math.atan2(e.dx, e.dz), 'parked', { fuel: 100, company: true }); J.company = v; bb.toast(`Your company ${bb.SPEC[t].label.toLowerCase()} is parked on the road nearby`, '#ffc93c'); }
  function finish(ok, why) { const t = J.t; const p = P(); let r = rating(t); if (ok) r = Math.min(5, r + (J.crashes ? .05 : .15)); else r = Math.max(1, r - .25); p.ratings[t] = Math.round(r * 100) / 100;
    if (ok) { let pay = J.pay; const bonus = Math.max(0, Math.round(J.timer * 1.5)); pay += bonus; if (J.agent) pay = Math.round(pay * .95); bb.earn(pay, 'job'); p.trips++; p.stats.trips++; p.jobs[t] = (p.jobs[t] || 0) + 1;
      bb.toast(`+${bb.inr(pay)}${J.agent ? ' · agent kept 5%' : ''}<br><span style="font-size:15px;font-weight:600">${JOBS[t].name} · rating ${r.toFixed(1)}★</span>`, '#3ddc97'); bb.emit('job', { type: t, pay, agent: J.agent }); }
    else bb.toast(`${why} · rating ${r.toFixed(1)}★`, '#ff5d73');
    if (J.company && bb.player.veh !== J.company) bb.removeVeh(J.company); const t2 = t, comp = J.company; J = null; hail = null; bb.setDirty();
    if (ok && !freelance) setTimeout(() => { if (!J && bb.started && !bb.inside) { newJob(t2); if (comp && bb.player.veh === comp) J.company = comp; } }, 2500); else nextOfferT = bb.MR(15, 40); }
  bb.on('crash', () => { if (J) J.crashes++; });
  bb.on('travel', () => { if (J) { if (J.company) bb.removeVeh(J.company); J = null; hail = null; bb.toast('You left town · current job cancelled', '#d6c8e4'); } });
  bb.onUpdate(dt => {
    if (!J) { if (freelance && JOBS[freelanceType] && !bb.inside && needVeh(freelanceType)) { nextOfferT -= dt; if (nextOfferT <= 0 && !hail) { const z = zoneHere(); if (['auto', 'cab'].includes(freelanceType)) { hail = Object.assign(spotIn(z), { name: 'Waving customer' }); } else { newJob(freelanceType); } } }
      if (hail) { const pp = bb.ppos(); const v = bb.player.veh; if (v && Math.hypot(pp.x - hail.x, pp.z - hail.z) < 9 && Math.abs(v.v) < 4) newJob(freelanceType); } return; }
    J.timer -= dt; const pp = bb.ppos(); const v = bb.player.veh; const slow = !v || Math.abs(v.v) < 6;
    if (J.timer <= 0 && J.t !== 'bus') return finish(false, 'Too late · customer cancelled');
    if (J.t === 'bus') { const s = J.extra.stops[J.extra.i]; if (needVeh('bus') && Math.hypot(pp.x - s.x, pp.z - s.z) < 9 && slow) { J.extra.dwell = (J.extra.dwell || 0) + dt; if (J.extra.dwell > 2.5) { J.extra.dwell = 0; const fare = Math.round(bb.MR(4, 10) * 12 * bb.fareMultAt(pp.x, pp.z)); J.pay += fare; bb.toast(`${s.name} · ${Math.floor(bb.MR(3, 14))} passengers · +${bb.inr(fare)}`, '#3ddc97'); J.extra.i++; if (J.extra.i >= J.extra.stops.length) { J.timer = Math.max(0, J.timer); finish(true); } } } return; }
    const tg = J.stage === 'pickup' ? J.from : J.to; const d = Math.hypot(pp.x - tg.x, pp.z - tg.z);
    if (d < (J.t === 'truck' ? 12 : 8) && slow && needVeh(J.t)) { if (J.stage === 'pickup') { J.stage = 'drop'; if (v && v.m.userData.pax) v.m.userData.pax.visible = true; bb.toast(J.t === 'delivery' ? 'Order picked up · deliver it hot' : J.t === 'truck' ? 'Cargo loaded · drive safe' : J.t === 'dabba' ? 'Dabba collected · office by noon' : 'Sawari on board · chalo!', '#ffc93c'); bb.hornSfx(); }
      else { if (v && v.m.userData.pax) v.m.userData.pax.visible = false; finish(true); } } });
  let freelanceType = 'auto';
  bb.addMission(() => { if (!J) { if (hail) return { pri: 40, k: `Freelance · ${JOBS[freelanceType].name}`, t: 'A customer is waving', m: 'Drive up and stop next to them', target: { x: hail.x, z: hail.z, col: 0x7fd858 } }; return null; }
    const pp = bb.ppos(); const tl = Math.max(0, Math.ceil(J.timer)); const tt = `${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`;
    if (J.t === 'bus') { const s = J.extra.stops[J.extra.i]; return { pri: 50, k: `Bus route · stop ${J.extra.i + 1} of ${J.extra.stops.length}`, t: s.name, m: `${Math.round(Math.hypot(pp.x - s.x, pp.z - s.z) * 2.4 / 10) * 10} m · stop in the ring for 3 s · earned ${bb.inr(J.pay)}`, target: { x: s.x, z: s.z, col: 0xffb347 } }; }
    const tg = J.stage === 'pickup' ? J.from : J.to; const need = needVeh(J.t) ? '' : ` · needs ${JOBS[J.t].veh.map(t => t === 'foot' ? 'on foot' : bb.SPEC[t].label).join(' or ')}`;
    return { pri: 50, cls: J.stage === 'drop' ? 'ride' : '', k: `${JOBS[J.t].name} · ${J.agent ? 'agent' : 'freelance'} · ${rating(J.t).toFixed(1)}★`, t: (J.stage === 'pickup' ? 'Pick up: ' : 'Drop: ') + tg.name, m: `${Math.round(Math.hypot(pp.x - tg.x, pp.z - tg.z) * 2.4 / 10) * 10} m · ${tt} left · ${bb.inr(J.pay)}${need}`, target: { x: tg.x, z: tg.z, col: J.stage === 'pickup' ? 0x3ddc97 : 0xff9f1c } }; });
  function jobsSheet() { const p = P(); const rows = Object.entries(JOBS).map(([id, j]) => { const ok = unlocked(id); const r = rating(id); return bb.rowHtml(id, `${j.icon} ${j.name}`, `${j.desc} · ${ok ? r.toFixed(1) + '★ · ' + (p.jobs[id] || 0) + ' done' : 'Unlock: ' + j.unlock}`, J && J.t === id ? 'Active' : ok ? 'Start' : 'Locked', ok ? '' : 'ghost'); }).join('');
    bb.openSheet('Jobs', `${freelance ? 'Freelance · keep 100%, find your own customers' : 'Job agent · steady work, agent keeps 5%'}`, `<div class="chips"><button class="chip${freelance ? '' : ' on'}" data-mode="agent">Agent</button><button class="chip${freelance ? ' on' : ''}" data-mode="free">Freelance</button></div>${rows}${J ? bb.rowHtml('quit', 'Quit current job', 'Your rating drops a little', 'Quit', 'danger') : ''}<p class="note">Higher ratings bring better-paying customers. Truck and bus jobs give you a company vehicle.</p>`,
      s => s.onclick = e => { const m = e.target.dataset.mode; if (m) { freelance = m === 'free'; jobsSheet(); return; } const id = e.target.dataset.id; if (!id) return; if (id === 'quit') { finish(false, 'You quit the job'); bb.closeSheet(); return; }
        if (J) { bb.toast('Finish or quit your current job first', '#ff9f1c'); return; } if (!unlocked(id)) { bb.toast(`Locked · ${JOBS[id].unlock}`, '#ff9f1c'); return; }
        if (!['truck', 'bus'].includes(id) && !needVeh(id)) { bb.toast(`You need to be ${JOBS[id].veh.map(t => t === 'foot' ? 'on foot' : 'on a ' + bb.SPEC[t].label.toLowerCase()).join(' or ')}`, '#ff9f1c'); if (id === 'delivery' && bb.P.cash >= bb.price(50)) { rentCycle(); } return; }
        bb.closeSheet(); if (freelance) { freelanceType = id; nextOfferT = 3; bb.toast(id === 'auto' || id === 'cab' ? 'Freelance · look for waving customers' : 'Freelance · orders will ping your phone', '#ffc93c'); } else newJob(id); }); }
  function rentCycle() { if (!bb.spend(bb.price(50))) return; const pp = bb.ppos(); const r = bb.nearestRoadPoint(pp.x, pp.z, 200); if (!r) return; const e = r.e; const v = bb.makeVeh('cycle', r.x + e.dz * (e.w / 2 + 1), r.z - e.dx * (e.w / 2 + 1), Math.atan2(e.dx, e.dz), 'parked', { company: true }); bb.toast(`Rented a cycle for ${bb.inr(bb.price(50))} · it is next to you`, '#3ddc97'); }
  bb.poiHandlers.jobs = () => jobsSheet();
  bb.addApp({ id: 'jobs', label: 'Jobs', icon: '💼', group: 'menu', fn: jobsSheet });

  /* RTO: licences */
  const LIC = { two: { name: 'Two-wheeler licence (MCWG)', fee: 1500 }, lmv: { name: 'Car licence (LMV)', fee: 2500 }, heavy: { name: 'Heavy vehicle licence', fee: 6000, need: 'lmv' } };
  const QUIZ = [['In India, vehicles keep to which side of the road?', ['Left', 'Right', 'Middle'], 0], ['What should you do at a red traffic light?', ['Stop', 'Slow down', 'Honk and go'], 0],
    ['Must the pillion rider on a motorbike wear a helmet?', ['Yes', 'Only on highways', 'No'], 0], ['What does PUC stand for?', ['Pollution Under Control', 'Public Utility Card', 'Permit Under Commerce'], 0],
    ['What is the minimum age for a car (LMV) licence?', ['18', '16', '21'], 0], ['An ambulance comes up behind you with its siren on. You should:', ['Move aside and let it pass', 'Speed up', 'Stop in the middle'], 0],
    ['Holding a phone while driving is:', ['Not allowed', 'Allowed at signals', 'Allowed on bikes'], 0], ['A zebra crossing is for:', ['Pedestrians', 'Cycles only', 'Parking'], 0],
    ['On Indian roads you should overtake from the:', ['Right', 'Left', 'Either side'], 0]];
  function rtoSheet(poi) { const p = P(); bb.openSheet(poi.name, 'Pass a 3-question road-rules test', Object.entries(LIC).map(([id, l]) => bb.rowHtml(id, l.name, p.lic[id] ? 'You have this licence' : l.need && !p.lic[l.need] ? 'Needs a car licence first' : 'Test fee', p.lic[id] ? 'Owned' : bb.inr(bb.price(l.fee)), p.lic[id] ? 'ghost' : '')).join(''),
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id || p.lic[id]) return; const l = LIC[id]; if (l.need && !p.lic[l.need]) { bb.toast('Get a car licence first', '#ff9f1c'); return; } if (!bb.spend(bb.price(l.fee))) return; quiz(poi, id, 0, QUIZ.slice().sort(() => Math.random() - .5).slice(0, 3)); }); }
  function quiz(poi, id, i, qs) { if (i >= qs.length) { P().lic[id] = true; bb.save(); bb.closeSheet(); bb.toast(`Passed · ${LIC[id].name} issued`, '#3ddc97'); bb.emit('licence', id); return; }
    const [q, opts, ans] = qs[i]; const order = opts.map((o, k) => k).sort(() => Math.random() - .5);
    bb.openSheet(`Question ${i + 1} of 3`, LIC[id].name, `<p style="font-size:16px;line-height:1.5;margin:0 0 10px">${bb.esc(q)}</p>${order.map(k => `<div class="row"><div class="nm">${bb.esc(opts[k])}</div><button class="buy ghost" data-a="${k}">Choose</button></div>`).join('')}`,
      s => s.onclick = e => { const a = e.target.dataset.a; if (a == null) return; if (+a === ans) quiz(poi, id, i + 1, qs); else { bb.closeSheet(); bb.toast('Wrong answer · test failed. Pay the fee and try again.', '#ff5d73'); } }); }
  bb.poiHandlers.rto = rtoSheet;
  bb.JOBS = { JOBS, get current() { return J; }, rating };
});
