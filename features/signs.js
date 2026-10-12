// Road signs at every city entrance: a green "Welcome to" board for drivers coming in, a green "Thank you,
// visit again" board for drivers leaving, and a blue direction board with arrows and distances to the next
// cities. Built only near the player so they cost nothing far away. Ads never use green or blue (core-2 adBg).
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD; const STN = W.states || {};
  const GREEN = '#0b7a3b', BLUE = '#1450a3';
  // real-world distance: the map is about 1000 units per degree of latitude and 850 per degree of longitude
  const realKm = (ax, az, bx, bz) => Math.round(Math.hypot((bx - ax) / 850 * 107, (bz - az) / 1000 * 111));
  const centre = z => [z.x0 + z.nx * 40, z.z0 + z.nz * 40];
  const specs = [];
  for (const z of W.zones) { const R = [z.x0 - 6, z.z0 - 6, z.x0 + z.nx * 80 + 6, z.z0 + z.nz * 80 + 6]; const inR = (x, y) => x > R[0] && x < R[2] && y > R[1] && y < R[3]; const found = [];
    for (const e of bb.EDGES) { if (e.kind === 'city') continue; const a = inR(e.ax, e.az), b = inR(e.bx, e.bz); if (a === b) continue;
      // inbound direction: from the outside end towards the city
      const [ox, oz, ix, iz] = a ? [e.bx, e.bz, e.ax, e.az] : [e.ax, e.az, e.bx, e.bz]; const L = Math.hypot(ix - ox, iz - oz); if (L < 40) continue; const fx = (ix - ox) / L, fz = (iz - oz) / L;
      // where the road crosses the city edge
      let t0 = 0, t1 = L; for (let k = 0; k < 24; k++) { const tm = (t0 + t1) / 2; if (inR(ox + fx * tm, oz + fz * tm)) t1 = tm; else t0 = tm; } const px = ox + fx * t1, pz = oz + fz * t1;
      if (t1 < 70) continue; if (found.some(q => Math.hypot(q[0] - px, q[1] - pz) < 120)) continue; found.push([px, pz]);
      const lx = fz, lz = -fx; const off = e.w / 2 + 3.5; // drivers keep left in India, so boards stand on the left
      const at = (back, side) => [px - fx * back + side * lx * off, pz - fz * back + side * lz * off];
      const ok = ([x, y]) => !bb.isWater(x, y) && !bb.roadAt(x, y, 1.2);
      const w = at(42, 1); if (ok(w)) specs.push({ x: w[0], z: w[1], ry: Math.atan2(-fx, -fz), kind: 'welcome', text: `WELCOME TO|${z.name.toUpperCase()}`, sub: STN[z.st] || '' });
      const th = at(30, -1); if (ok(th)) specs.push({ x: th[0], z: th[1], ry: Math.atan2(fx, fz), kind: 'thanks', text: `THANK YOU FOR VISITING|${z.name.toUpperCase()} · VISIT AGAIN`, sub: '' });
      // blue direction board for drivers leaving: the nearest bigger towns roughly ahead of them
      const hx = -fx, hz = -fz; const [cx0, cz0] = centre(z);
      const ahead = W.zones.filter(q => q !== z && q.size !== 'small').map(q => { const [cx, cz] = centre(q); const dx = cx - px, dz = cz - pz, d = Math.hypot(dx, dz); const cos = (dx * hx + dz * hz) / d; const side = dx * (-hz) - dz * (-hx); return { q, d, cos, side, km: realKm(px, pz, cx, cz) }; })
        .filter(o => o.cos > .5 && o.d > 300).sort((a, b2) => a.d - b2.d).slice(0, 3);
      const dr = at(75, -1); if (ahead.length && ok(dr)) specs.push({ x: dr[0], z: dr[1], ry: Math.atan2(fx, fz), kind: 'dir', lines: ahead.map(o => [o.cos > .93 ? '↑' : o.side > 0 ? '↖' : '↗', o.q.name, o.km + ' km']) });
      if (found.length >= 4) break; } }

  /* textures */
  function plate(kind, s) { const c = document.createElement('canvas'); c.width = 512; c.height = kind === 'dir' ? 300 : 200; const x = c.getContext('2d'); x.fillStyle = kind === 'dir' ? BLUE : GREEN; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = '#ffffff'; x.lineWidth = 8; x.beginPath(); x.roundRect ? x.roundRect(12, 12, c.width - 24, c.height - 24, 18) : x.rect(12, 12, c.width - 24, c.height - 24); x.stroke(); x.fillStyle = '#ffffff'; x.textBaseline = 'middle';
    if (kind === 'dir') { s.lines.forEach(([ar, name, km], i) => { const y = 62 + i * 86; x.font = '800 60px sans-serif'; x.textAlign = 'left'; x.fillText(ar, 34, y); x.font = '700 40px "Baloo 2", sans-serif'; x.textAlign = 'right'; x.fillText(km, 486, y + 2); const kw = x.measureText(km).width; x.textAlign = 'left'; let fs = 50; x.font = `800 ${fs}px "Baloo 2", sans-serif`; while (x.measureText(name).width > 486 - kw - 24 - 100 && fs > 28) { fs -= 2; x.font = `800 ${fs}px "Baloo 2", sans-serif`; } x.fillText(name, 100, y + 2); }); }
    else { const [a, b] = s.text.split('|'); x.textAlign = 'center'; x.font = '700 40px "Baloo 2", sans-serif'; x.fillText(a, 256, 62, 470); let fs = 64; x.font = `800 ${fs}px "Baloo 2", sans-serif`; while (x.measureText(b).width > 470 && fs > 26) { fs -= 3; x.font = `800 ${fs}px "Baloo 2", sans-serif`; } x.fillText(b, 256, 128, 470); if (s.sub) { x.font = '600 28px "Baloo 2", sans-serif'; x.fillText(s.sub, 256, 172); } }
    const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
  const post = bb.LMat('#9aa3ab'), back = bb.LMat('#5f6870');
  function build(s) { const g = new T.Group(); const w = 7, h = s.kind === 'dir' ? 4.1 : 2.75, y = 2.6 + h / 2; const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: plate(s.kind, s) })); m.position.set(0, y, .07); g.add(m);
    const bk = new T.Mesh(new T.BoxGeometry(w, h, .1), back); bk.position.set(0, y, 0); g.add(bk); for (const sx of [-w * .36, w * .36]) { const p = new T.Mesh(new T.CylinderGeometry(.09, .09, y + h / 2, 6), post); p.position.set(sx, (y + h / 2) / 2, -.12); g.add(p); }
    g.position.set(s.x, 0, s.z); g.rotation.y = s.ry; bb.scene.add(g); return g; }
  function free(g) { bb.scene.remove(g); g.traverse(o => { if (o.isMesh && o.material.map) { o.material.map.dispose(); o.material.dispose(); o.geometry.dispose(); } }); }
  let t = 0; bb.onUpdate(dt => { t -= dt; if (t > 0) return; t = .7; const pp = bb.ppos(); for (const s of specs) { const d = Math.abs(s.x - pp.x) + Math.abs(s.z - pp.z); if (d < 650 && !s.g) s.g = build(s); else if (d > 900 && s.g) { free(s.g); s.g = null; } if (s.g) s.g.visible = !bb.inside; } });
  bb.SIGNS = specs;
});
