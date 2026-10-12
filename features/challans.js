// Traffic challans, only when the admin switches them on (Admin → Online and moderation): jumping a red light,
// speeding past a speed camera (limit 80 km/h) and riding a motorbike without a helmet past a camera or checkpoint.
// Unpaid challans are paid in the e-Challan app or at any police station.
window.BBFeatures.push(function (bb) {
  const W = bb.WORLD, T = bb.THREE; const cams = (W.speedCams || []).concat((W.checkpoints || []).map(c => [c[0], c[1], 'chk']));
  const mat = bb.LMat('#3b3a40'), cam = bb.LMat('#d9d6d0'); const meshes = [];
  for (const c of W.speedCams || []) { const g = new T.Group(); const pole = new T.Mesh(new T.CylinderGeometry(.12, .14, 6, 6), mat); pole.position.y = 3; g.add(pole); const box = new T.Mesh(new T.BoxGeometry(.8, .6, 1), cam); box.position.set(0, 6, .3); g.add(box);
    const r = bb.nearestRoadPoint(c[0], c[1], 200); const x = r ? r.x + r.e.dz * (r.e.w / 2 + 2) : c[0], z = r ? r.z - r.e.dx * (r.e.w / 2 + 2) : c[1]; g.position.set(x, 0, z); g.visible = false; bb.scene.add(g); meshes.push(g);
    bb.addSign('SPEED CHECK · 80', x, 4.4, z, r ? Math.atan2(r.e.dx, r.e.dz) + Math.PI : 0, 3, .8, '#1a1430', '#ffffff'); }
  const seen = new Map();
  bb.onUpdate((dt, now) => { meshes.forEach(m => m.visible = bb.CFG.challansOn); if (!bb.CFG.challansOn || bb.inside) return; const pl = bb.player; if (pl.mode !== 'drive' || !pl.veh) return; const v = pl.veh, kmh = Math.abs(v.v) * 2.4;
    for (const c of cams) { const d = Math.hypot(v.pos.x - c[0], v.pos.z - c[1]); if (d > 26) continue; const k = c[0] + ',' + c[1]; if (now - (seen.get(k) || -99) < 40) continue;
      if (c[2] !== 'chk' && kmh > 88) { seen.set(k, now); bb.addChallan(bb.cost('fine.speeding', 2000), `Speeding · ${Math.round(kmh)} km/h in an 80 zone`); }
      else if (v.spec.two && v.type !== 'cycle' && !bb.P.helmet) { seen.set(k, now); bb.addChallan(bb.cost('fine.helmet', 1000), 'Riding without a helmet'); } } });
  function app() { const P = bb.P; const list = P.challans || []; const tot = list.reduce((a, c) => a + c.amt, 0);
    bb.openSheet('🚨 e-Challan', bb.CFG.challansOn ? `${list.length} unpaid · ${bb.inr(tot)}` : 'Traffic challans are switched off right now',
      (list.length ? list.slice().reverse().map((c, i) => `<div class="row"><div class="nm">${bb.esc(c.why)}<small>${bb.esc(c.day)}</small></div><b>${bb.inr(c.amt)}</b></div>`).join('') + bb.rowHtml('pay', 'Pay all challans', 'From your cash', bb.inr(tot)) : '<p class="note">No challans. Stop at red lights, keep under 80 km/h at speed cameras and wear a helmet on a motorbike.</p>'),
      s => s.onclick = e => { if (e.target.dataset.id === 'pay' && bb.spend(tot, true)) { P.challans = []; bb.save(); bb.toast('All challans paid', '#3ddc97'); app(); } }); }
  bb.addApp({ id: 'challans', label: 'e-Challan', icon: '🚨', fn: app });
});
