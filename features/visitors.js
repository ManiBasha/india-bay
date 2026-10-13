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
    tow: { veh: 'truck', shirt: '#f2b134', name: 'Tow truck' } };
  const live = [];
  const mat = c => bb.LMat(c);
  function build(R) { const g = new T.Group(); const v = bb.buildVeh(R.veh); g.add(v); const sp = bb.SPEC[R.veh] || {};
    const rider = bb.buildPerson(mat(R.shirt), { female: false }); const two = sp.two || sp.pedal;
    if (two) { rider.position.set(0, .35, -.15); rider.userData.legs.forEach(l => l.rotation.x = -1.3); rider.userData.arms.forEach(a => a.rotation.x = -1.1); g.add(rider); }
    if (R.box) { const b = new T.Mesh(new T.BoxGeometry(...R.boxS), mat(R.box)); b.position.set(0, two ? 1.55 : 1.4, two ? -.75 : -1); g.add(b); const lid = new T.Mesh(new T.BoxGeometry(R.boxS[0] + .02, .05, R.boxS[2] + .02), mat('#ffffff')); lid.position.set(0, b.position.y + R.boxS[1] / 2, b.position.z); g.add(lid); }
    if (R.cans) for (const s of [-1, 1]) { const c = new T.Mesh(new T.BoxGeometry(.18, .32, .26), mat('#d62f2f')); c.position.set(s * .32, .75, -.55); g.add(c); }
    if (R.veh === 'truck') { const boom = new T.Mesh(new T.BoxGeometry(.25, .25, 3), mat('#f2b134')); boom.position.set(0, 2, -2.8); boom.rotation.x = .35; g.add(boom); const hook = new T.Mesh(new T.BoxGeometry(.4, .7, .1), mat('#333')); hook.position.set(0, 1.2, -4.2); g.add(hook); }
    bb.scene.add(g); return { g, rider: two ? rider : null, two }; }
  function polyAt(P, L, s) { let i = 1; while (i < P.length - 1 && L[i] < s) i++; const a = P[i - 1], b = P[i], l = (L[i] - L[i - 1]) || 1, u = Math.max(0, Math.min(1, (s - L[i - 1]) / l)); return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, h: Math.atan2(b[0] - a[0], b[1] - a[1]) }; }
  function route(from, to) { const R = bb.findRoute(from.x, from.z, to.x, to.z) || [[from.x, from.z], [to.x, to.z]]; const P = [[from.x, from.z], ...R, [to.x, to.z]]; const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return { P, L, len: L[L.length - 1] }; }
  function send(o) { const R = ROLES[o.role] || ROLES.swiggy; const tgt = () => (typeof o.to === 'function' ? o.to() : o.to) || bb.ppos();
    if (bb.inside || bb.insideVenue) { setTimeout(() => o.onArrive && o.onArrive(), 3000); return null; }
    const t0 = tgt(); let start = null; for (let k = 0; k < 8 && !start; k++) { const a = Math.random() * 6.28, r = 130 + Math.random() * 60; const p = bb.nearestRoadPoint(t0.x + Math.cos(a) * r, t0.z + Math.sin(a) * r, 120); if (p && Math.hypot(p.x - t0.x, p.z - t0.z) > 70) start = p; }
    if (!start) { setTimeout(() => o.onArrive && o.onArrive(), 4000); return null; }
    const vis = Object.assign(build(R), { R, o, tgt, s: 0, state: 'ride', path: null, t: 0, speed: R.veh === 'truck' ? 11 : 13 });
    vis.end = bb.nearestRoadPoint(t0.x, t0.z, 60) || t0; vis.path = route(start, vis.end); live.push(vis); bb.toast(`🛵 ${o.label || R.name} is on the way · watch the map`, R.shirt); return vis; }
  // the rider on foot: walks from the parked bike to you and back
  function walker(vis) { const p = bb.buildPerson(mat(vis.R.shirt), { female: false }); if (vis.R.box && vis.R.veh !== 'truck') { const b = new T.Mesh(new T.BoxGeometry(.38, .3, .3), mat(vis.R.box)); b.position.set(.28, 1, .25); p.add(b); } if (vis.R.tools) { const tb = new T.Mesh(new T.BoxGeometry(.45, .2, .2), mat('#c0392b')); tb.position.set(.3, .75, .1); p.add(tb); } bb.scene.add(p); return p; }
  bb.onUpdate((dt, now) => { for (let i = live.length - 1; i >= 0; i--) { const v = live[i]; v.t += dt;
      const gone = () => { bb.scene.remove(v.g); if (v.walk) bb.scene.remove(v.walk); live.splice(i, 1); };
      if (v.state === 'ride' || v.state === 'leave') { v.s += v.speed * dt; const a = polyAt(v.path.P, v.path.L, v.s); v.g.position.set(a.x, 0, a.z); v.g.rotation.y = a.h;
        if (v.state === 'ride') { const tg = v.tgt(); if (v.t > 4 && Math.hypot(v.end.x - tg.x, v.end.z - tg.z) > 40 && (v.reroute = (v.reroute || 0) + dt) > 3) { v.reroute = 0; v.end = bb.nearestRoadPoint(tg.x, tg.z, 60) || tg; v.path = route({ x: a.x, z: a.z }, v.end); v.s = 0; }
          if (v.s >= v.path.len - 1) { v.state = 'walk'; if (v.rider) v.rider.visible = false; v.walk = walker(v); v.walk.position.set(a.x + 1.2, 0, a.z); v.wt = 0; } if (v.t > 120) { v.o.onArrive && v.o.onArrive(); gone(); } }
        else if (v.s >= v.path.len - 1 || v.t > 60) gone(); continue; }
      if (v.state === 'walk' || v.state === 'back') { const tg = v.state === 'walk' ? v.tgt() : { x: v.g.position.x + 1.2, z: v.g.position.z }; const w = v.walk; const dx = tg.x - w.position.x, dz = tg.z - w.position.z, d = Math.hypot(dx, dz);
        const U = w.userData; const sw = Math.sin(now * 8) * .5; U.legs[0].rotation.x = sw; U.legs[1].rotation.x = -sw; U.arms[0].rotation.x = -sw;
        if (d > (v.state === 'walk' ? 1.6 : .4) && v.wt < 25) { v.wt += dt; w.position.x += dx / d * 2.2 * dt; w.position.z += dz / d * 2.2 * dt; w.rotation.y = Math.atan2(dx, dz); }
        else if (v.state === 'walk') { v.state = 'serve'; v.st = 0; U.legs[0].rotation.x = U.legs[1].rotation.x = 0; }
        else { bb.scene.remove(w); v.walk = null; if (v.rider) v.rider.visible = true; v.state = 'leave'; v.t = 0; const far = bb.nearestRoadPoint(v.g.position.x + 300, v.g.position.z + 120, 200) || { x: v.g.position.x + 200, z: v.g.position.z }; v.path = route({ x: v.g.position.x, z: v.g.position.z }, far); v.s = 0; }
        continue; }
      if (v.state === 'serve') { v.st += dt; const U = v.walk.userData; U.arms[1].rotation.x = -1.2 + Math.sin(now * (v.R.tools ? 10 : 3)) * .3; if (v.R.tools) v.walk.position.y = -.35;
        if (v.st > (v.R.tools || v.R.cans ? 6 : 2.2)) { v.walk.position.y = 0; U.arms[1].rotation.x = 0; try { v.o.onArrive && v.o.onArrive(); } catch (e) { console.error(e); } v.state = 'back'; v.wt = 0; } } } });
  bb.VISIT = { send, ROLES, get live() { return live; } };
});
