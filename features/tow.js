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
    // where the truck comes from: a road about 120 m away; it drives the real roads in the left lane, waiting behind traffic (v1.01.25)
    const h0 = v.h, fx = Math.sin(h0), fz = Math.cos(h0); const car0 = { x: v.pos.x, z: v.pos.z, h: v.h };
    const stopX = car0.x + fx * 5.2, stopZ = car0.z + fz * 5.2; let r0 = null;
    for (let k = 0; k < 10 && !r0; k++) { const a = Math.random() * 6.283, rr = 100 + Math.random() * 60; const p = bb.nearestRoadPoint(stopX + Math.cos(a) * rr, stopZ + Math.sin(a) * rr, 120); if (p && Math.hypot(p.x - stopX, p.z - stopZ) > 60) r0 = p; }
    if (!r0) r0 = bb.nearestRoadPoint(stopX + fx * 70, stopZ + fz * 70, 200) || { x: stopX + fx * 70, z: stopZ + fz * 70 };
    const V = bb.VISIT; const path = V ? V.route({ x: r0.x, z: r0.z }, { x: stopX, z: stopZ }) : null;
    const T = bb.makeVeh('towtruck', r0.x, r0.z, 0, 'svc'); T.lot = true; T.noEnter = true; v.state = 'towed';
    const deck = (t, x, z, h) => { const bx = -Math.sin(h), bz = -Math.cos(h); return { x: x + bx * (1.6 + 2.2 * (1 - t)), z: z + bz * (1.6 + 2.2 * (1 - t)), y: 1.38 * t }; };
    const S = { ph: 'drive', t: 0 };
    bb.CINE.play({ kind: 'none', label: 'Roadside help', title: 'The tow truck is coming', sub: 'It drives over through the traffic', dur: 0, lookToggle: false, skipLabel: 'Skip ⏭',
      cam: (f, dt) => { dt = Math.min(dt || .016, .2); S.t += dt;
        if (S.ph === 'drive') { if (path) V.step(path, T, dt, 12); else { T.pos.set(stopX, 0, stopZ); path && (path.s = path.len); }
          if (!path || path.s >= path.len - .5 || S.t > 70) { S.ph = 'park'; S.t = 0; S.from = { x: T.pos.x, z: T.pos.z, h: T.h }; } }
        if (S.ph === 'park') { const u = Math.min(1, S.t / 2.5), e = u * u * (3 - 2 * u); let dh = h0 - S.from.h; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
          T.pos.set(S.from.x + (stopX - S.from.x) * e, 0, S.from.z + (stopZ - S.from.z) * e); T.h = S.from.h + dh * e; T.m.position.copy(T.pos); T.m.rotation.set(0, T.h, 0); if (u >= 1) { S.ph = 'load'; S.t = 0; bb.CINE.state && bb.CINE.state.o && (bb.CINE.state.o.title = 'The tow truck is here'); } }
        if (S.ph === 'load') { const t = Math.min(1, S.t / 5); const d = deck(t, stopX, stopZ, h0); v.pos.set(d.x, d.y, d.z); v.h = h0; v.m.position.copy(v.pos); v.m.rotation.set(-.12 * Math.sin(t * Math.PI), h0, 0); if (t >= 1 && S.t > 5.6) { S.ph = 'done'; setTimeout(() => bb.CINE.finish(false), 0); } }
        if (S.ph === 'drive') { const th = T.h, ex = T.pos.x - Math.sin(th) * 13 + Math.cos(th) * 3, ez = T.pos.z - Math.cos(th) * 13 - Math.sin(th) * 3; return { x: ex, y: 6, z: ez, lx: T.pos.x + Math.sin(th) * 5, ly: 1.4, lz: T.pos.z + Math.cos(th) * 5, lookK: 4, px: car0.x, pz: car0.z }; }
        const tx = (car0.x + stopX) / 2, tz = (car0.z + stopZ) / 2; const cx = car0.x - Math.cos(h0) * 10 - fx * 4, cz = car0.z + Math.sin(h0) * 10 - fz * 4; return { x: cx, y: 3.6, z: cz, lx: tx, ly: 1, lz: tz, lookK: 3, px: car0.x, pz: car0.z }; },
      onDone: (skipped) => { if (skipped) { T.pos.set(stopX, 0, stopZ); T.h = h0; T.m.position.copy(T.pos); T.m.rotation.set(0, h0, 0); const d = deck(1, stopX, stopZ, h0); v.pos.set(d.x, d.y, d.z); v.m.position.copy(v.pos); } drive(v, T, m.p); },
      onCancel: () => { bb.removeVeh(T); v.state = 'parked'; v.pos.set(car0.x, 0, car0.z); v.m.position.copy(v.pos); v.m.rotation.set(0, car0.h, 0); } }); }
  function drive(v, T, poi) { const end = bb.roadSpotNear(poi); const V = bb.VISIT; const path = V.route({ x: T.pos.x, z: T.pos.z }, { x: end[0], z: end[1] }); const len = path.len;
    const lines = ['Your vehicle is strapped down on the flatbed', 'The driver hums along to the radio', `${km(len)} km to the garage`, 'Almost there']; let t = 0, cam = null; const S2 = {};
    const done = () => { bb.removeVeh(T); v.state = 'parked'; v.hp = 100; v.fuel = Math.max(v.fuel || 0, 10); const h = end[2] || 0; v.pos.set(end[0], 0, end[1]); v.h = h; v.m.position.copy(v.pos); v.m.rotation.set(0, h, 0); bb.teleport(end[0] + Math.cos(h) * 2.2, end[1] - Math.sin(h) * 2.2, h);
      bb.toast(`🔧 ${esc(poi.name)} repaired your ${v.spec.label.toLowerCase()} · good as new`, '#3ddc97'); bb.emit('mod', 'repair'); bb.save(); };
    bb.CINE.play({ kind: 'open', label: 'Tow truck', title: `To ${poi.name}`, sub: lines[0], dur: 0, lookToggle: false, skipLabel: 'Skip to the garage ⏭', progress: () => Math.min(1, path.s / Math.max(1, len)),
      cam: (f, dt) => { dt = Math.min(dt || .016, .2); t += dt; V.step(path, T, dt, 13); const h = T.h; v.pos.set(T.pos.x - Math.sin(h) * 1.6, 1.38, T.pos.z - Math.cos(h) * 1.6); v.h = h; v.m.position.copy(v.pos); v.m.rotation.set(0, h, 0);
        const sub = document.getElementById('csub'); if (sub) sub.textContent = path.wait > 1 ? 'Waiting for the traffic ahead' : lines[Math.min(lines.length - 1, Math.floor(f * lines.length))];
        if ((path.s >= len - .5 || t > 150) && !S2.end) { S2.end = true; setTimeout(() => bb.CINE.finish(false), 0); }
        const ex = T.pos.x - Math.sin(h) * 15 + Math.cos(h) * 4, ez = T.pos.z - Math.cos(h) * 15 - Math.sin(h) * 4; if (!cam) cam = { x: ex, z: ez }; const k = Math.min(1, dt * 3); cam.x += (ex - cam.x) * k; cam.z += (ez - cam.z) * k;
        return { x: cam.x, y: 7, z: cam.z, lx: T.pos.x + Math.sin(h) * 6, ly: 1.5, lz: T.pos.z + Math.cos(h) * 6, lookK: 4, px: T.pos.x, pz: T.pos.z }; },
      onDone: () => done() }); }
  bb.TOW = { call, price, note };
});
