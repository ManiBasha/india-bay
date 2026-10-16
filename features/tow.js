// A real tow truck (Beta v1.01.24): Phone → Roadside help → Tow to the mechanic. A yellow tow truck drives up,
// winches your vehicle onto its flatbed, and drives it through the streets to the nearest mechanic, where it is
// repaired fully. You ride along in the cab. The price is a base fare plus a little per km.
window.BBFeatures.push(function (bb) {
  const esc = bb.esc;
  const mech = v => { const L = bb.pois.filter(p => p.type === 'mechanic'); let b = null, bd = 1e9; for (const p of L) { const d = Math.hypot(p.x - v.pos.x, p.z - v.pos.z); if (d < bd) { bd = d; b = p; } } return b ? { p: b, d: bd } : null; };
  const km = d => Math.max(1, Math.round(d * 2.4 / 1000));
  const price = v => { const m = v && mech(v); return Math.round(bb.cost('svc.tow', 1500) + (m ? km(m.d) * bb.cost('svc.towkm', 30) : 0)); };
  const note = v => { const m = v && mech(v); return m ? `To ${m.p.name} · ${km(m.d)} km · repaired fully there` : 'No mechanic nearby'; };
  function call(v) { const m = mech(v); if (!m) return bb.toast('No mechanic nearby', '#ff9f1c'); if (bb.player.veh === v) bb.exitVehicle(true);
    const cost = price(v); if (!bb.spend(cost, true)) return; bb.toast(`🚛 Tow truck on the way · ${bb.inr(cost)}`, '#ffc93c');
    // where the truck comes from: a road point about 70 m away
    const h0 = v.h, fx = Math.sin(h0), fz = Math.cos(h0); const r0 = bb.nearestRoadPoint(v.pos.x + fx * 70, v.pos.z + fz * 70, 200) || { x: v.pos.x + fx * 70, z: v.pos.z + fz * 70 };
    const T = bb.makeVeh('towtruck', r0.x, r0.z, 0, 'tow'); T.lot = true; const car0 = { x: v.pos.x, z: v.pos.z, h: v.h }; v.state = 'towed';
    // the truck stops in front of the car, nose away from it, so the flatbed lines up
    const stopX = car0.x + fx * 5.2, stopZ = car0.z + fz * 5.2, ah = Math.atan2(stopX - r0.x, stopZ - r0.z);
    const deck = (t, x, z, h) => { const bx = -Math.sin(h), bz = -Math.cos(h); return { x: x + bx * (1.6 + 2.2 * (1 - t)), z: z + bz * (1.6 + 2.2 * (1 - t)), y: 1.38 * t }; };
    bb.CINE.play({ kind: 'none', label: 'Roadside help', title: 'The tow truck is here', sub: 'Winching your vehicle onto the flatbed', dur: 12, lookToggle: false, skipLabel: 'Skip ⏭',
      cam: (f, dt) => { const a = Math.min(1, f / .55), e = 1 - Math.pow(1 - a, 2); let tx = r0.x + (stopX - r0.x) * e, tz = r0.z + (stopZ - r0.z) * e, th = f < .55 ? ah : h0 + Math.PI * 0;
          if (f >= .55) { tx = stopX; tz = stopZ; th = h0; } T.pos.set(tx, 0, tz); T.h = th; T.m.rotation.y = th;
          if (f > .6) { const t = Math.min(1, (f - .6) / .35); const d = deck(t, stopX, stopZ, h0); v.pos.set(d.x, d.y, d.z); v.h = h0; v.m.rotation.set(-.12 * Math.sin(t * Math.PI), h0, 0); }
          const cx = car0.x - Math.cos(h0) * 9 - fx * 3, cz = car0.z + Math.sin(h0) * 9 - fz * 3; return { x: cx, y: 3.2, z: cz, lx: (car0.x + stopX) / 2, ly: 1, lz: (car0.z + stopZ) / 2, lookK: 3, px: cx, pz: cz }; },
      onDone: () => drive(v, T, m.p), onCancel: () => { bb.removeVeh(T); v.state = 'parked'; v.pos.set(car0.x, 0, car0.z); v.m.rotation.set(0, car0.h, 0); } }); }
  function drive(v, T, poi) { const end = bb.roadSpotNear(poi); const r = bb.findRoute(T.pos.x, T.pos.z, end[0], end[1]); const pts = r && r.length > 1 ? [[T.pos.x, T.pos.z]].concat(r, [[end[0], end[1]]]) : [[T.pos.x, T.pos.z], [end[0], end[1]]];
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); const secs = Math.max(20, Math.min(70, Math.round(len / 14)));
    const ride = bb.CINE.ride({ kind: 'taxi', pts, speed: 13, dur: secs, y: 2.4 }, { label: 'Tow truck', title: `To ${poi.name}`, sub: 'Your vehicle is strapped down on the flatbed', lines: ['Your vehicle is strapped down on the flatbed', 'The driver hums along to the radio', `${km(len)} km to the garage`, 'Almost there'], look: 'fwd', lookToggle: false, skipLabel: 'Skip to the garage ⏭', cancel: null,
      onDone: () => { bb.removeVeh(T); v.state = 'parked'; v.hp = 100; v.fuel = Math.max(v.fuel || 0, 10); const h = end[2] || 0; v.pos.set(end[0], 0, end[1]); v.h = h; v.m.rotation.set(0, h, 0); bb.teleport(end[0] + Math.cos(h) * 2.2, end[1] - Math.sin(h) * 2.2, h);
        bb.toast(`🔧 ${esc(poi.name)} repaired your ${v.spec.label.toLowerCase()} · good as new`, '#3ddc97'); bb.emit('mod', 'repair'); bb.save(); } });
    ride.kind = 'open'; const base = ride.cam; ride.cam = (f, dt, st, keys) => { st.look = 'fwd'; const c = base(f, dt, st, keys); if (!c) return c; const h = Math.atan2(c.lx - c.x, c.lz - c.z); T.pos.set(c.x, 0, c.z); T.h = h; T.m.rotation.y = h; for (const w of T.m.userData.wheels || []) w.rotation.x += (c.speed || 0) * dt / .5;
      const d = { x: c.x - Math.sin(h) * 1.6, z: c.z - Math.cos(h) * 1.6 }; v.pos.set(d.x, 1.38, d.z); v.h = h; v.m.rotation.set(0, h, 0);
      const ex = c.x - Math.sin(h) * 15 + Math.cos(h) * 4, ez = c.z - Math.cos(h) * 15 - Math.sin(h) * 4; return Object.assign({}, c, { x: ex, y: 7, z: ez, lx: c.x + Math.sin(h) * 6, ly: 1.5, lz: c.z + Math.cos(h) * 6, lookK: 4, px: c.x, pz: c.z }); };
    bb.CINE.play(ride); }
  bb.TOW = { call, price, note };
});
