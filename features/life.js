// Indian road life: traffic police checks, e-challans, tolls, speed cameras, helmets, PUC, insurance,
// mechanic garages, roadside help and monsoon flooding.
window.BBFeatures.push(function (bb) {
  const W = bb.WORLD, T = bb.THREE, P = () => bb.P;
  const M = { cone: bb.LMat('#ff6a1a'), white: bb.LMat('#f3f1ec'), khaki: bb.LMat('#b89a5a'), pole: bb.LMat('#3b3a40'), cam: bb.LMat('#202226') };
  function onRoad(x, z) { const r = bb.nearestRoadPoint(x, z, 200); return r; }
  /* checkpoints: barricades and a traffic cop */
  const checks = W.checkpoints.map(([x, z]) => { const r = onRoad(x, z); if (!r) return null; const e = r.e, nx = e.dz, nz = -e.dx, a = Math.atan2(e.dx, e.dz);
    for (const s of [-1, 1]) { bb.boxRot(3, 1, .3, r.x + nx * s * (e.w / 2 - 1.5), .5, r.z + nz * s * (e.w / 2 - 1.5), a + Math.PI / 2, M.white); }
    for (let k = 0; k < 4; k++) { const g = new T.ConeGeometry(.3, .8, 8); g.translate(r.x + e.dx * (k * 2 - 3), .4, r.z + e.dz * (k * 2 - 3)); bb.addStatic(g, M.cone); }
    const cop = bb.buildPerson(M.khaki); cop.position.set(r.x + nx * (e.w / 2 + 1), .3, r.z + nz * (e.w / 2 + 1)); cop.rotation.y = a + Math.PI / 2; cop.userData.arms[1].rotation.x = -2.6; bb.scene.add(cop);
    bb.addSign('NAKABANDI', r.x + nx * (e.w / 2 + 2.5), 2.6, r.z + nz * (e.w / 2 + 2.5), a, 4, 1, '#ffffff', '#1d3f9a'); return { x: r.x, z: r.z, last: -999 }; }).filter(Boolean);
  /* tolls */
  const tolls = W.tolls.map(([x, z, name]) => { const r = onRoad(x, z); if (!r) return null; const e = r.e, nx = e.dz, nz = -e.dx, a = Math.atan2(e.dx, e.dz);
    for (const s of [-1, 1]) bb.boxRot(1, 6, 1, r.x + nx * s * (e.w / 2 + .8), 3, r.z + nz * s * (e.w / 2 + .8), a, M.white); bb.boxRot(e.w + 3, 1.2, 2, r.x, 6.2, r.z, a, bb.LMat('#1f6f4a')); bb.addSign(name.toUpperCase() + ' · FASTag', r.x, 7.6, r.z, a, 10, 1.2, '#ffffff', '#1f6f4a'); return { x: r.x, z: r.z, name, last: -999 }; }).filter(Boolean);
  /* speed cameras */
  const cams = W.speedCams.map(([x, z]) => { const r = onRoad(x, z); if (!r) return null; const e = r.e, nx = e.dz, nz = -e.dx; const px = r.x + nx * (e.w / 2 + 1.2), pz = r.z + nz * (e.w / 2 + 1.2); const g = new T.CylinderGeometry(.12, .15, 6, 6); g.translate(px, 3, pz); bb.addStatic(g, M.pole); bb.box(.6, .5, .9, px - nx * 1, 6, pz - nz * 1, M.cam); return { x: r.x, z: r.z, last: -999 }; }).filter(Boolean);
  /* floods */
  const waterMat = new T.MeshPhongMaterial({ color: 0x5a6e6a, transparent: true, opacity: .78, shininess: 80 });
  const floods = W.floods.map(([x, z]) => { const m = new T.Mesh(new T.CircleGeometry(30, 24), waterMat); m.rotation.x = -Math.PI / 2; m.position.set(x, .14, z); m.visible = false; bb.scene.add(m); return { x, z, m }; });
  bb.flushStatic();
  let flooded = false;
  bb.speedMods.push(v => { if (!flooded) return 1; for (const f of floods) if (Math.hypot(v.pos.x - f.x, v.pos.z - f.z) < 28) { return v.spec.two ? .25 : v.spec.len > 7 ? .6 : .35; } return 1; });
  let floodWarn = 0;

  function violations(v) { const p = P(); const sp = v.spec; const out = []; const C = bb.CFG.challan; const owned = v.owned ? p.cars[v.ownedIdx] : null;
    if (sp.lic && !p.lic[sp.lic]) out.push(['licence', 'Driving without a licence', C.licence]);
    if (sp.two && v.type !== 'cycle' && !p.helmet) out.push(['helmet', 'No helmet', C.helmet]);
    if (owned && sp.fuel && !(owned.puc >= bb.gameDay)) out.push(['puc', 'No valid PUC certificate', C.puc]);
    if (owned && sp.fuel && !(owned.ins >= bb.gameDay)) out.push(['insurance', 'No insurance', C.insurance]);
    if (!owned && !v.company && v.state === 'player') out.push(['stolen', 'Vehicle papers do not match', 0]); return out; }
  function checkSheet(v) { const list = violations(v); const total = list.reduce((a, x) => a + bb.price(x[2]), 0); const stolen = list.some(x => x[0] === 'stolen');
    if (!list.length) { bb.toast('Traffic police: "Papers theek hain. Drive safe!"', '#3ddc97'); bb.emit('checkPassed'); return; }
    v.v = 0; bb.openSheet('Traffic police check', 'Nakabandi · licence and papers, please', list.map(x => `<div class="row"><div class="nm">${bb.esc(x[1])}</div><b>${x[2] ? bb.inr(bb.price(x[2])) : 'Suspicious'}</b></div>`).join('') +
      bb.rowHtml('pay', 'Pay the e-challan', stolen ? 'They also want to check the chassis number' : 'Settled online, no trouble', bb.inr(total)) + bb.rowHtml('argue', 'Argue', '"Sir, I am the CM\'s cousin\'s neighbour…" Risky', 'Argue', 'ghost') + bb.rowHtml('bribe', 'Offer chai-paani', 'Might cost a third. Might cost a lot more.', bb.inr(Math.round(total * .3 / 10) * 10 || 200), 'danger'),
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; bb.closeSheet();
      if (stolen && id !== 'bribe') { bb.addWanted(2, 'Stolen vehicle at checkpoint'); }
      if (id === 'pay') { if (P().bank + P().cash >= total) { bb.spend(total, true); bb.toast(`e-challan paid · ${bb.inr(total)}`, '#3ddc97'); } else for (const x of list) if (x[2]) bb.addChallan(x[2], x[1]); }
      else if (id === 'argue') { if (Math.random() < .35) bb.toast('Cop: "Theek hai, jaao. Next time papers ready rakhna."', '#3ddc97'); else { bb.toast('Arguing made it worse · extra ₹500', '#ff5d73'); for (const x of list) if (x[2]) bb.addChallan(x[2], x[1]); bb.addChallan(500, 'Obstructing police'); if (Math.random() < .3) bb.addWanted(1, 'Argued with police'); } }
      else { const b = Math.round(total * .3 / 10) * 10 || 200; if (Math.random() < .5 && P().cash >= b) { P().cash -= b; bb.toast('The cop pockets it and waves you on', '#ffc93c'); } else { bb.toast('Anti-corruption sting! Fines doubled and a star', '#ff5d73'); for (const x of list) if (x[2]) bb.addChallan(x[2] * 2, x[1]); bb.addChallan(2000, 'Attempted bribe'); bb.addWanted(1, 'Bribery'); } } bb.emit('checkpoint', id); }); }
  let helmetWarned = false;
  bb.on('enterVehicle', v => { if (v.spec.two && v.type !== 'cycle' && !P().helmet && !helmetWarned) { helmetWarned = true; bb.toast('No helmet · police will fine you and falls hurt more', '#ff9f1c'); } if (v.spec.lic && !P().lic[v.spec.lic]) bb.toast(`You have no ${v.spec.lic === 'two' ? 'two-wheeler' : v.spec.lic === 'heavy' ? 'heavy vehicle' : 'car'} licence · RTO offices issue them`, '#ff9f1c'); });
  bb.onUpdate((dt, now) => { const v = bb.player.mode === 'drive' ? bb.player.veh : null; flooded = bb.weather === 'monsoon' || bb.weather === 'rain'; for (const f of floods) f.m.visible = flooded && !bb.inside;
    if (!v || bb.inside) return; const kmh = Math.abs(v.v) * 2.4;
    for (const c of checks) if (Math.hypot(v.pos.x - c.x, v.pos.z - c.z) < 11 && now - c.last > 120) { c.last = now; if (bb.player.stars) { bb.addWanted(1, 'Drove through a nakabandi'); continue; } checkSheet(v); }
    for (const t of tolls) if (Math.hypot(v.pos.x - t.x, v.pos.z - t.z) < 10 && now - t.last > 60) { t.last = now; if (v.spec.two || v.spec.pedal) { bb.toast('Two-wheelers ride free through the toll', '#d6c8e4'); continue; } const fee = bb.price(bb.CFG.toll * (v.spec.len > 7 ? 2.5 : 1)); if (P().bank >= fee) { P().bank -= fee; bb.toast(`FASTag · ${t.name} · ${bb.inr(fee)} from your bank`, '#ffc93c'); } else { bb.addChallan(fee * 2, 'Toll without FASTag balance'); } bb.setDirty(); }
    for (const c of cams) if (Math.hypot(v.pos.x - c.x, v.pos.z - c.z) < 16 && now - c.last > 30 && kmh > 80) { c.last = now; bb.addChallan(bb.CFG.challan.speeding, `Speeding at ${Math.round(kmh)} km/h`); }
    if (flooded && now - floodWarn > 20) for (const f of floods) if (Math.hypot(v.pos.x - f.x, v.pos.z - f.z) < 30) { floodWarn = now; bb.toast('Waterlogged road · go slow', '#5fb4ff'); break; } });

  /* mechanic garage */
  function repairCost(v) { const c = v.owned ? P().cars[v.ownedIdx] : null; const base = Math.ceil((100 - v.hp) * 40); if (c && c.ins >= bb.gameDay) return Math.min(base, 500); return base; }
  function mechSheet(poi) { const v = bb.player.veh || bb.ownedVeh.filter(Boolean).sort((a, b) => a.pos.distanceTo(bb.ppos()) - b.pos.distanceTo(bb.ppos()))[0];
    if (!v || v.pos.distanceTo(bb.ppos()) > 20) { bb.toast('Bring a vehicle to the garage', '#ff9f1c'); return; } const c = v.owned ? P().cars[v.ownedIdx] : null; const cost = bb.price(repairCost(v));
    bb.openSheet(poi.name, `${v.spec.label} · body ${Math.round(v.hp)}%`, bb.rowHtml('fix', 'Full repair', c && c.ins >= bb.gameDay ? 'Insured · you pay a small deductible' : 'Denting, painting and engine', v.hp >= 99 ? 'Fine' : bb.inr(cost), v.hp >= 99 ? 'ghost' : '') +
      (c ? bb.rowHtml('ins', 'Insurance', c.ins >= bb.gameDay ? `Covered for ${c.ins - bb.gameDay} more game days` : 'Not insured · police can fine you', bb.inr(bb.price(3000)), c.ins >= bb.gameDay ? 'ghost' : '') : '') + bb.rowHtml('service', 'Quick service', 'Oil change and a wash', bb.inr(bb.price(400)), 'ghost'),
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; if (id === 'fix' && v.hp < 99) { if (!bb.spend(cost, true)) return; bb.closeSheet(); bb.startActivity({ kind: 'Mechanic', title: 'Repairing your ' + v.spec.label.toLowerCase(), minutes: 30, effects: {}, onDone: () => { v.hp = 100; bb.save(); bb.toast('Good as new', '#3ddc97'); } }); }
      if (id === 'ins' && c) { if (!bb.spend(bb.price(3000), true)) return; c.ins = Math.max(c.ins, bb.gameDay) + 30; bb.save(); bb.toast('Insured for 30 game days', '#3ddc97'); mechSheet(poi); }
      if (id === 'service' && bb.spend(bb.price(400))) { v.hp = Math.min(100, v.hp + 10); bb.toast('Serviced and washed', '#3ddc97'); } }); }
  bb.poiHandlers.mechanic = mechSheet;
  function helpSheet() { const v = bb.player.veh || bb.ownedVeh.filter(Boolean).sort((a, b) => a.pos.distanceTo(bb.ppos()) - b.pos.distanceTo(bb.ppos()))[0];
    bb.openSheet('Roadside help', v ? `${v.spec.label} · fuel ${Math.round(v.fuel)}% · body ${Math.round(v.hp)}%` : 'No vehicle nearby', v ? bb.rowHtml('fuel', 'Fuel delivery', 'Brings you to 30% tank', bb.inr(bb.price(500))) + bb.rowHtml('tow', 'Tow and patch-up', 'Body back to 60%', bb.inr(bb.price(1500))) : '',
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id || !v) return; if (id === 'fuel') { if (!v.spec.fuel) { bb.toast('No fuel needed', '#d6c8e4'); return; } if (!bb.spend(bb.price(500), true)) return; bb.closeSheet(); bb.startActivity({ kind: 'Roadside help', title: 'Waiting for fuel delivery', minutes: 20, onDone: () => { v.fuel = Math.max(v.fuel, 30); bb.toast('Fuel delivered', '#3ddc97'); } }); }
        if (id === 'tow') { if (!bb.spend(bb.price(1500), true)) return; bb.closeSheet(); bb.startActivity({ kind: 'Roadside help', title: 'Mechanic on the way', minutes: 40, onDone: () => { v.hp = Math.max(v.hp, 60); bb.toast('Patched up · get a full repair at a garage', '#3ddc97'); } }); } }); }
  function challanSheet() { const p = P(); const tot = p.challans.reduce((a, c) => a + c.amt, 0);
    bb.openSheet('e-Challans', tot ? `${p.challans.length} unpaid · ${bb.inr(tot)}` : 'All clear', p.challans.slice(-12).reverse().map((c, i) => `<div class="row"><div class="nm">${bb.esc(c.why)}<small>${bb.esc(c.day)}</small></div><b>${bb.inr(c.amt)}</b></div>`).join('') + (tot ? bb.rowHtml('pay', 'Pay all online', 'From your bank and cash', bb.inr(tot)) : '<p class="note">No challans. Keep it that way.</p>'),
      s => s.onclick = e => { if (e.target.dataset.id === 'pay' && bb.spend(tot, true)) { p.challans = []; bb.save(); bb.toast('Challans paid', '#3ddc97'); challanSheet(); } }); }
  bb.addApp({ id: 'challans', label: 'e-Challan', icon: '🧾', fn: challanSheet }); bb.addApp({ id: 'roadside', label: 'Roadside help', icon: '🛠', fn: helpSheet });
});
