// India map, West India map with GPS, and travel: trains, flights, buses, bot taxis, the Mumbai local and the ferry.
window.BBFeatures.push(function (bb) {
  const W = bb.WORLD, P = () => bb.P;
  const STATES = [['JK', 'Jammu & Kashmir', 33.8, 75.0, 'north', 7], ['LA', 'Ladakh', 34.4, 77.8, 'north', 8], ['HP', 'Himachal Pradesh', 31.9, 77.2, 'north', 6], ['PB', 'Punjab', 30.9, 75.4, 'north', 6], ['CH', 'Chandigarh', 30.7, 76.8, 'north', 3], ['UK', 'Uttarakhand', 30.1, 79.1, 'north', 6], ['HR', 'Haryana', 29.1, 76.2, 'north', 6], ['DL', 'Delhi', 28.6, 77.2, 'north', 3.5],
    ['RJ', 'Rajasthan', 26.6, 73.8, 'west', 11], ['GJ', 'Gujarat', 22.6, 71.6, 'west', 9], ['MH', 'Maharashtra', 19.4, 75.7, 'west', 10], ['DD', 'Daman & Diu', 20.4, 72.0, 'west', 3], ['DN', 'Dadra & Nagar Haveli', 20.2, 73.2, 'west', 3],
    ['UP', 'Uttar Pradesh', 27.0, 80.9, 'central', 10], ['MP', 'Madhya Pradesh', 23.5, 78.5, 'central', 11], ['CG', 'Chhattisgarh', 21.3, 81.9, 'central', 8],
    ['BR', 'Bihar', 25.6, 85.6, 'east', 7], ['JH', 'Jharkhand', 23.6, 85.3, 'east', 6.5], ['WB', 'West Bengal', 23.4, 87.9, 'east', 7], ['OD', 'Odisha', 20.5, 84.4, 'east', 8],
    ['SK', 'Sikkim', 27.5, 88.5, 'northeast', 3], ['AS', 'Assam', 26.2, 92.9, 'northeast', 7], ['AR', 'Arunachal Pradesh', 28.0, 94.6, 'northeast', 7], ['NL', 'Nagaland', 26.1, 94.4, 'northeast', 3.5], ['MN', 'Manipur', 24.8, 93.9, 'northeast', 3.5], ['MZ', 'Mizoram', 23.2, 92.8, 'northeast', 3.5], ['TR', 'Tripura', 23.8, 91.6, 'northeast', 3], ['ML', 'Meghalaya', 25.5, 91.3, 'northeast', 4],
    ['KA', 'Karnataka', 14.9, 75.9, 'southwest', 9], ['GA', 'Goa', 15.4, 74.0, 'southwest', 3], ['KL', 'Kerala', 10.4, 76.4, 'southwest', 6], ['LD', 'Lakshadweep', 10.6, 72.6, 'southwest', 2.5],
    ['TN', 'Tamil Nadu', 11.0, 78.5, 'southeast', 8.5], ['AP', 'Andhra Pradesh', 15.9, 79.7, 'southeast', 9], ['TS', 'Telangana', 17.9, 79.0, 'southeast', 7], ['PY', 'Puducherry', 11.9, 79.8, 'southeast', 2.5], ['AN', 'Andaman & Nicobar', 11.7, 92.7, 'southeast', 3.5]];
  const RCOL = { west: '#ffc93c', north: '#5fb4ff', central: '#c38bff', east: '#ff8fd0', northeast: '#7fd858', southwest: '#3fd0c9', southeast: '#ff9f1c' };
  let gps = null;
  bb.addMission(() => { if (!gps) return null; const pp = bb.ppos(); const d = Math.hypot(pp.x - gps.x, pp.z - gps.z); if (d < 45) { bb.toast(`Arrived · ${gps.name}`, '#3ddc97'); gps = null; return null; } return { pri: 60, k: 'Directions', t: gps.name, m: 'Follow the blue line on the minimap', target: { x: gps.x, z: gps.z, col: 0x5fb4ff } }; });
  function setGps(x, z, name) { gps = { x, z, name }; bb.closeSheet(); }

  const dkm = d => { const k = d * 2.4; return k >= 1000 ? (k / 1000).toFixed(1) + ' km' : Math.round(k / 10) * 10 + ' m'; };
  let mapTab = 'map';
  function tabs() { return `<div class="chips">${[['map', '🗺 Map'], ['india', '🇮🇳 All India']].map(([k, l]) => `<button class="chip${k === mapTab ? ' on' : ''}" data-tab="${k}">${l}</button>`).join('')}${gps ? '<button class="chip" data-tab="clear">✖ Clear route</button>' : ''}</div>`; }
  function mapSheet(tab) { if (tab === 'clear') { gps = null; bb.toast('Directions cleared', '#d6c8e4'); tab = null; } if (tab === 'city' || tab === 'region') tab = 'map'; if (tab) mapTab = tab; if (mapTab === 'india') return indiaTab(); return zoomTab(); }
  function go(x, z, name) { const r = bb.nearestRoadPoint(x, z, 400); setGps(r && Math.hypot(r.x - x, r.z - z) < 60 ? r.x : x, r && Math.hypot(r.x - x, r.z - z) < 60 ? r.z : z, name); bb.toast(`Directions to ${bb.esc(name)} · follow the blue line`, '#5fb4ff'); }
  function selectCard(sh, x, z, name, sub, pin) { const el = sh.querySelector('#msel'); const pp = bb.ppos(); el.innerHTML = `<div class="selcard"><div><b>${bb.esc(name)}</b><small>${bb.esc(sub || '')} · ${dkm(Math.hypot(x - pp.x, z - pp.z))} away</small></div><div class="btnrow" style="gap:6px;flex-wrap:nowrap"><button class="go" data-dir>Directions</button><button class="buy ghost" data-unsel>Close</button></div></div>`;
    el.querySelector('[data-dir]').onclick = () => go(x, z, name); el.querySelector('[data-unsel]').onclick = () => { el.innerHTML = ''; if (pin) pin(null); }; if (pin) pin([x, z]); }
  function curZone() { const pp = bb.ppos(); return bb.zoneAt(pp.x, pp.z, 150) || W.zones.slice().sort((a, b) => Math.hypot(a.x0 + a.nx * 40 - pp.x, a.z0 + a.nz * 40 - pp.z) - Math.hypot(b.x0 + b.nx * 40 - pp.x, b.z0 + b.nz * 40 - pp.z))[0]; }

  /* Zoomable map: drag to pan, pinch or scroll to zoom, tap for directions. */
  let view = null; // remembered between openings: {cx, cz, s}
  function zoomTab() {
    const pp = bb.ppos(); const z = curZone(); const R0 = bb.route;
    const near = bb.pois.filter(p => (p.type !== 'home' || P().homes.includes(p.extra)) && Math.hypot(p.x - pp.x, p.z - pp.z) < 700).map(p => ({ p, d: Math.hypot(p.x - pp.x, p.z - pp.z) })).sort((a, b) => a.d - b.d).slice(0, 30);
    const zs = W.zones.map(q => ({ z: q, d: Math.hypot(q.x0 + q.nx * 40 - pp.x, q.z0 + q.nz * 40 - pp.z) })).sort((a, b) => a.d - b.d);
    const sub = gps ? `Route to ${bb.esc(gps.name)} · drag, pinch or scroll to zoom` : 'Drag to move · pinch or scroll to zoom · tap a place for directions';
    bb.openSheet(`🗺 ${bb.esc(z.name)} · ${W.states[z.st]}`, sub, tabs() +
      `<div class="mapwrap zmap"><canvas id="zm"></canvas><div class="zbtns"><button data-zb="in" aria-label="Zoom in">+</button><button data-zb="out" aria-label="Zoom out">−</button><button data-zb="me" aria-label="Centre on me">◎</button>${R0 || gps ? '<button data-zb="ahead" aria-label="Navigation view: the road ahead">🧭</button><button data-zb="route" aria-label="Show whole route">⤢</button>' : ''}</div><div class="zscale" id="zsc"></div></div>
      <div id="msel"></div><div class="legend"><span><b style="color:#2f7bff">━</b> Your route</span><span><b style="color:#d62f4b">●</b> Destination</span><span><b style="color:#ff9f1c">━</b> Busy · <b style="color:#e8473a">━</b> Jammed</span><span><b style="color:#ffd36a">━</b> Expressway</span><span>✈ Airport · 🏡 Home</span><span><b style="color:${bb.CFG.accent}">▲</b> You</span></div>` +
      `<details open><summary class="dsum">Near you (${near.length})</summary>${near.map((q, i) => bb.rowHtml('p' + i, `${bb.PICON[q.p.type] || '📍'} ${bb.esc(q.p.name)}`, `${bb.PLABEL[q.p.type] || ''} · ${dkm(q.d)}`, 'Directions', 'ghost')).join('')}</details>` +
      `<details><summary class="dsum">Cities and towns (${zs.length})</summary>${zs.map((q, i) => bb.rowHtml('z' + i, bb.esc(q.z.name), `${W.states[q.z.st]} · ${dkm(q.d)}`, 'Directions', 'ghost')).join('')}</details>` +
      `<details><summary class="dsum">Famous places (${W.places.length})</summary>${W.places.map((pl, i) => bb.rowHtml('f' + i, bb.esc(pl[0]), `${P().discovered[pl[0]] ? '✅ Discovered' : 'Not discovered yet'} · ${dkm(Math.hypot(pl[1] - pp.x, pl[2] - pp.z))}`, 'Directions', 'ghost')).join('')}</details>`, sh => {
      const c = sh.querySelector('#zm'), wrap = c.parentNode, x = c.getContext('2d'); const DPR = Math.min(2, window.devicePixelRatio || 1);
      let cw = wrap.clientWidth || 400, ch = Math.round(Math.min(Math.max(300, window.innerHeight * .55), 560)); c.style.height = ch + 'px'; c.width = cw * DPR; c.height = ch * DPR;
      const sMin = Math.min(cw / W.W, ch / W.H) * .95, sMax = 3;
      let V = view ? Object.assign({}, view) : { cx: pp.x, cz: pp.z, s: .45 }; let pin = null, raf = 0;
      const fitRoute = () => { const R = bb.route; const pts = R ? R.slice() : []; if (gps) pts.push([gps.x, gps.z]); pts.push([pp.x, pp.z]); if (pts.length < 2) return false; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [a, b] of pts) { x0 = Math.min(x0, a); x1 = Math.max(x1, a); z0 = Math.min(z0, b); z1 = Math.max(z1, b); }
        V.cx = (x0 + x1) / 2; V.cz = (z0 + z1) / 2; V.s = Math.max(sMin, Math.min(1.2, Math.min((cw - 90) / (x1 - x0 + 1), (ch - 110) / (z1 - z0 + 1)))); V.cz -= 10 / V.s; return true; };
      // navigating: open on the road ahead of you (not the whole city); otherwise open around you
      const fitAhead = () => { const R = bb.route; if (!R || R.length < 2) return fitRoute(); let L = 0, k = 0; let bi = 0, bd = 1e9; R.forEach((q, i) => { const d = Math.hypot(q[0] - pp.x, q[1] - pp.z); if (d < bd) { bd = d; bi = i; } });
        const pts = [[pp.x, pp.z]]; for (let i = bi + 1; i < R.length && L < 900; i++) { L += Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]); pts.push(R[i]); k++; } if (L < 900 && gps) pts.push([gps.x, gps.z]);
        let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [a, b] of pts) { x0 = Math.min(x0, a); x1 = Math.max(x1, a); z0 = Math.min(z0, b); z1 = Math.max(z1, b); }
        V.cx = (x0 + x1) / 2; V.cz = (z0 + z1) / 2; V.s = Math.max(.3, Math.min(1.4, Math.min((cw - 80) / (x1 - x0 + 1), (ch - 100) / (z1 - z0 + 1)))); return true; };
      if (R0 || gps) fitAhead(); else if (!view || Math.hypot(view.cx - pp.x, view.cz - pp.z) > 300) V = { cx: pp.x, cz: pp.z, s: view ? Math.max(view.s, .45) : .45 };
      const clampV = () => { V.s = Math.max(sMin, Math.min(sMax, V.s)); const hw = cw / 2 / V.s, hh = ch / 2 / V.s; V.cx = Math.max(Math.min(hw, W.W / 2), Math.min(W.W - Math.min(hw, W.W / 2), V.cx)); V.cz = Math.max(Math.min(hh, W.H / 2), Math.min(W.H - Math.min(hh, W.H / 2), V.cz)); view = Object.assign({}, V); };
      const sx = wx => (wx - V.cx) * V.s + cw / 2, sz = wz => (wz - V.cz) * V.s + ch / 2, wx = px => (px - cw / 2) / V.s + V.cx, wz = py => (py - ch / 2) / V.s + V.cz;
      const inView = (ax, az, bx, bz, m) => Math.max(ax, bx) > wx(-m) && Math.min(ax, bx) < wx(cw + m) && Math.max(az, bz) > wz(-m) && Math.min(az, bz) < wz(ch + m);
      function draw() { raf = 0; clampV(); x.setTransform(DPR, 0, 0, DPR, 0, 0); x.fillStyle = '#2a6f97'; x.fillRect(0, 0, cw, ch);
        const M = bb.MAPS; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(bb.mapCanvas, sx(0), sz(0), bb.mapCanvas.width * M * V.s, bb.mapCanvas.height * M * V.s);
        const s = V.s;
        if (s > .18) for (const b of bb.blocks) { if (!b.land || !inView(b.x - 32, b.z - 32, b.x + 32, b.z + 32, 10)) continue; x.fillStyle = b.hasBld ? 'rgba(150,140,120,.85)' : b.open ? 'rgba(140,190,110,.9)' : 'rgba(205,190,150,.8)'; x.fillRect(sx(b.x - 32), sz(b.z - 32), 64 * s, 64 * s); }
        x.lineCap = 'round'; x.lineJoin = 'round';
        for (const pass of [0, 1]) for (const e of bb.EDGES) { if (!inView(e.ax, e.az, e.bx, e.bz, 20)) continue; if (s < .12 && e.kind === 'city') continue;
          const big = e.kind !== 'city'; x.strokeStyle = pass ? (e.road && e.road.kind === 'exp' ? '#ffd36a' : big ? '#fbf5e6' : '#ffffff') : 'rgba(60,55,70,.55)'; x.lineWidth = Math.max(big ? 2.2 : 1.2, e.w * s) + (pass ? 0 : 2);
          x.beginPath(); x.moveTo(sx(e.ax), sz(e.az)); x.lineTo(sx(e.bx), sz(e.bz)); x.stroke(); }
        if (s > .25) for (const e of bb.EDGES) { const cg = bb.CONG[e.id]; if (!(cg >= .42) || !inView(e.ax, e.az, e.bx, e.bz, 0)) continue; x.strokeStyle = cg > .7 ? '#e8473a' : '#ff9f1c'; x.lineWidth = Math.max(1.6, e.w * s * .5); x.beginPath(); x.moveTo(sx(e.ax), sz(e.az)); x.lineTo(sx(e.bx), sz(e.bz)); x.stroke(); }
        for (const a of W.airports) { x.fillStyle = '#2e2f33'; x.fillRect(sx(a.x - a.L / 2), sz(a.z - 15), Math.max(4, a.L * s), Math.max(2, 30 * s)); }
        const R = bb.route; if (R && R.length > 1) { for (const [col, w] of [['#ffffff', 9], ['#2f7bff', 5.5]]) { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); R.forEach(([px, pz], i) => i ? x.lineTo(sx(px), sz(pz)) : x.moveTo(sx(px), sz(pz))); x.stroke(); } }
        else if (gps) { x.setLineDash([6, 6]); x.strokeStyle = '#2f7bff'; x.lineWidth = 3; x.beginPath(); x.moveTo(sx(pp.x), sz(pp.z)); x.lineTo(sx(gps.x), sz(gps.z)); x.stroke(); x.setLineDash([]); }
        x.textAlign = 'center'; x.textBaseline = 'middle';
        if (s > .7) { x.font = '12px sans-serif'; for (const p of bb.pois) { if (p.type === 'home' && !P().homes.includes(p.extra)) continue; const X = sx(p.x), Z = sz(p.z); if (X < -10 || Z < -10 || X > cw + 10 || Z > ch + 10) continue; x.fillStyle = '#fff'; x.strokeStyle = p.color || '#888'; x.lineWidth = 2; x.beginPath(); x.arc(X, Z, 9, 0, 6.29); x.fill(); x.stroke(); x.fillStyle = '#1a1430'; x.fillText(bb.PICON[p.type] || '•', X, Z + 1); } }
        else { x.font = '11px sans-serif'; for (const a of W.airports) x.fillText('✈', sx(a.x), sz(a.z)); for (const h of P().homes) { const p = bb.pois.find(q => q.type === 'home' && q.extra === h); if (p) x.fillText('🏡', sx(p.x), sz(p.z)); } }
        if (s > .3) { x.font = '700 10px "Baloo 2", sans-serif'; for (const [n, px, pz] of W.places) { const X = sx(px), Z = sz(pz); if (X < 0 || Z < 0 || X > cw || Z > ch) continue; x.fillStyle = P().discovered[n] ? '#3ddc97' : '#ffc93c'; x.beginPath(); x.arc(X, Z, 3, 0, 6.29); x.fill(); if (s > .5) { x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3; x.strokeText(n, X, Z - 9); x.fillStyle = '#fff'; x.fillText(n, X, Z - 9); } } }
        const fs = s < .05 ? 9 : s < .15 ? 11 : 13; x.font = `800 ${fs}px "Baloo 2", sans-serif`;
        for (const q of W.zones) { if (s < .05 && q.size === 'small') continue; if (s < .03 && q.size !== 'big') continue; const X = sx(q.x0 + q.nx * 40), Z = sz(q.z0 + q.nz * 40); if (X < -40 || Z < -20 || X > cw + 40 || Z > ch + 20) continue; if (s < .2) { x.fillStyle = '#fff4e2'; x.beginPath(); x.arc(X, Z, q.size === 'big' ? 3.4 : 2.4, 0, 6.29); x.fill(); }
          const Y = s < .2 ? Z - 8 : sz(q.z0) - 8; x.strokeStyle = 'rgba(0,0,0,.65)'; x.lineWidth = 3.5; x.strokeText(q.name, X, Y); x.fillStyle = '#fff4e2'; x.fillText(q.name, X, Y); }
        const mark = (px, pz, col) => { const X = sx(px), Z = sz(pz); x.fillStyle = col; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(X, Z); x.bezierCurveTo(X - 9, Z - 12, X - 8, Z - 22, X, Z - 22); x.bezierCurveTo(X + 8, Z - 22, X + 9, Z - 12, X, Z); x.fill(); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Z - 15, 3, 0, 6.29); x.fill(); };
        if (gps) mark(gps.x, gps.z, '#d62f4b'); if (pin) mark(pin[0], pin[1], '#7a3cff');
        const h = bb.player.veh ? bb.player.veh.h : bb.player.h; x.save(); x.translate(sx(pp.x), sz(pp.z)); x.fillStyle = 'rgba(47,123,255,.18)'; x.beginPath(); x.arc(0, 0, 18, 0, 6.29); x.fill(); x.rotate(Math.PI - h); x.fillStyle = bb.CFG.accent; x.strokeStyle = '#1a1430'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -10); x.lineTo(8, 8); x.lineTo(0, 3); x.lineTo(-8, 8); x.closePath(); x.fill(); x.stroke(); x.restore();
        const sc = sh.querySelector('#zsc'); if (sc) { const m = [50, 100, 200, 500, 1000, 2000, 5000].find(v => v * s > 50) || 5000; sc.style.width = Math.round(m * s) + 'px'; sc.textContent = dkm(m); } }
      const redraw = () => { if (!raf) raf = requestAnimationFrame(draw); };
      draw();
      const zoomAt = (f, px, py) => { const ax = wx(px), az = wz(py); V.s = Math.max(sMin, Math.min(sMax, V.s * f)); V.cx = ax - (px - cw / 2) / V.s; V.cz = az - (py - ch / 2) / V.s; redraw(); };
      const pts = new Map(); let moved = 0, pinch = null, lastTap = 0;
      const rel = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); pts.set(e.pointerId, rel(e)); moved = 0; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: V.s }; } });
      c.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const p = rel(e), q = pts.get(e.pointerId); pts.set(e.pointerId, p);
        if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; zoomAt((pinch.s * d / pinch.d) / V.s, mx, my); moved = 99; return; }
        const dx = p[0] - q[0], dy = p[1] - q[1]; moved += Math.abs(dx) + Math.abs(dy); V.cx -= dx / V.s; V.cz -= dy / V.s; redraw(); });
      const up = e => { const was = pts.has(e.pointerId); pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!was || pts.size || moved > 8) return; const [px, py] = rel(e); const now = performance.now();
        if (now - lastTap < 300) { lastTap = 0; zoomAt(2, px, py); return; } lastTap = now; tapAt(px, py); };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; });
      c.addEventListener('wheel', e => { e.preventDefault(); const [px, py] = rel(e); zoomAt(Math.exp(-e.deltaY * .0015), px, py); }, { passive: false });
      function tapAt(px, py) { const mx = wx(px), mz = wz(py); let best = null, bd = 16;
        if (V.s > .7) for (const p of bb.pois) { if (p.type === 'home' && !P().homes.includes(p.extra)) continue; const d = Math.hypot(sx(p.x) - px, sz(p.z) - py); if (d < bd) { bd = d; best = { x: p.x, z: p.z, name: p.name, sub: bb.PLABEL[p.type] }; } }
        for (const [n, x0, z0] of W.places) { const d = Math.hypot(sx(x0) - px, sz(z0) - py); if (d < bd) { bd = d; best = { x: x0, z: z0, name: n, sub: 'Famous place' }; } }
        if (!best) { const zz = bb.zoneAt(mx, mz, 10); if (zz && V.s < .3) best = { x: zz.x0 + zz.nx * 40, z: zz.z0 + zz.nz * 40, name: zz.name, sub: W.states[zz.st] }; }
        if (!best) { const zz = bb.zoneAt(mx, mz, 60); best = { x: mx, z: mz, name: 'Dropped pin', sub: zz ? zz.name : W.states[bb.stateAt(mx, mz)] || '' }; }
        if (bb.isWater(best.x, best.z) && !bb.roadAt(best.x, best.z)) return bb.toast('That is water · tap on land', '#d6c8e4');
        selectCard(sh, best.x, best.z, best.name, best.sub, p => { pin = p; redraw(); }); }
      sh.querySelector('.zbtns').onclick = e => { const k = e.target.dataset.zb; if (!k) return; e.stopPropagation(); if (k === 'in') zoomAt(1.8, cw / 2, ch / 2); if (k === 'out') zoomAt(1 / 1.8, cw / 2, ch / 2); if (k === 'me') { V.cx = pp.x; V.cz = pp.z; V.s = Math.max(V.s, .45); redraw(); } if (k === 'route') { fitRoute(); redraw(); } if (k === 'ahead') { fitAhead(); redraw(); } };
      sh.onclick = e => { const t = e.target.dataset.tab; if (t) return mapSheet(t); const id = e.target.dataset.id; if (!id) return;
        if (id[0] === 'p') { const q = near[+id.slice(1)]; go(q.p.x, q.p.z, q.p.name); } if (id[0] === 'z') { const q = zs[+id.slice(1)].z; go(q.x0 + q.nx * 40, q.z0 + q.nz * 40, q.name); } if (id[0] === 'f') { const pl = W.places[+id.slice(1)]; go(pl[1], pl[2], pl[0]); } };
    }); }
  function indiaTab() { const IS = window.INDIA_STATES; const live = id => { const r = bb.REGIONS.find(q => q.id === id); return !!(r && r.map && bb.CFG.regions[id]); };
    const svg = `<svg viewBox="${IS.viewBox}" width="100%" role="img" aria-label="Map of India by state" style="display:block;background:#123049;border-radius:14px">${IS.states.map(st => `<path data-s="${st.id}" d="${st.d}" fill="${RCOL[st.region]}" fill-opacity="${live(st.region) ? .95 : .4}" stroke="#123049" stroke-width="${live(st.region) ? 1.2 : .8}" style="cursor:pointer"><title>${bb.esc(st.name)}</title></path>`).join('')}<g id="slabels" font-family="Baloo 2, sans-serif" font-weight="800" font-size="10" text-anchor="middle" fill="#1a1430" pointer-events="none"></g></svg>`;
    bb.openSheet('🗺 All India', 'Tap a state · coloured by region · bright = playable now', tabs() + `<div class="mapwrap" style="background:#123049">${svg}</div><div id="msel"></div><div class="legend">${bb.REGIONS.map(r => `<span><b style="color:${RCOL[r.id]}">■</b>${r.name}${live(r.id) ? ' · live' : ''}</span>`).join('')}</div>` +
      bb.REGIONS.map(r => bb.rowHtml(r.id, `<span style="color:${RCOL[r.id]}">●</span> ${r.name}`, r.states, live(r.id) ? 'Open map' : 'Coming soon', live(r.id) ? '' : 'ghost')).join('') + `<p class="note">${IS.credit}. The bright regions are one connected map: drive, take a train or fly between them.</p>`,
      sh => { const g = sh.querySelector('#slabels'); const ABR = { an: 'AN', ap: 'AP', ar: 'AR', as: 'AS', br: 'BR', ch: '', ct: 'CG', dn: '', dd: '', dl: '', ga: 'GA', gj: 'GJ', hr: 'HR', hp: 'HP', jk: 'J&K', jh: 'JH', ka: 'KA', kl: 'KL', ld: '', mp: 'MP', mh: 'MH', mn: 'MN', ml: 'ML', mz: 'MZ', nl: 'NL', or: 'OD', py: '', pb: 'PB', rj: 'RJ', sk: '', tn: 'TN', tg: 'TS', tr: 'TR', up: 'UP', ut: 'UK', wb: 'WB' };
        for (const pth of sh.querySelectorAll('path[data-s]')) { const id = pth.dataset.s; if (!ABR[id]) continue; try { const bx = pth.getBBox(); const t = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t.setAttribute('x', bx.x + bx.width / 2); t.setAttribute('y', bx.y + bx.height / 2 + 3); t.textContent = ABR[id]; g.appendChild(t); } catch (e) {} }
        sh.onclick = e => { const t = e.target.dataset.tab; if (t) return mapSheet(t); const ps = e.target.closest('path[data-s]'); if (ps) { const st = IS.states.find(q => q.id === ps.dataset.s); const r = bb.REGIONS.find(q => q.id === st.region); sh.querySelectorAll('path[data-s]').forEach(q => q.setAttribute('stroke', '#123049')); ps.setAttribute('stroke', '#ffffff');
            sh.querySelector('#msel').innerHTML = `<div class="selcard"><div><b>${bb.esc(st.name)}</b><small>${r.name} region · ${live(r.id) ? 'playable now' : 'coming soon'}</small></div>${live(r.id) ? '<button class="go" data-tab="map">Open map</button>' : ''}</div>`; return; }
          const id = e.target.dataset.id; if (!id) return; if (live(id)) return mapSheet('map'); const r = bb.REGIONS.find(x => x.id === id); if (r) bb.toast(`${r.name} opens in a coming update`, '#d6c8e4'); }; }); }
  bb.setMap(() => mapSheet('city')); bb.onKey('KeyN', () => mapSheet()); bb.addApp({ id: 'map', label: 'Map', icon: '🗺', fn: () => mapSheet() });

  /* travel booking */
  const MODE = { sleeper: 'Train · Sleeper', ac: 'Train · AC chair car', flight: 'Flight', bus: 'ST bus', bottaxi: 'Bot taxi', ferry: 'Ferry', local: 'Mumbai local', metro: 'Metro' };
  const FLAVOUR = { train: ['"Chai, chai, garam chai!" walks down the aisle', 'Someone opens a tiffin of theplas', 'The ghats roll past the window', 'Middle-berth uncle is snoring', 'A long halt at a junction'], flight: ['Seatbelt sign is on', 'Cabin crew bring masala peanuts', 'Clouds over the Western Ghats', 'Starting descent'], bus: ['The driver plays a 90s playlist', 'A stop at a highway dhaba', 'Speed breaker!', 'Overtaking a tractor'], bottaxi: ['The bot taxi brakes for a cow', 'The bot taxi says "Recalculating"', 'Smooth expressway cruise'], ferry: ['Gulls chase the boat', 'Spray from the harbour', 'The Gateway shrinks behind you'], local: ['"Agla station…"', 'Door-side breeze', 'Squeezed between dabbawalas'], metro: ['"Next station…" · doors open on the left', 'The city rolls past below the viaduct', 'Air-conditioned and on time', 'Someone offers you their seat'] };
  // The ride itself: you look out of the window while the map goes past (see features/cine.js).
  const RIDE = { sleeper: { kind: 'train', speed: 20, y: 3.4, side: 7 }, ac: { kind: 'train', speed: 22, y: 3.4, side: 7 }, bus: { kind: 'bus', speed: 15, y: 3.1, side: 2 }, bottaxi: { kind: 'taxi', speed: 17, y: 1.5, side: 2, look: 'fwd' },
    local: { kind: 'train', speed: 16, y: 3.2, side: 0 }, metro: { kind: 'metro', speed: 14, y: 13, side: 0, look: 'fwd' }, ferry: { kind: 'ferry', speed: 9, y: 3, side: 0 }, flight: { kind: 'plane', speed: 70 } };
  const runway = p => W.airports.slice().sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
  function ridePath(mode, from, to) { if (mode === 'flight') { const a = runway(from), b = runway(to); return [[a.x - a.L / 2 + 20, a.z], [a.x + a.L / 2, a.z], [b.x - b.L / 2 - 40, b.z], [b.x + b.L / 2 - 30, b.z]]; }
    if (mode === 'ferry') return [[from.x, from.z], [to.x, to.z]];
    if (mode === 'local') return [[2902, from.z], [2902, to.z]];
    const r = bb.findRoute(from.x, from.z, to.x, to.z); return r && r.length > 1 ? [[from.x, from.z]].concat(r, [[to.x, to.z]]) : [[from.x, from.z], [to.x, to.z]]; }
  function journey(mode, fromName, to, dist) { const [tk, maxT] = bb.CFG.travel[mode] || [0, 60]; const secs = Math.max(12, Math.round(maxT * Math.min(1, Math.max(.25, dist / 7000)))); const fl = FLAVOUR[mode === 'sleeper' || mode === 'ac' ? 'train' : mode] || FLAVOUR.bus;
    if (bb.player.mode === 'drive') bb.exitVehicle(true);
    const arrive = () => { bb.teleport(to.x, to.z, to.rot || 0); bb.toast(`Welcome to ${to.zoneName || to.name}`, '#ffc93c'); bb.emit('travel', { mode, to: to.name }); bb.save(); };
    if (!bb.CINE) { bb.openWait({ kind: MODE[mode], title: `${fromName} → ${to.name}`, sub: fl[0], total: secs, cancel: 'Get off and go back', onDone: arrive }); return; }
    const R = RIDE[mode] || RIDE.bus; const pp = bb.ppos(); const pts = ridePath(mode, pp, to); const km = Math.round(dist * 2.4 / 1000);
    // flights take off, climb above the clouds, cruise and land; the rest stay on the ground (the metro runs on its viaduct)
    const rw = mode === 'flight' ? runway(pp).L : 0; const y = mode === 'flight' ? (fr, s, len) => { const up = Math.min(s, len - s); return 3 + Math.min(190, Math.max(0, up - rw * .55) * .4); } : R.y;
    bb.CINE.play(bb.CINE.ride({ kind: R.kind, pts, y, speed: R.speed, dur: secs, side: R.side, lookDown: mode === 'flight' ? .72 : .5, side: mode === 'flight' ? 0 : R.side }, {
      label: MODE[mode], title: `${fromName} → ${to.name}`, sub: fl[0], lines: fl, look: R.look || 'side', clouds: mode === 'flight' ? 175 : 0, cancel: 'Get off · go back', skipLabel: 'Skip to arrival ⏭',
      timeText: (f) => { const l = Math.max(0, Math.ceil(secs * (1 - f))); return `${km} km · ${Math.floor(l / 60)}:${String(l % 60).padStart(2, '0')} to arrival · Bay ${bb.bayTime()}`; },
      onScene: k => bb.CINE.setSub(k === 1 ? `Half-way · ${Math.round(km / 2)} km to go` : `Arriving at ${to.name}`),
      onDone: arrive }));
  }
  function arrivalFor(type, zoneId) { const z = W.zones.find(q => q.id === zoneId); const p = bb.pois.find(q => q.type === type && q.zone === z) || bb.pois.find(q => q.zone === z); if (!p) return null; return { x: p.x + Math.sin(p.rot) * 2, z: p.z + Math.cos(p.rot) * 2, rot: p.rot, name: p.name, zoneName: z.name }; }
  function bookSheet(poi, modes, dests) { const here = poi.zone; let mode = modes[0];
    const draw = () => { const [tk] = bb.CFG.travel[mode]; bb.openSheet(poi.name, `${MODE[mode]} · Cash ${bb.inr(P().cash)}`, `<div class="chips">${modes.map(m => `<button class="chip${m === mode ? ' on' : ''}" data-m="${m}">${MODE[m]}</button>`).join('')}</div>` +
      dests.map(d => { const dist = Math.hypot(d.x - poi.x, d.z - poi.z); const t = Math.max(8, Math.round(bb.CFG.travel[mode][1] * Math.min(1, Math.max(.25, dist / 7000)))); const fare = bb.price(tk * (mode === 'local' || mode === 'metro' ? 1 : Math.min(1, Math.max(.3, dist / 6000)))); return bb.rowHtml(d.key, bb.esc(d.name), `${(dist * 2.4 / 1000).toFixed(0)} km · about ${Math.ceil(t / 60)} min`, bb.inr(fare)); }).join('') + '<p class="note">You leave your vehicle parked here. Call it later from Phone → Garage.</p>',
      s => s.onclick = e => { const m = e.target.dataset.m; if (m) { mode = m; draw(); return; } const id = e.target.dataset.id; if (!id) return; const d = dests.find(q => q.key === id); const dist = Math.hypot(d.x - poi.x, d.z - poi.z); const fare = bb.price(tk * (mode === 'local' || mode === 'metro' ? 1 : Math.min(1, Math.max(.3, dist / 6000))));
        if (!bb.spend(fare, true)) return; bb.closeSheet(); const place = mode === 'flight' ? 'checkin' : mode === 'bottaxi' || mode === 'metro' ? null : 'ticket';
        const go = () => { if (mode === 'local') { const rush = (bb.clock >= 8 && bb.clock < 11) || (bb.clock >= 17 && bb.clock < 21); if (rush) { P().energy = Math.max(0, P().energy - 5); bb.toast('Rush hour · you squeezed in at the door', '#ff9f1c'); } } journey(mode, poi.zone ? poi.zone.name : poi.name, d.arrive, dist); };
        if (place) bb.startQueue({ place, title: mode === 'flight' ? 'Check-in queue' : 'Ticket counter queue', onServe: go }); else go(); }); }; draw(); }
  bb.poiHandlers.station = poi => { const dests = W.zones.filter(z => z !== poi.zone && bb.pois.some(p => p.type === 'station' && p.zone === z)).map(z => ({ key: z.id, name: z.name, x: z.x0 + z.nx * 40, z: z.z0 + z.nz * 40, arrive: arrivalFor('station', z.id) })).filter(d => d.arrive); bookSheet(poi, ['sleeper', 'ac'], dests); };
  bb.poiHandlers.bus = poi => { const dests = W.zones.filter(z => z !== poi.zone).map(z => ({ key: z.id, name: z.name, x: z.x0 + z.nx * 40, z: z.z0 + z.nz * 40, arrive: arrivalFor('bus', z.id) })).filter(d => d.arrive); bookSheet(poi, ['bus', 'bottaxi'], dests); };
  bb.poiHandlers.airport = poi => { const dests = W.airports.filter(a => a.id !== poi.extra).map(a => { const p = bb.pois.find(q => q.type === 'airport' && q.extra === a.id); return { key: a.id, name: a.name, x: a.x, z: a.z, arrive: { x: p.x + Math.sin(p.rot) * 3, z: p.z + Math.cos(p.rot) * 3, rot: p.rot, name: a.name, zoneName: W.zones.find(z => z.id === a.zone).name } }; }); bookSheet(poi, ['flight'], dests); };
  bb.poiHandlers.local = poi => { const dests = bb.pois.filter(p => p.type === 'local' && p !== poi).map(p => ({ key: p.extra, name: p.name, x: p.x, z: p.z, arrive: { x: p.x + 2.5, z: p.z, rot: Math.PI / 2, name: p.name, zoneName: p.name } })); bookSheet(poi, ['local'], dests); };
  /* Metro: stations in the metro cities and rides along the elevated line between them */
  const METRO = { mumbai: [['Andheri', 3, 1], ['BKC', 3, 4], ['Siddhivinayak', 2, 6], ['Cuffe Parade', 2, 9]], pune: [['PCMC', 1, 1], ['Shivajinagar', 2, 2], ['Civil Court', 3, 3], ['Swargate', 3, 4]],
    ahmedabad: [['Thaltej', 0, 1], ['Old High Court', 3, 2], ['Kalupur', 4, 3], ['Vastral', 5, 5]], jaipur: [['Mansarovar', 0, 4], ['Sindhi Camp', 1, 2], ['Chandpole', 2, 1], ['Badi Chaupar', 4, 2]],
    bengaluru: [['Majestic', 1, 2], ['MG Road', 4, 2], ['Indiranagar', 5, 3], ['Electronic City', 5, 5]], kochi: [['Aluva', 3, 1], ['Edappally', 2, 1], ['MG Road', 1, 2], ['Vyttila', 3, 2]] };
  const MLINE = { mumbai: 'Mumbai Metro', pune: 'Pune Metro', ahmedabad: 'Ahmedabad Metro', jaipur: 'Jaipur Metro', bengaluru: 'Namma Metro', kochi: 'Kochi Metro' };
  const T3 = bb.THREE; const mKiosk = bb.LMat('#6b4fa0'), mRoof = bb.LMat('#e6e1f2'), mPole = bb.LMat('#3b3a40');
  for (const [zid, list] of Object.entries(METRO)) { const z = W.zones.find(q => q.id === zid); if (!z) continue;
    for (const [n, i, j] of list) { const bx = z.x0 + i * 80 + 40, bz = z.z0 + j * 80; const r = bb.nearestRoadPoint(bx, bz, 120); if (!r) continue; const e = r.e; const nx = e.dz, nz = -e.dx; const o = e.w / 2 + 2.6;
      const x = r.x + nx * o, zz = r.z + nz * o; const rot = Math.atan2(-nx, -nz);
      const g = new T3.Group(); const k = new T3.Mesh(new T3.BoxGeometry(3.2, 3, 2.2), mKiosk); k.position.y = 1.5; g.add(k); const rf = new T3.Mesh(new T3.BoxGeometry(4.2, .3, 3), mRoof); rf.position.y = 3.15; g.add(rf);
      const pl = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 5.2, 5), mPole); pl.position.set(2.2, 2.6, 0); g.add(pl); g.position.set(x - nx * 1.2, 0, zz - nz * 1.2); g.rotation.y = rot; bb.scene.add(g);
      bb.addSign('Ⓜ ' + n.toUpperCase(), x + Math.sin(rot) * .2 - nx * 1.2, 4.2, zz + Math.cos(rot) * .2 - nz * 1.2, rot, 4.4, .9, '#ffffff', '#6b4fa0');
      bb.addPoi({ type: 'metro', name: `${n} Metro`, x, z: zz, rot, extra: zid + ':' + n, zone: z }); } }
  bb.poiHandlers.metro = poi => { const zid = String(poi.extra).split(':')[0]; const dests = bb.pois.filter(p => p.type === 'metro' && p !== poi && String(p.extra).split(':')[0] === zid)
      .map(p => ({ key: p.extra, name: p.name, x: p.x, z: p.z, arrive: { x: p.x + Math.sin(p.rot) * 2, z: p.z + Math.cos(p.rot) * 2, rot: p.rot, name: p.name, zoneName: p.name } }));
    bookSheet(Object.assign({}, poi, { name: `${poi.name} · ${MLINE[zid] || 'Metro'}`, zone: null }), ['metro'], dests); };
  W.ferries.forEach((f, i) => { bb.addPoi({ type: 'ferry', name: f.a, x: f.ax, z: f.az, rot: -Math.PI / 2, extra: i + 'b' }); bb.addPoi({ type: 'ferry', name: f.b, x: f.bx, z: f.bz, rot: Math.PI / 2, extra: i + 'a' }); });
  bb.poiHandlers.ferry = poi => { const ex = String(poi.extra); const i = ex.length > 1 ? +ex.slice(0, -1) : 0, side = ex.slice(-1); const f = W.ferries[i]; const zn = id => { const q = W.zones.find(z => z.id === id); return q ? q.name : ''; };
    const toB = side === 'b'; const d = toB ? { key: 'b', name: f.b, x: f.bx, z: f.bz, arrive: { x: f.bx, z: f.bz, rot: Math.PI / 2, name: f.b, zoneName: f.zb ? zn(f.zb) : 'Alibaug' } } : { key: 'a', name: f.a, x: f.ax, z: f.az, arrive: { x: f.ax, z: f.az, rot: -Math.PI / 2, name: f.a, zoneName: f.za ? zn(f.za) : 'Mumbai' } };
    if (i === 0) { d.arrive.x += toB ? -2 : -3; } bookSheet(Object.assign({}, poi, { zone: null }), ['ferry'], [d]); };
  bb.TRAVEL = { setGps, mapSheet, go };
});
