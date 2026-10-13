// Detailed builders for the big statues and monuments (Beta v1.0.0): Jatayu Earth's Center, the Statue of Unity,
// Murudeshwar Shiva, Gommateshwara at Shravanabelagola and the Kanyakumari rocks (Vivekananda Rock Memorial and the
// Thiruvalluvar statue). They replace the simpler versions in landmarks.js. Built from smooth shapes, still LOD 200.
(function () {
  const L = window.LANDMARKS; if (!L) return;
  const MC = {}; const mat = (c, hex) => MC[hex] || (MC[hex] = new c.THREE.MeshLambertMaterial({ color: hex }));
  // a local frame: build in statue space (forward = +z), rotated by ry and moved to (x, y, z)
  function frame(c, x, y, z, ry) { const T = c.THREE;
    const put = (g, m, lx, ly, lz, rx, rry, rz) => { if (rz) g.rotateZ(rz); if (rx) g.rotateX(rx); if (rry) g.rotateY(rry); g.translate(lx, ly, lz); g.rotateY(ry); g.translate(x, y, z); c.add(g, m); };
    return {
      box: (w, h, d, lx, ly, lz, m, rx, rry, rz) => put(new T.BoxGeometry(w, h, d), m, lx, ly, lz, rx, rry, rz),
      sph: (rx_, ry_, rz_, lx, ly, lz, m, rx, rry, rz) => { const g = new T.SphereGeometry(1, 16, 12); g.scale(rx_, ry_, rz_); put(g, m, lx, ly, lz, rx, rry, rz); },
      cyl: (rt, rb, h, lx, ly, lz, m, rx, rry, rz, seg) => put(new T.CylinderGeometry(rt, rb, h, seg || 12), m, lx, ly, lz, rx, rry, rz),
      cone: (r, h, lx, ly, lz, m, rx, rry, rz, seg) => put(new T.ConeGeometry(r, h, seg || 10), m, lx, ly, lz, rx, rry, rz),
      // a limb from point a to point b
      limb: (a, b, r1, r2, m) => { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], l = Math.hypot(dx, dy, dz); const g = new T.CylinderGeometry(r2, r1, l, 10); g.translate(0, l / 2, 0);
        const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / l, dy / l, dz / l)); g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(q)); g.translate(a[0], a[1], a[2]); g.rotateY(ry); g.translate(x, y, z); c.add(g, m);
        const s = new T.SphereGeometry(r2 * 1.02, 10, 8); s.translate(b[0], b[1], b[2]); s.rotateY(ry); s.translate(x, y, z); c.add(s, m); },
      lathe: (pts, lx, ly, lz, m, sx, sz) => { const g = new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), 20); g.scale(sx || 1, 1, sz || 1); put(g, m, lx, ly, lz); } };
  }
  // a standing figure H tall. opts: robe (dhoti or long robe), shawl, arms ('down' | 'book' | 'jain'), hair, vines
  function standing(c, x, y, z, ry, H, m, o) { const f = frame(c, x, y, z, ry); const u = H / 8; o = o || {};
    // feet
    for (const s of [-1, 1]) f.sph(.32 * u, .18 * u, .62 * u, s * .42 * u, .16 * u, .2 * u, m);
    if (o.robe) f.lathe([[0, 0], [1.05 * u, .25 * u], [1.0 * u, 1.2 * u], [.86 * u, 2.6 * u], [.8 * u, 3.6 * u], [.78 * u, 4.4 * u], [0, 4.5 * u]], 0, 0, 0, m, 1, .7);
    else for (const s of [-1, 1]) { f.limb([s * .42 * u, .3 * u, 0], [s * .4 * u, 2.2 * u, .04 * u], .26 * u, .3 * u, m); f.limb([s * .4 * u, 2.2 * u, .04 * u], [s * .45 * u, 4.1 * u, 0], .3 * u, .42 * u, m);
      if (o.vines) for (let k = 0; k < 6; k++) f.cyl(.05 * u, .05 * u, .9 * u, s * .62 * u, (.8 + k * .55) * u, (k % 2 ? .1 : -.1) * u, mat(c, '#8d8576'), .3, 0, s * (k % 2 ? .5 : -.5), 6); }
    // hips, torso, chest
    f.sph(.85 * u, .55 * u, .5 * u, 0, 4.25 * u, 0, m);
    f.lathe([[0, 0], [.78 * u, .05 * u], [.74 * u, .7 * u], [.86 * u, 1.5 * u], [.98 * u, 2.1 * u], [.6 * u, 2.45 * u], [0, 2.5 * u]], 0, 4.3 * u, 0, m, 1, .62);
    if (o.shawl) { const sm = o.shawlM || m; f.lathe([[0, 0], [1.12 * u, .2 * u], [1.12 * u, 1.4 * u], [1.0 * u, 2.0 * u], [.5 * u, 2.3 * u], [0, 2.35 * u]], 0, 4.4 * u, 0, sm, 1, .7);
      f.box(.9 * u, 3.2 * u, .2 * u, -.55 * u, 4.6 * u, .45 * u, sm, -.05, 0, .25); }
    // neck and head
    f.cyl(.24 * u, .28 * u, .5 * u, 0, 6.95 * u, 0, m); const hy = 7.5 * u;
    f.sph(.44 * u, .55 * u, .5 * u, 0, hy, .02 * u, m); f.box(.12 * u, .26 * u, .16 * u, 0, hy - .05 * u, .5 * u, m); f.sph(.3 * u, .2 * u, .2 * u, 0, hy - .32 * u, .25 * u, m);
    for (const s of [-1, 1]) f.sph(.08 * u, o.longEars ? .34 * u : .16 * u, .1 * u, s * .46 * u, hy - (o.longEars ? .2 : 0) * u, 0, m);
    if (o.hair === 'curls') for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28, b = (i % 3) * .35; f.sph(.12 * u, .12 * u, .12 * u, Math.cos(a) * .4 * u * Math.cos(b), hy + .3 * u + Math.sin(b) * .2 * u, Math.sin(a) * .42 * u * Math.cos(b) - .02 * u, m); }
    else if (o.hair === 'short') f.sph(.46 * u, .32 * u, .52 * u, 0, hy + .25 * u, -.04 * u, o.hairM || m);
    else if (o.hair === 'bun') { f.sph(.46 * u, .32 * u, .52 * u, 0, hy + .25 * u, -.04 * u, m); f.sph(.28 * u, .3 * u, .28 * u, 0, hy + .6 * u, -.1 * u, m); }
    // arms: shoulders at 6.6u
    const sh = [[-1.0 * u, 6.55 * u, 0], [1.0 * u, 6.55 * u, 0]];
    for (const [i, s] of [[0, -1], [1, 1]]) { const S = sh[i]; f.sph(.32 * u, .32 * u, .32 * u, S[0], S[1], S[2], m);
      let el, hand;
      if (o.arms === 'book' && s > 0) { el = [1.15 * u, 5.0 * u, .2 * u]; hand = [1.0 * u, 5.6 * u, 1.2 * u]; }
      else if (o.arms === 'raise' && s < 0) { el = [-1.3 * u, 5.4 * u, .4 * u]; hand = [-1.2 * u, 6.6 * u, .9 * u]; }
      else if (o.arms === 'cane' && s > 0) { el = [1.2 * u, 5.0 * u, .25 * u]; hand = [1.25 * u, 4.0 * u, .5 * u]; }
      else { el = [s * 1.15 * u, 5.0 * u, .05 * u]; hand = [s * 1.15 * u, 3.55 * u, .12 * u]; }
      f.limb(S, el, .28 * u, .24 * u, m); f.limb(el, hand, .24 * u, .19 * u, m); f.sph(.2 * u, .28 * u, .16 * u, hand[0], hand[1] - .15 * u, hand[2], m);
      if (o.vines) f.cyl(.05 * u, .05 * u, 1.6 * u, s * 1.3 * u, 5 * u, 0, mat(c, '#8d8576'), 0, 0, s * .3, 6);
      if (o.arms === 'book' && s > 0) f.box(.9 * u, .12 * u, 1.3 * u, hand[0] - .1 * u, hand[1] - .1 * u, hand[2], o.bookM || m, .5); }
    return f; }
  function seated(c, x, y, z, ry, H, m, o) { const f = frame(c, x, y, z, ry); const u = H / 5; o = o || {}; const gold = mat(c, '#d9a93a');
    // crossed legs (lotus) and knees
    f.sph(1.9 * u, .5 * u, 1.1 * u, 0, .5 * u, .2 * u, m); for (const s of [-1, 1]) { f.sph(.6 * u, .45 * u, .6 * u, s * 1.55 * u, .5 * u, .8 * u, m); f.limb([s * 1.5 * u, .55 * u, .9 * u], [-s * .4 * u, .7 * u, 1.0 * u], .35 * u, .3 * u, m); }
    if (o.tiger) f.lathe([[0, 0], [2.6 * u, .05 * u], [2.5 * u, .2 * u], [0, .22 * u]], 0, .02 * u, .2 * u, o.tiger, 1, .7);
    // torso, belly, chest
    f.lathe([[0, 0], [.95 * u, .05 * u], [.9 * u, .6 * u], [1.05 * u, 1.3 * u], [1.12 * u, 1.75 * u], [.6 * u, 2.05 * u], [0, 2.1 * u]], 0, .8 * u, 0, m, 1, .62);
    f.cyl(.25 * u, .3 * u, .4 * u, 0, 3.0 * u, 0, m); const hy = 3.55 * u;
    f.sph(.45 * u, .56 * u, .5 * u, 0, hy, .03 * u, m); f.box(.12 * u, .25 * u, .15 * u, 0, hy - .05 * u, .5 * u, m);
    if (o.jata) { f.cyl(.3 * u, .42 * u, .9 * u, 0, hy + .75 * u, -.05 * u, m, 0, 0, 0, 10); f.sph(.32 * u, .2 * u, .32 * u, 0, hy + 1.2 * u, -.05 * u, m); f.cone(.07 * u, .5 * u, .25 * u, hy + .85 * u, .2 * u, gold, 0, 0, -.6); f.box(.3 * u, .05 * u, .1 * u, -.3 * u, hy + .9 * u, .2 * u, gold, 0, 0, .5); }
    if (o.snake) { for (let i = 0; i < 10; i++) { const a = -Math.PI * .9 + i / 9 * Math.PI * 1.8; f.sph(.13 * u, .13 * u, .13 * u, Math.cos(a) * .5 * u, 2.85 * u + (i > 7 ? (i - 7) * .25 * u : 0), Math.sin(a) * .35 * u + .05 * u, gold); } f.sph(.22 * u, .12 * u, .25 * u, .55 * u, 3.4 * u, .25 * u, gold); }
    for (const s of [-1, 1]) f.sph(.08 * u, .18 * u, .1 * u, s * .46 * u, hy, 0, m);
    // arms: right hand raised in blessing, left resting on the knee
    const SR = [1.15 * u, 2.6 * u, 0], SL = [-1.15 * u, 2.6 * u, 0]; f.sph(.35 * u, .35 * u, .35 * u, SR[0], SR[1], SR[2], m); f.sph(.35 * u, .35 * u, .35 * u, SL[0], SL[1], SL[2], m);
    f.limb(SR, [1.75 * u, 1.65 * u, .3 * u], .3 * u, .26 * u, m); f.limb([1.75 * u, 1.65 * u, .3 * u], [1.95 * u, 2.45 * u, 1.0 * u], .26 * u, .22 * u, m); f.sph(.2 * u, .32 * u, .1 * u, 1.95 * u, 2.7 * u, 1.05 * u, m);
    f.limb(SL, [-1.5 * u, 1.55 * u, .35 * u], .3 * u, .26 * u, m); f.limb([-1.5 * u, 1.55 * u, .35 * u], [-1.45 * u, .95 * u, 1.05 * u], .26 * u, .22 * u, m); f.sph(.24 * u, .14 * u, .3 * u, -1.45 * u, .9 * u, 1.15 * u, m);
    for (const s of [-1, 1]) { f.cyl(.22 * u, .22 * u, .1 * u, s * 1.3 * u, 2.2 * u, .2 * u, gold, 0, 0, s * .2); f.cyl(.18 * u, .18 * u, .08 * u, s * 1.5 * u, 1.3 * u, .5 * u, gold, .4, 0, 0); }
    f.lathe([[0, 0], [.8 * u, .05 * u], [.7 * u, .12 * u], [0, .14 * u]], 0, 2.75 * u, .05 * u, gold, 1, .7);
    return f; }

  /* ---------- Jatayu Earth's Center, Chadayamangalam (Kollam) ---------- */
  // the world's largest bird sculpture: Jatayu fallen on the rock after fighting Ravana, one wing raised to the sky
  L.jatayu = (c, x, z) => { const M = c.M, T = c.THREE, rnd = c.rnd; const rk = mat(c, '#8a857b'), rk2 = mat(c, '#76716a'), moss = mat(c, '#4f7a36'), st = mat(c, '#d6cfc1'), st2 = mat(c, '#b9b1a1'), beak = mat(c, '#e0b04a'), dark = mat(c, '#2a2622');
    // Jatayupara: a granite hill of piled boulders with forest on its lower slopes
    c.cone(52, 22, x, 11, z, rk2, 12); c.cyl(30, 40, 6, x, 23, z, rk, 12);
    for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28 + rnd() * .2, r = 18 + rnd() * 26; const g = new T.SphereGeometry(4 + rnd() * 6, 9, 7); g.scale(1.3, .7 + rnd() * .3, 1); g.translate(x + Math.cos(a) * r, 22 - r * .38 + rnd() * 3, z + Math.sin(a) * r); c.add(g, i % 3 ? rk : rk2); }
    for (let i = 0; i < 30; i++) { const a = rnd() * 6.28, r = 38 + rnd() * 16; c.tree(x + Math.cos(a) * r, z + Math.sin(a) * r, 1 + rnd() * .5); }
    c.cyl(26, 27, 1, x, 26.5, z, mat(c, '#c9c2b2'), 20);                                     // summit deck
    for (let i = 0; i < 40; i++) { const a = i / 40 * 6.28; c.box(.2, 1.1, 4.1, x + Math.cos(a) * 26.5, 27.5, z + Math.sin(a) * 26.5, M.steel); }
    const f = frame(c, x, 27, z, .4); const Y = 0;
    // body lying on its belly, chest lifted, head turned to the sky with the beak open
    f.sph(9, 4.6, 14, 0, Y + 4.2, -2, st); f.sph(7, 4.4, 6, 0, Y + 5.8, 8, st); f.sph(5.5, 3, 9, 0, Y + 2.4, -2, st2);
    for (let i = 0; i < 9; i++) f.sph(2.4, .7, 3.4, (i % 3 - 1) * 4, Y + 8.3 - Math.abs(i % 3 - 1) * .9, -10 + Math.floor(i / 3) * 6, st2, .15);    // feather scales on the back
    f.limb([0, Y + 7, 10], [1.5, Y + 13, 15], 3.2, 2.4, st);                                     // neck
    f.sph(3, 3.3, 4.8, 1.8, Y + 14.8, 16.8, st); for (let i = 0; i < 5; i++) f.box(.6, 3.2 - i * .4, 2, 1.8, Y + 17.4 - i * .5, 13.6 - i * 1.3, st2, -.9 - i * .15); for (const s of [-1, 1]) { f.sph(.7, .7, .5, 1.8 + s * 2.6, Y + 15.4, 17.6, dark); f.sph(1.2, .4, 1.6, 1.8 + s * 1.6, Y + 17, 15.6, st2, .3); }
    f.cone(1.9, 7.5, 1.9, Y + 15.6, 23.6, beak, Math.PI / 2 - .12); f.cone(.8, 2.6, 1.9, Y + 14.4, 27.2, beak, Math.PI - .2); f.cone(1.2, 5, 1.9, Y + 12.6, 22, beak, Math.PI / 2 + .55); f.sph(1.4, .25, 2.2, 1.9, Y + 13.6, 21.6, mat(c, '#a8402a'));   // upper and lower beak, open
    
    // the raised wing: long primary feathers fanning up into the sky
    const wb = [-7, Y + 7, 2]; f.limb([-4, Y + 6, 4], wb, 3, 2.6, st); f.limb(wb, [-12, Y + 20, 0], 2.6, 1.8, st);
    for (let i = 0; i < 11; i++) { const t = i / 10; const bx = -7 - t * 5, by = Y + 7 + t * 13; f.box(1.2, 15 - i * .4, 4.2, bx - 3, by + 4 - t * 2, -3 - t * 2, i % 2 ? st : st2, .9 - t * .9, 0, .55 - t * .45); }
    for (let i = 0; i < 7; i++) f.box(1, 9, 3.4, -10 - i * .8, Y + 22 + i * 1.2, -2 - i * 1.5, i % 2 ? st2 : st, .35 + i * .08, 0, .25 + i * .05);
    // the broken wing lying spread on the rock
    for (let i = 0; i < 10; i++) f.box(3.6, .9, 15 - i * .6, 7 + i * 1.6, Y + 1.2 + i * .05, -2 - i * 1.5, i % 2 ? st : st2, 0, -.4 - i * .1, 0);
    // tail feathers fanned out
    for (let i = 0; i < 7; i++) { const a = (i / 6 - .5) * 1.1; f.box(2.8, .9, 12, Math.sin(a) * 6, Y + 2.2, -18 - Math.cos(a) * 5, i % 2 ? st : st2, -.1, a, 0); }
    // talons clawing at the sky (a bird that fell fighting)
    for (const s of [-1, 1]) { const k = [s * 5, Y + 3, -6], fo = [s * 7, Y + 10, -8]; f.limb(k, fo, 1.4, 1, beak); for (let j = 0; j < 4; j++) f.cone(.35, 2.4, fo[0] + (j - 1.5) * .7, fo[1] + 1.4, fo[2] + (j === 0 ? -1 : .3), dark, j === 0 ? -.6 : .3); }
    // cable car from the foot of the hill to the summit: towers, the cable and two cabins
    const bx = x + 70, bz = z + 40; c.box(14, 6, 10, bx, 3, bz, M.white); c.box(15, .8, 11, bx, 6.4, bz, mat(c, '#c0392b')); c.box(10, 4, 8, x + 22, 30, z + 12, M.white);
    for (let i = 1; i < 4; i++) { const t = i / 4, px = bx + (x + 22 - bx) * t, pz = bz + (z + 12 - bz) * t, py = 6 + 24 * t; c.cyl(.5, .7, py + 6, px, (py + 6) / 2, pz, M.steel, 6); c.box(4, .5, .5, px, py + 6, pz, M.steel); }
    { const ax = bx, az = bz, ay = 9, ex = x + 22, ez = z + 12, ey = 32; const l = Math.hypot(ex - ax, ey - ay, ez - az); const g = new T.CylinderGeometry(.08, .08, l, 4); g.translate(0, l / 2, 0); g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3((ex - ax) / l, (ey - ay) / l, (ez - az) / l)))); g.translate(ax, ay, az); c.add(g, M.dark);
      for (const t of [.3, .7]) { c.box(2.2, 2.2, 2.2, ax + (ex - ax) * t, ay + (ey - ay) * t - 1.8, az + (ez - az) * t, mat(c, '#e74c3c')); c.box(2.3, .8, 2.3, ax + (ex - ax) * t, ay + (ey - ay) * t - 1.4, az + (ez - az) * t, mat(c, '#2a3a4a')); } }
    c.sign("JATAYU EARTH'S CENTER", bx, 9, bz + 5.2, 0, 16, 1.8, '#ffffff', '#7a3a1a');
    // a little hill temple (Kodandarama) on the summit
    c.box(5, 3, 5, x - 20, 28.5, z - 10, M.white); c.cone(3.6, 4, x - 20, 32, z - 10, mat(c, '#a8402a'), 4);
    c.col(x, z, 36, 36); c.far(); return {}; };

  /* ---------- Statue of Unity, Kevadia ---------- */
  // Sardar Patel in dhoti and shawl, 182 m, facing the Narmada dam, on a stepped base with the viewing gallery
  L.statueUnity = (c, x, z) => { const M = c.M; const b = mat(c, '#7d6247'), b2 = mat(c, '#6c5440'), base = mat(c, '#d9d2c3'), base2 = mat(c, '#b8b0a0');
    c.cyl(34, 38, 1.6, x, -.2, z, M.rock, 20); c.cyl(28, 30, 4, x, 2, z, base2, 24); c.cyl(23, 25, 5, x, 6.5, z, base, 24); c.cyl(15, 18, 5, x, 11.5, z, base2, 24);
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; c.box(.6, 4, .6, x + Math.cos(a) * 25.5, 6, z + Math.sin(a) * 25.5, M.white); }
    for (let k = 0; k < 8; k++) c.box(10, .6, 2, x + 32 - k * 1.2, .3 + k * .55, z, base);    // grand steps
    standing(c, x, 14, z, Math.PI / 2, 64, b, { robe: true, shawl: true, shawlM: b2, arms: 'down', hair: 'short', hairM: b2 });
    c.sign('STATUE OF UNITY', x + 30, 5, z, Math.PI / 2, 18, 2, '#ffffff', '#3a4a5a');
    c.col(x, z, 16, 16); c.far(); return { poi: [{ type: 'food', name: 'Viewing gallery cafe', x: x, z: z - 30, rot: Math.PI, extra: 'GJ' }] }; };

  /* ---------- Murudeshwar: the giant seated Shiva over the Arabian Sea ---------- */
  L.murudeshwar = (c, x, z) => { const M = c.M, rk = mat(c, '#7c7870'), sv = mat(c, '#8fa3b5'), gold = mat(c, '#d9a93a');
    c.cyl(20, 26, 8, x, 4, z, rk, 14); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; c.sph(4 + c.rnd() * 3, x + Math.cos(a) * 22, 6 + c.rnd() * 2, z + Math.sin(a) * 22, rk); }
    // a rocky mount (Kailash) with a waterfall (Ganga) and Nandi in front
    c.cone(16, 10, x, 13, z, mat(c, '#6f6a62'), 10); seated(c, x, 16, z, -Math.PI / 2, 34, sv, { jata: true, snake: true });
    c.box(1.6, 8, 3, x - 14, 12, z, mat(c, '#bfe3f5'));
    { const nx = x - 22, nz = z; c.sph(2.4, nx, 10.2, nz, sv); c.sph(1.3, nx - 2.4, 11, nz, sv); c.cone(.4, 1.2, nx - 2.6, 12.4, nz - .7, gold); c.cone(.4, 1.2, nx - 2.6, 12.4, nz + .7, gold); }
    c.box(.4, 26, .4, x + 9, 22, z + 10, gold); c.cone(1.6, 3, x + 9, 36, z + 10, gold, 3); c.cyl(.6, .6, 2, x + 9, 31, z + 10, mat(c, '#c0392b'), 8);     // trishul with a damru
    gopurams(c, x + 2, z - 55); c.col(x, z, 20, 20); c.col(x + 2, z - 55, 8, 6); c.far(); return {}; };
  // the 20-storey Raja Gopuram in front of the temple
  function gopurams(c, x, z) { const m = mat(c, '#e8d6b0'), m2 = mat(c, '#d4bf92'), gold = mat(c, '#d9a93a'); c.box(18, 10, 14, x, 5, z, m); let w = 16, d = 12, y = 10;
    for (let i = 0; i < 12; i++) { c.box(w, 4.8, d, x, y + 2.4, z, i % 2 ? m : m2); for (const s of [-1, 1]) c.box(.6, 3, .6, x + s * w * .45, y + 2.4, z + d / 2 + .1, mat(c, '#a8402a')); y += 4.8; w -= .8; d -= .6; }
    c.roof(w + 2, 4, d + 1, x, y, z, m2); for (let i = -2; i <= 2; i++) c.cone(.5, 2.4, x + i * 2, y + 4.8, z, gold, 6); }

  /* ---------- Gommateshwara (Bahubali), Shravanabelagola ---------- */
  L.gommateshwara = (c, x, z) => { const M = c.M, gr = mat(c, '#7d7466'), gr2 = mat(c, '#8f8676'), st = mat(c, '#dcd6c8'), wall = mat(c, '#c9c1ae');
    c.cone(50, 34, x, 17, z, gr, 12); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28 + .2, r = 22 + c.rnd() * 18; c.sph(4 + c.rnd() * 4, x + Math.cos(a) * r, 34 - r * .7, z + Math.sin(a) * r, gr2); }
    c.cyl(15, 17, 3, x, 34.5, z, gr2, 16);
    // the temple enclosure (cloisters) around the statue
    for (const [dx, dz, w, d] of [[0, -11, 24, 2], [0, 11, 24, 2], [-11, 0, 2, 24], [11, 0, 2, 24]]) { c.box(w, 5, d, x + dx, 38.5, z + dz, wall); c.box(w + 1, .6, d + 1, x + dx, 41.3, z + dz, st); }
    c.box(6, 7, 3, x, 39.5, z - 12, wall); c.box(7, 2, 4, x, 44, z - 12, st);
    standing(c, x, 36, z, Math.PI, 22, st, { arms: 'down', hair: 'curls', longEars: true, vines: true });
    // more than 600 steps cut into the rock
    for (let i = 0; i < 22; i++) c.box(5, .6, 2.4, x, 1 + i * 1.55, z - 48 + i * 1.75, M.stone);
    c.col(x, z, 30, 30); c.far(); return {}; };

  /* ---------- Kanyakumari: Vivekananda Rock Memorial and the Thiruvalluvar statue ---------- */
  L.kanyakumari = (c, x, z) => { const M = c.M, red = mat(c, '#a85a3a'), sand = mat(c, '#c8b69a'), rk = mat(c, '#57524a'), st = mat(c, '#9a8f80'), wh = M.white;
    // the shore temple (Kumari Amman) and the ferry jetty
    c.box(24, .3, 16, x, .15, z, M.stone, false, true); c.box(10, 5, 8, x, 2.5, z, wh); c.box(11, 1, 9, x, 5.4, z, red); c.cone(3, 5, x, 8.4, z, red, 4);
    c.box(3, 1, 30, x - 6, .5, z + 20, M.concrete); for (const s of [0, 1]) { const fx = x - 3 + s * 6, fz = z + 40 + s * 10; c.box(3.2, 1.6, 10, fx, .6, fz, M.white); c.box(3, 1.6, 6, fx, 2, fz, mat(c, '#2f7fc1')); }
    // Vivekananda Rock Memorial: mandapam with a stepped shikhara on a rock island
    const rx = 6575, rz = 19010; c.sph(14, rx, -4, rz, rk); c.box(22, 2, 16, rx, 3.6, rz, sand);
    c.box(14, 7, 10, rx, 8, rz, sand); for (let i = 0; i < 6; i++) c.box(.9, 6, .9, rx - 6 + i * 2.4, 7.5, rz + 5.3, red);
    let w = 12, y = 11.5; for (let i = 0; i < 5; i++) { c.box(w, 1.6, w * .75, rx, y + .8, rz, i % 2 ? sand : red); y += 1.6; w -= 2.2; } c.dome(1.6, rx, y, rz, sand); c.cone(.4, 2, rx, y + 2.2, rz, mat(c, '#d9a93a'));
    c.box(7, 4, 6, rx + 12, 5.6, rz - 2, sand); c.dome(2.6, rx + 12, 7.6, rz - 2, red);
    // Thiruvalluvar statue: 133 ft, on a 38 ft pedestal, palm-leaf book in hand
    const tx = 6618, tz = 19022; c.sph(10, tx, -3, tz, rk); c.cyl(6, 7, 2, tx, 2, tz, st, 12);
    c.box(9, 6, 9, tx, 6, tz, mat(c, '#b0a594')); for (const s of [-1, 1]) c.box(1, 6, 9.4, tx + s * 4.3, 6, tz, red); c.box(10, .8, 10, tx, 9.4, tz, st);
    standing(c, tx, 9.8, tz, Math.PI, 23, st, { robe: true, shawl: true, arms: 'book', bookM: mat(c, '#c9b48a'), hair: 'bun' });
    c.col(x, z, 12, 8); c.far(); return {}; };

  /* ---------- Hawa Mahal, Jaipur (Beta v1.01.03, LOD 300) ---------- */
  // the five-storey pink sandstone "palace of winds": stepped tiers of projecting jharokha bays with latticed windows,
  // small domed caps and white trim, a crown of chhatris, the arched entrance and the palace body behind
  L.hawaMahal = (c, x, z) => { const M = c.M, Y = .3, pink = mat(c, '#e58a6a'), pinkL = mat(c, '#f0a585'), trim = mat(c, '#f6e7d2'), lat = mat(c, '#7a3b2e'), FZ = z + 9;
    c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); c.box(46, 22, 14, x, Y + 11, z - 4, pink);
    const tiers = [[42, 7], [38, 6], [32, 5.5], [24, 5.5], [15, 5]]; let y = Y, d = 6;
    tiers.forEach(([w, h], ti) => { c.box(w, h, d, x, y + h / 2, FZ - d / 2, pink); c.box(w + .4, .35, d + .5, x, y + h + .1, FZ - d / 2 + .2, trim);
      const n = Math.max(3, Math.floor(w / 3)); for (let i = 0; i < n; i++) { const wx = x - w / 2 + (i + .5) * w / n; const bw = w / n * .78;
        const bay = new c.THREE.CylinderGeometry(bw / 2, bw / 2, h * .72, 8, 1, false, -Math.PI / 2, Math.PI); bay.translate(wx, y + h * .46, FZ); c.add(bay, i % 2 ? pinkL : pink);
        c.box(bw * .55, h * .42, .1, wx, y + h * .5, FZ + bw / 2 - .02, lat); c.box(bw * .62, .14, .2, wx, y + h * .74, FZ + bw / 2, trim);
        c.dome(bw / 2 * .9, wx, y + h * .82, FZ, i % 2 ? pink : pinkL); if (ti >= 2) c.cone(.12, .7, wx, y + h * .82 + bw * .45 + .3, FZ, trim, 6); } y += h; d -= .9; });
    for (const s of [-1, 0, 1]) { c.cyl(.18, .18, 1.6, x + s * 4, y + .8, FZ - 1.2, trim, 6); c.dome(1, x + s * 4, y + 1.6, FZ - 1.2, pinkL); c.cone(.12, .8, x + s * 4, y + 2.9, FZ - 1.2, M.gold, 6); }
    c.box(6, 5, 1, x, Y + 2.5, FZ + .3, trim); c.box(4, 4, 1.2, x, Y + 2, FZ + .4, lat);
    c.col(x, z, 23, 12); c.far(); return {}; };

  /* ---------- Mysore Palace (Beta v1.01.03, LOD 300) ---------- */
  // the Indo-Saracenic palace: a long arcaded front with cusped arches on pillars, a five-storey central tower with a
  // gilded dome, red domed corner towers, flags, and strings of bulbs that light it up at night
  L.mysorePalace = (c, x, z) => { const M = c.M, Y = .3, st = mat(c, '#ece0c2'), st2 = mat(c, '#d9c7a0'), red = mat(c, '#c4553f'), gold = mat(c, '#d9a93a'), dark = mat(c, '#3a2e26');
    const bulb = new c.THREE.MeshBasicMaterial({ color: 0xffe08a }); const F = z - 11;
    c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true); c.box(58, .4, 14, x, Y + .2, z - 18, M.plaza, false, true);
    c.box(54, 13, 26, x, Y + 6.5, z + 3, st); c.box(55, .9, 27, x, Y + 13.2, z + 3, st2); c.box(54, 2, .6, x, Y + 12, F - .6, st2);
    // the arcade: cusped arches on twin pillars across the front, two storeys
    for (let row = 0; row < 2; row++) for (let i = 0; i < 13; i++) { const ax = x - 24 + i * 4, ay = Y + 1 + row * 6;
      for (const s of [-1, 1]) c.cyl(.28, .32, 4.4, ax + s * 1.6, ay + 2.2, F - 1.2, st, 8);
      const arch = new c.THREE.TorusGeometry(1.35, .22, 5, 10, Math.PI); arch.translate(ax, ay + 4.4, F - 1.2); c.add(arch, st2); c.box(2.4, 3.6, .2, ax, ay + 2.6, F - .2, dark); }
    // the central tower
    for (let k = 0; k < 4; k++) { const w = 13 - k * 1.8; c.box(w, 4.2, w, x, Y + 15.5 + k * 4.2, z - 3, k % 2 ? st2 : st); c.box(w + .5, .4, w + .5, x, Y + 17.7 + k * 4.2, z - 3, trimOf(c)); }
    c.cyl(4, 4.4, 3, x, Y + 33, z - 3, st, 14); c.dome(4.6, x, Y + 34.4, z - 3, gold); c.cyl(.25, .3, 3, x, Y + 40.5, z - 3, gold, 6); c.box(.04, 1, 1.6, x, Y + 41.6, z - 2.2, mat(c, '#ff9933'));
    // corner and side towers with red domes
    for (const [dx, dz, s] of [[-25, -9, 1], [25, -9, 1], [-25, 15, .8], [25, 15, .8], [-12, -9, .7], [12, -9, .7]]) { c.cyl(2.4 * s, 2.6 * s, 10 * s, x + dx, Y + 13 + 5 * s, z + dz, st, 10); c.box(5.6 * s, .4, 5.6 * s, x + dx, Y + 13, z + dz, st2); c.dome(2.8 * s, x + dx, Y + 13 + 10 * s, z + dz, red); c.cone(.2, 1.4, x + dx, Y + 14.4 + 12.4 * s, z + dz, gold, 6); }
    // the evening lights: bulbs along the roof line, arches and the tower
    const bl = (bx, by, bz) => { const b = new c.THREE.BoxGeometry(.22, .22, .22); b.translate(bx, by, bz); c.add(b, bulb, false, false); };
    for (let i = 0; i <= 54; i += 1.5) { bl(x - 27 + i, Y + 13.8, F - .8); bl(x - 27 + i, Y + 7.6, F - 1.6); }
    for (let k = 0; k < 4; k++) { const w = 13 - k * 1.8; for (let i = 0; i <= w; i += 1.2) bl(x - w / 2 + i, Y + 17.9 + k * 4.2, z - 3 - w / 2 - .3); }
    for (const s of [-1, 1]) c.box(.06, 2.2, 3.4, x + s * 30, Y + 9, F - 4, mat(c, '#c8102e'));
    c.col(x, z + 3, 27, 13); c.far(); return {}; };
  function trimOf(c) { return mat(c, '#f6ecd6'); }

  /* ---------- Beta v1.01.03: new cities from the state plans ---------- */
  // a Nagara temple: a plinth, a mandapa with a pyramid roof and a curved shikhara with an amalaka and a flag
  function nagara(c, x, z, m, m2, h) { const Y = .3; c.box(18, 1.2, 26, x, Y + .6, z, m2); c.box(12, 5, 10, x, Y + 3.7, z + 6, m); c.roof(14, 4, 12, x, Y + 6.2, z + 6, m2);
    for (let i = 0; i < 6; i++) { const t = i / 6, r = 6.2 * (1 - t * .7); c.cyl(r * .86, r, h / 6, x, Y + 1.2 + h * t + h / 12, z - 4, i % 2 ? m2 : m, 8); }
    c.cyl(1.6, 1.6, .7, x, Y + 1.5 + h, z - 4, m2, 14); c.sph(.6, x, Y + 2.3 + h, z - 4, c.M.gold); c.flag(x, Y + 3 + h, z - 4); c.col(x, z, 9, 13); }
  L.mahalaxmi = (c, x, z) => { const st = mat(c, '#6f6a62'), st2 = mat(c, '#8a8378'); c.box(64, .1, 64, x, .32, z, c.M.plaza || st2, false, true); nagara(c, x, z, st, st2, 15);
    for (const s of [-1, 1]) c.box(.8, 8, .8, x + s * 14, .3 + 4, z + 18, st2); c.box(29, 1.2, 1.2, x, 8.9, z + 18, st2); c.far(); return { poi: [{ type: 'food', name: 'Kolhapuri misal stall', x: x + 24, z: z + 26, rot: Math.PI, extra: 'MH' }] }; };
  L.vitthal = (c, x, z) => { const st = mat(c, '#c9b68e'), st2 = mat(c, '#a8916a'); nagara(c, x, z, st, st2, 13); c.box(40, 4, 1, x, 2.3, z + 24, st2); for (let i = 0; i < 4; i++) c.box(6, .4, 3, x - 15 + i * 10, .5, z + 28, mat(c, '#e88b2c')); c.far(); return {}; };
  // Akshardham, Gandhinagar: a pink sandstone mandir on a lawn, with a domed roof, many carved pillars and a pond
  L.akshardham = (c, x, z) => { const pk = mat(c, '#e8b9a0'), pk2 = mat(c, '#d9a184'); c.box(64, .1, 64, x, .32, z, c.M.grass, false, true); c.box(30, 2, 22, x, 1.3, z, pk2);
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) c.cyl(.5, .5, 7, x - 12 + i * 3, 5.8, z + s * 9, pk, 8);
    c.box(28, 1.4, 20, x, 10, z, pk2); c.dome(5, x, 10.7, z, pk); for (const [dx, dz] of [[-10, -7], [10, -7], [-10, 7], [10, 7]]) c.dome(2.2, x + dx, 10.7, z + dz, pk); c.sph(.5, x, 15.9, z, c.M.gold);
    c.box(26, .2, 10, x, .4, z + 22, mat(c, '#4fa3c7')); c.col(x, z, 15, 11); c.far(); return {}; };
  // Lakhota palace in Lakhota lake, Jamnagar: a round, towered fort pavilion on a little island
  L.lakhota = (c, x, z) => { const st = mat(c, '#d8c9a3'); c.box(64, .1, 64, x, .32, z, c.M.plaza || st, false, true); c.cyl(11, 12, 7, x, 3.8, z, st, 16); c.cyl(12.2, 12.2, 1, x, 7.6, z, mat(c, '#bfae86'), 16);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; c.cyl(1.8, 2, 9, x + Math.cos(a) * 11.5, 4.8, z + Math.sin(a) * 11.5, st, 10); c.dome(1.9, x + Math.cos(a) * 11.5, 9.3, z + Math.sin(a) * 11.5, st); }
    c.dome(5, x, 7.6, z, mat(c, '#e9dfc4')); c.col(x, z, 12, 12); c.far(); return {}; };
  // Mahabat Maqbara, Junagadh: silver-grey onion domes, spiral-stair minarets and horseshoe arches
  L.mahabat = (c, x, z) => { const st = mat(c, '#d9d0bf'), st2 = mat(c, '#b9ad97'); c.box(64, .1, 64, x, .32, z, c.M.plaza || st2, false, true); c.box(20, 10, 20, x, 5.3, z, st);
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { c.box(3, 4.6, .3, x - 7.5 + i * 5, 3, z + s * 10.05, mat(c, '#4a3d33')); c.torus(1.5, .25, x - 7.5 + i * 5, 5.3, z + s * 10.1, st2); }
    const onion = (r, ox, oy, oz) => { c.sph(r, ox, oy + r * .8, oz, st); c.cone(r * .55, r * 1.2, ox, oy + r * 2.2, oz, st, 10); c.sph(.25, ox, oy + r * 2.9, oz, c.M.gold); };
    onion(4.6, x, 10.3, z); for (const [dx, dz] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) onion(1.9, x + dx, 10.3, z + dz);
    for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) c.cyl(1.3, 1.4, 3.4, x + s * 15, 2 + k * 3.4, z + 8, k % 2 ? st2 : st, 10); onion(1.5, x + s * 15, 20.6, z + 8); }
    c.col(x, z, 11, 11); c.far(); return {}; };
  // Kirti Mandir, Porbandar: the birthplace memorial of Gandhi, a tall pale tower over a two-storey house
  L.kirtiMandir = (c, x, z) => { const cr = mat(c, '#efe4cc'), tr = mat(c, '#c97a4a'); c.box(30, 8, 18, x, 4.3, z, cr); c.box(31, .6, 19, x, 8.6, z, tr);
    for (let k = 0; k < 6; k++) c.box(9 - k * 1.1, 4, 9 - k * 1.1, x, 10.9 + k * 4, z - 1, k % 2 ? tr : cr); c.cone(1.6, 3, x, 36.4, z - 1, cr, 8); c.flag(x, 38.2, z - 1);
    for (let i = 0; i < 6; i++) c.box(2.2, 4.4, .3, x - 11 + i * 4.4, 3, z + 9.1, mat(c, '#4a3d33')); c.col(x, z, 15, 9); c.far(); return {}; };
  // Junagarh Fort, Bikaner: red sandstone walls with round bastions, palace blocks with jharokhas and chhatris
  L.junagarh = (c, x, z) => { const rs = mat(c, '#b8553a'), rs2 = mat(c, '#9c4630'), cr = mat(c, '#f1d9b8'); const Y = .3;
    c.box(58, 9, 2, x, Y + 4.5, z + 27, rs2); c.box(58, 9, 2, x, Y + 4.5, z - 27, rs2); c.box(2, 9, 54, x - 29, Y + 4.5, z, rs2); c.box(2, 9, 54, x + 29, Y + 4.5, z, rs2);
    for (const [dx, dz] of [[-29, -27], [29, -27], [-29, 27], [29, 27], [0, 27], [-29, 0], [29, 0]]) { c.cyl(3.4, 3.8, 11, x + dx, Y + 5.5, z + dz, rs, 12); c.box(7.6, .6, 7.6, x + dx, Y + 11.2, z + dz, rs2); }
    c.box(8, 7, 3, x, Y + 3.5, z + 28.4, rs); c.box(3.8, 5, .4, x, Y + 2.5, z + 30, mat(c, '#3a2a20'));
    for (const [bx, bz, w, h] of [[-12, -8, 18, 18], [10, -10, 16, 22], [0, 8, 26, 14]]) { c.box(w, h, 12, x + bx, Y + h / 2, z + bz, rs); for (let i = 0; i < Math.floor(w / 4); i++) { c.box(2.2, 2.6, 1.2, x + bx - w / 2 + 2 + i * 4, Y + h - 4, z + bz + 6.4, cr); c.dome(1.1, x + bx - w / 2 + 2 + i * 4, Y + h - 2.7, z + bz + 6.6, cr); }
      for (const s of [-1, 1]) { c.box(3, .3, 3, x + bx + s * (w / 2 - 2), Y + h + 2, z + bz, cr); for (const q of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) c.cyl(.12, .12, 2, x + bx + s * (w / 2 - 2) + q[0] * 1.2, Y + h + 1, z + bz + q[1] * 1.2, cr, 5); c.dome(1.6, x + bx + s * (w / 2 - 2), Y + h + 2.15, z + bz, cr); } }
    c.col(x, z - 27, 30, 1.5); c.col(x - 29, z, 1.5, 28); c.col(x + 29, z, 1.5, 28); c.col(x - 18, z + 27, 12, 1.5); c.col(x + 18, z + 27, 12, 1.5); c.far(); return { open: true }; };
  // Vijay Stambh, Chittorgarh: the nine-storey victory tower on the fort, with the fort wall behind
  L.vijayStambh = (c, x, z) => { const st = mat(c, '#c9a77a'), st2 = mat(c, '#a8865a'); const Y = .3; c.box(64, .1, 64, x, Y + .02, z, mat(c, '#b79f78'), false, true);
    c.box(10, 1.2, 10, x, Y + .6, z, st2); for (let k = 0; k < 9; k++) { const w = 7 - k * .35; c.box(w, 3.6, w, x, Y + 3 + k * 4, z, st); c.box(w + 1.4, .5, w + 1.4, x, Y + 4.9 + k * 4, z, st2); for (const s of [-1, 1]) { c.box(1.6, 2, .3, x + s * 1.6, Y + 3 + k * 4, z + w / 2 + .1, mat(c, '#3a2a20')); } }
    c.box(6.4, 1.2, 6.4, x, Y + 39.4, z, st2); c.dome(2.8, x, Y + 40, z, st); c.flag(x, Y + 43, z);
    c.box(60, 6, 3, x, Y + 3, z - 28, st2); for (let i = 0; i < 12; i++) c.box(2, 1.4, 3, x - 27 + i * 5, Y + 6.7, z - 28, st2); c.col(x, z, 5.5, 5.5); c.col(x, z - 28, 30, 1.6); c.far(); return { open: true }; };
  // Ujra Mosque, Kavaratti: a small whitewashed mosque with a tiled roof, carved wooden ceiling and a well, among palms
  L.ujraMosque = (c, x, z) => { const wh = mat(c, '#f6f3ea'), tl = mat(c, '#9c4a32'), gr = mat(c, '#2fa36b'); c.box(64, .1, 64, x, .32, z, c.M.sand, false, true);
    c.box(14, 5, 10, x, 2.8, z, wh); c.roof(16, 3.4, 12, x, 5.3, z, tl); c.box(6, 3.8, 4, x, 2.2, z + 6.6, wh); c.roof(7, 2, 5, x, 4.1, z + 6.6, tl); c.cyl(.6, .7, 8, x + 9, 4.3, z - 3, wh, 8); c.dome(.9, x + 9, 8.3, z - 3, gr);
    c.cyl(1.4, 1.4, 1, x - 10, .8, z + 6, wh, 12); for (let i = 0; i < 9; i++) c.palm(x - 26 + c.rnd() * 52, z - 26 + c.rnd() * 14); c.col(x, z, 7, 5); c.far(); return { open: true }; };
  // a Lakshadweep lagoon beach: palms, an upturned odam (wooden boat), beach huts and a dive shack
  L.lagoonBeach = (c, x, z) => { const wd = mat(c, '#8a5a3a'), th = mat(c, '#c9a45a');
    for (let i = 0; i < 12; i++) { const a = c.rnd() * 6.28, r = 12 + c.rnd() * 22; c.palm(x + Math.cos(a) * r, z + Math.sin(a) * r); }
    for (let i = 0; i < 3; i++) { const hx = x - 8 + i * 8, hz = z + 6; c.box(5, 2.6, 4, hx, 1.6, hz, wd); c.roof(6.4, 2.4, 5.4, hx, 2.9, hz, th); }
    c.box(1.6, .7, 7, x + 10, .45, z - 6, mat(c, '#2f7fc1')); c.sign('LAGOON DIVE', x - 8, 4.4, z + 3.9, 0, 4, .8, '#ffffff', '#1a8fb0'); c.col(x, z + 6, 11, 2.2); c.far(); return {}; };
  // Kumbhalgarh: the second-longest wall in the world snaking over the Aravalli ridge, with a palace on top
  L.kumbhalgarh = (c, x, z) => { const st = mat(c, '#a39272'), st2 = mat(c, '#8b7b5c'); c.cone(46, 26, x, 13, z, mat(c, '#7f8a55'), 10);
    const P = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * 6.283; P.push([x + Math.cos(a) * (60 + Math.sin(a * 3) * 10), z + Math.sin(a) * (50 + Math.cos(a * 2) * 8)]); }
    for (let i = 1; i < P.length; i++) { const [ax, az] = P[i - 1], [bx, bz] = P[i]; const L2 = Math.hypot(bx - ax, bz - az); c.boxRot(L2 + 1, 7, 4.5, (ax + bx) / 2, 3.5, (az + bz) / 2, Math.atan2(bx - ax, bz - az) + Math.PI / 2, st); if (i % 3 === 0) c.cyl(3.4, 3.8, 9, ax, 4.5, az, st2, 10); }
    c.box(16, 9, 12, x, 30, z, mat(c, '#e7dcc4')); c.box(17, .6, 13, x, 34.8, z, st2); for (const s of [-1, 1]) c.dome(2.2, x + s * 6, 35.1, z, mat(c, '#e7dcc4')); c.col(x, z, 24, 24); c.far(); return {}; };
  // Lonar crater: a rim of low hills round the green crater lake, with old temples on the slopes
  L.lonarCrater = (c, x, z) => { const rim = mat(c, '#6f7a45'); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; c.cone(14, 9 + (i % 3) * 2, x + Math.cos(a) * 48, 4.5, z + Math.sin(a) * 48, rim, 7); }
    for (const a of [.4, 2.3, 4.4]) { const tx = x + Math.cos(a) * 38, tz = z + Math.sin(a) * 38; c.box(5, 4, 5, tx, 2, tz, mat(c, '#7d756a')); c.cone(3, 4, tx, 6, tz, mat(c, '#7d756a'), 4); } c.far(); return {}; };
})();
