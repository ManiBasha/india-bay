// Landmark builders, LOD 200: recognisable massing, no fine detail.
// Block specials get (c, x, z, o) with x,z = block centre and o = {arg, zone}. They sit on a 0.3 m pavement.
// Free-standing landmarks get world coordinates on ground level 0.
// Return { open:true } for walkable blocks, and { poi:[...] } to add services.
window.LANDMARKS = (function () {
  const L = {};
  const Y = 0.3;
  function pillars(c, x, z, w, d, n, h, m) { for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1) - 0.5; c.cyl(0.5, 0.5, h, x + t * w, Y + h / 2, z + d, m, 8); } }
  function chhatri(c, x, y, z, r, m) { for (const [dx, dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) c.cyl(r * .12, r * .12, r * 1.2, x + dx * r * .7, y + r * .6, z + dz * r * .7, m, 6); c.box(r * 2, r * .2, r * 2, x, y + r * 1.25, z, m); c.dome(r, x, y + r * 1.3, z, m); }
  function shikhara(c, x, y, z, r, h, m, top) { const tiers = 5; for (let i = 0; i < tiers; i++) { const t = i / tiers; c.cyl(r * (1 - t * .75), r * (1 - (t + 1 / tiers) * .75), h / tiers, x, y + h * t + h / tiers / 2, z, m, 8); } c.sph(r * .28, x, y + h + r * .2, z, top || c.M.gold); }
  function wallRing(c, x, z, w, d, h, th, m, tower) { c.box(w, h, th, x, Y + h / 2, z - d / 2, m); c.box(w, h, th, x, Y + h / 2, z + d / 2, m); c.box(th, h, d, x - w / 2, Y + h / 2, z, m); c.box(th, h, d, x + w / 2, Y + h / 2, z, m);
    if (tower) for (const [dx, dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) c.cyl(tower, tower * 1.1, h + 3, x + dx * w / 2, Y + (h + 3) / 2, z + dz * d / 2, m, 10); }
  function trees(c, x, z, n, r, s) { for (let i = 0; i < n; i++) { const a = c.rnd() * 6.28, rr = r * (.55 + c.rnd() * .45); c.tree(x + Math.cos(a) * rr, z + Math.sin(a) * rr, s || .9); } }

  /* ---------- Mumbai ---------- */
  L.gateway = (c, x, z) => { const M = c.M, ax = x + 18; c.box(8, 17, 7, ax, Y + 8.5, z - 7.5, M.stone); c.box(8, 17, 7, ax, Y + 8.5, z + 7.5, M.stone); c.box(8, 6, 22, ax, Y + 20, z, M.stone); c.box(9, 1, 23, ax, Y + 23.4, z, M.cream);
    c.torus(4, .9, ax, Y + 13, z, M.stone); for (const dz of [-9.5, 9.5]) for (const dx of [-3, 3]) { c.cyl(1, 1, 3, ax + dx, Y + 25.4, z + dz, M.stone, 10); c.dome(1.1, ax + dx, Y + 26.9, z + dz, M.stone); }
    c.dome(3, ax, Y + 23.9, z, M.stone); c.col(ax, z - 7.5, 4, 3.5); c.col(ax, z + 7.5, 4, 3.5); c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); trees(c, x - 10, z, 8, 22); return { open: true }; };
  L.csmt = (c, x, z) => { const M = c.M; c.box(54, 14, 18, x, Y + 7, z, M.station); c.box(55, 1.2, 19, x, Y + 14.6, z, M.cream); c.box(55, 1.2, 19, x, Y + 5, z, M.cream);
    c.box(11, 30, 11, x, Y + 15, z - 3, M.station); c.box(12, 1.2, 12, x, Y + 30.6, z - 3, M.cream); c.cone(7, 12, x, Y + 37.2, z - 3, M.station, 4); c.dome(5.5, x, Y + 31, z - 3, M.station);
    for (const dx of [-24, 24]) { c.box(6, 20, 6, x + dx, Y + 10, z, M.station); c.cone(4.6, 7, x + dx, Y + 23.5, z, M.station, 4); }
    for (let i = -4; i <= 4; i++) if (i) c.box(2.4, 5, .4, x + i * 5.5, Y + 9.5, z - 9.1, M.cream); c.col(x, z, 28, 10);
    return { poi: [{ type: 'station', name: 'CSMT Railway Station', side: 'n', t: 0 }] }; };
  L.maidan = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true); c.box(4, .06, 22, x, Y + .1, z, M.dirt, false, true); trees(c, x, z, 22, 30); return { open: true }; };
  L.wankhede = (c, x, z) => { const M = c.M; c.cyl(28, 28, .1, x, Y + .05, z, M.grass, 24); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; const g = c.boxRot(9, 10, 6, x + Math.cos(a) * 29, Y + 5, z + Math.sin(a) * 29, -a, i % 6 === 0 ? M.white : M.blue); }
    for (const a of [.8, 2.4, 3.9, 5.5]) { c.cyl(.5, .7, 34, x + Math.cos(a) * 32, Y + 17, z + Math.sin(a) * 32, M.pole, 6); c.box(4, 2, 1, x + Math.cos(a) * 32, Y + 34, z + Math.sin(a) * 32, M.lampBox); }
    c.col(x, z, 32, 32); return {}; };
  L.siddhivinayak = (c, x, z) => { const M = c.M; c.box(20, 10, 20, x, Y + 5, z, M.marble); shikhara(c, x, Y + 10, z, 7, 14, M.marble); c.dome(3, x, Y + 24.5, z, M.gold); c.flag(x, Y + 30, z); c.col(x, z, 11, 11); return { poi: [{ type: 'food', name: 'Flower and modak stall', side: 's', t: 14, extra: 'MH' }] }; };
  L.policeHQ = (c, x, z) => { const M = c.M; c.box(40, 12, 24, x + 4, Y + 6, z, M.white); c.box(41, 1.4, 25, x + 4, Y + 9, z, M.blue); c.box(41, .8, 25, x + 4, Y + 12.4, z, M.blue); c.box(8, 5, 26, x - 6, Y + 2.5, z, M.blue); c.col(x + 4, z, 21, 13); return { poi: [{ type: 'police', name: 'Police Station', side: 'w', t: 0 }] }; };
  L.hospitalBlock = (c, x, z) => { const M = c.M; c.box(44, 18, 30, x, Y + 9, z, M.white); c.box(10, 3, 32, x, Y + 19.5, z, M.white); c.box(1.2, 4, .4, x, Y + 15, z - 15.3, M.red); c.box(4, 1.2, .4, x, Y + 15, z - 15.3, M.red); c.col(x, z, 23, 16); return { poi: [{ type: 'hospital', name: 'City Hospital', side: 'n', t: 0 }] }; };
  L.biz = (c, x, z) => { c.building(x - 13, z - 13, 22, 22, 70 + c.rnd() * 50, 'glass'); c.building(x + 13, z + 13, 22, 22, 60 + c.rnd() * 50, 'glass'); c.building(x + 13, z - 13, 20, 20, 30 + c.rnd() * 20); c.building(x - 13, z + 13, 20, 20, 30 + c.rnd() * 20); return {}; };
  L.beachBlock = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.sand, false, true); for (let i = 0; i < 7; i++) c.palm(x - 24 + c.rnd() * 10, z - 28 + i * 9);
    for (let i = 0; i < 5; i++) { const ux = x - 10 + c.rnd() * 30, uz = z - 25 + c.rnd() * 50; c.cyl(.06, .06, 2.4, ux, Y + 1.2, uz, M.pole, 4); c.cone(1.6, .7, ux, Y + 2.6, uz, c.pick(M.awn), 8); }
    return { open: true, poi: [{ type: 'food', name: 'Beach chaat stall', side: 'e', t: -10, extra: 'BEACH' }] }; };
  function track(c, x, z) { const M = c.M; c.box(10, .25, 82, x, .32, z, M.ballast, false, true); for (const dx of [-2.2, 2.2]) { c.box(.12, .15, 82, x + dx - .75, .5, z, M.steel, false); c.box(.12, .15, 82, x + dx + .75, .5, z, M.steel, false); }
    for (let k = -40; k < 40; k += 2) c.box(4.2, .1, .4, x - 2.2, .42, z + k, M.wood, false), c.box(4.2, .1, .4, x + 2.2, .42, z + k, M.wood, false); }
  L.rail = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.ballast, false, true); track(c, x, z); c.box(.3, 1.6, 62, x - 8, Y + .8, z, M.concrete); c.box(.3, 1.6, 62, x + 8, Y + .8, z, M.concrete);
    c.building(x - 22, z, 16, 50, 10 + c.rnd() * 14); c.building(x + 22, z, 16, 50, 10 + c.rnd() * 14); c.col(x, z, 30, 31); return { rail: true }; };
  L.localStation = (c, x, z, o) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.ballast, false, true); track(c, x, z); for (const dx of [-6.5, 6.5]) { c.box(3.5, 1, 56, x + dx, Y + .5, z, M.concrete); c.box(4, .3, 50, x + dx, Y + 5, z, M.roofTin); pillars(c, x + dx, z - 22, 0, 0, 1, 4.5, M.pole); pillars(c, x + dx, z + 22, 0, 0, 1, 4.5, M.pole); }
    c.box(14, 6, 10, x + 20, Y + 3, z, M.cream); c.box(15, .5, 11, x + 20, Y + 6.2, z, M.red); c.sign(o.arg + ' ' + 'स्टेशन', x + 20, Y + 8, z - 5.3, 0, 12, 2.4, '#ffffff', '#c8102e'); c.col(x, z, 30, 31);
    return { rail: true, poi: [{ type: 'local', name: o.arg + ' local station', side: 'e', t: 0, extra: o.arg }] }; };

  /* ---------- Rest of Maharashtra ---------- */
  L.shaniwarWada = (c, x, z) => { const M = c.M; wallRing(c, x, z, 52, 52, 10, 2.4, M.stone, 4); c.box(14, 15, 6, x, Y + 7.5, z - 26, M.stone); c.box(5, 9, 6.4, x, Y + 4.5, z - 26, M.dark);
    c.box(46, .1, 46, x, Y + .02, z, M.grass, false, true); for (let i = 0; i < 4; i++) c.box(6, .3, 6, x - 12 + i * 8, Y + .2, z + 6, M.marble); c.col(x, z, 28, 28); return { poi: [{ type: 'food', name: 'Pune misal house', side: 's', t: 18, extra: 'MH' }] }; };
  L.dagdusheth = (c, x, z) => { const M = c.M; c.box(18, 9, 14, x, Y + 4.5, z, M.cream); for (let i = 0; i < 3; i++) c.box(16 - i * 4, 2.5, 12 - i * 3, x, Y + 10 + i * 2.5, z, M.gold); shikhara(c, x, Y + 17, z, 3, 8, M.gold); c.flag(x, Y + 27, z); c.col(x, z, 10, 8); return {}; };
  L.tigerPoint = (c, x, z) => { const M = c.M; c.box(18, .4, 8, x, .4, z, M.concrete); c.box(18, 1, .2, x, 1.1, z - 4, M.pole); c.box(3, 2.6, 2.2, x + 6, 1.4, z + 2, M.kiosk); c.sign('TIGER POINT', x, 4.2, z + 4, 0, 10, 2, '#1d1433', '#ffc93c'); return { poi: [{ type: 'food', name: 'Chikki and bhutta stall', x: x + 6, z: z + 5, rot: 0, extra: 'MH' }] }; };
  L.arthurSeat = (c, x, z) => { const M = c.M; c.box(14, .4, 10, x, .4, z, M.stone); c.box(.2, 1, 10, x - 7, 1.1, z, M.pole); c.sign("ARTHUR'S SEAT", x, 3.6, z, Math.PI / 2, 10, 2, '#ffffff', '#1f8a4c'); return {}; };
  L.kolabaFort = (c, x, z) => { const M = c.M; c.cyl(28, 30, 1.6, x, -.2, z, M.basalt, 18); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; c.boxRot(11, 7, 2.2, x + Math.cos(a) * 23, 3.5, z + Math.sin(a) * 23, -a + Math.PI / 2, M.basalt); if (i % 2 === 0) c.cyl(3, 3.2, 8.5, x + Math.cos(a) * 24, 4.2, z + Math.sin(a) * 24, M.basalt, 10); }
    c.far(); return {}; };
  L.ganpatipuleTemple = (c, x, z) => { const M = c.M; c.box(10, 5, 8, x, 2.5, z, M.redstone); shikhara(c, x, 5, z, 3.6, 9, M.redstone); c.flag(x, 15.5, z); for (let i = 0; i < 5; i++) c.palm(x - 12 + i * 6, z + 10); c.col(x, z, 5.5, 4.5); return {}; };
  L.ramkund = (c, x, z) => { const M = c.M; for (const s of [-1, 1]) for (let i = 0; i < 5; i++) c.box(60, .5, 3, x, .25 + i * .5, z + s * (17 + i * 3), M.stone, false, true);
    for (let i = 0; i < 4; i++) { const tx = x - 22 + i * 15; shikhara(c, tx, 2.6, z - 32, 2.2, 6, M.temple); c.col(tx, z - 32, 2.5, 2.5); } return {}; };
  L.trimbak = (c, x, z) => { const M = c.M; c.box(30, 1.5, 30, x, .75, z, M.blackstone); c.box(14, 8, 14, x, 5.5, z, M.blackstone); shikhara(c, x, 9.5, z, 6, 22, M.blackstone); for (const dx of [-11, 11]) shikhara(c, x + dx, 1.5, z + 8, 2.4, 9, M.blackstone); c.flag(x, 34, z); c.col(x, z, 15, 15); c.far(); return {}; };
  L.saiTemple = (c, x, z) => { const M = c.M; c.box(30, 9, 22, x, Y + 4.5, z, M.marble); c.dome(6, x, Y + 9, z, M.gold); c.cyl(1.2, 1.2, 4, x, Y + 16, z, M.gold, 8); for (let i = 0; i < 6; i++) c.box(.15, 1, 18, x - 14 + i * 1.2, Y + .5, z + 20, M.pole);
    c.col(x, z, 16, 12); return { poi: [{ type: 'food', name: 'Prasad and chai counter', side: 's', t: -14, extra: 'MH' }] }; };
  L.ellora = (c, x, z) => { const M = c.M; for (let i = 0; i < 9; i++) { const a = -.6 + i * .15, cx = x + Math.sin(a) * 120, cz = z - Math.cos(a) * 30 - 30; c.boxRot(28, 32, 18, cx, 16, cz, -a, M.basalt); c.boxRot(6, 7, 1, cx + Math.cos(a) * 0, 4, cz + 9.2, -a, M.dark); c.col(cx, cz, 13, 9); }
    const kx = x, kz = z + 10; c.box(46, 1, 30, kx, .2, kz, M.dark, false, true); c.box(26, 10, 16, kx, 5, kz, M.basalt); shikhara(c, kx, 10, kz, 7, 14, M.basalt, M.basalt); c.col(kx, kz, 14, 9); c.far(); return {}; };
  L.ajanta = (c, x, z) => { const M = c.M; for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.15 + i / 12 * .7), cx = x + Math.cos(a) * 70, cz = z - Math.sin(a) * 55; c.boxRot(18, 28, 14, cx, 14, cz, a - Math.PI / 2, M.basalt); c.boxRot(5, 6, 1, cx - Math.cos(a) * 7.2, 3.5, cz + Math.sin(a) * 7.2, a - Math.PI / 2, M.dark); c.col(cx, cz, 9, 9); }
    c.far(); return {}; };
  L.bibiMaqbara = (c, x, z) => { const M = c.M; c.box(44, 2, 44, x, Y + 1, z, M.marble); c.box(16, 10, 16, x, Y + 7, z, M.marble); c.cyl(6, 6, 3, x, Y + 13.5, z, M.marble, 16); c.dome(7, x, Y + 15, z, M.marble); c.cone(.8, 4, x, Y + 23.5, z, M.gold, 8);
    for (const [dx, dz] of [[-19,-19],[19,-19],[-19,19],[19,19]]) { c.cyl(1.2, 1.5, 20, x + dx, Y + 12, z + dz, M.marble, 10); c.dome(1.6, x + dx, Y + 22, z + dz, M.marble); }
    c.box(4, .2, 16, x, Y + 2.1, z + 32, M.waterBox); c.col(x, z, 22, 22); c.far(); return {}; };
  L.zeroMile = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); c.box(3, 6, 3, x, Y + 3, z, M.stone); c.cone(2.1, 2, x, Y + 7, z, M.stone, 4); for (const [dx, dz] of [[-4,0],[4,0],[0,-4],[0,4]]) c.box(1, 1.6, 2.4, x + dx, Y + .8, z + dz, M.bronze); trees(c, x, z, 12, 26); c.col(x, z, 5, 5); return { open: true }; };
  L.deekshabhoomi = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); c.cyl(16, 17, 8, x, Y + 4, z, M.marble, 24); c.dome(16, x, Y + 8, z, M.marble); c.cyl(1, 1, 5, x, Y + 26, z, M.marble, 8); c.col(x, z, 17, 17); c.far(); return { open: true }; };
  L.motiDamanFort = (c, x, z) => { const M = c.M; wallRing(c, x, z, 56, 56, 7, 2.2, M.basalt, 3.5); c.box(52, .1, 52, x, Y + .02, z, M.grass, false, true); c.box(10, 12, 18, x + 6, Y + 6, z, M.white); c.cone(3, 6, x + 6, Y + 15, z - 7, M.white, 4); c.col(x, z, 29, 29); return {}; };

  /* ---------- Gujarat ---------- */
  L.diamondBourse = (c, x, z) => { const M = c.M; c.box(56, 6, 10, x, Y + 3, z, M.glassBox); for (let i = 0; i < 5; i++) c.building(x - 22 + i * 11, z + (i % 2 ? 12 : -12), 10, 12, 42 + (i % 3) * 6, 'glass'); c.col(x, z, 30, 28); return {}; };
  L.laxmiVilas = (c, x, z) => { const M = c.M; c.box(58, 12, 20, x, Y + 6, z, M.redstone); c.box(59, 1, 21, x, Y + 12.5, z, M.cream); c.box(9, 30, 9, x + 8, Y + 15, z, M.redstone); c.dome(4.6, x + 8, Y + 30, z, M.redstone);
    for (const dx of [-24, -12, 20]) { c.box(6, 16, 6, x + dx, Y + 8, z - 7, M.redstone); c.dome(3, x + dx, Y + 16, z - 7, M.redstone); } c.box(64, .1, 22, x, Y + .02, z + 20, M.grass, false, true); c.col(x, z, 30, 11); c.far(); return {}; };
  L.riverfront = (c, x, z, o) => { const M = c.M; for (const dx of [-30, 30]) { c.box(10, .1, 80, x + dx, Y + .03, z, M.plaza, false, true); for (let k = -36; k <= 36; k += 12) c.tree(x + dx + (dx > 0 ? 3 : -3), z + k, .7); }
    if (o.arg === 'bridge') { for (let i = 0; i < 9; i++) { const t = i / 8 - .5; c.box(6, .5, 1.4, x + t * 56, 2.6 + Math.cos(t * Math.PI) * 2.2, z, i % 2 ? M.awn[1] : M.awn[0]); } c.box(56, .4, 6, x, 2.4, z, M.concrete); }
    return { open: true }; };
  L.sabarmatiAshram = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.dirt, false, true); for (const [dx, dz] of [[-12,-8],[10,-10],[-6,12]]) { c.box(12, 3.2, 8, x + dx, Y + 1.6, z + dz, M.cream); c.roof(13, 3, 9, x + dx, Y + 3.2, z + dz, M.tile); c.col(x + dx, z + dz, 6.5, 4.5); }
    trees(c, x, z, 10, 28); c.box(1, .8, 1, x + 2, Y + .4, z + 2, M.wood); return { open: true }; };
  L.kankaria = (c, x, z) => { const M = c.M; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; c.boxRot(9.5, .1, 3, x + Math.cos(a) * 38, Y + .03, z + Math.sin(a) * 38, -a + Math.PI / 2, M.plaza, false, true); } c.box(4, 3, 4, x + 34, Y + 1.5, z - 20, M.kiosk); trees(c, x, z, 14, 31); return { open: true }; };
  L.adalaj = (c, x, z) => { const M = c.M; c.box(16, .3, 46, x, .15, z, M.stone, false, true); for (let i = 0; i < 4; i++) { c.box(14 - i * 2.6, .6, 10 - i * 1.6, x, .45 - i * .01, z + 8, M.stone); } c.box(6, .1, 4, x, .8, z + 8, M.waterBox);
    for (let i = 0; i < 4; i++) { for (const dx of [-6, 6]) c.cyl(.4, .4, 5, x + dx, 2.8, z - 18 + i * 6, M.stone, 6); c.box(14, .6, 4, x, 5.5, z - 18 + i * 6, M.stone); } c.col(x, z, 8, 23); return {}; };
  L.stadium = (c, x, z) => { const M = c.M; c.cyl(48, 48, .1, x, .05, z, M.grass, 32); for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; c.boxRot(9, 16, 10, x + Math.cos(a) * 54, 8, z + Math.sin(a) * 50, -a, i % 5 ? M.white : M.blue); }
    c.box(110, 2, 2, x, 22, z, M.white); for (const a of [.7, 2.4, 3.9, 5.6]) c.cyl(.6, .8, 40, x + Math.cos(a) * 62, 20, z + Math.sin(a) * 58, M.pole, 6); c.col(x, z, 60, 56); c.far(); return {}; };
  L.giftCity = (c, x, z) => { c.building(x - 14, z, 20, 20, 95, 'glass'); c.building(x + 14, z + 4, 18, 18, 85, 'glass'); c.building(x, z - 26, 16, 16, 40, 'glass'); c.col(x, z - 4, 26, 32); c.far(); return {}; };
  L.dwarkadhish = (c, x, z) => { const M = c.M; c.box(24, 4, 24, x, Y + 2, z, M.stone); for (let i = 0; i < 4; i++) c.box(18 - i * 2, 4, 18 - i * 2, x, Y + 6 + i * 4, z, M.temple); shikhara(c, x, Y + 20, z, 6, 22, M.temple); c.flag(x, Y + 46, z, true); c.col(x, z, 12, 12); c.far(); return {}; };
  L.somnathTemple = (c, x, z) => { const M = c.M; c.box(40, 2, 30, x, 1, z, M.stone); c.box(18, 10, 22, x - 6, 7, z, M.temple); shikhara(c, x + 8, 2, z, 8, 34, M.temple); c.flag(x + 8, 40, z, true); c.box(60, 1.6, 2, x, .8, z + 18, M.concrete); c.col(x, z, 20, 15); c.far(); return {}; };
  L.girGate = (c, x, z) => { const M = c.M; c.box(2, 7, 2, x - 9, 3.5, z, M.wood); c.box(2, 7, 2, x + 9, 3.5, z, M.wood); c.box(22, 1.4, 2.4, x, 7.2, z, M.wood); c.sign('GIR NATIONAL PARK', x, 9.6, z, 0, 18, 2.4, '#ffe9b8', '#3b5d2a');
    return { poi: [{ type: 'safari', name: 'Gir lion safari', x: x + 14, z: z + 4, rot: 0 }] }; };
  L.tentCity = (c, x, z) => { const M = c.M; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const tx = x - 40 + i * 16, tz = z - 20 + j * 14; c.box(7, 2.4, 6, tx, 1.2, tz, M.white); c.roof(8, 2, 7, tx, 2.4, tz, M.white); } c.box(16, .8, 10, x, .4, z + 40, M.wood); c.col(x, z, 48, 30);
    return { poi: [{ type: 'lodge', name: 'Rann Utsav tents', x: x, z: z + 34, rot: 0 }, { type: 'food', name: 'Kutchi food court', x: x + 24, z: z + 34, rot: 0, extra: 'GJ' }] }; };
  L.kalaDungar = (c, x, z) => { const M = c.M; c.box(12, .4, 8, x + 30, .4, z + 40, M.stone); c.sign('KALA DUNGAR', x + 30, 3.4, z + 44, 0, 10, 2, '#ffffff', '#1d1433'); return {}; };
  L.ainaMahal = (c, x, z) => { const M = c.M; c.box(40, 14, 22, x, Y + 7, z, M.cream); for (let i = 0; i < 6; i++) c.box(4, 4, 1.6, x - 15 + i * 6, Y + 9, z + 11.6, M.wood); c.dome(4, x, Y + 14, z, M.cream); c.col(x, z, 21, 12); return {}; };

  /* ---------- Rajasthan ---------- */
  L.dilwara = (c, x, z) => { const M = c.M; c.box(48, 5, 40, x, Y + 2.5, z, M.marble); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) c.dome(2.3, x - 18 + i * 9, Y + 5, z - 14 + j * 9, M.marble); shikhara(c, x, Y + 5, z, 5, 10, M.marble); c.col(x, z, 25, 21); return {}; };
  L.guruShikhar = (c, x, z) => { const M = c.M; c.cyl(16, 26, 14, x, 7, z, M.rock, 10); c.box(6, 4, 6, x, 16, z, M.marble); shikhara(c, x, 18, z, 2.4, 6, M.marble); c.flag(x, 26, z); c.col(x, z, 18, 18); c.far(); return {}; };
  L.cityPalace = (c, x, z) => { const M = c.M; c.box(30, 24, 60, x - 14, Y + 12, z, M.cream); for (let i = 0; i < 5; i++) { const tz = z - 26 + i * 13; c.box(7, 8, 7, x - 14, Y + 28, tz, M.cream); c.dome(3, x - 14, Y + 32, tz, M.cream); }
    for (let i = 0; i < 8; i++) c.box(1.4, 2.4, 2.4, x - 29.4, Y + 16, z - 26 + i * 7.4, M.wood); c.col(x - 14, z, 16, 31); c.far(); return {}; };
  L.lakePalace = (c, x, z) => { const M = c.M; c.box(34, 8, 30, x, 4, z, M.marble); c.box(22, 6, 18, x, 11, z, M.marble); for (const [dx, dz] of [[-12,-10],[12,-10],[-12,10],[12,10]]) chhatri(c, x + dx, 8, z + dz, 2.2, M.marble); c.dome(4, x, 14, z, M.marble); c.col(x, z, 17, 15); return {}; };
  L.pushkarGhats = (c, x, z) => { const M = c.M; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283; for (let k = 0; k < 3; k++) c.boxRot(13, .4, 2, x + Math.cos(a) * (55 + k * 2) * 1.0, .2 + k * .4, z + Math.sin(a) * (45 + k * 2), -a + Math.PI / 2, M.marble, false, true);
      if (i % 4 === 0) { const tx = x + Math.cos(a) * 64, tz = z + Math.sin(a) * 54; c.box(5, 5, 5, tx, 2.5, tz, M.marble); c.dome(2.4, tx, 5, tz, M.marble); c.col(tx, tz, 2.6, 2.6); } }
    const bx = x - 70, bz = z; c.box(10, 6, 10, bx, 3, bz, M.marble); shikhara(c, bx, 6, bz, 3.6, 10, M.redstone); c.flag(bx, 17, bz); c.col(bx, bz, 5, 5); return {}; };
  L.ajmerDargah = (c, x, z) => { const M = c.M; c.box(14, 16, 4, x, Y + 8, z + 26, M.marble); c.box(5, 9, 4.4, x, Y + 4.5, z + 26, M.dark); c.box(20, 8, 20, x, Y + 4, z, M.marble); c.dome(8, x, Y + 8, z, M.marble); c.cone(.6, 3, x, Y + 17, z, M.gold, 8);
    for (const dx of [-12, 12]) c.cyl(.9, 1.1, 16, x + dx, Y + 8, z - 8, M.marble, 8); c.col(x, z, 11, 11); c.col(x, z + 26, 7, 2); return {}; };
  L.hawaMahal = (c, x, z) => { const M = c.M; const tiers = [[40, 8], [36, 6], [30, 6], [22, 5], [14, 5]]; let y = Y, d = 10;
    for (const [w, h] of tiers) { c.box(w, h, d, x, y + h / 2, z + 4, M.pink); for (let i = 0; i < Math.floor(w / 3.4); i++) { const wx = x - w / 2 + 1.7 + i * 3.4; c.box(2.4, h * .6, 1.2, wx, y + h * .5, z + 4 + d / 2 + .5, M.pinkLight); c.dome(1.2, wx, y + h * .8, z + 4 + d / 2 + .5, M.pink); } y += h; d -= 1.4; }
    c.col(x, z + 4, 20, 6); c.far(); return {}; };
  L.jantarMantar = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); c.wedge(4, 22, 30, x, Y, z - 6, M.stone); for (const dx of [-6, 6]) c.box(2, 10, 18, x + dx, Y + 5, z - 6, M.stone);
    for (const [dx, dz] of [[-20, 18], [20, 18]]) { c.cyl(7, 7, 1.6, x + dx, Y + .8, z + dz, M.stone, 20); c.cyl(.6, .6, 4, x + dx, Y + 3, z + dz, M.stone, 6); } c.col(x, z - 6, 8, 15); return { open: true }; };
  L.cityPalaceJaipur = (c, x, z) => { const M = c.M; c.box(48, 10, 40, x, Y + 5, z, M.pink); for (let i = 0; i < 7; i++) c.box(16 - i, 3.6, 12 - i * .6, x, Y + 11.8 + i * 3.6, z - 6, i % 2 ? M.cream : M.pink); chhatri(c, x, Y + 37, z - 6, 2.5, M.cream); c.flag(x, Y + 44, z - 6); c.col(x, z, 25, 21); c.far(); return {}; };
  L.jalMahal = (c, x, z) => { const M = c.M; c.box(28, 10, 28, x, 5, z, M.stone); c.box(28, 1, 28, x, 10.5, z, M.cream); for (const [dx, dz] of [[-13,-13],[13,-13],[-13,13],[13,13]]) chhatri(c, x + dx, 11, z + dz, 2.4, M.stone); chhatri(c, x, 11, z, 3, M.stone); c.col(x, z, 14, 14); c.far(); return {}; };
  L.amberFort = (c, x, z) => { const M = c.M; c.box(90, 12, 60, x, 6, z, M.rock); c.box(70, 10, 46, x, 17, z - 4, M.rock); c.box(60, 14, 36, x, 29, z - 6, M.stone); for (let i = 0; i < 6; i++) chhatri(c, x - 25 + i * 10, 36, z - 20, 2.4, M.stone);
    for (let i = 0; i < 10; i++) { c.box(14, 4, 2, x + 50 + i * 12, 2 + i * 2.5, z - 40 - i * 6, M.stone); c.cyl(2, 2.2, 6 + i * 2.5, x + 56 + i * 12, (6 + i * 2.5) / 2, z - 43 - i * 6, M.stone, 8); }
    c.box(30, .4, 12, x, .2, z + 40, M.stone, false, true); c.col(x, z, 46, 31); c.far(); return { poi: [{ type: 'food', name: 'Amber chai and kachori', x: x + 18, z: z + 46, rot: 0, extra: 'RJ' }] }; };
  L.ranthamboreFort = (c, x, z) => { const M = c.M; c.box(60, 10, 40, x, 5, z, M.rock); wallRing(c, x, z, 56, 36, 6, 2, M.stone, 3); c.box(10, 8, 4, x, 14, z + 18, M.stone); c.far(); c.col(x, z, 30, 20); return {}; };
  L.mehrangarh = (c, x, z) => { const M = c.M; c.box(110, 16, 70, x, 8, z, M.rock); c.box(96, 14, 56, x + 4, 23, z, M.rock); c.box(84, 26, 40, x + 4, 43, z, M.redstone); for (let i = 0; i < 6; i++) c.cyl(5, 6, 30, x - 36 + i * 15, 43, z + 20, M.redstone, 10);
    for (let i = 0; i < 6; i++) c.box(6, 3, 1.4, x - 30 + i * 12, 50, z + 20.8, M.cream); c.col(x, z, 56, 36); c.far(); return {}; };
  L.ghantaGhar = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); c.box(7, 24, 7, x, Y + 12, z, M.stone); c.box(8, 2, 8, x, Y + 25, z, M.stone); c.cone(4.6, 6, x, Y + 29, z, M.stone, 4);
    for (const [dx, dz, r] of [[0, 3.6, 0], [0, -3.6, Math.PI], [3.6, 0, Math.PI / 2], [-3.6, 0, -Math.PI / 2]]) c.clock(x + dx, Y + 19, z + dz, r); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; c.box(5, 3, 4, x + Math.cos(a) * 22, Y + 1.5, z + Math.sin(a) * 22, c.pick(M.awn)); }
    c.col(x, z, 4, 4); return { open: true, poi: [{ type: 'food', name: 'Sardar market kachori', side: 's', t: 10, extra: 'RJ' }] }; };
  L.umaidBhawan = (c, x, z) => { const M = c.M; c.box(60, 14, 28, x, Y + 7, z, M.stone); c.box(20, 10, 20, x, Y + 19, z, M.stone); c.cyl(7, 7, 6, x, Y + 27, z, M.stone, 16); c.dome(7.5, x, Y + 30, z, M.stone); for (const dx of [-24, 24]) { c.box(10, 18, 10, x + dx, Y + 9, z, M.stone); c.dome(4, x + dx, Y + 18, z, M.stone); } c.col(x, z, 30, 14); c.far(); return {}; };
  L.jaisalmerFort = (c, x, z) => { const M = c.M; c.cyl(30, 34, 6, x, Y + 3, z, M.rock, 16); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; c.cyl(3.2, 3.6, 10, x + Math.cos(a) * 28, Y + 9, z + Math.sin(a) * 28, M.gold2, 10); c.boxRot(11, 7, 2, x + Math.cos(a + .2) * 28, Y + 9.5, z + Math.sin(a + .2) * 28, -a - .2 + Math.PI / 2, M.gold2); }
    for (let i = 0; i < 9; i++) c.box(7, 6 + c.rnd() * 8, 7, x - 12 + (i % 3) * 12, Y + 10, z - 12 + Math.floor(i / 3) * 12, M.gold2); c.col(x, z, 33, 33); c.far(); return {}; };
  L.patwonHaveli = (c, x, z) => { const M = c.M; for (let i = 0; i < 3; i++) { const hx = x - 16 + i * 16; c.box(14, 20, 14, hx, Y + 10, z, M.gold2); for (let k = 0; k < 4; k++) c.box(10, 2.4, 1.4, hx, Y + 5 + k * 4, z + 7.6, M.gold2); } c.col(x, z, 24, 7); return {}; };
  L.samCamp = (c, x, z) => { const M = c.M; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; const tx = x + Math.cos(a) * 18, tz = z + Math.sin(a) * 14; c.box(5, 2.2, 5, tx, 1.1, tz, M.white); c.roof(5.6, 1.6, 5.6, tx, 2.2, tz, c.pick(M.awn)); c.col(tx, tz, 2.6, 2.6); }
    c.cyl(1.4, 1.6, .5, x, .25, z, M.dark, 10); return { poi: [{ type: 'lodge', name: 'Desert camp', x: x, z: z + 22, rot: 0 }, { type: 'food', name: 'Camp dinner', x: x + 8, z: z + 22, rot: 0, extra: 'RJ' }, { type: 'camel', name: 'Camel safari', x: x - 10, z: z + 22, rot: 0 }] }; };

  /* ---------- Big free-standing pieces ---------- */
  L.seaLink = (c) => { const M = c.M; const pts = [[2540, 8500], [2470, 8460], [2450, 8400], [2460, 8330], [2540, 8290]];
    for (let k = 0; k < pts.length - 1; k++) { const [ax, az] = pts[k], [bx, bz] = pts[k + 1]; const len = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bx - ax, bz - az);
      for (const s of [-1, 1]) c.boxRot(.5, 1, len, (ax + bx) / 2 + Math.cos(ang) * 6.6 * s, .6, (az + bz) / 2 - Math.sin(ang) * 6.6 * s, ang, M.concrete, false);
      for (let t = 0; t < len; t += 22) c.cyl(1.2, 1.2, 6, ax + (bx - ax) * t / len, -3, az + (bz - az) * t / len, M.concrete, 8); }
    const px = 2450, pz = 8400; for (const s of [-1, 1]) c.box(2.4, 64, 2.4, px + s * 4.2, 32, pz, M.concrete); c.box(11, 3, 2.6, px, 50, pz, M.concrete); c.box(11, 2, 2.6, px, 20, pz, M.concrete);
    for (const dz of [-60, -45, -30, 30, 45, 60]) c.cable(px, 60, pz, px + (dz / 60) * 8, .8, pz + dz); c.far(); return {}; };
  L.hajiAli = (c, x, z) => { const M = c.M; c.cyl(20, 22, 1.2, x, -.3, z, M.sand, 16); c.box(14, 6, 14, x, 3, z, M.marble); c.dome(5.5, x, 6, z, M.marble); c.cyl(.8, 1, 16, x + 7, 8, z - 6, M.marble, 8); c.cone(.9, 2, x + 7, 17, z - 6, M.marble, 8); c.col(x, z, 8, 8); return {}; };
  L.statueUnity = (c, x, z) => { const M = c.M; c.cyl(30, 34, 1.6, x, -.2, z, M.rock, 16); c.box(26, 14, 26, x, 7, z, M.stone); const b = M.bronze, y0 = 14;
    c.box(4.5, 36, 5, x - 3.2, y0 + 18, z, b); c.box(4.5, 36, 5, x + 3.2, y0 + 18, z, b); c.cone(9, 30, x, y0 + 44, z, b, 8); c.box(14, 22, 7, x, y0 + 50, z, b); c.box(3.6, 26, 3.6, x - 8.6, y0 + 46, z, b); c.box(3.6, 26, 3.6, x + 8.6, y0 + 46, z, b);
    c.cyl(2.2, 2.6, 4, x, y0 + 63, z, b, 8); c.sph(4.2, x, y0 + 68, z, b); c.col(x, z, 14, 14); c.far(); return { poi: [{ type: 'food', name: 'Viewing gallery cafe', x: x, z: z - 24, rot: Math.PI, extra: 'GJ' }] }; };
  L.narmadaDam = (c, x, z) => { const M = c.M; c.box(10, 24, 130, x, 8, z, M.concrete); for (let i = 0; i < 9; i++) c.box(10.4, 4, 4, x, 18, z - 48 + i * 12, M.steel); c.far(); c.col(x, z, 5, 65); return {}; };
  L.dumasBeach = (c, x, z) => { for (let i = 0; i < 6; i++) c.palm(x + 20 + c.rnd() * 20, z - 40 + i * 14); return { poi: [{ type: 'food', name: 'Dumas bhajiya stall', x: x + 32, z: z, rot: -Math.PI / 2, extra: 'BEACH' }] }; };
  L.juhuBeach = (c, x, z) => ({});
  return L;
})();
