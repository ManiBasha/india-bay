// Shared traffic (Beta v1.01.16). When players are near each other, one of them (the lowest player id in the
// group) drives the street traffic and sends where every vehicle is, 2–3 times a second. Everyone else nearby
// hides their own traffic and shows those vehicles instead: same cars, same colours, same places.
// Alone, or out of reach of the group, your own traffic runs as before. People on foot are still per device.
window.BBFeatures.push(function (bb) {
  const TYPES = ['cycle', 'rickshaw', 'bike', 'sportsbike', 'auto', 'taxi', 'car', 'sedan', 'suv', 'sports', 'police', 'bus', 'truck'];
  const O = () => bb.ONLINE; const R = 220;   // the group: players within this distance
  const proxies = new Map(); let follow = null, lastTr = 0, sendT = 0, snap = null;
  // who drives the traffic here: the lowest id among you and the players near you
  function hostHere() { const o = O(); if (!o || o.status !== 'on' || !o.myId) return null; const pp = bb.ppos(); let best = o.myId; const now = performance.now();
    for (const r of o.remotes.values()) { if (!r.id || (r.seen && now - r.seen > 6000) || r.m === 'i') continue; if (Math.hypot(r.x - pp.x, r.z - pp.z) < R && r.id < best) best = r.id; } return best; }
  function clearProxies() { for (const v of proxies.values()) bb.removeVeh(v); proxies.clear(); }
  function stopFollow() { if (follow) { follow = null; bb.netFollow = false; clearProxies(); } }
  bb.on('tr', d => { const h = hostHere(); if (!h || h !== d.id || h === O().myId) return; snap = { at: performance.now(), L: d.L }; lastTr = snap.at;
    if (follow !== d.id) { clearProxies(); follow = d.id; bb.netFollow = true; }
    const seen = new Set();
    for (const [tid, ti, seed, x, z, y, h1000, v10] of d.L) { const key = tid; seen.add(key); const type = TYPES[ti] || 'car'; let v = proxies.get(key);
      const X = x / 10, Z = z / 10, Y = y / 10, H = h1000 / 1000, V = v10 / 10;
      if (!v || v.type !== type) { if (v) bb.removeVeh(v); v = bb.makeVeh(type, X, Z, H, 'net', { seed, livery: type === 'bus' && bb.TRANSIT && bb.TRANSIT.liveryAt ? bb.TRANSIT.liveryAt(X, Z) : null }); v.pos.y = Y; proxies.set(key, v); }
      v.net = { x: X, z: Z, y: Y, h: H, v: V, at: performance.now() }; v.lastSeen = performance.now(); }
    for (const [k, v] of proxies) if (!seen.has(k) && performance.now() - v.lastSeen > 1200) { bb.removeVeh(v); proxies.delete(k); } });
  bb.onUpdate(dt => { if (!bb.started) return; const o = O(); const now = performance.now();
    const h = hostHere();
    // following: smooth each vehicle towards where the host says it is (moving on along its heading in between)
    if (follow) { if (!h || h !== follow || now - lastTr > 2500) stopFollow();
      else for (const v of proxies.values()) { const n = v.net; if (!n) continue; const t = Math.min(.8, (now - n.at) / 1000); const tx = n.x + Math.sin(n.h) * n.v * t, tz = n.z + Math.cos(n.h) * n.v * t; const k = Math.min(1, dt * 7);
        if (Math.hypot(tx - v.pos.x, tz - v.pos.z) > 25) { v.pos.x = tx; v.pos.z = tz; } else { v.pos.x += (tx - v.pos.x) * k; v.pos.z += (tz - v.pos.z) * k; } v.pos.y += (n.y - v.pos.y) * k;
        let dh = n.h - v.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); v.h += dh * k; v.m.rotation.y = v.h; v.v = n.v; if (v.m.userData.wheels) for (const w of v.m.userData.wheels) w.rotation.x += n.v * dt / .4; } }
    // driving it: send the vehicles around you
    if (o && o.status === 'on' && h && h === o.myId && o.remotes.size) { sendT -= dt; if (sendT > 0) return; sendT = .4; const pp = bb.ppos(); const L = [];
      for (const v of bb.vehicles) { if (v.state !== 'traffic' || !v.tid || Math.abs(v.pos.x - pp.x) > 240 || Math.abs(v.pos.z - pp.z) > 240) continue; const ti = TYPES.indexOf(v.type); if (ti < 0) continue;
        L.push([v.tid, ti, v.seed >>> 0, Math.round(v.pos.x * 10), Math.round(v.pos.z * 10), Math.round((v.pos.y || 0) * 10), Math.round(v.h * 1000), Math.round((v.v || 0) * 10)]); if (L.length >= 40) break; }
      o.send({ t: 'tr', L }); } });
  bb.NETTRAFFIC = { get following() { return follow; }, hostHere, get count() { return proxies.size; } };
});
