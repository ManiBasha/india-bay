// Footpaths (Beta v1.01.24): where a highway or a coast road runs through a town or city, it now has a raised
// paved footpath with a kerb on both sides, and people walk along it (never on the water, never on the road).
// City streets already have their pavements on the blocks.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE; if (!bb.EDGES) return;
  const pave = bb.LMat('#c9c1b0'), kerb = bb.LMat('#9a958a'); const V = new T.Vector3();
  const segs = [];   // { ax, az, bx, bz, len, dx, dz } footpath centre lines
  const inTown = (x, z) => !!bb.zoneAt(x, z, 0);
  const onBlock = (x, z) => bb.blockAt ? !!bb.blockAt(x, z) : false;
  const ok = (x, z, e) => { if (bb.isWater(x, z) || (bb.wetNear && bb.wetNear(x, z, 3))) return false; const r = bb.roadAt(x, z, 1.4); if (r && r !== e) return false; if (onBlock(x, z)) return false; V.set(x, 0, z); return !bb.collideTest(V); };
  for (const e of bb.EDGES) { if (e.fly || e.kind === 'city' || e.kind === 'service' || e.kind === 'bridge' || e.len < 20) continue; const off = e.w / 2 + 1.35;
    for (const side of [1, -1]) { const nx = e.dz * side, nz = -e.dx * side; let run = null;
      const flush = () => { if (run && run.t1 - run.t0 >= 8) { const ax = e.ax + e.dx * run.t0 + nx * off, az = e.az + e.dz * run.t0 + nz * off, L = run.t1 - run.t0; const cx = ax + e.dx * L / 2, cz = az + e.dz * L / 2, ry = Math.atan2(e.dx, e.dz);
          const g = new T.BoxGeometry(2.3, .16, L); g.rotateY(ry); g.translate(cx, .08, cz); bb.addStatic(g, pave, false, true); const k = new T.BoxGeometry(.18, .22, L); k.rotateY(ry); k.translate(cx - nx * 1.2, .11, cz - nz * 1.2); bb.addStatic(k, kerb, false, true);
          segs.push({ ax, az, bx: ax + e.dx * L, bz: az + e.dz * L, len: L, dx: e.dx, dz: e.dz }); } run = null; };
      for (let t = 10; t <= e.len - 10; t += 2) { const x = e.ax + e.dx * t + nx * off, z = e.az + e.dz * t + nz * off; if (inTown(x, z) && ok(x, z, e)) { if (!run) run = { t0: t, t1: t }; else run.t1 = t; } else flush(); } flush(); } }
  if (bb.flushStatic) bb.flushStatic();
  /* ---------- people walking on the footpaths near you ---------- */
  const SH = ['#d9483b', '#e8a628', '#2f7fc1', '#9b4fb5', '#3aa66b', '#ff6fa8', '#f4f1ea', '#1f8a8a', '#c96a2a', '#5c6b8a'];
  const walkers = []; let lastPick = 0;
  function near(pp) { return segs.filter(s => { const t = Math.max(0, Math.min(s.len, (pp.x - s.ax) * s.dx + (pp.z - s.az) * s.dz)); return Math.hypot(s.ax + s.dx * t - pp.x, s.az + s.dz * t - pp.z) < 160; }); }
  bb.onUpdate((dt, t) => { if (!bb.started || bb.inside) { for (const w of walkers) w.g.visible = false; return; } const pp = bb.ppos(); const now = performance.now();
    if (now - lastPick > 3000) { lastPick = now; const L = near(pp); for (const w of walkers) if (!L.includes(w.s)) w.s = null;
      while (walkers.length < Math.min(13, L.length * 3)) { const cyc = walkers.length % 4 === 3; let g;
        if (cyc) { g = new T.Group(); const c = bb.buildVeh('cycle'); g.add(c); const r = bb.buildPerson(SH[walkers.length % SH.length], { seated: true }); const st = (bb.SPEC.cycle && bb.SPEC.cycle.seat) || [0, .95, -.15]; r.position.set(0, st[1] - .62, st[2]); r.userData.arms.forEach(a => a.rotation.x = -1.05); g.add(r); g.userData = { rider: r.userData, wheels: c.userData.wheels || [] }; }
        else g = bb.buildPerson(SH[walkers.length % SH.length], { kid: Math.random() < .08 });
        bb.scene.add(g); walkers.push({ g, s: null, u: 0, dir: 1, cyc, sp: cyc ? 3.2 + Math.random() * 1.6 : .9 + Math.random() * .7, ph: Math.random() * 6 }); }
      for (const w of walkers) if (!w.s && L.length) { w.s = L[Math.floor(Math.random() * L.length)]; w.u = Math.random() * w.s.len; w.dir = Math.random() < .5 ? 1 : -1; w.lat = (Math.random() - .5) * 1.2; } }
    for (const w of walkers) { if (!w.s) { w.g.visible = false; continue; } w.u += w.dir * w.sp * dt; if (w.u < 0 || w.u > w.s.len) { w.dir *= -1; w.u = Math.max(0, Math.min(w.s.len, w.u)); }
      const s = w.s; let x = s.ax + s.dx * w.u + s.dz * w.lat, z = s.az + s.dz * w.u - s.dx * w.lat; const ob = bb.pedPush && bb.pedPush(x, z); if (ob) { w.lat = Math.max(-1.1, Math.min(1.1, w.lat + (ob[0] * s.dz - ob[1] * s.dx) * dt)); } const far = Math.abs(x - pp.x) + Math.abs(z - pp.z) > 200; w.g.visible = !far; if (far) continue;
      if (w.cyc) { w.g.position.set(x, .16, z); w.g.rotation.y = Math.atan2(s.dx * w.dir, s.dz * w.dir); const R = w.g.userData.rider, ph = t * w.sp * 1.6 + w.ph; if (R.legs) { R.legs[0].rotation.x = -1.2 + Math.sin(ph) * .5; R.legs[1].rotation.x = -1.2 - Math.sin(ph) * .5; } for (const wh of w.g.userData.wheels) wh.rotation.x += w.sp * dt / .35; continue; }
      w.g.position.set(x, .17 + Math.abs(Math.sin(t * 7 + w.ph)) * .04, z); w.g.rotation.y = Math.atan2(s.dx * w.dir, s.dz * w.dir); const U = w.g.userData, a = Math.sin(t * 7 + w.ph) * .5;
      if (U.legs) { U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } if (U.arms) { U.arms[0].rotation.x = -a; U.arms[1].rotation.x = a; } } });
  bb.FOOTPATHS = { segs, get walkers() { return walkers.length; } };
});
