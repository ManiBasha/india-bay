// Service people who come to you (Beta v1.01.03): the Swiggy or Zomato rider on a bike with the orange or red
// delivery bag, the BayCart agent with a blue box, the mechanic on a scooter with a toolbox, the fuel delivery bike
// with jerrycans and the tow truck. They ride the real roads to where you are (or to your vehicle), park, walk up,
// hand over or fix things, then ride away. bb.VISIT.send({ role, to: {x,z} | () => {x,z}, onArrive, label }).
window.BBFeatures.push(function (bb) {
  const T = bb.THREE;
  const ROLES = {
    swiggy: { veh: 'bike', shirt: '#fc8019', box: '#fc8019', boxS: [.55, .5, .5], name: 'Swiggy rider' },
    zomato: { veh: 'bike', shirt: '#e23744', box: '#e23744', boxS: [.55, .5, .5], name: 'Zomato rider' },
    baycart: { veh: 'bike', shirt: '#2a62c9', box: '#2a62c9', boxS: [.6, .45, .6], name: 'BayCart agent' },
    mechanic: { veh: 'bike', shirt: '#24467a', box: '#c0392b', boxS: [.5, .25, .3], name: 'Mechanic', tools: true },
    fuel: { veh: 'bike', shirt: '#f2b134', box: '#d62f2f', boxS: [.3, .4, .3], name: 'Fuel delivery', cans: true },
    tow: { veh: 'towtruck', shirt: '#f2b134', name: 'Tow truck' } };
  const live = [];
  const mat = c => bb.LMat(c);
  // Beta v1.01.25: the visitor's vehicle is a real vehicle in the world (state 'svc'): street traffic queues behind it, it waits
  // behind traffic and for you, keeps to the left lane, and slows for corners, so it never drives through cars or buildings.
  function build(R, x, z, h) { const v = bb.makeVeh(R.veh, x, z, h, 'svc', { fuel: 100 }); v.noEnter = true; const g = v.m; const sp = v.spec;
    const rider = bb.buildPerson(mat(R.shirt), { female: false, seated: true }); const two = sp.two || sp.pedal;
    if (two) { const st = sp.seat || [0, .95, -.2]; rider.position.set(0, st[1] - .62, st[2]); rider.userData.legs.forEach((l, i) => { l.rotation.x = -1.2; l.rotation.z = (i ? 1 : -1) * .1; }); rider.userData.arms.forEach(a => a.rotation.x = -.95); g.add(rider); }
    if (R.box) { const b = new T.Mesh(new T.BoxGeometry(...R.boxS), mat(R.box)); b.position.set(0, two ? 1.55 : 1.4, two ? -.75 : -1); g.add(b); const lid = new T.Mesh(new T.BoxGeometry(R.boxS[0] + .02, .05, R.boxS[2] + .02), mat('#ffffff')); lid.position.set(0, b.position.y + R.boxS[1] / 2, b.position.z); g.add(lid); }
    if (R.cans) for (const s of [-1, 1]) { const c = new T.Mesh(new T.BoxGeometry(.18, .32, .26), mat('#d62f2f')); c.position.set(s * .32, .75, -.55); g.add(c); }
    return { g, veh: v, rider: two ? rider : null, two }; }
  // a road route shifted onto the left lane (India drives on the left)
  function lanePath(P, off) { if (P.length < 2) return P; const out = []; for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[i], c = P[Math.min(P.length - 1, i + 1)];
      let n1x = 0, n1z = 0, n2x = 0, n2z = 0; const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
      if (l1 > .01) { n1x = (b[1] - a[1]) / l1; n1z = -(b[0] - a[0]) / l1; } if (l2 > .01) { n2x = (c[1] - b[1]) / l2; n2z = -(c[0] - b[0]) / l2; }
      let nx = n1x + n2x, nz = n1z + n2z; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl; const cos = Math.max(.5, (l1 > .01 ? nx * n1x + nz * n1z : 1)); const d = (i === 0 || i === P.length - 1) ? off * .5 : off / cos;
      out.push([b[0] + nx * d, b[1] + nz * d]); } return out; }
  function lens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
  // move a vehicle along a path like traffic does: brake for anything ahead, ease off for corners
  function step(st, veh, dt, maxSp) { const a = polyAt(st.P, st.L, st.s), b = polyAt(st.P, st.L, Math.min(st.len, st.s + 10)); let dh = Math.abs(b.h - a.h); if (dh > Math.PI) dh = 2 * Math.PI - dh;
    let target = maxSp * (1 - Math.min(.65, dh * .8)); const fx = Math.sin(a.h), fz = Math.cos(a.h); const me = veh ? veh.spec.len / 2 : 1; const look = me + 4 + (st.v || 0) * .8;
    for (const o of bb.vehicles) { if (o === veh || o.state === 'towed' || o.carried) continue; const dx = o.pos.x - a.x, dz = o.pos.z - a.z; if (Math.abs(dx) > 40 || Math.abs(dz) > 40) continue; const along = dx * fx + dz * fz, lat = Math.abs(-dx * fz + dz * fx);
      if (along > 0 && along < look + o.spec.len / 2 && lat < 1.4 + o.spec.wid / 2) target = Math.min(target, o.state === 'traffic' && Math.abs(o.v) > 1 ? Math.abs(o.v) * .8 : 0); }
    const pl = bb.player; if (pl.mode === 'foot' && !bb.inside) { const dx = pl.pos.x - a.x, dz = pl.pos.z - a.z, along = dx * fx + dz * fz, lat = Math.abs(-dx * fz + dz * fx); if (along > 0 && along < look && lat < 1.6) target = 0; }
    st.v = st.v || 0; st.v += Math.max(-14 * dt, Math.min(5 * dt, target - st.v)); st.s = Math.min(st.len, st.s + st.v * dt); st.wait = target < .5 ? (st.wait || 0) + dt : 0;
    const q = polyAt(st.P, st.L, st.s); if (veh) { veh.pos.set(q.x, 0, q.z); let dd = q.h - veh.h; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; veh.h += dd * Math.min(1, dt * 8); veh.v = st.v; veh.m.position.copy(veh.pos); veh.m.rotation.set(0, veh.h, 0); for (const w of veh.m.userData.wheels || []) w.rotation.x += st.v * dt / .4; }
    return q; }
  function polyAt(P, L, s) { let i = 1; while (i < P.length - 1 && L[i] < s) i++; const a = P[i - 1], b = P[i], l = (L[i] - L[i - 1]) || 1, u = Math.max(0, Math.min(1, (s - L[i - 1]) / l)); return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, h: Math.atan2(b[0] - a[0], b[1] - a[1]) }; }
  function route(from, to, off) { const R = bb.findRoute(from.x, from.z, to.x, to.z) || [[from.x, from.z], [to.x, to.z]]; const P = lanePath([[from.x, from.z], ...R, [to.x, to.z]], off == null ? 1.9 : off); const L = lens(P); return { P, L, len: L[L.length - 1], s: 0, v: 0 }; }
  function send(o) { const R = ROLES[o.role] || ROLES.swiggy; const tgt = () => (typeof o.to === 'function' ? o.to() : o.to) || bb.ppos();
    if (bb.inside || bb.insideVenue) { setTimeout(() => o.onArrive && o.onArrive(), 3000); return null; }
    const t0 = tgt(); let start = null; for (let k = 0; k < 8 && !start; k++) { const a = Math.random() * 6.28, r = 130 + Math.random() * 60; const p = bb.nearestRoadPoint(t0.x + Math.cos(a) * r, t0.z + Math.sin(a) * r, 120); if (p && Math.hypot(p.x - t0.x, p.z - t0.z) > 70) start = p; }
    if (!start) { setTimeout(() => o.onArrive && o.onArrive(), 4000); return null; }
    const vis = Object.assign(build(R, start.x, start.z, 0), { R, o, tgt, state: 'ride', path: null, t: 0, speed: R.veh === 'towtruck' ? 11 : 13 });
    vis.end = bb.nearestRoadPoint(t0.x, t0.z, 60) || t0; vis.path = route(start, vis.end); live.push(vis); bb.toast(`🛵 ${o.label || R.name} is on the way · watch the map`, R.shirt); return vis; }
  // the rider on foot: walks from the parked bike to you and back
  function walker(vis) { const p = bb.buildPerson(mat(vis.R.shirt), { female: false }); if (vis.R.box && vis.R.veh !== 'truck') { const b = new T.Mesh(new T.BoxGeometry(.38, .3, .3), mat(vis.R.box)); b.position.set(.28, 1, .25); p.add(b); } if (vis.R.tools) { const tb = new T.Mesh(new T.BoxGeometry(.45, .2, .2), mat('#c0392b')); tb.position.set(.3, .75, .1); p.add(tb); } bb.scene.add(p); return p; }
  bb.onUpdate((dt, now) => { for (let i = live.length - 1; i >= 0; i--) { const v = live[i]; v.t += dt;
      const gone = () => { bb.removeVeh(v.veh); if (v.walk) bb.scene.remove(v.walk); live.splice(i, 1); };
      if (v.state === 'ride' || v.state === 'leave') { const a = step(v.path, v.veh, dt, v.speed); v.s = v.path.s;
        if (v.state === 'ride') { const tg = v.tgt(); if (v.t > 4 && Math.hypot(v.end.x - tg.x, v.end.z - tg.z) > 40 && (v.reroute = (v.reroute || 0) + dt) > 3) { v.reroute = 0; v.end = bb.nearestRoadPoint(tg.x, tg.z, 60) || tg; v.path = route({ x: a.x, z: a.z }, v.end); }
          if (v.s >= v.path.len - 1) { v.state = 'walk'; if (v.rider) v.rider.visible = false; v.walk = walker(v); v.walk.position.set(a.x + 1.2, 0, a.z); v.wt = 0; } if (v.t > 120) { v.o.onArrive && v.o.onArrive(); gone(); } }
        else if (v.s >= v.path.len - 1 || v.t > 90) gone(); continue; }
      if (v.state === 'walk' || v.state === 'back') { const tg = v.state === 'walk' ? v.tgt() : { x: v.g.position.x + 1.2, z: v.g.position.z }; const w = v.walk; const dx = tg.x - w.position.x, dz = tg.z - w.position.z, d = Math.hypot(dx, dz);
        const U = w.userData; const sw = Math.sin(now * 8) * .5; U.legs[0].rotation.x = sw; U.legs[1].rotation.x = -sw; U.arms[0].rotation.x = -sw;
        if (d > (v.state === 'walk' ? 1.6 : .4) && v.wt < 25) { v.wt += dt; w.position.x += dx / d * 2.2 * dt; w.position.z += dz / d * 2.2 * dt; w.rotation.y = Math.atan2(dx, dz); }
        else if (v.state === 'walk') { v.state = 'serve'; v.st = 0; U.legs[0].rotation.x = U.legs[1].rotation.x = 0; }
        else { bb.scene.remove(w); v.walk = null; if (v.rider) v.rider.visible = true; v.state = 'leave'; v.t = 0; const far = bb.nearestRoadPoint(v.g.position.x + 300, v.g.position.z + 120, 200) || { x: v.g.position.x + 200, z: v.g.position.z }; v.path = route({ x: v.g.position.x, z: v.g.position.z }, far); }
        continue; }
      if (v.state === 'serve') { v.st += dt; const U = v.walk.userData; U.arms[1].rotation.x = -1.2 + Math.sin(now * (v.R.tools ? 10 : 3)) * .3; if (v.R.tools) v.walk.position.y = -.35;
        if (v.st > (v.R.tools || v.R.cans ? 6 : 2.2)) { v.walk.position.y = 0; U.arms[1].rotation.x = 0; try { v.o.onArrive && v.o.onArrive(); } catch (e) { console.error(e); } v.state = 'back'; v.wt = 0; } } } });
  bb.VISIT = { send, ROLES, lanePath, lens, polyAt, step, route, get live() { return live; } };
});
