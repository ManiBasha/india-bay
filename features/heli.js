// Helicopters: helipads in the cities, joyrides over the city, heli taxis between helipads, flying one
// yourself (with a pilot licence) and helicopters flying over the cities.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD, P = () => bb.P, esc = bb.esc;
  const mats = {}; const mat = c => (mats[c] = mats[c] || bb.LMat(c));
  const hx = () => { const p = P(); p.extra = p.extra || {}; return p.extra.heli = p.extra.heli || { lic: false, own: false, parked: null, flights: 0 }; };

  /* ---------- the helicopter ---------- */
  function buildHeli(col) { const g = new T.Group(); const body = new T.Mesh(new T.SphereGeometry(1.6, 14, 10), mat(col || '#d62f4b')); body.scale.set(1, .95, 1.7); body.position.y = 2; g.add(body);
    const glass = new T.Mesh(new T.SphereGeometry(1.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshLambertMaterial({ color: 0x9fd3e8, transparent: true, opacity: .7 })); glass.scale.set(1.05, .9, 1.2); glass.rotation.x = -.9; glass.position.set(0, 2.3, 1.2); g.add(glass);
    const boom = new T.Mesh(new T.CylinderGeometry(.18, .38, 5.4, 8), mat(col || '#d62f4b')); boom.rotation.x = Math.PI / 2; boom.position.set(0, 2.3, -4.2); g.add(boom);
    const fin = new T.Mesh(new T.BoxGeometry(.12, 1.4, .9), mat('#f4f1ea')); fin.position.set(0, 2.9, -6.8); g.add(fin);
    const tr = new T.Group(); tr.position.set(.2, 2.9, -6.8); for (let i = 0; i < 2; i++) { const b = new T.Mesh(new T.BoxGeometry(.04, 1.4, .14), mat('#2b2b30')); b.rotation.x = i * Math.PI / 2; tr.add(b); } g.add(tr);
    const mast = new T.Mesh(new T.CylinderGeometry(.12, .12, .6, 6), mat('#2b2b30')); mast.position.y = 3.6; g.add(mast);
    // more detail (Beta v1.01.03): engine cowling, side windows and doors, skids, a tail stabiliser and lights
    const cowl = new T.Mesh(new T.BoxGeometry(1.3, .6, 2.2), mat(col || '#d62f4b')); cowl.position.set(0, 3.2, -.5); g.add(cowl);
    const ex2 = new T.Mesh(new T.CylinderGeometry(.18, .22, .5, 8), mat('#3a3a40')); ex2.rotation.x = Math.PI / 2; ex2.position.set(0, 3.25, -1.8); g.add(ex2);
    for (const s of [-1, 1]) { const w = new T.Mesh(new T.BoxGeometry(.05, .8, 1.3), new T.MeshLambertMaterial({ color: 0x24323d })); w.position.set(s * 1.55, 2.25, .2); g.add(w);
      const sk = new T.Mesh(new T.CylinderGeometry(.07, .07, 4.4, 6), mat('#2b2b30')); sk.rotation.x = Math.PI / 2; sk.position.set(s * 1.05, .2, .1); g.add(sk);
      for (const z of [-1, 1.1]) { const st = new T.Mesh(new T.CylinderGeometry(.05, .05, 1.1, 5), mat('#2b2b30')); st.position.set(s * 1.0, .75, z); st.rotation.z = s * .25; g.add(st); }
      const hs = new T.Mesh(new T.BoxGeometry(1.2, .06, .4), mat(col || '#d62f4b')); hs.position.set(s * .6, 2.4, -6); g.add(hs); }
    const stripe = new T.Mesh(new T.BoxGeometry(3.25, .16, 4.2), mat('#f4f1ea')); stripe.position.set(0, 1.55, -.1); g.add(stripe);
    const light = new T.Mesh(new T.SphereGeometry(.12, 6, 4), new T.MeshBasicMaterial({ color: 0xff3b3b })); light.position.set(0, 3.1, -6.9); g.add(light);
    const rotor = new T.Group(); rotor.position.y = 3.95; for (let i = 0; i < 4; i++) { const b = new T.Mesh(new T.BoxGeometry(.32, .05, 9.5), mat('#2b2b30')); b.rotation.y = i * Math.PI / 4; rotor.add(b); } g.add(rotor);
    for (const s of [-1, 1]) { const sk = new T.Mesh(new T.BoxGeometry(.12, .12, 4.4), mat('#3b3a40')); sk.position.set(s * 1.1, .1, .2); g.add(sk); for (const z of [-.8, 1.2]) { const st = new T.Mesh(new T.BoxGeometry(.08, .9, .08), mat('#3b3a40')); st.position.set(s * 1.05, .55, z); g.add(st); } }
    g.userData.rotor = rotor; g.userData.tail = tr; return g; }
  const spin = (g, dt, k = 1) => { g.userData.rotor.rotation.y += dt * 28 * k; g.userData.tail.rotation.x += dt * 40 * k; };

  /* ---------- helipads ---------- */
  const hTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#3a3b41'; x.beginPath(); x.arc(128, 128, 126, 0, 6.29); x.fill(); x.strokeStyle = '#ffd23a'; x.lineWidth = 12; x.beginPath(); x.arc(128, 128, 108, 0, 6.29); x.stroke();
    x.fillStyle = '#ffffff'; x.font = '900 150px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', 128, 136); return new T.CanvasTexture(c); })();
  const pads = [];
  function addPad(x, z, name, zone) { const m = new T.Mesh(new T.CircleGeometry(10, 32), new T.MeshLambertMaterial({ map: hTex, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.position.set(x, .34, z); bb.scene.add(m);
    const sock = new T.Mesh(new T.ConeGeometry(.35, 1.6, 8), mat('#ff7a1a')); sock.rotation.z = Math.PI / 2; sock.position.set(x + 11, 3.2, z); bb.scene.add(sock); const pole = new T.Mesh(new T.CylinderGeometry(.06, .06, 3.4, 5), mat('#d9d6d0')); pole.position.set(x + 11.8, 1.7, z); bb.scene.add(pole);
    const pad = { x, z, name, zone }; pads.push(pad); bb.addPoi({ type: 'helipad', name, x: x, z: z + 11.5, rot: 0, extra: pads.length - 1 }); return pad; }
  const free = (x, z) => bb.isLand(x, z) && !bb.isWater(x, z) && !bb.roadAt(x, z, 10) && [[-11, 0], [11, 0], [0, -11], [0, 11]].every(([a, b]) => bb.isLand(x + a, z + b) && !bb.isWater(x + a, z + b) && !bb.roadAt(x + a, z + b, 2));
  const NAMES = { mumbai: 'Juhu Aerodrome helipad', bengaluru: 'HAL helipad, Bengaluru', mysuru: 'Mysuru helipad', panaji: 'Panaji helipad', kochi: 'Kochi helipad', jaipur: 'Jaipur helipad', udaipur: 'Udaipur helipad', ahmedabad: 'Ahmedabad helipad', pune: 'Pune helipad', hosapete: 'Hampi helipad (Hosapete)', thiruvananthapuram: 'Thiruvananthapuram helipad' };
  for (const z of W.zones) { if (z.size === 'small' && !NAMES[z.id]) continue; const open = bb.blocks.filter(b => b.zone === z && b.land && b.open && free(b.x, b.z)); let spot = open.length ? [open[0].x, open[0].z] : null;
    if (!spot) { const x0 = z.x0, z0 = z.z0, x1 = z.x0 + z.nx * 80, z1 = z.z0 + z.nz * 80; const cand = []; for (let t = 20; t <= 80; t += 20) for (const [x, zz] of [[x0 - t - 12, (z0 + z1) / 2], [x1 + t + 12, (z0 + z1) / 2], [(x0 + x1) / 2, z0 - t - 12], [(x0 + x1) / 2, z1 + t + 12], [x0 - t, z0 - t], [x1 + t, z1 + t]]) cand.push([x, zz]); spot = cand.find(([x, zz]) => free(x, zz)); }
    if (spot) addPad(spot[0], spot[1], NAMES[z.id] || `${z.name} helipad`, z); }

  /* ---------- helicopters over the cities ---------- */
  const amb = [0, 1].map(i => { const g = buildHeli(i ? '#2d6cdf' : '#f4f1ea'); g.visible = false; bb.scene.add(g); return { g, a: i * Math.PI, c: null, r: 220 + i * 90, y: 70 + i * 25 }; });
  let ambT = 0;
  bb.onUpdate((dt, now) => { ambT -= dt; const pp = bb.ppos(); if (ambT <= 0) { ambT = 3; const big = W.zones.filter(z => z.size === 'big').map(z => ({ z, cx: z.x0 + z.nx * 40, cz: z.z0 + z.nz * 40 })).sort((a, b) => Math.hypot(a.cx - pp.x, a.cz - pp.z) - Math.hypot(b.cx - pp.x, b.cz - pp.z))[0]; for (const h of amb) h.c = big && Math.hypot(big.cx - pp.x, big.cz - pp.z) < 1400 ? big : null; }
    for (const h of amb) { h.g.visible = !!h.c && !bb.inside; if (!h.g.visible) continue; h.a += dt * 22 / h.r; const x = h.c.cx + Math.cos(h.a) * h.r, z = h.c.cz + Math.sin(h.a) * h.r; h.g.position.set(x, h.y, z); h.g.rotation.set(.12, -h.a, -.15, 'YXZ'); spin(h.g, dt); }
    if (parked && parked.g) spin(parked.g, dt, 0); });

  /* ---------- the helipad counter ---------- */
  const near = p => pads.filter(q => q !== p).map(q => ({ q, d: Math.hypot(q.x - p.x, q.z - p.z) })).sort((a, b) => a.d - b.d);
  const fare = d => Math.round(bb.cost('heli.taxi', 5000) + d * 2.4 / 1000 * bb.cost('heli.km', 40));
  bb.poiHandlers.helipad = poi => { const pad = pads[poi.extra]; const H = hx(); const list = near(pad).slice(0, 12);
    const rows = bb.rowHtml('joy', `Joyride over ${esc(pad.zone ? pad.zone.name : 'the city')}`, '10 minutes in the air with a pilot · see the landmarks', bb.inr(bb.cost('heli.joy', 3500))) +
      bb.rowHtml('fly', 'Fly it yourself', H.lic ? (H.own ? 'Your own helicopter · free' : `Rent for one flight · land anywhere`) : 'Needs a pilot licence', H.lic ? (H.own ? 'Fly' : bb.inr(bb.cost('heli.rent', 6000))) : 'Locked', H.lic ? '' : 'ghost') +
      (H.lic ? '' : bb.rowHtml('lic', 'Pilot licence (helicopter)', 'A short flying lesson · then you can rent or buy', bb.inr(bb.cost('lic.heli', 25000)), 'ghost')) +
      (H.own ? '' : bb.rowHtml('buy', 'Buy your own helicopter', 'Fly free from any helipad, forever', bb.inr(bb.cost('veh.heli', 4500000)), 'ghost')) +
      `<h3 class="sub">Heli taxi</h3>` + list.map((o, i) => bb.rowHtml('t' + i, esc(o.q.name), `${Math.round(o.d * 2.4 / 1000)} km · about ${Math.max(1, Math.round(o.d * 2.4 / 1000 / 3.5))} game min`, bb.inr(fare(o.d)), 'ghost')).join('') + '<p class="note">Your vehicle stays parked here. Call it later from Menu → Garage.</p>';
    bb.openSheet(`🚁 ${esc(pad.name)}`, `Cash ${bb.inr(P().cash)}`, rows, s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return;
      if (id === 'joy') { if (!bb.spend(bb.cost('heli.joy', 3500), true)) return; bb.closeSheet(); return joyride(pad); }
      if (id === 'lic') { if (!bb.spend(bb.cost('lic.heli', 25000), true)) return; bb.closeSheet(); return bb.startActivity({ kind: 'Flying lesson', title: 'Helicopter pilot licence', sub: 'Hover, turn, land · the instructor nods', minutes: 60, onDone: () => { H.lic = true; bb.setDirty(); bb.save(); bb.toast('🪪 Pilot licence! Rent or buy a helicopter at any helipad', '#3ddc97'); bb.emit('licence', 'heli'); } }); }
      if (id === 'buy') { if (!bb.spend(bb.cost('veh.heli', 4500000), true)) return; H.own = true; bb.setDirty(); bb.save(); bb.toast('🚁 The helicopter is yours · fly it from any helipad', '#3ddc97'); return bb.poiHandlers.helipad(poi); }
      if (id === 'fly') { if (!H.lic) return bb.toast('Get a pilot licence first', '#ff9f1c'); if (!H.own && !bb.spend(bb.cost('heli.rent', 6000), true)) return; bb.closeSheet(); return fly(pad.x, pad.z, 0, !H.own); }
      if (id[0] === 't') { const o = list[+id.slice(1)]; if (!bb.spend(fare(o.d), true)) return; bb.closeSheet(); return taxi(pad, o.q); } }); };

  /* ---------- rides with a pilot ---------- */
  function joyride(pad) { const z = pad.zone; const cx = z ? z.x0 + z.nx * 40 : pad.x, cz = z ? z.z0 + z.nz * 40 : pad.z; const g = buildHeli('#f4f1ea'); bb.scene.add(g); const R = Math.max(220, (z ? Math.max(z.nx, z.nz) * 40 : 200) + 80);
    const marks = (W.places || []).filter(p => Math.hypot(p[1] - cx, p[2] - cz) < R + 200).map(p => p[0]);
    bb.CINE.play({ kind: 'heli', label: 'Helicopter joyride', title: `Over ${z ? z.name : pad.name}`, dur: 32, look: 'side', cancel: 'Land now', skipLabel: 'Skip ⏭', sub: 'Lift-off! The city drops away', lines: ['Lift-off! The city drops away'].concat(marks.slice(0, 4).map(n => `Below you: ${n}`), ['Banking round for one more look', 'Coming in to land']),
      cam: (f, dt, st) => { const up = Math.min(1, f * 6, (1 - f) * 6); const a = f * Math.PI * 2; const r = R * Math.min(1, f * 4, (1 - f) * 4 + .1); const x = f < .12 || f > .9 ? pad.x + (cx + Math.cos(a) * r - pad.x) * Math.min(1, up * 1.4) : cx + Math.cos(a) * r, zz = f < .12 || f > .9 ? pad.z + (cz + Math.sin(a) * r - pad.z) * Math.min(1, up * 1.4) : cz + Math.sin(a) * r;
        const y = 2 + up * 120; const hd = Math.atan2(-Math.sin(a), Math.cos(a)); g.position.set(x, y - 2, zz); g.rotation.set(.1, hd, -.2 * up, 'YXZ'); spin(g, dt);
        if (st.look === 'side') return { x: x, y: y + .3, z: zz, lx: cx, ly: 0, lz: cz, lookK: 2 }; return { x: x - Math.sin(hd) * 18, y: y + 7, z: zz - Math.cos(hd) * 18, lx: x, ly: y, lz: zz }; },
      onStop: () => bb.scene.remove(g), onDone: () => { bb.teleport(pad.x, pad.z + 12, 0); bb.toast('What a view! Back on the helipad', '#3ddc97'); hx().flights++; bb.setDirty(); bb.emit('heli', { kind: 'joy' }); }, onCancel: () => bb.teleport(pad.x, pad.z + 12, 0) }); }
  function taxi(from, to) { const g = buildHeli('#2d6cdf'); bb.scene.add(g); const d = Math.hypot(to.x - from.x, to.z - from.z); const secs = Math.max(16, Math.min(50, Math.round(d / 90))); const km = Math.round(d * 2.4 / 1000);
    const r = bb.CINE.ride({ kind: 'heli', pts: [[from.x, from.z], [to.x, to.z]], dur: secs, speed: 45, y: (fr, s, len) => 2 + Math.min(150, Math.min(s, len - s) * .9), lookDown: .25 }, { label: 'Heli taxi', title: `${from.name} → ${to.name}`, sub: 'Lift-off', lines: ['Lift-off', 'Cruising over the countryside', 'The pilot points out a river', 'Descending to the helipad'], look: 'fwd', cancel: 'Turn back', skipLabel: 'Skip to arrival ⏭',
      timeText: f => `${km} km · ${Math.max(0, Math.ceil(secs * (1 - f)))} s · Bay ${bb.bayTime()}`, onStop: () => bb.scene.remove(g), onDone: () => { bb.teleport(to.x, to.z + 12, 0); bb.toast(`Landed at ${to.name}`, '#3ddc97'); bb.emit('travel', { mode: 'heli', to: to.name }); hx().flights++; bb.save(); }, onCancel: () => bb.teleport(from.x, from.z + 12, 0) });
    const cam0 = r.cam; r.cam = (f, dt, st) => { const c = cam0(f, dt, st); const hd = Math.atan2(to.x - from.x, to.z - from.z); g.position.set(c.x, c.y - 2.2, c.z); g.rotation.set(.08, hd, 0, 'YXZ'); spin(g, dt); return st.look === 'fwd' ? Object.assign(c, { x: c.x + Math.sin(hd) * 1.6, z: c.z + Math.cos(hd) * 1.6, y: c.y + .2 }) : c; };
    bb.CINE.play(r); }

  /* ---------- flying it yourself ---------- */
  let parked = null; // your own helicopter, parked where you landed
  function fly(x, z, h, rented) { if (parked) { bb.scene.remove(parked.g); parked = null; } const g = buildHeli('#d62f4b'); bb.scene.add(g); const S = { x, z, y: .2, h: h || 0, v: 0, vy: 0, bank: 0, view: 'chase', landed: true, k: {} };
    const K = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', Space: 'u', KeyE: 'u', KeyQ: 'd', ShiftLeft: 'd', ShiftRight: 'd' };
    const pad = `<div class="fhud" id="fhud"></div><div class="fpad l"><span></span><button data-f="f">▲</button><span></span><button data-f="l">◀</button><button data-f="b">▼</button><button data-f="r">▶</button></div><div class="fpad r"><button data-f="u">⤒</button><button data-f="d">⤓</button></div>`;
    const W0 = W.W, H0 = W.H;
    bb.CINE.play({ kind: 'none', hud: true, lookToggle: false, label: rented ? 'Rented helicopter' : 'Your helicopter', title: 'Flying', sub: 'W/S or ▲▼ forward and back · A/D turn · Space/E climb · Q/Shift down', skipLabel: 'Get out', extraHtml: pad,
      buttons: [{ id: 'view', label: '🎥 View', fn: () => { S.view = S.view === 'chase' ? 'cockpit' : 'chase'; const el = document.getElementById('cine'); if (el) el.className = S.view === 'cockpit' ? 'k-heli hudless' : 'k-none hudless'; } }],
      keys: (code, down) => { const m = K[code]; if (!m) return false; S.k[m] = down; return true; },
      onStart: el => { el.querySelectorAll('[data-f]').forEach(b => { const m = b.dataset.f; const on = e => { e.preventDefault(); S.k[m] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) {} }; const off = () => { S.k[m] = false; b.classList.remove('on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); }); },
      cam: (f, dt) => { const k = S.k; const vt = k.f ? 32 : k.b ? -7 : 0; S.v += (vt - S.v) * Math.min(1, dt * (vt ? .7 : 1.2)); const turn = (k.l ? 1 : 0) - (k.r ? 1 : 0); S.h += turn * 1.1 * dt; S.bank += (-turn * .35 - S.bank) * Math.min(1, dt * 3);
        const vyt = k.u ? 9 : k.d ? -9 : 0; S.vy += (vyt - S.vy) * Math.min(1, dt * 2.5); if (S.landed && !k.u) { S.v = 0; S.vy = 0; } if (k.u) S.landed = false;
        S.x = Math.max(20, Math.min(W0 - 20, S.x + Math.sin(S.h) * S.v * dt)); S.z = Math.max(20, Math.min(H0 - 20, S.z + Math.cos(S.h) * S.v * dt)); S.y = Math.max(.2, Math.min(420, S.y + S.vy * dt));
        const water = bb.isWater(S.x, S.z) && !bb.roadAt(S.x, S.z); if (water && S.y < 3 && !S.landed) { S.y = 3; S.vy = Math.max(0, S.vy); } if (!water && S.y <= .25 && !S.landed && Math.abs(S.v) < 6) { S.landed = true; bb.toast('Landed · tap Get out, or climb to take off again', '#3ddc97'); }
        g.position.set(S.x, S.y, S.z); g.rotation.set(S.v / 32 * .18, S.h, S.bank, 'YXZ'); spin(g, dt, S.landed ? .25 : 1);
        const hud = document.getElementById('fhud'); if (hud) hud.innerHTML = `ALT ${Math.round(S.y * 2.4)} m · ${Math.round(Math.abs(S.v) * 2.4 * 3.6)} km/h${S.landed ? ' · landed' : water && S.y < 4 ? ' · over water' : ''}`;
        if (S.view === 'cockpit') return { x: S.x + Math.sin(S.h) * 1.4, y: S.y + 2.6, z: S.z + Math.cos(S.h) * 1.4, lx: S.x + Math.sin(S.h) * 40, ly: S.y - 6, lz: S.z + Math.cos(S.h) * 40, lookK: 6, px: S.x, pz: S.z };
        return { x: S.x - Math.sin(S.h) * 17, y: S.y + 7, z: S.z - Math.cos(S.h) * 17, lx: S.x + Math.sin(S.h) * 8, ly: S.y + 1.5, lz: S.z + Math.cos(S.h) * 8, lookK: 5, px: S.x, pz: S.z }; },
      onDone: () => { // get out
        let ox = S.x + Math.cos(S.h) * 4, oz = S.z - Math.sin(S.h) * 4; if (S.y > 3 || bb.isWater(S.x, S.z)) { const pd = pads.slice().sort((a, b) => Math.hypot(a.x - S.x, a.z - S.z) - Math.hypot(b.x - S.x, b.z - S.z))[0]; bb.toast(`You can only get out after landing on ground · the autopilot lands you at ${pd.name}`, '#ff9f1c'); S.x = pd.x; S.z = pd.z; S.y = .2; ox = pd.x; oz = pd.z + 12; }
        bb.teleport(ox, oz, S.h); bb.scene.remove(g); hx().flights++; bb.emit('heli', { kind: 'fly' });
        if (!rented) { const pg = buildHeli('#d62f4b'); pg.position.set(S.x, .2, S.z); pg.rotation.y = S.h; bb.scene.add(pg); parked = { g: pg, x: S.x, z: S.z, h: S.h }; hx().parked = { x: S.x, z: S.z, h: S.h }; bb.setDirty(); bb.toast('Your helicopter is parked here · walk up to it to fly again', '#d6c8e4'); }
        else bb.toast('The rental company picks up the helicopter', '#d6c8e4'); } }); }
  bb.addPrompt(() => { if (!parked || bb.inside || bb.player.mode !== 'foot') return null; const pp = bb.ppos(); if (Math.hypot(pp.x - parked.x, pp.z - parked.z) > 7) return null; return { text: 'Fly your helicopter', fn: () => { const p = parked; bb.scene.remove(p.g); parked = null; fly(p.x, p.z, p.h, false); } }; });
  bb.onStart(() => { const H = hx(); if (H.own && H.parked && !parked) { const pg = buildHeli('#d62f4b'); pg.position.set(H.parked.x, .2, H.parked.z); pg.rotation.y = H.parked.h; bb.scene.add(pg); parked = { g: pg, x: H.parked.x, z: H.parked.z, h: H.parked.h }; } });
  bb.HELI = { pads, buildHeli, fly };
});
