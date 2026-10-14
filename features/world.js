// A shared world (Beta v1.01.12). Everything here is worked out from the shared clock (the online server's time)
// and the place, never from chance on one device, so players in the same city see the same thing at the same time:
//   · street incidents that change every 6 minutes in each city: a fender-bender with the police, a broken-down
//     truck, road works, a wedding baraat with a band, and gully cricket in a side street
//   · BayRadio traffic news about them
// The Bay clock, weather, festivals, heroes and beach crowds use the same clock. Moving traffic and people are still
// drawn by each device.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD; const LM = c => bb.LMat(c), G = c => new T.MeshBasicMaterial({ color: c });
  const SLOT = 6 * 60 * 1000;
  const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) / 4294967296; };
  bb.srand = key => { let a = Math.floor(hash(String(key)) * 4294967296) >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const KINDS = [['crash', '🚓', 'Fender-bender', 'Two cars bumped; police are sorting it out · drive slowly'], ['breakdown', '⚠', 'Broken-down truck', 'A truck has broken down · one lane blocked'], ['works', '🚧', 'Road works', 'Road works · expect delays'],
    ['baraat', '🎺', 'Wedding baraat', 'A wedding procession with a band is on the road · join the dance!'], ['cricket', '🏏', 'Gully cricket', 'Kids are playing cricket in a side street']];
  // the incident in a city for a time slot (the same answer on every device)
  function incidentFor(z, slot) { const r = bb.srand(z.id + ':' + slot); if (r() < .25) return null; const k = KINDS[Math.floor(r() * KINDS.length)];
    const i = Math.floor(r() * z.nx), j = Math.floor(r() * z.nz); const bx = z.x0 + i * 80 + (r() < .5 ? 0 : 40), bz = z.z0 + j * 80 + (r() < .5 ? 40 : 0); const p = bb.nearestRoadPoint(bx, bz, 60); if (!p || !p.e) return null;
    return { kind: k[0], icon: k[1], title: k[2], text: k[3], x: p.x, z: p.z, e: p.e, zone: z, slot }; }
  let cur = null, news = new Set();
  const person = (c, f) => bb.buildPerson(LM(c), { female: f });
  function build(I) { const g = new T.Group(); const e = I.e; const h = Math.atan2(e.dx, e.dz); const side = (e.w || 8) / 2 - 1.6; const nx = e.dz, nz = -e.dx; g.position.set(I.x + nx * side, 0, I.z + nz * side); g.rotation.y = h; const anim = [];
    const m = (geo, mt, x, y, z) => { const o = new T.Mesh(geo, mt); o.position.set(x, y, z); g.add(o); return o; }; const cone = (x, z) => { m(new T.ConeGeometry(.22, .6, 8), LM('#ff6a1f'), x, .3, z); m(new T.CylinderGeometry(.18, .2, .08, 8), G(0xffffff), x, .32, z); };
    const veh = (type, x, z, rot) => { const v = bb.buildVeh(type); v.position.set(x, 0, z); v.rotation.y = rot; g.add(v); return v; };
    if (I.kind === 'crash') { veh('car', 0, -2.4, .4); veh('sedan', -.4, 2.2, -2.9); veh('police', -.2, 8, 0); const bar = m(new T.BoxGeometry(.9, .14, .3), G(0x3366ff), -.2, 2.1, 8); anim.push(t => bar.material.color.setHex(Math.sin(t * 9) > 0 ? 0x3366ff : 0xff2a2a));
      for (let k = 0; k < 4; k++) cone(1.6, -5 + k * 3); for (const [x, z, c] of [[1.8, 0, '#2b4a8a'], [1.6, 1.4, '#f4f1ea'], [2.2, -1.2, '#d9483b']]) { const p = person(c, false); p.position.set(x, 0, z); p.rotation.y = -1.2; g.add(p); } }
    if (I.kind === 'breakdown') { veh('truck', 0, 0, 0); const hz = [m(new T.BoxGeometry(.2, .2, .05), G(0xffa500), -1, 1, -3.85), m(new T.BoxGeometry(.2, .2, .05), G(0xffa500), 1, 1, -3.85)]; anim.push(t => hz.forEach(o => o.visible = Math.sin(t * 6) > 0));
      const tri = m(new T.ConeGeometry(.35, .6, 3), LM('#e8384f'), 0, .3, -9); tri.rotation.x = .2; const d = person('#f4f1ea', false); d.position.set(1.6, 0, 1); g.add(d); }
    if (I.kind === 'works') { for (let k = 0; k < 6; k++) cone(-.2 + (k % 2) * .4, -7 + k * 2.8); m(new T.BoxGeometry(2, 1, .15), LM('#ffc93c'), 0, .5, -8); m(new T.BoxGeometry(2, .2, .16), G(0x1d1433), 0, .7, -8.01);
      m(new T.BoxGeometry(2.2, 1.6, 3.4), LM('#f2b705'), .2, 1.2, 1); m(new T.BoxGeometry(.3, .3, 3), LM('#333'), .2, 2.4, 3.2); m(new T.BoxGeometry(3, .4, 4), LM('#6b5a48'), -.4, .2, -2);
      for (let k = 0; k < 3; k++) { const w = person('#ff8a1f', false); w.position.set(-.5 + k * .8, 0, -3 + k * 1.5); g.add(w); anim.push(t => { w.rotation.x = Math.sin(t * 3 + k) * .25; }); } }
    if (I.kind === 'baraat') { const cols = ['#ff4fa3', '#ffc93c', '#e4572e', '#7b2a5e', '#2f7fc1']; for (let k = 0; k < 18; k++) { const p = person(cols[k % 5], k % 2 === 0); const x = -2 + (k % 4) * 1.3, z = -6 + Math.floor(k / 4) * 1.6; p.position.set(x, 0, z); g.add(p); anim.push(t => { p.position.y = Math.abs(Math.sin(t * 5 + k)) * .22; p.rotation.y = Math.sin(t * 2 + k) * 1.2; }); }
      for (let k = 0; k < 4; k++) { const b = person('#c0392b', false); b.position.set(-1.8 + k * 1.2, 0, 2.4); g.add(b); m(new T.CylinderGeometry(.25, .25, .3, 10), LM('#d9b26f'), -1.8 + k * 1.2, 1.1, 2.75); }
      const groom = person('#f4e3b0', false); groom.position.set(0, .9, 5); g.add(groom); m(new T.BoxGeometry(.6, 1.2, 1.8), LM('#f4f1ea'), 0, .6, 5); m(new T.ConeGeometry(.22, .35, 8), G(0xff3d6e), 0, 2.85, 5);
      const lamps = []; for (let k = 0; k < 6; k++) { const l = m(new T.SphereGeometry(.18, 6, 5), G(0xffe08a), -2.6 + (k % 2) * 5.2, 2.2, -5 + Math.floor(k / 2) * 4); lamps.push(l); } anim.push(t => lamps.forEach((l, i) => l.visible = Math.sin(t * 4 + i) > -.5)); I.moves = true; }
    if (I.kind === 'cricket') { m(new T.BoxGeometry(.15, .7, .05), LM('#d9b26f'), 3.5, .35, -6); m(new T.BoxGeometry(.15, .7, .05), LM('#d9b26f'), 3.5, .35, 6); const ball = m(new T.SphereGeometry(.09, 6, 5), LM('#c0392b'), 3.5, .5, 0);
      const kids = []; for (let k = 0; k < 5; k++) { const p = person(['#2f7fc1', '#f4f1ea', '#ffc93c', '#1f8a4c', '#e4572e'][k], k === 2); p.scale.setScalar(.7); p.position.set(3.5 + (k > 1 ? (k - 3) * 2.4 : 0), 0, k === 0 ? -6.5 : k === 1 ? 6.5 : (k - 3) * 3); g.add(p); kids.push(p); }
      anim.push(t => { const u = (t * .5) % 1; ball.position.z = 6 - u * 12; ball.position.y = .1 + Math.abs(Math.sin(u * Math.PI * 2)) * .6; }); }
    bb.scene.add(g); return { g, anim }; }
  let tk = 0;
  bb.onUpdate(dt => { if (!bb.started) return; tk -= dt; const t = performance.now() / 1000;
    if (tk <= 0) { tk = 2; const pp = bb.ppos(); const z = bb.zoneAt(pp.x, pp.z, 200); const slot = Math.floor(bb.now() / SLOT);
      const want = z && (z.size !== 'small') ? incidentFor(z, slot) : null; const key = want ? want.zone.id + ':' + want.slot : '';
      if ((cur && cur.key) !== key) { if (cur && cur.b) bb.scene.remove(cur.b.g); cur = want ? { key, I: want, b: null } : null;
        if (want && !news.has(key)) { news.add(key); bb.NEWS && bb.NEWS.push({ icon: want.icon, title: `${want.title} in ${want.zone.name}`, text: want.text }); } }
      if (cur) { const d = Math.hypot(cur.I.x - pp.x, cur.I.z - pp.z); if (d < 380 && !cur.b && !bb.inside) cur.b = build(cur.I); if (cur.b) cur.b.g.visible = d < 420 && !bb.inside;
        if (d < 60 && !cur.told) { cur.told = 1; bb.toast(`${cur.I.icon} ${bb.esc(cur.I.title)} ahead`, '#ffc93c'); } } }
    if (cur && cur.b && cur.b.g.visible) { for (const f of cur.b.anim) f(t); if (cur.I.moves) { const u = ((bb.now() % SLOT) / SLOT) * 30 - 15; const e = cur.I.e; cur.b.g.position.x = cur.I.x + e.dz * ((e.w || 8) / 2 - 1.6) + e.dx * u; cur.b.g.position.z = cur.I.z - e.dx * ((e.w || 8) / 2 - 1.6) + e.dz * u; } } });
  // the baraat: dance along when you are close
  bb.addPrompt(() => { if (!cur || !cur.b || cur.I.kind !== 'baraat' || bb.player.mode !== 'foot') return null; const pp = bb.ppos(); if (Math.hypot(cur.b.g.position.x - pp.x, cur.b.g.position.z - pp.z) > 8) return null;
    return { text: 'Dance with the baraat 💃', fn: () => bb.startActivity({ kind: 'Baraat', title: '🎺 Dancing in the baraat', sub: 'The band plays faster and faster', minutes: 20, effects: { energy: -8 }, noPersist: true, onDone: () => { const x = bb.P.extra; const d = bb.istISO(); if (x.baraat !== d) { x.baraat = d; bb.earn(bb.price(150), 'baraat'); bb.toast(`The family gives you mithai and ${bb.inr(bb.price(150))} shagun`, '#ffc93c'); } } }) }; });
  /* ---------- heritage boards (Kamathipura, Falkland Road) ---------- */
  const HERITAGE = {
    kamathipura: ['Kamathipura', ['One of Mumbai\'s oldest neighbourhoods, near Grant Road and Mumbai Central.', 'It is named after the Kamathi workers from the Deccan who came in the late 1700s and helped build the city\'s roads, causeways and land reclamations.', 'Its narrow lanes are lined with old chawls: three- and four-storey blocks with shared galleries, where families have lived for generations.', 'Today it is a busy mix of homes, small workshops, tailors, metal and textile traders, eateries and local community groups.', 'Try the kheema pav and the cutting chai from the lane stalls.']],
    falkland: ['Falkland Road', ['A historic road in the old city near Grant Road station.', 'It is named after Lord Falkland, Governor of Bombay from 1848 to 1853.', 'It was known for its single-screen cinemas, Irani cafés with bun maska and chai, and busy markets of fruit, bangles and tailoring shops.', 'Many of its buildings date from the late 1800s and early 1900s, with arched shopfronts and wooden balconies.']] };
  bb.poiHandlers.heritage = poi => { const H = HERITAGE[poi.extra]; if (!H) return bb.toast('An old heritage board', '#d6c8e4'); const x = bb.P.extra; x.heritage = x.heritage || {};
    const first = !x.heritage[poi.extra]; if (first) { x.heritage[poi.extra] = bb.istISO(); bb.earn(bb.price(100), 'explore'); bb.setDirty(); }
    bb.openSheet(`📜 ${H[0]}`, 'Heritage board · old Mumbai', H[1].map(l => `<p class="note" style="font-size:14px;color:var(--ink)">${bb.esc(l)}</p>`).join('') + (first ? `<p class="note">Explorer bonus · +${bb.inr(bb.price(100))}</p>` : '')); };
  bb.WORLDSYNC = { incidentFor, get current() { return cur && cur.I; } };
});
