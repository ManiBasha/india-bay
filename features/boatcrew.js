// Boat crews (Beta v1.01.25): moored houseboats have a boatman at the stern with his long bamboo pole and a cook at the
// bow; fishing boats have a fisherman casting his net. Only boats near you get their people, so it costs little.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE; const crews = new Map(); let tk = 0;
  const pole = () => { const m = new T.Mesh(new T.CylinderGeometry(.03, .04, 5.5, 5), bb.LMat('#b08a4e')); return m; };
  function make(b) { const g = new T.Group(); g.position.set(b.x, b.y, b.z); g.rotation.y = b.ry; const out = { g, men: [] };
    if (b.kind === 'kettu') { const m = bb.buildPerson(bb.LMat('#f4f1ea'), { female: false, clothes: { dress: 'mundu', shirt: '#f4f1ea', pants: '#f4f1ea' } }); m.position.set(.6, 0, -7.3); const p = pole(); p.position.set(0, -.25, .35); p.rotation.x = .5; m.userData.fores[1].add(p); g.add(m); out.men.push({ p: m, kind: 'pole' });
      const c = bb.buildPerson(bb.LMat('#2f7fc1'), { female: false, seated: true }); c.position.set(-1.1, -.33, 5.4); c.rotation.y = Math.PI / 2; c.userData.legs.forEach(l => l.rotation.x = -1.5); g.add(c); out.men.push({ p: c, kind: 'sit' }); }
    else { const m = bb.buildPerson(bb.LMat('#e8a628'), { female: false }); m.position.set(.2, 0, 2.3); g.add(m); out.men.push({ p: m, kind: 'net' }); }
    bb.scene.add(g); return out; }
  bb.onUpdate((dt, now) => { const B = window.IB_BOATS; if (!B || !bb.started) return; tk -= dt;
    if (tk <= 0) { tk = 1.5; const pp = bb.ppos(); for (const b of B) { const near = !bb.inside && Math.abs(b.x - pp.x) < 230 && Math.abs(b.z - pp.z) < 230; const c = crews.get(b);
        if (near && !c && crews.size < 16) crews.set(b, make(b)); else if (!near && c) { bb.scene.remove(c.g); crews.delete(b); } } }
    for (const c of crews.values()) for (const q of c.men) { const U = q.p.userData;
      if (q.kind === 'pole') { const a = Math.sin(now * .9); U.armLock = true; U.arms[1].rotation.x = -1.3 + a * .5; U.arms[0].rotation.x = -1.1 + a * .45; U.fores[1].rotation.x = -.4; U.fores[0].rotation.x = -.6; q.p.rotation.x = .12 + a * .1; }
      else if (q.kind === 'net') { const k = (now * .35) % 1; const throwA = k < .15 ? Math.sin(k / .15 * Math.PI) : 0; U.arms[1].rotation.x = -.6 - 2 * throwA; U.arms[0].rotation.x = -.5 - 1.6 * throwA; q.p.rotation.y = Math.sin(now * .2) * .8; } } });
});
