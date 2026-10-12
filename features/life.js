// Indian road life: FASTag tolls, helmets, mechanic garages, roadside help and monsoon flooding.
// Traffic fines, police paper checks, speed cameras, PUC and insurance were removed in v3.9.
window.BBFeatures.push(function (bb) {
  const W = bb.WORLD, T = bb.THREE, P = () => bb.P;
  const M = { cone: bb.LMat('#ff6a1a'), white: bb.LMat('#f3f1ec'), khaki: bb.LMat('#b89a5a'), pole: bb.LMat('#3b3a40'), cam: bb.LMat('#202226') };
  function onRoad(x, z) { const r = bb.nearestRoadPoint(x, z, 200); return r; }
  /* tolls */
  const tolls = W.tolls.map(([x, z, name]) => { const r = onRoad(x, z); if (!r) return null; const e = r.e, nx = e.dz, nz = -e.dx, a = Math.atan2(e.dx, e.dz);
    for (const s of [-1, 1]) bb.boxRot(1, 6, 1, r.x + nx * s * (e.w / 2 + .8), 3, r.z + nz * s * (e.w / 2 + .8), a, M.white); bb.boxRot(e.w + 3, 1.2, 2, r.x, 6.2, r.z, a, bb.LMat('#1f6f4a')); bb.addSign(name.toUpperCase() + ' · FASTag', r.x, 7.6, r.z, a, 10, 1.2, '#ffffff', '#1f6f4a'); return { x: r.x, z: r.z, name, last: -999 }; }).filter(Boolean);
  /* floods */
  const waterMat = new T.MeshPhongMaterial({ color: 0x5a6e6a, transparent: true, opacity: .78, shininess: 80 });
  const floods = W.floods.map(([x, z]) => { const m = new T.Mesh(new T.CircleGeometry(30, 24), waterMat); m.rotation.x = -Math.PI / 2; m.position.set(x, .14, z); m.visible = false; bb.scene.add(m); return { x, z, m }; });
  bb.flushStatic();
  let flooded = false;
  bb.speedMods.push(v => { if (!flooded) return 1; for (const f of floods) if (Math.hypot(v.pos.x - f.x, v.pos.z - f.z) < 28) { return v.spec.two ? .25 : v.spec.len > 7 ? .6 : .35; } return 1; });
  let floodWarn = 0;

  let helmetWarned = false;
  bb.on('enterVehicle', v => { if (v.spec.two && v.type !== 'cycle' && !P().helmet && !helmetWarned) { helmetWarned = true; bb.toast('No helmet · falls hurt more. Bike dealers sell helmets', '#ff9f1c'); } });
  bb.onUpdate((dt, now) => { const v = bb.player.mode === 'drive' ? bb.player.veh : null; flooded = bb.weather === 'monsoon' || bb.weather === 'rain'; for (const f of floods) f.m.visible = flooded && !bb.inside;
    if (!v || bb.inside) return; const kmh = Math.abs(v.v) * 2.4;
    for (const t of tolls) if (Math.hypot(v.pos.x - t.x, v.pos.z - t.z) < 10 && now - t.last > 60) { t.last = now; if (v.spec.two || v.spec.pedal) { bb.toast('Two-wheelers ride free through the toll', '#d6c8e4'); continue; } const fee = bb.price(bb.CFG.toll * (v.spec.len > 7 ? 2.5 : 1)); if (P().bank >= fee) { P().bank -= fee; bb.toast(`FASTag · ${t.name} · ${bb.inr(fee)} from your bank`, '#ffc93c'); } else if (P().cash >= fee) { P().cash -= fee; bb.toast(`${t.name} · paid ${bb.inr(fee)} in cash`, '#ffc93c'); } else bb.toast(`${t.name} · no money for the toll, the barrier opens this time`, '#d6c8e4'); bb.setDirty(); }
    if (flooded && now - floodWarn > 20) for (const f of floods) if (Math.hypot(v.pos.x - f.x, v.pos.z - f.z) < 30) { floodWarn = now; bb.toast('Waterlogged road · go slow', '#5fb4ff'); break; } });

  /* mechanic garage */
  function repairCost(v) { return Math.ceil((100 - v.hp) * 40); }
  function mechSheet(poi) { const v = bb.player.veh || bb.ownedVeh.filter(Boolean).sort((a, b) => a.pos.distanceTo(bb.ppos()) - b.pos.distanceTo(bb.ppos()))[0];
    if (!v || v.pos.distanceTo(bb.ppos()) > 20) { bb.toast('Bring a vehicle to the garage', '#ff9f1c'); return; } const c = v.owned ? P().cars[v.ownedIdx] : null; const cost = bb.price(repairCost(v));
    bb.openSheet(poi.name, `${v.spec.label} · body ${Math.round(v.hp)}%`, bb.rowHtml('fix', 'Full repair', 'Denting, painting and engine', v.hp >= 99 ? 'Fine' : bb.inr(cost), v.hp >= 99 ? 'ghost' : '') +
      bb.rowHtml('service', 'Quick service', 'Oil change and a wash', bb.inr(bb.price(400)), 'ghost'),
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; if (id === 'fix' && v.hp < 99) { if (!bb.spend(cost, true)) return; bb.closeSheet(); bb.startActivity({ kind: 'Mechanic', title: 'Repairing your ' + v.spec.label.toLowerCase(), minutes: 30, effects: {}, onDone: () => { v.hp = 100; bb.save(); bb.toast('Good as new', '#3ddc97'); } }); }
      if (id === 'service' && bb.spend(bb.price(400))) { v.hp = Math.min(100, v.hp + 10); bb.toast('Serviced and washed', '#3ddc97'); } }); }
  bb.poiHandlers.mechanic = mechSheet;
  function helpSheet() { const v = bb.player.veh || bb.ownedVeh.filter(Boolean).sort((a, b) => a.pos.distanceTo(bb.ppos()) - b.pos.distanceTo(bb.ppos()))[0];
    bb.openSheet('Roadside help', v ? `${v.spec.label} · fuel ${Math.round(v.fuel)}% · body ${Math.round(v.hp)}%` : 'No vehicle nearby', v ? bb.rowHtml('fuel', 'Fuel delivery', 'Brings you to 30% tank', bb.inr(bb.price(500))) + bb.rowHtml('tow', 'Tow and patch-up', 'Body back to 60%', bb.inr(bb.price(1500))) : '',
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id || !v) return; if (id === 'fuel') { if (!v.spec.fuel) { bb.toast('No fuel needed', '#d6c8e4'); return; } if (!bb.spend(bb.price(500), true)) return; bb.closeSheet(); bb.startActivity({ kind: 'Roadside help', title: 'Waiting for fuel delivery', minutes: 20, onDone: () => { v.fuel = Math.max(v.fuel, 30); bb.toast('Fuel delivered', '#3ddc97'); } }); }
        if (id === 'tow') { if (!bb.spend(bb.price(1500), true)) return; bb.closeSheet(); bb.startActivity({ kind: 'Roadside help', title: 'Mechanic on the way', minutes: 40, onDone: () => { v.hp = Math.max(v.hp, 60); bb.toast('Patched up · get a full repair at a garage', '#3ddc97'); } }); } }); }
  bb.addApp({ id: 'roadside', label: 'Roadside help', icon: '🛠', fn: helpSheet });
});
