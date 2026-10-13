// Lakshadweep and the other islands (Beta v1.01.03): turquoise lagoons around the coral islands, the entry permit
// for visitors (bought once, on your first arrival), and the island rules from the plan (no dogs: none live there).
// Get there by the ship from Kochi wharf, the flight to Agatti, or the inter-island boats.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD;
  const lag = new T.MeshBasicMaterial({ color: 0x3fd0c9, transparent: true, opacity: .55, depthWrite: false });
  const reef = new T.MeshBasicMaterial({ color: 0xe8f6f2, transparent: true, opacity: .5, depthWrite: false });
  for (const [x, z, r] of W.lagoons || []) { const g = new T.CircleGeometry(r, 40); g.rotateX(-Math.PI / 2); const m = new T.Mesh(g, lag); m.position.set(x, -.25, z); m.renderOrder = 1; bb.scene.add(m);
    const rg = new T.RingGeometry(r - 3, r, 40); rg.rotateX(-Math.PI / 2); const rm = new T.Mesh(rg, reef); rm.position.set(x, -.2, z); bb.scene.add(rm); }
  const R = W.rules || {};
  let tick = 0, asked = false;
  bb.onUpdate(dt => { if ((tick -= dt) > 0 || !bb.started) return; tick = 1.5; const pp = bb.ppos(); const st = bb.stateAt(pp.x, pp.z); const r = R[st]; if (!r || !r.permit) return;
    const e = bb.P.extra = bb.P.extra || {}; e.permits = e.permits || {}; if (e.permits[st] || asked) return;
    if (!bb.zoneAt(pp.x, pp.z, 40)) return; asked = true;
    const ok = bb.spend(r.permit, true); if (ok) { e.permits[st] = 1; bb.save(); bb.toast(`🪪 ${r.permitName} issued · ${bb.inr(r.permit)} · welcome to ${W.states[st]}! Please keep the beaches clean; there are no dogs on the islands`, '#3fd0c9'); }
    else { asked = false; tick = 30; bb.toast(`🪪 You need a ${r.permitName} (${bb.inr(r.permit)}) · get some money in your wallet`, '#ff9f1c'); } });
});
