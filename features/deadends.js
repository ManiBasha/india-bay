// Dead ends (Beta v1.01.22): where a road just stops, there is now a yellow "END OF ROAD" sign, a red-and-white
// police barrier across the road that vehicles cannot drive through (people on foot can still step past), and
// hardly any traffic on that last stretch.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE; if (!T || !bb.ROADS || !bb.EDGES) return;
  const RH = 60, hash = new Map();
  for (const e of bb.EDGES) { const n = Math.max(1, Math.ceil(e.len / (RH / 2))); for (let i = 0; i <= n; i++) { const x = e.ax + (e.bx - e.ax) * i / n, z = e.az + (e.bz - e.az) * i / n; const k = Math.floor(x / RH) + ',' + Math.floor(z / RH); let a = hash.get(k); if (!a) hash.set(k, a = []); if (a[a.length - 1] !== e) a.push(e); } }
  const segD = (px, pz, e) => { const dx = e.bx - e.ax, dz = e.bz - e.az, l2 = dx * dx + dz * dz; let t = l2 ? ((px - e.ax) * dx + (pz - e.az) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - e.ax - dx * t, pz - e.az - dz * t); };
  function joined(px, pz, e) { for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = hash.get((Math.floor(px / RH) + i) + ',' + (Math.floor(pz / RH) + j)); if (!a) continue;
      for (const q of a) { if (q === e || (q.road === e.road && Math.abs(q.k - e.k) <= 1)) continue; if (segD(px, pz, q) < q.w / 2 + 6) return true; } } return false; }
  // a road that ends at a place (a fort, the Statue of Unity, a beach, a shop) is a destination, not a dead end: leave it open
  const LM = (bb.WORLD && bb.WORLD.landmarks) || [];
  const atPlace = (x, z) => (bb.pois || []).some(p => Math.abs(p.x - x) < 25 && Math.abs(p.z - z) < 25 && Math.hypot(p.x - x, p.z - z) < 25) || LM.some(l => Math.hypot(l.x - x, l.z - z) < 70);
  const ends = [];
  for (const r of bb.ROADS) { if (r.fly || !r.edges.length || r.kind === 'service') continue;
    const first = r.edges[0], last = r.edges[r.edges.length - 1];
    for (const [e, atB] of [[first, false], [last, true]]) { const px = atB ? e.bx : e.ax, pz = atB ? e.bz : e.az; if (joined(px, pz, e)) continue;
      if (bb.isWater && bb.isWater(px, pz)) continue; if (atPlace(px, pz)) continue; e.deadEnd = true; const ox = atB ? e.dx : -e.dx, oz = atB ? e.dz : -e.dz;
      // also the edge before, when the last one is short
      if (e.len < 60) { const nb = r.edges.find(q => q.k === e.k + (atB ? -1 : 1)); if (nb) nb.deadEnd = true; }
      ends.push({ x: px - ox * 3, z: pz - oz * 3, ox, oz, w: e.w, kind: r.kind }); } }
  /* ---------- the look: barrier boards on legs, a sign on a pole, a police cone or two ---------- */
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };
  const stripe = tex(256, 32, (x, w, h) => { for (let i = -2; i < 12; i++) { x.fillStyle = i % 2 ? '#f4f1ea' : '#d7261e'; x.beginPath(); x.moveTo(i * 26, 0); x.lineTo(i * 26 + 26, 0); x.lineTo(i * 26 + 26 - 16, h); x.lineTo(i * 26 - 16, h); x.fill(); } });
  stripe.wrapS = T.RepeatWrapping;
  const signT = tex(256, 192, (x, w, h) => { x.fillStyle = '#f2c230'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1b1b1b'; x.lineWidth = 10; x.strokeRect(9, 9, w - 18, h - 18); x.fillStyle = '#1b1b1b'; x.textAlign = 'center'; x.font = '800 44px system-ui,sans-serif'; x.fillText('END OF', w / 2, 80); x.fillText('ROAD', w / 2, 132); x.font = '700 22px system-ui,sans-serif'; x.fillText('POLICE BARRIER', w / 2, 168); });
  const mStripe = new T.MeshLambertMaterial({ map: stripe }), mSign = new T.MeshLambertMaterial({ map: signT }), mLeg = new T.MeshLambertMaterial({ color: '#2b2b30' }), mBack = new T.MeshLambertMaterial({ color: '#6d6d72' }), mCone = new T.MeshLambertMaterial({ color: '#ff6a1a' }), mBand = new T.MeshLambertMaterial({ color: '#f4f1ea' });
  const put = (g, m, x, y, z, ry) => { g.rotateY(ry); g.translate(x, y, z); bb.addStatic(g, m); };
  for (const d of ends) { const ry = Math.atan2(d.ox, d.oz); const sx = d.oz, sz = -d.ox;   // across the road
    const span = d.w * .92, n = Math.max(2, Math.round(span / 3.2)), seg = span / n;
    for (let i = 0; i < n; i++) { const t = (i + .5) / n - .5, cx = d.x + sx * t * span, cz = d.z + sz * t * span;
      for (const y of [.62, 1.02]) { const b = new T.BoxGeometry(seg * .92, .22, .06); const uv = b.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * seg / 2.2); put(b, mStripe, cx, y, cz, ry); }
      for (const s of [-1, 1]) { const lx = cx + sx * s * seg * .4, lz = cz + sz * s * seg * .4; put(new T.BoxGeometry(.07, 1.15, .5), mLeg, lx, .575, lz, ry); } }
    // vehicles stop here; people on foot can still walk past the barrier
    for (let t = -span / 2; t <= span / 2 + .01; t += 1.2) bb.addCol(d.x + sx * t, d.z + sz * t, .7, .7, true, false);
    // the sign on the left side, facing the traffic coming up the road
    const px = d.x - d.ox * 2.5 + sx * (d.w / 2 + .8), pz = d.z - d.oz * 2.5 + sz * (d.w / 2 + .8);
    put(new T.CylinderGeometry(.06, .07, 2.6, 8), mLeg, px, 1.3, pz, 0);
    put(new T.PlaneGeometry(1.5, 1.12), mSign, px, 2.35, pz, ry + Math.PI); put(new T.PlaneGeometry(1.5, 1.12), mBack, px, 2.35, pz, ry);
    for (const s of [-.3, .3]) { const cx = d.x - d.ox * 2 + sx * s * span, cz = d.z - d.oz * 2 + sz * s * span; put(new T.ConeGeometry(.22, .7, 10), mCone, cx, .35, cz, 0); put(new T.CylinderGeometry(.12, .15, .1, 10), mBand, cx, .42, cz, 0); } }
  if (bb.flushStatic) bb.flushStatic();
  bb.DEADENDS = ends;
});
