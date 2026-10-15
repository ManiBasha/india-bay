// Animal rides (Beta v1.01.21): hire a camel in the Thar and Kutch, a horse in the hill stations and on Juhu
// beach, or an elephant at Amer Fort and in the forests of Kodagu and Kerala. You ride it yourself like a slow
// vehicle (no fuel, no licence) for the time you paid for. Press E to get down; it waits for you until the time is up.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, esc = bb.esc;
  bb.ASPEC.horse = bb.ASPEC.horse || { col: ['#6b4226', '#3b2416', '#f2ede2', '#8a5a33', '#1c1714'], L: 1.6, W: .48, H: .62, leg: 1.08, lr: .075, neck: .75, nAng: .62, tilt: .3, head: [.16, .2, .52], snout: '#241a14', tail: .75, ears: 'small', hoof: 1 };
  const KINDS = {
    camel: { label: 'Camel', icon: '🐪', max: 6.5, acc: 2.4, turn: 1.3, len: 2.6, wid: 1, seat: [0, 2.05, -.15], fp: [0, 3.1, .5], cam: 6, price: 400, mins: 15, zones: ['jaisalmer', 'bikaner', 'jodhpur', 'osian', 'barmer', 'ajmer', 'bhuj', 'mandvi'], line: 'Swaying over the sand' },
    horse: { label: 'Horse', icon: '🐎', max: 9, acc: 3.6, turn: 1.8, len: 2.3, wid: .8, seat: [0, 1.55, -.1], fp: [0, 2.6, .4], cam: 5, price: 350, mins: 15, zones: ['matheran', 'mahabaleshwar', 'panchgani', 'lonavala', 'mumbai', 'saputara', 'mountabu', 'chikhaldara'], line: 'Clip-clop along the trail' },
    elephant: { label: 'Elephant', icon: '🐘', max: 3.6, acc: 1.4, turn: .9, len: 3.4, wid: 1.6, seat: [0, 3.2, -.2], fp: [0, 4.4, .6], cam: 8, price: 900, mins: 15, zones: ['jaipur', 'madikeri', 'thekkady', 'munnar', 'chikkamagaluru'], line: 'High above the crowd' } };
  // each animal is a "vehicle" built from the animal model, so the game drives it like any slow vehicle
  for (const [k, K] of Object.entries(KINDS)) bb.SPEC[k] = { max: K.max, acc: K.acc, turn: K.turn, len: K.len, wid: K.wid, fuel: null, lic: null, fp: K.fp, cam: K.cam, label: K.label, seat: K.seat, pedal: true, animal: k,
    build: () => { const g = new T.Group(); const a = bb.buildAnimal(k, { scale: k === 'elephant' ? 1.05 : 1 }); g.add(a); g.userData = { wheels: [], animal: a };
      // a saddle or howdah to sit on
      const sad = new T.Mesh(new T.BoxGeometry(k === 'elephant' ? 1.4 : .62, k === 'elephant' ? .35 : .12, k === 'elephant' ? 1.3 : .7), bb.LMat(k === 'elephant' ? '#b3202a' : k === 'camel' ? '#c0392b' : '#4a2c1a')); sad.position.set(0, K.seat[1] - .25, K.seat[2]); g.add(sad);
      if (k === 'elephant') { const cl = new T.Mesh(new T.BoxGeometry(1.5, .05, 1.9), bb.LMat('#f2c230')); cl.position.set(0, K.seat[1] - .45, K.seat[2]); g.add(cl); }
      return g; } };
  /* ---------- the hire points ---------- */
  const spots = [];
  for (const [k, K] of Object.entries(KINDS)) for (const zid of K.zones) { const z = bb.WORLD.zones.find(q => q.id === zid); if (!z) continue;
    const cx = z.x0 + z.nx * 40 + (k === 'horse' ? -30 : 30), cz = z.z0 + z.nz * 40 - 30; const r = bb.nearestRoadPoint(cx, cz, 300); if (!r) continue; const nx = r.e.dz, nz = -r.e.dx, o = r.e.w / 2 + 4.5; const x = r.x + nx * o, zz = r.z + nz * o;
    if (bb.isWater(x, zz)) continue; const rot = Math.atan2(-nx, -nz);
    const poi = bb.addPoi({ type: 'ride', name: `${K.icon} ${K.label} rides · ${z.name}`, x, z: zz, rot, extra: k, color: '#e0a21b' });
    // a resting animal by the stand, so you can see where to hire one
    const a = bb.buildAnimal(k, {}); a.position.set(x + Math.sin(rot) * 3 + Math.cos(rot) * 2, 0, zz + Math.cos(rot) * 3 - Math.sin(rot) * 2); a.rotation.y = rot + Math.PI / 2; a.visible = false; bb.scene.add(a); spots.push({ poi, a, k });
    bb.addSign(`${K.label.toUpperCase()} RIDES`, x - nx * .3, 2.8, zz - nz * .3, rot, 3.2, .8, '#1d1433', '#ffd04a'); }
  bb.PICON.ride = '🐾'; bb.PLABEL.ride = 'Animal rides';
  bb.onUpdate(() => { const pp = bb.ppos(); for (const s of spots) { const near = !bb.inside && Math.abs(s.a.position.x - pp.x) + Math.abs(s.a.position.z - pp.z) < 260; s.a.visible = near && !(hire && hire.poi === s.poi && hire.v); } });
  /* ---------- hiring ---------- */
  let hire = null;   // { k, v, poi, end }
  bb.poiHandlers.ride = poi => { const k = poi.extra, K = KINDS[k]; const p = bb.cost('ride.' + k, K.price);
    if (hire) return bb.openSheet(poi.name, `${hire.K.icon} You already have a ${hire.K.label.toLowerCase()}`, bb.rowHtml('ret', `Return your ${hire.K.label.toLowerCase()}`, 'Ends the ride now', 'Return', 'ghost'), s => s.onclick = e => { if (e.target.dataset.id === 'ret') { end('Thank you for riding'); bb.closeSheet(); } });
    bb.openSheet(poi.name, `${K.line} · no licence needed`, bb.rowHtml('hire', `${K.icon} Ride a ${K.label.toLowerCase()}`, `${K.mins} real minutes · ride it anywhere, press E to get down`, bb.inr(p)) + `<p class="note">${k === 'elephant' ? 'Slow and steady: elephants walk.' : k === 'camel' ? 'Camels are made for sand, not speed.' : 'A gentle trot, faster than walking.'} Ride on roads, beaches and open ground.</p>`,
      s => s.onclick = e => { if (e.target.dataset.id !== 'hire') return; if (bb.player.mode === 'drive') return bb.toast('Get out of your vehicle first', '#ff9f1c'); if (!bb.spend(p, true)) return; bb.closeSheet();
        const x = poi.x + Math.sin(poi.rot) * 3, z = poi.z + Math.cos(poi.rot) * 3; const v = bb.makeVeh(k, x, z, poi.rot + Math.PI, 'parked'); v.rental = true; hire = { k, K, v, poi, end: Date.now() + K.mins * 60000 };
        bb.TIMERS.add({ kind: 'animalride', icon: K.icon, label: `${K.label} ride`, secs: K.mins * 60, data: {} }); bb.enterVehicle(v); bb.toast(`${K.icon} Hop on! ${K.label} for ${K.mins} minutes · GO to move, E to get down`, '#ffc93c'); bb.emit('animalRide', k); }); };
  function end(msg) { if (!hire) return; const h = hire; hire = null; if (bb.player.veh === h.v) bb.exitVehicle(true); bb.removeVeh(h.v); const j = bb.TIMERS.jobs.find(q => q.kind === 'animalride'); if (j) bb.TIMERS.cancel(j.id); if (msg) bb.toast(`${h.K.icon} ${msg}`, '#d6c8e4'); }
  bb.TIMERS.on('animalride', () => end('Time is up · your ride walked back to its stand'));
  // a walking gait while you ride (legs, head and tail), and you sit up straight
  const AU = bb.avatar.userData;
  bb.onUpdate((dt, now) => { const v = bb.player.veh; if (!v || !v.spec || !v.spec.animal) return; const a = v.m.userData.animal; if (a) bb.animGait({ g: a, graze: false }, now, Math.abs(v.v) / 4); if (AU && AU.legs) { AU.legs[0].rotation.x = AU.legs[1].rotation.x = -.9; AU.legs[0].rotation.z = .5; AU.legs[1].rotation.z = -.5; } });
  bb.on('exitVehicle', v => { if (AU && AU.legs) AU.legs.forEach(l => l.rotation.z = 0); if (v && v.rental && hire && hire.v === v) bb.toast(`${hire.K.icon} Your ${hire.K.label.toLowerCase()} waits here · press E next to it to get back on`, '#d6c8e4'); });
  // animals do not go into the garage, and leave if you wander far away
  setInterval(() => { if (!hire || !hire.v) return; const pp = bb.ppos(); if (bb.player.veh !== hire.v && Math.hypot(hire.v.pos.x - pp.x, hire.v.pos.z - pp.z) > 400) end('You left your ride behind · it walked home'); }, 5000);
  bb.RIDES = { KINDS, get hire() { return hire; }, end };
});
