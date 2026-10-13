// The Mumbai–Ahmedabad bullet train (Beta v1.01.04): a high viaduct on tall pillars from Mumbai BKC to Sabarmati
// with 12 stations, a 10-car train with long noses running the line at 320 km/h, and rides between any two
// stations (walk up to a station's ticket hall and press E). The route is in js/world-plus2.js (W.bullet).
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD, B = W.bullet; if (!B) return;
  const DECK = 16;
  const conc = bb.LMat('#d2cdc4'), concD = bb.LMat('#aaa49a'), rail = bb.LMat('#4a4a50'), roof = bb.LMat('#f2f2f4'), blue = bb.LMat('#1b4f9c'), red = bb.LMat('#d6402b');
  const glass = new T.MeshLambertMaterial({ color: 0x9fd3e8, transparent: true, opacity: .5 });
  const box = (w, h, d, x, y, z, ry, m) => { const g = new T.BoxGeometry(w, h, d); g.rotateY(ry); g.translate(x, y, z); bb.addStatic(g, m); };
  const cyl = (r, h, x, y, z, m) => { const g = new T.CylinderGeometry(r, r * 1.12, h, 10); g.translate(x, y, z); bb.addStatic(g, m); };
  const P = B.pts; const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); const LEN = L[L.length - 1];
  function at(s) { s = Math.max(0, Math.min(LEN, s)); let i = 1; while (i < P.length - 1 && L[i] < s) i++; const a = P[i - 1], b = P[i], u = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, h: Math.atan2(b[0] - a[0], b[1] - a[1]) }; }
  function sOf(x, z) { let best = 0, bd = 1e9; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz; let t = ((x - a[0]) * dx + (z - a[1]) * dz) / l2; t = Math.max(0, Math.min(1, t)); const d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z); if (d < bd) { bd = d; best = L[i] + t * Math.sqrt(l2); } } return best; }
  const inZone = (x, z, m) => W.zones.some(q => x > q.x0 - m && x < q.x0 + q.nx * 80 + m && z > q.z0 - m && z < q.z0 + q.nz * 80 + m);
  const nearLm = (x, z) => W.landmarks.some(l => Math.hypot(l.x - x, l.z - z) < 45);
  const stations = B.stations.map(([name, x, z]) => ({ name, x, z, s: sOf(x, z) })).sort((a, b) => a.s - b.s);
  const nearStation = s => stations.some(st => Math.abs(st.s - s) < 40);
  /* the viaduct: a box girder deck with parapets and catenary masts, on tall pillars every 32 m */
  for (let k = 0; k < P.length - 1; k++) { const [ax, az] = P[k], [bx, bz] = P[k + 1]; const l = Math.hypot(bx - ax, bz - az); if (l < .5) continue; const ry = Math.atan2(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
    box(9, 1.3, l + 9, mx, DECK, mz, ry, conc); box(5.4, 1.6, l + 7, mx, DECK - 1.4, mz, ry, concD);
    for (const sd of [-1, 1]) { const ox = Math.cos(ry) * sd * 4.35, oz = -Math.sin(ry) * sd * 4.35; box(.35, 1.4, l + 8.6, mx + ox, DECK + 1.3, mz + oz, ry, conc); for (const r of [.7, 2.2]) { const rx = Math.cos(ry) * sd * r, rz = -Math.sin(ry) * sd * r; box(.14, .18, l + 8, mx + rx, DECK + .74, mz + rz, ry, rail); } }
    for (let t = 10; t < l - 4; t += 32) { const x = ax + (bx - ax) * t / l, z = az + (bz - az) * t / l; const s = L[k] + t;
      if (k % 1 === 0 && Math.round(t / 32) % 2 === 0) { const ox = Math.cos(ry) * 4.1, oz = -Math.sin(ry) * 4.1; cyl(.14, 6, x + ox, DECK + 3.6, z + oz, rail); box(4.6, .14, .14, x + ox * .45, DECK + 6.4, z + oz * .45, ry + Math.PI / 2, rail); }
      if (nearStation(s) || !bb.isLand(x, z) || bb.roadAt(x, z, 3) || inZone(x, z, -2) || nearLm(x, z)) continue;
      cyl(1.3, DECK - 2, x, (DECK - 2) / 2, z, conc); box(6.4, 1.2, 2.4, x, DECK - 2.4, z, ry, concD); bb.addCol(x, z, 1.4, 1.4, true, false); } }
  /* stations: a long platform with a wave roof over the tracks and a ticket hall on the ground beside the line */
  for (const st of stations) { const a = at(st.s); const ry = a.h; const nx = Math.cos(ry), nz = -Math.sin(ry);
    box(16, 1, 70, a.x, DECK + .3, a.z, ry, conc); for (let i = 0; i < 7; i++) { const t = -30 + i * 10; const px = a.x + Math.sin(ry) * t, pz = a.z + Math.cos(ry) * t; box(18, .4, 10.6, px, DECK + 7.4 + Math.sin(i * .9) * .5, pz, ry, roof); for (const sd of [-1, 1]) cyl(.28, 7, px + nx * sd * 8, DECK + 3.8, pz + nz * sd * 8, concD); }
    for (const sd of [-1, 1]) box(.12, 4, 64, a.x + nx * sd * 7.8, DECK + 2.6, a.z + nz * sd * 7.8, ry, glass);
    for (const t of [-28, -8, 12, 28]) { const px = a.x + Math.sin(ry) * t, pz = a.z + Math.cos(ry) * t; if (!bb.roadAt(px, pz, 2)) { cyl(1.8, DECK - .3, px, (DECK - .3) / 2, pz, conc); bb.addCol(px, pz, 1.9, 1.9, true, false); } }
    // the ticket hall goes on the side with more room
    const fx = Math.sin(ry), fz = Math.cos(ry); const clearAt = (sd, d) => { for (let u = -11; u <= 11; u += 2.75) for (let v = -7; v <= 9; v += 2) { const px = a.x + nx * sd * (d + v) + fx * u, pz = a.z + nz * sd * (d + v) + fz * u; if (!bb.isLand(px, pz) || bb.isWater(px, pz) || bb.roadAt(px, pz, 1.5) || inZone(px, pz, 2)) return false; } return true; };
    let side = 0, dist = 20; for (const d of [20, 28, 36]) { for (const sd of [1, -1]) if (!side && clearAt(sd, d)) { side = sd; dist = d; } if (side) break; }
    if (!side) { side = 1; dist = 0; }
    const hx = a.x + nx * side * dist, hz = a.z + nz * side * dist; if (dist) { box(20, 7, 12, hx, 3.5, hz, ry, roof); box(21, .6, 13, hx, 7.3, hz, ry, blue); box(20.2, 1.4, .2, hx - nx * side * 6.1, 5.4, hz - nz * side * 6.1, ry, glass);
    box(3, DECK + 1, 3, a.x + nx * side * 11, (DECK + 1) / 2, a.z + nz * side * 11, ry, concD); box(6, .5, 3, a.x + nx * side * 9.5, DECK + .6, a.z + nz * side * 9.5, ry + Math.PI / 2, conc);
    bb.addCol(hx, hz, Math.abs(Math.sin(ry)) > .7 ? 6 : 10, Math.abs(Math.sin(ry)) > .7 ? 10 : 6, true, false); }
    const door = dist ? { x: hx + nx * side * 7.5, z: hz + nz * side * 7.5 } : { x: a.x + nx * 6, z: a.z + nz * 6 }; const rot = Math.atan2(nx * side, nz * side) + Math.PI;
    bb.addSign('🚄 ' + st.name.toUpperCase(), hx + nx * side * 6.2, 9, hz + nz * side * 6.2, Math.atan2(nx * side, nz * side), 12, 1.6, '#ffffff', '#1b4f9c');
    st.poi = bb.addPoi({ type: 'bullet', name: `${st.name} bullet train station`, x: door.x, z: door.z, rot, extra: st.name }); }
  if (bb.flushStatic) bb.flushStatic();
  /* the train: 10 white cars with a blue band and a red line, long aerodynamic noses at both ends */
  function car(nose, flip) { const g = new T.Group(); const white = bb.LMat('#f4f6f8'), win = bb.LMat('#1f2a36');
    const body = new T.Mesh(new T.BoxGeometry(3.3, 3.4, nose ? 14 : 24), white); body.position.y = 2.2; g.add(body); const top = new T.Mesh(new T.CylinderGeometry(1.65, 1.65, nose ? 14 : 24, 12, 1, false, 0, Math.PI), white); top.rotation.x = Math.PI / 2; top.rotation.z = Math.PI / 2; top.position.y = 3.9; g.add(top);
    const band = new T.Mesh(new T.BoxGeometry(3.34, .7, nose ? 14 : 24), blue); band.position.y = 1.2; g.add(band); const line = new T.Mesh(new T.BoxGeometry(3.35, .14, nose ? 14 : 24), red); line.position.y = 1.7; g.add(line);
    const wb = new T.Mesh(new T.BoxGeometry(3.36, .7, nose ? 10 : 21), win); wb.position.set(0, 3, nose ? -1.5 * (flip ? -1 : 1) : 0); g.add(wb);
    if (nose) { const n = new T.Mesh(new T.ConeGeometry(1.75, 12, 14, 1), white); n.scale.set(1, 1, .58); n.rotation.x = Math.PI / 2 * (flip ? -1 : 1); n.position.set(0, 2.5, (flip ? -1 : 1) * 13); g.add(n);
      const ws = new T.Mesh(new T.SphereGeometry(1.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), win); ws.scale.set(1.2, .5, 2.2); ws.position.set(0, 3.4, (flip ? -1 : 1) * 8); g.add(ws);
      const lamp = new T.Mesh(new T.BoxGeometry(2.4, .2, .3), new T.MeshBasicMaterial({ color: 0xfff6d8 })); lamp.position.set(0, 1.7, (flip ? -1 : 1) * 15.5); g.add(lamp); }
    return g; }
  const train = new T.Group(); const CARS = 10; const offs = []; let o = 0;
  for (let i = 0; i < CARS; i++) { const nose = i === 0 || i === CARS - 1; const len = nose ? 14 + 12 : 24; const c = car(nose, i === CARS - 1); train.add(c); offs.push({ c, o: o + len / 2 - (nose && i === 0 ? 6 : 0), nose }); o += len + .6; }
  const TL = o; train.visible = false; bb.scene.add(train);
  let ts = Math.random() * LEN, dir = 1, wait = 0, nextStop = null; const V = 75;
  bb.onUpdate(dt => { const pp = bb.ppos(); const head = at(ts); const near = !bb.inside && Math.hypot(head.x - pp.x, head.z - pp.z) < 1600; train.visible = near; if (!near) { ts += dir * V * dt; if (ts > LEN || ts < 0) { dir *= -1; ts = Math.max(0, Math.min(LEN, ts)); } return; }
    if (wait > 0) wait -= dt; else { if (!nextStop || (dir > 0 ? ts > nextStop.s : ts < nextStop.s)) nextStop = stations.filter(s => dir > 0 ? s.s > ts + 5 : s.s < ts - 5).sort((a, b) => dir * (a.s - b.s))[0] || null;
      const toStop = nextStop ? Math.abs(nextStop.s - ts) : 1e9; const v = Math.min(V, 4 + toStop * .6); ts += dir * v * dt; if (nextStop && toStop < 1.5) { wait = 8; ts = nextStop.s; nextStop = null; } if (ts >= LEN || ts <= 0) { ts = Math.max(0, Math.min(LEN, ts)); dir *= -1; wait = 10; } }
    for (const { c, o } of offs) { const q = at(ts - dir * o); c.position.set(q.x, DECK + .65, q.z); c.rotation.y = q.h + (dir < 0 ? Math.PI : 0); } });
  /* tickets and rides */
  bb.poiHandlers.bullet = poi => { const from = stations.find(s => s.name === poi.extra); const dests = stations.filter(s => s !== from && s.poi).map(s => ({ key: s.name, name: s.name, x: s.poi.x, z: s.poi.z, arrive: { x: s.poi.x + Math.sin(s.poi.rot) * 3, z: s.poi.z + Math.cos(s.poi.rot) * 3, rot: s.poi.rot, name: `${s.name} station`, zoneName: s.name } }));
    if (!bb.TRAVEL || !bb.TRAVEL.book) return; bb.TRAVEL.book(Object.assign({}, poi, { name: `${from.name} · Mumbai–Ahmedabad bullet train`, zone: null }), ['bullet'], dests); };
  // the ride follows the viaduct between the two stations
  bb.BULLET = { stations, DECK, path(ax, az, bx, bz) { const s0 = sOf(ax, az), s1 = sOf(bx, bz); const out = []; const n = Math.max(2, Math.ceil(Math.abs(s1 - s0) / 20)); for (let i = 0; i <= n; i++) { const q = at(s0 + (s1 - s0) * i / n); out.push([q.x, q.z]); } return out; } };
});
