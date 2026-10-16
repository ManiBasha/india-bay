// Ride cabins (Beta v1.01.24): on a train, the metro, the bullet train, a flight, a helicopter or a ferry you now sit
// INSIDE a 3D cabin that moves along the real map. Look around with the arrow keys or W A S D (or drag on the
// screen), and change seat: window, middle, aisle, berths, standing at the door, the front window of the metro,
// next to the helicopter pilot, the ferry's upper deck rail and so on.
// bb.CABIN.wrap(rideObj, kind, opts) turns any bb.CINE ride into a cabin ride. bb.CABIN.look(rideObj, g, seats, pose)
// is the shared seat-and-look driver (also used by the bus interiors in features/transit.js).
window.BBFeatures.push(function (bb) {
  const T = bb.THREE; const mats = {}; const M = c => mats[c] || (mats[c] = new T.MeshLambertMaterial({ color: c }));
  const glow = c => mats['g' + c] || (mats['g' + c] = new T.MeshBasicMaterial({ color: c }));
  const glass = new T.MeshPhongMaterial({ color: 0xbfd8e8, transparent: true, opacity: .14, shininess: 120, depthWrite: false });
  function kit(g) { const box = (w, h, d, x, y, z, m) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), typeof m === 'string' ? M(m) : m); o.position.set(x, y, z); g.add(o); return o; };
    const cyl = (r, h, x, y, z, m, rx, rz) => { const o = new T.Mesh(new T.CylinderGeometry(r, r, h, 10), typeof m === 'string' ? M(m) : m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz; g.add(o); return o; };
    return { box, cyl }; }
  const PEOPLE = ['#d9483b', '#2f7fc1', '#f4f1ea', '#1f8a4c', '#ffc93c', '#7b2a5e', '#e58f2a', '#5c6b8a', '#ff6fa8'];
  function sitter(g, x, y, z, ry, stand) { const p = bb.buildPerson(M(PEOPLE[Math.floor(Math.random() * PEOPLE.length)]), { female: Math.random() < .45, seated: !stand }); p.position.set(x, y - (stand ? 0 : 1.4), z); p.rotation.y = ry || 0; p.scale.setScalar(.96);
    if (!stand && p.userData.legs) for (const l of p.userData.legs) l.rotation.x = -1.5; if (!stand && p.userData.arms) for (const a of p.userData.arms) a.rotation.x = -.5; g.add(p); return p; }
  // a side wall with window openings: panels below and above the glass band, pillars between the windows
  function windowWall(K, x, len, floor, band0, band1, top, pitch, gap, col, frame) { K.box(.08, band0, len, x, floor + band0 / 2, 0, col); K.box(.08, top - band1, len, x, floor + band1 + (top - band1) / 2, 0, col);
    for (let z = -len / 2; z <= len / 2 + .01; z += pitch) K.box(.1, band1 - band0, pitch - gap, x, floor + (band0 + band1) / 2, z + (pitch - gap) / 2 - pitch / 2 + gap / 2 + 0, frame || col);
    K.box(.02, band1 - band0, len, x, floor + (band0 + band1) / 2, 0, glass); }
  /* ---------- the cabins ---------- */
  function train(mode) { const g = new T.Group(), K = kit(g); const L = 22, Wd = 3.0, F = 0, H = 2.45; const sleeper = mode === 'sleeper', local = mode === 'local';
    const wall = sleeper ? '#d8d2bf' : local ? '#9fb3c4' : '#e9e5da', seatC = sleeper ? '#2f5f8a' : local ? '#6f7f8f' : '#3b6ea8';
    K.box(Wd, .06, L, 0, F, 0, '#6b645a'); K.box(Wd, .05, L, 0, F + H, 0, '#efeee8'); for (let z = -L / 2 + 1; z < L / 2; z += 2.2) K.box(.5, .02, 1.2, 0, F + H - .03, z, glow('#fffbe8'));
    for (const s of [-1, 1]) windowWall(K, s * Wd / 2, L, F, .74, 1.66, H, 1.6, 1.22, wall, '#8d969e');
    K.box(Wd, H, .1, 0, F + H / 2, -L / 2, wall); K.box(Wd, H, .1, 0, F + H / 2, L / 2, wall);
    const seats = [];
    if (sleeper) { // bays of six berths with side berths along the aisle
      for (let z = -L / 2 + 1.8, b = 0; z < L / 2 - 1.5; z += 2.0, b++) { for (const yb of [.42, 1.1, 1.75]) { K.box(1.85, .08, .6, .45, F + yb, z - .62, seatC); K.box(1.85, .08, .6, .45, F + yb, z + .62, seatC); }
        K.box(.05, H - .1, .05, .45 - .95, F + 1.2, z - .95, '#9aa0a6'); K.box(.55, .08, 1.7, -1.15, F + .42, z, seatC); K.box(.55, .08, 1.7, -1.15, F + 1.5, z, seatC);
        if (Math.random() < .6) sitter(g, .2, F + .9, z - .62, Math.PI / 2); if (Math.random() < .5) sitter(g, .9, F + .9, z + .62, -Math.PI / 2); }
      seats.push({ name: 'Lower berth by the window', eye: [1.1, F + 1.05, -.1], yaw: Math.PI / 2 }, { name: 'Side lower berth', eye: [-1.15, F + 1.0, .2], yaw: -Math.PI / 2 }, { name: 'Upper berth', eye: [.8, F + 2.15, -.6], yaw: Math.PI / 2, pitch: -.15 }, { name: 'Standing at the door', eye: [-.2, F + 1.65, L / 2 - .9], yaw: -Math.PI / 2 }); }
    else if (local) { // long benches facing each other, steel poles and handles, open doors
      for (const s of [-1, 1]) { K.box(.5, .45, L - 4, s * 1.2, F + .22, 0, seatC); K.box(.08, .5, L - 4, s * 1.45, F + .7, 0, seatC); }
      for (let z = -L / 2 + 2; z < L / 2; z += 1.4) { K.cyl(.025, H, .55, F + H / 2, z, '#c9ccd1'); K.cyl(.025, H, -.55, F + H / 2, z, '#c9ccd1'); K.box(.03, .14, .03, 0, F + 2.0, z, '#e8e2a4'); }
      for (let i = 0; i < 16; i++) sitter(g, (i % 2 ? 1 : -1) * 1.15, F + .45 + .62, -L / 2 + 2.5 + Math.floor(i / 2) * 2.1, i % 2 ? -Math.PI / 2 : Math.PI / 2);
      for (let i = 0; i < 8; i++) sitter(g, (Math.random() - .5) * 1, F, -6 + i * 1.6, Math.random() * 6, true);
      seats.push({ name: 'Window seat', eye: [1.15, F + 1.12, 3.2], yaw: Math.PI / 2 }, { name: 'Standing at the open door', eye: [-.9, F + 1.65, 7.9], yaw: -Math.PI / 2 }, { name: 'Standing in the aisle', eye: [0, F + 1.65, -2], yaw: 0 });
      for (const s of [-1, 1]) for (const z of [-7.5, 7.9]) K.box(.12, H, 1.4, s * Wd / 2, F + H / 2, z, glow('#0b0f14')).visible = false; }
    else { // AC chair car: rows of 2 + 3 facing forward
      for (let z = -L / 2 + 1.4; z < L / 2 - 1; z += .95) { for (const x of [1.05, .55, -.35, -.85, -1.3]) { K.box(.46, .1, .45, x, F + .45, z, seatC); K.box(.46, .62, .08, x, F + .8, z - .22, seatC); K.box(.46, .12, .1, x, F + 1.15, z - .22, '#f4f1ea'); if (Math.random() < .45 && !(x === 1.05 && Math.abs(z - .5) < .5)) sitter(g, x, F + .45 + .62, z + .02, 0); } }
      seats.push({ name: 'Window seat', eye: [1.08, F + 1.22, .55], yaw: Math.PI / 2 * .85 }, { name: 'Aisle seat', eye: [.5, F + 1.22, .55], yaw: 0 }, { name: 'Middle of three', eye: [-.85, F + 1.22, -.4], yaw: -Math.PI / 4 }, { name: 'Standing by the door', eye: [0, F + 1.65, L / 2 - .8], yaw: Math.PI }); }
    return { g, seats, floor: 1.15, ground: true }; }
  function metro(bullet) { const g = new T.Group(), K = kit(g); const L = 20, Wd = 2.9, F = 0, H = 2.35; const wall = bullet ? '#f1efe9' : '#e6eaee', seatC = bullet ? '#2a5aa8' : '#7a3d9a';
    K.box(Wd, .06, L, 0, F, 0, bullet ? '#8a8f96' : '#5a6068'); K.box(Wd, .05, L, 0, F + H, 0, '#f6f6f4'); for (const s of [-.6, .6]) K.box(.25, .02, L - 1, s, F + H - .03, 0, glow('#ffffff'));
    for (const s of [-1, 1]) windowWall(K, s * Wd / 2, L, F, bullet ? .75 : .7, bullet ? 1.45 : 1.85, H, bullet ? 1.25 : 2.5, bullet ? .5 : 1.4, wall, bullet ? '#c9ccd1' : '#b8c0c8');
    K.box(Wd, H, .1, 0, F + H / 2, -L / 2, wall);
    // the front: a big window (driverless metro) and the line map above the doors
    K.box(Wd, .8, .1, 0, F + .4, L / 2, wall); K.box(Wd, .35, .1, 0, F + H - .18, L / 2, wall); K.box(Wd, H - 1.15, .02, 0, F + .8 + (H - 1.15) / 2, L / 2, glass);
    const seats = [];
    if (bullet) { for (let z = -L / 2 + 1.2; z < L / 2 - 1.5; z += 1.0) for (const x of [1.0, .52, -.35, -.83, -1.25]) { K.box(.46, .1, .46, x, F + .45, z, seatC); K.box(.46, .66, .08, x, F + .82, z - .23, seatC); K.box(.46, .1, .1, x, F + 1.18, z - .23, '#f4f1ea'); if (Math.random() < .5 && !(x === 1.0 && Math.abs(z - 1.2) < .6)) sitter(g, x, F + 1.07, z + .02, 0); }
      seats.push({ name: 'Window seat', eye: [1.02, F + 1.22, 1.2], yaw: Math.PI / 2 * .8 }, { name: 'Aisle seat', eye: [.45, F + 1.22, 1.2], yaw: 0 }, { name: 'Front of the car', eye: [0, F + 1.6, L / 2 - .7], yaw: 0 }); }
    else { for (const s of [-1, 1]) for (const z of [-6, 0, 6]) { K.box(.45, .42, 3.6, s * 1.15, F + .21, z, seatC); K.box(.06, .5, 3.6, s * 1.4, F + .65, z, seatC); }
      for (let z = -L / 2 + 1; z < L / 2; z += 2) K.cyl(.025, H, 0, F + H / 2, z, '#c9ccd1'); for (const s of [-.7, .7]) K.cyl(.02, L - 1, s, F + 2.0, 0, '#c9ccd1', Math.PI / 2);
      K.box(1.6, .22, .04, 0, F + 2.12, L / 2 - .08, glow('#ffd64a'));
      for (let i = 0; i < 10; i++) sitter(g, (i % 2 ? 1 : -1) * 1.12, F + 1.04, -7 + Math.floor(i / 2) * 3, i % 2 ? -Math.PI / 2 : Math.PI / 2); for (let i = 0; i < 5; i++) sitter(g, (Math.random() - .5), F, -5 + i * 2.5, Math.random() * 6, true);
      seats.push({ name: 'Front window (no driver)', eye: [0, F + 1.6, L / 2 - .6], yaw: 0 }, { name: 'Seat by the window', eye: [1.12, F + 1.04, 3], yaw: -Math.PI / 2, look: Math.PI / 2 }, { name: 'Standing by the doors', eye: [-.9, F + 1.62, 3], yaw: Math.PI / 2 }); }
    return { g, seats, floor: bullet ? 17 : 12.2 }; }
  function plane() { const g = new T.Group(), K = kit(g); const L = 26, R = 2.0; const F = 0;
    K.box(3.6, .06, L, 0, F, 0, '#5a6274'); for (let z = -L / 2 + .5; z < L / 2; z += 1) K.box(.5, .01, .8, 0, F + .04, z, '#3e4658');
    const cg = new T.CylinderGeometry(R, R, L, 18, 1, true, Math.PI * .68, Math.PI * .64); cg.rotateX(Math.PI / 2); const ceil = new T.Mesh(cg, new T.MeshLambertMaterial({ color: '#efece6', side: T.DoubleSide })); ceil.position.y = F + .55; ceil.rotation.z = 0; g.add(ceil);
    for (const s of [-1, 1]) { K.box(.08, .82, L, s * 1.82, F + .41, 0, '#e6e2da'); // below the windows
      // Beta v1.01.27: real cabin windows · narrow pillars and tall rounded-off openings, so you can see out
      for (let z = -L / 2; z < L / 2; z += .82) { K.box(.1, .62, .3, s * 1.84, F + 1.13, z + .15, '#e6e2da'); K.box(.1, .07, .5, s * 1.84, F + .86, z + .55, '#d6d1c7'); K.box(.1, .07, .5, s * 1.84, F + 1.41, z + .55, '#d6d1c7'); }
      K.box(.02, .62, L, s * 1.88, F + 1.13, 0, glass);
      K.box(.1, .36, L, s * 1.72, F + 1.62, 0, '#e6e2da'); K.box(.55, .4, L, s * 1.35, F + 1.95, 0, '#f4f2ee'); K.box(.02, .06, L, s * 1.08, F + 1.78, 0, glow('#e9f0ff')); }
    const seats = [];
    for (let z = -L / 2 + 1.5, row = 1; z < L / 2 - 2; z += .82, row++) for (const s of [-1, 1]) for (const k of [0, 1, 2]) { const x = s * (.45 + k * .48); K.box(.44, .1, .44, x, F + .45, z, '#26406e'); K.box(.44, .72, .08, x, F + .85, z - .22, '#26406e'); K.box(.44, .14, .09, x, F + 1.27, z - .22, '#f2f2f2');
      if (Math.random() < .55 && !(s === 1 && k === 2 && Math.abs(z - 1) < .5)) sitter(g, x, F + 1.07, z + .02, 0); }
    K.box(3.6, 2.1, .1, 0, F + 1.05, L / 2 - .5, '#e6e2da'); K.box(.9, 1.9, .04, 0, F + .95, L / 2 - .56, '#cfc9be');
    seats.push({ name: 'Window seat', eye: [1.3, F + 1.18, 1.0], look: Math.PI / 2 * .86, pitch: -.18 }, { name: 'Aisle seat', eye: [.45, F + 1.2, 1.0], yaw: 0 }, { name: 'Window seat over the wing', eye: [-1.3, F + 1.18, -2.3], look: -Math.PI / 2 * .86, pitch: -.18 });
    return { g, seats, floor: 1.15, airY: true }; }
  function heli() { const g = new T.Group(), K = kit(g); const F = 0;
    K.box(2.2, .06, 3.4, 0, F, 0, '#2b2e33'); for (const s of [-1, 1]) for (const z of [.3, -1.1]) { K.box(.5, .12, .5, s * .5, F + .45, z, '#4a3b2b'); K.box(.5, .65, .1, s * .5, F + .8, z - .25, '#4a3b2b'); }
    K.box(1.9, .45, .55, 0, F + .9, 1.35, '#1b1e23'); for (let i = 0; i < 6; i++) K.box(.16, .12, .02, -.7 + i * .28, F + 1.05, 1.08, glow(i % 2 ? '#7bff9a' : '#ffd36a'));
    K.cyl(.035, 1.0, .5, F + .55, .9, '#3a3a40', -.5); const pilot = sitter(g, .5, F + 1.07, .32, 0); pilot.userData.isPilot = true;
    // the frame of the bubble canopy: thin pillars only, so you see almost everything
    for (const s of [-1, 1]) { const p = K.box(.06, 1.6, .06, s * .95, F + 1.25, 1.55, '#1b1e23'); p.rotation.x = -.45; K.box(.06, .06, 3.2, s * 1.0, F + 2.05, 0, '#1b1e23'); K.box(.06, 1.9, .06, s * 1.05, F + 1.0, -.4, '#1b1e23'); }
    K.box(2.1, .06, 1.8, 0, F + 2.1, -.7, '#2b2e33');
    const seats = [{ name: 'Front seat next to the pilot', eye: [-.5, F + 1.27, .32], yaw: 0, pitch: -.12 }, { name: 'Back seat, left window', eye: [.5, F + 1.27, -1.08], yaw: Math.PI / 2 * .9, pitch: -.25 }, { name: 'Back seat, right window', eye: [-.5, F + 1.27, -1.08], yaw: -Math.PI / 2 * .9, pitch: -.25 }];
    return { g, seats, floor: 1.4, airY: true }; }
  function ferry() { const g = new T.Group(), K = kit(g); const F = 0; K.box(6, .1, 14, 0, F, 0, '#8a6a44'); for (const s of [-1, 1]) { K.box(.06, .06, 14, s * 2.95, F + 1.0, 0, '#d9d6d0'); for (let z = -6.5; z <= 6.5; z += 1.3) K.box(.05, 1.0, .05, s * 2.95, F + .5, z, '#d9d6d0'); }
    for (let z = -5; z <= 4; z += 1.5) { K.box(4, .1, .45, 0, F + .45, z, '#2f6f8a'); K.box(4, .5, .08, 0, F + .75, z - .22, '#2f6f8a'); if (Math.random() < .7) sitter(g, (Math.random() - .5) * 3, F + 1.07, z + .02, 0); }
    K.box(5, .1, 3, 0, F + 2.6, 5.5, '#e9e2d0'); for (const s of [-1, 1]) K.box(.1, 2.6, .1, s * 2.4, F + 1.3, 5.5, '#e9e2d0');
    for (let i = 0; i < 4; i++) sitter(g, (Math.random() < .5 ? -1 : 1) * 2.6, F, -4 + i * 2.5, Math.random() * 6, true);
    return { g, seats: [{ name: 'At the rail', eye: [2.6, F + 1.62, 0], yaw: Math.PI / 2, pitch: -.15 }, { name: 'Bench in the middle', eye: [.5, F + 1.12, -2.0], yaw: 0 }, { name: 'At the front', eye: [0, F + 1.62, 6.6], yaw: 0, pitch: -.1 }], floor: 1.6 }; }
  const BUILD = { train: m => train(m), metro: m => metro(m === 'bullet'), plane: () => plane(), heli: () => heli(), ferry: () => ferry() };
  /* ---------- seats and looking around ---------- */
  let drag = null, active = null;
  addEventListener('pointerdown', e => { if (!active || (e.target.closest && e.target.closest('button,.sheet,#sheetWrap,input'))) return; drag = { x: e.clientX, y: e.clientY }; }, true);
  addEventListener('pointermove', e => { if (!active || !drag) return; active.yaw -= (e.clientX - drag.x) * .006; active.pitch = Math.max(-1.1, Math.min(.9, active.pitch - (e.clientY - drag.y) * .005)); drag.x = e.clientX; drag.y = e.clientY; }, true);
  addEventListener('pointerup', () => { drag = null; }, true);
  // pose(c, st) -> {x, y, z, h}: where the cabin floor is and which way it faces, from the ride's own camera
  function look(rideObj, g, seats, pose) { const base = rideObj.cam, stop0 = rideObj.onStop, start0 = rideObj.onStart; const S = { i: 0, yaw: 0, pitch: 0, hd: null };
    // nobody sits in your seat, or right in front of it with their head in your view
    const ppl = []; g.traverse(o => { if (o.userData && o.userData.legs && o.userData.arms && !o.userData.isPilot) ppl.push(o); });
    for (const q of ppl) for (const se of seats) { const dx = q.position.x - se.eye[0], dz = q.position.z - se.eye[2]; const fwd = Math.abs((se.look != null ? se.look : se.yaw || 0)) < .5; if (Math.hypot(dx, dz) < .62 || (fwd && Math.abs(dx) < .4 && dz > 0 && dz < 1.15)) { if (q.parent) q.parent.remove(q); break; } }
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; } }); bb.scene.add(g);
    rideObj.kind = 'cabin'; rideObj.lookToggle = false; rideObj.buttons = (rideObj.buttons || []).concat([{ id: 'seat', label: '💺 Change seat', fn: btn => { S.i = (S.i + 1) % seats.length; S.yaw = 0; S.pitch = 0; bb.CINE.setSub(`💺 ${seats[S.i].name} · look round with the arrow keys, W A S D or drag`); } }]);
    rideObj.onStart = (el, st) => { active = S; if (start0) start0(el, st); setTimeout(() => bb.CINE.setSub(`💺 ${seats[0].name} · look round with the arrow keys, W A S D or drag · 💺 to change seat`), 400); };
    rideObj.cam = (f, dt, st, keys) => { st.look = 'fwd'; const c = base(f, dt, st, keys); if (!c) return c; const p = pose(c, st); if (S.hd == null) S.hd = p.h; else { let d = p.h - S.hd; d = Math.atan2(Math.sin(d), Math.cos(d)); S.hd += d * Math.min(1, dt * 2.5); }
      if (keys) { const k = keys; const r = 1.4 * dt; if (k.ArrowLeft || k.KeyA) S.yaw += r; if (k.ArrowRight || k.KeyD) S.yaw -= r; if (k.ArrowUp || k.KeyW) S.pitch = Math.min(.9, S.pitch + r * .7); if (k.ArrowDown || k.KeyS) S.pitch = Math.max(-1.1, S.pitch - r * .7); }
      const t = performance.now() / 1000; g.position.set(p.x, p.y + Math.sin(t * 7) * (p.bob || .008), p.z); g.rotation.set(p.pitch || 0, S.hd, (p.roll || 0) + Math.sin(t * 1.3) * .006, 'YXZ');
      const ch = Math.cos(S.hd), sh = Math.sin(S.hd); const Wp = (lx, ly, lz) => ({ x: p.x + lx * ch + lz * sh, y: p.y + ly, z: p.z - lx * sh + lz * ch });
      const se = seats[S.i]; const e = Wp(se.eye[0], se.eye[1], se.eye[2]); const yw = (se.look != null ? se.look : se.yaw || 0) + S.yaw, pt = (se.pitch || 0) + S.pitch;
      const dx = Math.sin(yw) * Math.cos(pt), dz = Math.cos(yw) * Math.cos(pt), dy = Math.sin(pt); const lk = Wp(se.eye[0] + dx * 10, se.eye[1] + dy * 10, se.eye[2] + dz * 10);
      return Object.assign({}, c, { x: e.x, y: e.y, z: e.z, lx: lk.x, ly: lk.y, lz: lk.z, hard: true, lookK: 30, px: p.x, pz: p.z }); };
    rideObj.onStop = () => { bb.scene.remove(g); if (active === S) active = null; if (stop0) try { stop0(); } catch (e) {} };
    return rideObj; }
  function wrap(rideObj, kind, opts) { opts = opts || {}; const b = BUILD[kind]; if (!b) return rideObj; const C = b(opts.mode); const side = opts.side || 0;
    return look(rideObj, C.g, C.seats, (c, st) => { const h = Math.atan2(c.lx - c.x, c.lz - c.z); const x = c.x + Math.cos(h) * side, z = c.z - Math.sin(h) * side;
      // ground trains run on the ground; the metro and bullet train on their viaducts; flights, helicopters and ferries follow the ride's height
      const y = C.ground ? C.floor : kind === 'metro' ? Math.max(c.y - 1.9, 1) : c.y - C.floor;
      const pitch = kind === 'plane' && opts.climb ? -Math.max(-.12, Math.min(.12, opts.climb(st))) : 0; return { x, y, z, h, pitch, roll: kind === 'heli' ? -.03 : 0, bob: kind === 'train' ? .012 : .006 }; }); }
  bb.CABIN = { wrap, look, sitter, kit, M, glass, build: (kind, mode) => BUILD[kind] && BUILD[kind](mode) };
});
