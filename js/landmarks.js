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

  /* ================= South-West: Goa, Karnataka, Kerala ================= */
  const MC = {};
  function mat(c, hex, opts) { const k = hex + (opts ? JSON.stringify(opts) : ''); if (!MC[k]) MC[k] = new c.THREE.MeshLambertMaterial(Object.assign({ color: hex }, opts || {})); return MC[k]; }
  const LAT = '#a5552f', LAT2 = '#8f4a2a', TILE = '#a8402a', COPPER = '#4f6f5c', GRAN = '#c9c0ad', THATCH = '#b89a5a', DWOOD = '#5a3a24';
  // A box rotated about any axis, for leaning poles and tilted roofs.
  function tbox(c, w, h, d, x, y, z, rx, ry, rz, m) { const g = new c.THREE.BoxGeometry(w, h, d); if (rz) g.rotateZ(rz); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); c.add(g, m); }
  // Pitched tile roof: two sloping slabs over a w x d footprint, ridge along x (ry turns it).
  function pitch(c, w, d, x, y, z, rise, m, ry) { const a = Math.atan2(rise, d / 2), L = Math.hypot(rise, d / 2) + .4; for (const s of [-1, 1]) { const g = new c.THREE.BoxGeometry(w + .8, .35, L); g.rotateX(-s * a); g.translate(0, rise / 2, s * -d / 4); if (ry) g.rotateY(ry); g.translate(x, y, z); c.add(g, m); } }
  // Kerala roof: two-tier hipped pyramid.
  function kroof(c, w, d, x, y, z, m) { c.roof(w * 1.35, w * .45, d * 1.35, x, y, z, m); c.roof(w * .7, w * .35, d * .7, x, y + w * .38, z, m); c.cone(.5, 1.6, x, y + w * .75 + .6, z, c.M.gold, 6); }
  // Dravidian gopuram: tapering tiers and a barrel top.
  function gopuram(c, x, y, z, w, d, h, m, tiers) { tiers = tiers || 7; c.box(w, h * .18, d, x, y + h * .09, z, m); let yy = y + h * .18; const th = h * .72 / tiers;
    for (let i = 0; i < tiers; i++) { const t = 1 - i / tiers * .55; c.box(w * t, th, d * (1 - i / tiers * .35), x, yy + th / 2, z, m); c.box(w * t + .6, .3, d * (1 - i / tiers * .35) + .6, x, yy + th, z, c.M.cream); yy += th; }
    c.box(w * .42, h * .08, d * .5, x, yy + h * .04, z, m); for (let i = -2; i <= 2; i++) c.cone(.45, 1.8, x + i * w * .08, yy + h * .08 + .9, z, c.M.gold, 6); return yy + h * .1; }
  function lighthouse(c, x, z, h, a, b) { const n = 6; for (let i = 0; i < n; i++) c.cyl(2.6 - i * .18, 2.8 - i * .18, h / n, x, h / n * (i + .5), z, i % 2 ? a : b, 12); c.cyl(2, 2, 2.4, x, h + 1.2, z, c.M.glassBox, 10); c.cone(2.4, 1.8, x, h + 3.3, z, a, 10); c.col(x, z, 3, 3); }
  // Waterfalls: strands of falling water with a scrolling streak texture (animated by the game each frame),
  // a curved lip where the river pours over, white foam and spray at the bottom and a plunge pool.
  let flowTex = null, foamTex = null;
  function waterTex(c) { if (flowTex) return flowTex; const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const x = cv.getContext('2d'); x.fillStyle = 'rgba(210,232,245,.85)'; x.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 90; i++) { const sx = Math.random() * 64, sy = Math.random() * 256, l = 20 + Math.random() * 70; const g = x.createLinearGradient(0, sy, 0, sy + l); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(sx, sy, 1 + Math.random() * 3, l); x.fillRect(sx, sy - 256, 1 + Math.random() * 3, l); }
    flowTex = new c.THREE.CanvasTexture(cv); flowTex.wrapS = flowTex.wrapT = c.THREE.RepeatWrapping; flowTex.repeat.set(2, 3); (window.FLOW_TEX = window.FLOW_TEX || []).push({ t: flowTex, speed: 1.3 }); return flowTex; }
  function foam(c) { if (foamTex) return foamTex; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); x.fillStyle = 'rgba(80,140,170,.0)'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 260; i++) { const r = 2 + Math.random() * 7; x.fillStyle = `rgba(255,255,255,${.25 + Math.random() * .6})`; x.beginPath(); x.arc(Math.random() * 128, Math.random() * 128, r, 0, 6.29); x.fill(); }
    foamTex = new c.THREE.CanvasTexture(cv); foamTex.wrapS = foamTex.wrapT = c.THREE.RepeatWrapping; (window.FLOW_TEX = window.FLOW_TEX || []).push({ t: foamTex, speed: .08, x: .05 }); return foamTex; }
  // A waterfall that faces west (towards -x): fx is the cliff face, zc the middle, w the width and h the height.
  function falls(c, fx, zc, w, h, n) { const T = c.THREE, rnd = c.rnd; n = n || 3;
    const wm = new T.MeshBasicMaterial({ map: waterTex(c), transparent: true, opacity: .93, depthWrite: false, side: T.DoubleSide });
    const fm = new T.MeshBasicMaterial({ map: foam(c), transparent: true, opacity: .95, depthWrite: false });
    for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1) - .5, sw = w / n * (.6 + rnd() * .3), sh = h * (.9 + rnd() * .1), z0 = zc + t * w * .9;
      const N = 14, pos = [], uv = [], idx = [];
      for (let k = 0; k <= N; k++) { const f = k / N, y = f * sh, lip = Math.pow(Math.max(0, f - .8) * 5, 2) * 3 + f * 1.2; pos.push(fx - .6 - lip, y, z0 - sw / 2, fx - .6 - lip, y, z0 + sw / 2); uv.push(0, f * 3, 1, f * 3); if (k) { const b = (k - 1) * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); c.add(g, wm, false, false);
      const fg = new T.CircleGeometry(sw * .7, 14); fg.rotateX(-Math.PI / 2); fg.scale(1.3, 1, 1); fg.translate(fx - 3, .45, z0); c.add(fg, fm, false, false); }
    const p = new T.CircleGeometry(1, 28); p.rotateX(-Math.PI / 2); p.scale(w * .35, 1, w * .62); p.translate(fx - w * .28, .3, zc); c.add(p, c.M.waterBox, false, true);
    const mist = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .2, depthWrite: false });
    for (let i = 0; i < 7; i++) { const sg = new T.SphereGeometry(w * (.08 + rnd() * .07), 8, 6); sg.scale(1, .6, 1.6); sg.translate(fx - 4 - rnd() * 6, 1 + rnd() * 3, zc + (rnd() - .5) * w * .9); c.add(sg, mist, false, false); }
    // the river running over the top of the cliff
    c.box(18, .5, w * .95, fx + 9, h + .1, zc, c.M.waterBox, false, true); }
  // A rock cliff of overlapping boulders behind a west-facing face at fx, so it never looks like a flat wall.
  function cliff(c, fx, zc, w, h, d, col) { const T = c.THREE, rnd = c.rnd, m = mat(c, col || '#77705e'), m2 = mat(c, '#625c4d'), moss = mat(c, '#4f7a36');
    const cols = Math.max(3, Math.round(w / 14)), rows = Math.max(2, Math.round(h / 16)), r = Math.max(w / cols, h / rows) * .72;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const g = new T.IcosahedronGeometry(r, 1); const P2 = g.attributes.position; for (let k = 0; k < P2.count; k++) P2.setXYZ(k, P2.getX(k) * (1 + (rnd() - .5) * .3), P2.getY(k) * (1 + (rnd() - .5) * .3), P2.getZ(k) * (1 + (rnd() - .5) * .3)); g.computeVertexNormals();
      g.scale(Math.max(1, d / r / 2), 1, 1); g.translate(fx + Math.max(r, d / 2) + rnd() * 2, (j + .5) * h / rows, zc - w / 2 + (i + .5) * w / cols + (rnd() - .5) * 3); c.add(g, (i + j) % 3 ? m : m2); }
    for (let i = 0; i < cols; i++) { const g = new T.SphereGeometry(r * .9, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(Math.max(1, d / r / 2), .35, 1); g.translate(fx + Math.max(r, d / 2) + 2, h - r * .1, zc - w / 2 + (i + .5) * w / cols); c.add(g, moss); } }
  function hut(c, x, z, ry, wall) { tbox(c, 5, 2.6, 4, x, 1.3, z, 0, ry, 0, mat(c, wall || '#c8a46a')); pitch(c, 5.4, 4.4, x, 2.6, z, 1.6, mat(c, THATCH), ry); }

  L.goaChurch = (c, x, z, o) => { const M = c.M, wh = M.white; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true);
    c.box(14, 13, 32, x, Y + 6.5, z + 4, wh); pitch(c, 32, 14, x, Y + 13, z + 4, 4, mat(c, TILE), Math.PI / 2);
    c.box(22, 17, 2.4, x, Y + 8.5, z - 12, wh); c.box(8, 5, 2.4, x, Y + 19.5, z - 12, wh); c.box(.5, 3, .5, x, Y + 23.5, z - 12, M.dark); c.box(2, .5, .5, x, Y + 24, z - 12, M.dark);
    for (const s of [-1, 1]) { c.box(5, 23, 5, x + s * 9.5, Y + 11.5, z - 11, wh); c.box(5.6, .6, 5.6, x + s * 9.5, Y + 23.3, z - 11, M.cream); c.dome(2.2, x + s * 9.5, Y + 23.6, z - 11, wh); }
    c.box(4, 7, .3, x, Y + 3.5, z - 13.3, M.wood);
    if (!o || !o.arg) for (let i = 0; i < 6; i++) { const w = 26 - i * 2.4, s = i % 2 ? 1 : -1; c.box(w, .7, 3.4, x + s * 2, Y + .35 + i * .7, z - 18 - (5 - i) * 2.4, wh); }
    c.col(x, z + 4, 7.5, 16.5); c.col(x, z - 11.5, 12, 2.5); return { open: true }; };
  L.bomJesus = (c, x, z) => { const M = c.M, lat = mat(c, LAT); c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true);
    c.box(16, 15, 38, x, Y + 7.5, z + 6, lat); pitch(c, 38, 16, x, Y + 15, z + 6, 4.5, mat(c, TILE), Math.PI / 2);
    c.box(24, 20, 3, x, Y + 10, z - 14, lat); c.box(16, 6, 3, x, Y + 23, z - 14, lat); c.box(8, 5, 3, x, Y + 28.5, z - 14, lat); c.box(.6, 3, .6, x, Y + 32.5, z - 14, M.gold);
    for (const dx of [-8, 0, 8]) c.box(3, 6, .4, x + dx, Y + 3, z - 15.6, M.dark); for (const dx of [-8, -2.7, 2.7, 8]) for (const yy of [8, 14.5]) c.box(2, 3.4, .4, x + dx, Y + yy, z - 15.6, mat(c, '#f1e2c2'));
    c.box(6, 26, 6, x + 13, Y + 13, z + 18, lat); trees(c, x, z, 6, 28); c.col(x, z + 6, 8.5, 19.5); c.col(x, z - 14, 12.5, 2); return { open: true }; };
  L.fontainhas = (c, x, z) => { const cols = ['#f2d16b', '#7fb7d9', '#e98b7f', '#9fd3a5', '#d9a0c8', '#f4f1ea']; let k = 0;
    for (const dz of [-20, 0, 20]) for (const dx of [-21, -7, 7, 21]) { if (c.rnd() < .12) continue; const h = 5 + c.rnd() * 3, w = 11, d = 12; c.box(w, h, d, x + dx, Y + h / 2, z + dz, mat(c, cols[k++ % cols.length]));
      c.box(w + .2, .5, .6, x + dx, Y + 3.2, z + dz - d / 2 - .3, c.M.white); pitch(c, w, d, x + dx, Y + h, z + dz, 2.2, mat(c, TILE)); c.col(x + dx, z + dz, w / 2, d / 2); }
    return {}; };
  L.marketBlock = (c, x, z, o) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const sx = x - 25 + i * 10, sz = z - 21 + r * 14; c.box(6, 1, 3, sx, Y + .5, sz, M.wood); c.box(.15, 2.6, .15, sx - 2.8, Y + 1.3, sz - 1.4, M.pole); c.box(.15, 2.6, .15, sx + 2.8, Y + 1.3, sz - 1.4, M.pole); c.box(7, .15, 4, sx, Y + 2.7, sz, c.pick(M.awn)); }
    c.col(x, z, 28, 26);
    const food = o && o.zone ? o.zone.food : 'MH'; return { open: true, poi: [{ type: 'food', name: (o && o.arg) || 'Market', side: 's', t: 0, extra: food }, { type: 'clothes', name: ((o && o.arg) || 'Market') + ' cloth stalls', side: 'n', t: 8 }] }; };
  L.lakePark = (c, x, z) => { const M = c.M; for (const [dx, dz] of [[-29, -29], [29, -29], [-29, 29], [29, 29], [0, -29], [0, 29]]) c.tree(x + dx, z + dz, 1); c.box(64, .08, 3, x, Y, z - 30.5, M.pave, false, true); c.box(64, .08, 3, x, Y, z + 30.5, M.pave, false, true);
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + .4; c.box(2.4, .5, .7, x + Math.cos(a) * 27, Y + .25, z + Math.sin(a) * 24, M.wood); } c.box(5, .6, 2, x + 14, .3, z + 12, M.boat); return { open: true }; };
  L.lalbagh = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true); const gl = mat(c, '#cfe4ee', { transparent: true, opacity: .55 });
    c.box(30, 6, 12, x, Y + 3, z, gl); c.box(12, 6, 26, x, Y + 3, z, gl); c.dome(6, x, Y + 6, z, gl); for (const s of [-1, 1]) c.box(.3, 6.2, 12.2, x + s * 15, Y + 3.1, z, M.white);
    trees(c, x, z, 14, 28, 1.1); c.col(x, z, 15, 6); c.col(x, z, 6, 13); return { open: true }; };
  L.vidhanaSoudha = (c, x, z) => { const M = c.M, g = mat(c, GRAN); c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true);
    c.box(58, 16, 30, x, Y + 8, z + 6, g); c.box(59, 1, 31, x, Y + 16.4, z + 6, M.cream); c.box(26, 4, 30, x, Y + 18.5, z + 6, g);
    c.box(24, 2, 8, x, Y + 1, z - 13, g); for (let i = 0; i < 12; i++) c.cyl(.8, .8, 14, x - 11 + i * 2, Y + 9, z - 12, g, 8); c.box(26, 2.4, 9, x, Y + 17, z - 12, g); c.wedge(26, 4, 9, x, Y + 18.2, z - 12, g);
    c.box(10, 6, 10, x, Y + 23.5, z + 6, g); c.dome(6, x, Y + 26.5, z + 6, g); c.cyl(.6, .6, 3, x, Y + 33, z + 6, M.gold, 6); c.flag(x, Y + 38, z + 6, true);
    for (const s of [-1, 1]) { c.box(6, 4, 6, x + s * 24, Y + 18, z + 6, g); c.dome(3, x + s * 24, Y + 20, z + 6, g); }
    c.col(x, z + 6, 29, 15); c.col(x, z - 12, 12, 4); return { open: true }; };
  L.bangalorePalace = (c, x, z) => { const M = c.M, st = mat(c, '#b9b3a3'), rf = mat(c, '#4a4e57'); c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true);
    c.box(42, 12, 18, x, Y + 6, z, st); pitch(c, 42, 18, x, Y + 12, z, 5, rf);
    for (const [dx, dz] of [[-21, -9], [21, -9], [-21, 9], [21, 9], [0, -9]]) { c.cyl(3.2, 3.2, 17, x + dx, Y + 8.5, z + dz, st, 10); c.cone(3.8, 6, x + dx, Y + 20, z + dz, rf, 10); }
    for (let i = -9; i <= 9; i++) c.box(1.2, 1.4, 1.2, x + i * 2.2, Y + 12.7, z - 9.3, st); trees(c, x, z, 8, 28); c.col(x, z, 22, 10); return { open: true }; };
  L.techPark = (c, x, z, o) => { const M = c.M; c.building(x - 14, z - 12, 22, 22, 38 + c.rnd() * 20, 'glass'); c.building(x + 14, z - 10, 20, 26, 30 + c.rnd() * 25, 'glass'); c.building(x, z + 16, 34, 18, 22 + c.rnd() * 14, 'glass');
    c.sign(((o && o.arg) || 'Tech Park').toUpperCase(), x, Y + 4, z - 31.6, 0, 22, 2.6, '#ffffff', '#2a3d6b'); return { poi: [{ type: 'jobs', name: ((o && o.arg) || 'Tech park') + ' hiring desk', side: 'e', t: 0 }] }; };
  L.mysorePalace = (c, x, z) => { const M = c.M, st = mat(c, '#e8d9b5'), dm = mat(c, '#c4553f'); c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true);
    c.box(54, 12, 30, x, Y + 6, z + 4, st); c.box(55, 1, 31, x, Y + 12.4, z + 4, M.cream); for (let i = 0; i < 9; i++) c.box(3.4, 6, .5, x - 24 + i * 6, Y + 4, z - 11.2, M.dark);
    c.box(12, 14, 12, x, Y + 19, z - 2, st); c.cyl(5, 5, 4, x, Y + 28, z - 2, st, 12); c.dome(5.6, x, Y + 30, z - 2, dm); c.cyl(.4, .4, 3, x, Y + 36.5, z - 2, M.gold, 6);
    for (const [dx, dz] of [[-24, -9], [24, -9], [-24, 17], [24, 17], [-12, -9], [12, -9]]) { c.cyl(2.2, 2.2, 6, x + dx, Y + 15.4, z + dz, st, 8); c.dome(2.6, x + dx, Y + 18.4, z + dz, dm); }
    c.box(14, 9, 3, x, Y + 4.5, z - 30, st); c.box(5, 6, 3.2, x, Y + 3, z - 30, M.dark); c.flag(x, Y + 42, z - 2, true); c.col(x, z + 4, 27, 15); return { open: true }; };
  L.krishnaMatha = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true); const w = mat(c, '#efe5cf');
    c.box(20, 6, 16, x - 10, Y + 3, z + 6, w); kroof(c, 20, 16, x - 10, Y + 6, z + 6, mat(c, TILE)); c.box(14, .4, 14, x + 16, Y + .1, z + 14, M.stone); c.box(11, .3, 11, x + 16, Y + .2, z + 14, M.waterBox);
    let y = Y; for (let i = 0; i < 5; i++) { const s = 7 - i; c.box(s, 2.2, s, x + 14, y + 1.1, z - 16, mat(c, i % 2 ? '#c8102e' : DWOOD)); y += 2.2; } c.cone(2.4, 4, x + 14, y + 2, z - 16, M.gold, 8);
    c.col(x - 10, z + 6, 10, 8); c.col(x + 14, z - 16, 4, 4); return { open: true }; };
  L.keralaTemple = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.dirt, false, true); const w = M.white, rf = mat(c, COPPER), tl = mat(c, TILE);
    c.box(58, 2.2, .8, x, Y + 1.1, z - 29, w); c.box(58, 2.2, .8, x, Y + 1.1, z + 29, w); c.box(.8, 2.2, 58, x - 29, Y + 1.1, z, w); c.box(.8, 2.2, 58, x + 29, Y + 1.1, z, w);
    c.box(10, 5, 6, x, Y + 2.5, z - 29, w); kroof(c, 10, 6, x, Y + 5, z - 29, tl);
    c.box(26, 1, 26, x, Y + .5, z + 4, M.stone); c.box(18, 4, 18, x, Y + 3, z + 4, mat(c, '#8a5a3a')); kroof(c, 18, 18, x, Y + 5, z + 4, rf);
    c.cyl(.35, .45, 13, x, Y + 6.5, z - 14, M.gold, 8); c.box(1.6, .4, .4, x, Y + 13, z - 14, M.gold); for (let i = 0; i < 8; i++) c.cyl(.12, .12, 1.4, x - 18 + i * 5, Y + 2.9, z - 26.5, M.gold, 4);
    c.col(x, z + 4, 9.5, 9.5); return { open: true }; };
  L.padmanabhaswamy = (c, x, z) => { const M = c.M, st = mat(c, '#cdb48a'); c.box(64, .1, 64, x, Y + .02, z, M.plaza, false, true);
    gopuram(c, x, Y, z - 18, 22, 12, 36, st, 7); c.box(56, 7, 26, x, Y + 3.5, z + 14, st); kroof(c, 40, 20, x, Y + 7, z + 14, mat(c, COPPER)); c.box(10, 4, 1, x, Y + 2, z - 24.6, M.dark);
    c.col(x, z - 18, 11, 6); c.col(x, z + 14, 28, 13); return { open: true }; };
  L.golGumbaz = (c, x, z) => { const M = c.M, st = mat(c, '#8c857a'); c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true);
    c.box(38, 26, 38, x, Y + 13, z, st); c.cyl(17, 18, 3, x, Y + 27.5, z, st, 24); c.dome(17, x, Y + 29, z, st); c.cyl(1, 1, 3, x, Y + 47, z, st, 8);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.cyl(3.2, 3.4, 30, x + dx * 19, Y + 15, z + dz * 19, st, 8); c.dome(3.4, x + dx * 19, Y + 30, z + dz * 19, st); }
    for (let i = -2; i <= 2; i++) c.box(3, 9, .5, x + i * 6.5, Y + 6, z - 19.2, M.dark); c.col(x, z, 21, 21); return { open: true }; };
  L.tankPark = (c, x, z) => { const M = c.M; c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true); for (let i = 0; i < 3; i++) c.box(36 - i * 4, .3, 30 - i * 4, x, Y + .15 - i * .05, z, M.stone, false, true);
    c.box(24, .1, 18, x, Y + .25, z, M.waterBox, false, true); c.box(5, 4, 5, x + 24, Y + 2, z - 22, M.white); kroof(c, 5, 5, x + 24, Y + 4, z - 22, mat(c, TILE)); trees(c, x, z, 10, 29); return { open: true }; };
  L.fortWalls = (c, x, z, o) => { const M = c.M, st = mat(c, '#9b8a6e'); c.box(64, .1, 64, x, Y + .02, z, M.grass, false, true); wallRing(c, x, z, 54, 54, 7, 2.4, st, 4);
    c.box(10, 10, 4, x, Y + 5, z - 27, st); c.box(5, 6, 4.2, x, Y + 3, z - 27, M.dark); c.flag(x, Y + 13, z - 27, false);
    c.col(x, z - 27, 22, 1.5); c.col(x - 27, z, 1.5, 27); c.col(x + 27, z, 1.5, 27); c.col(x, z + 27, 27, 1.5); return { open: true }; };

  // Goa, free-standing
  L.aguadaFort = (c, x, z) => { const M = c.M, lat = mat(c, LAT); c.cyl(26, 28, .6, x, .1, z, mat(c, '#8a5a3a'), 16); wallRing(c, x, z, 40, 34, 5, 2, lat, 3); lighthouse(c, x + 6, z - 4, 13, M.white, M.white); c.col(x, z, 20, 17); c.far(); return {}; };
  L.chaporaFort = (c, x, z) => { const M = c.M, lat = mat(c, LAT); c.cone(30, 14, x, 7, z, mat(c, '#8a7a4a'), 9); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; c.boxRot(9, 4, 1.6, x + Math.cos(a) * 13, 15, z + Math.sin(a) * 13, -a + Math.PI / 2, lat); } c.col(x, z, 18, 18); c.far(); return {}; };
  L.seCathedral = (c, x, z) => { const M = c.M, wh = M.white; c.box(60, .1, 70, x, .02, z, M.plaza, false, true); c.box(22, 18, 52, x, 9, z + 6, wh); pitch(c, 52, 22, x, 18, z + 6, 6, mat(c, TILE), Math.PI / 2);
    c.box(30, 22, 3, x, 11, z - 20, wh); c.box(8, 30, 8, x + 14, 15, z - 18, wh); c.box(8.6, .8, 8.6, x + 14, 30.4, z - 18, M.cream); c.box(.6, 4, .6, x, 25, z - 20, M.dark);
    c.col(x, z + 6, 11, 26); c.col(x, z - 20, 15, 2); c.far(); return { poi: [{ type: 'food', name: 'Old Goa chai stall', x: x - 22, z: z - 30, rot: Math.PI, extra: 'GA' }] }; };
  L.mangueshi = (c, x, z) => { const M = c.M, wh = M.white; c.box(40, .3, 36, x, .15, z, M.stone, false, true); c.box(16, 9, 22, x + 4, 4.5, z, wh); c.cyl(5, 5, 4, x + 4, 11, z + 4, wh, 8); c.dome(5, x + 4, 13, z + 4, mat(c, '#d9483b'));
    let y = 0; for (let i = 0; i < 7; i++) { c.cyl(2.2 - i * .2, 2.4 - i * .2, 2.4, x - 12, y + 1.2, z - 8, wh, 8); c.cyl(2.8 - i * .2, 2.8 - i * .2, .3, x - 12, y + 2.4, z - 8, M.cream, 8); y += 2.4; } c.cone(1, 2, x - 12, y + 1, z - 8, M.gold, 8);
    c.box(12, .2, 10, x - 6, .3, z + 12, M.waterBox); c.col(x + 4, z, 8, 11); c.col(x - 12, z - 8, 2.4, 2.4); c.far(); return {}; };
  L.dudhsagar = (c, x, z) => { const M = c.M; // tall four-tier fall on the Goa–Karnataka ghats, with the Konkan railway bridge across its face
    cliff(c, x + 6, z, 90, 70, 40); cliff(c, x - 6, z - 58, 30, 44, 26); cliff(c, x - 6, z + 58, 30, 46, 26); falls(c, x + 6, z, 36, 70, 4);
    for (let i = -3; i <= 3; i++) c.box(2.4, 30, 2.4, x - 20, 15, z + i * 13, M.stone); for (let i = -3; i < 3; i++) c.torus(6.5, .8, x - 20, 24, z + i * 13 + 6.5, M.stone);
    c.box(4.4, 1.6, 92, x - 20, 30.8, z, M.stone); c.box(3, 2.4, 22, x - 20, 32.8, z - 14, mat(c, '#8a1c1c')); c.box(3, 2.4, 14, x - 20, 32.8, z + 6, mat(c, '#8a1c1c'));
    trees(c, x - 40, z, 16, 30, 1.2); c.col(x + 30, z, 24, 45); c.far(); return {}; };
  L.beachShacks = (c, x, z, o) => { const M = c.M; for (let i = 0; i < 4; i++) hut(c, x + (i % 2) * 7, z - 15 + i * 10, Math.PI / 2, i % 2 ? '#7fb7d9' : '#c8a46a');
    for (let i = 0; i < 6; i++) { const ux = x - 14 + c.rnd() * 8, uz = z - 18 + i * 7; c.box(1, .3, 2.2, ux, .4, uz, M.white); c.cyl(.06, .06, 2.4, ux + 1, 1.2, uz, M.pole, 4); c.cone(1.5, .7, ux + 1, 2.6, uz, c.pick(M.awn), 8); }
    for (let i = 0; i < 5; i++) c.palm(x + 10 + c.rnd() * 8, z - 22 + i * 11); c.col(x + 3, z, 6, 20); return { poi: [{ type: 'food', name: 'Beach shack', x: x - 6, z: z, rot: -Math.PI / 2, extra: 'BEACH' }] }; };
  L.casinoBoats = (c, x, z) => { const M = c.M; for (const [dx, col] of [[-40, '#c8102e'], [40, '#2d5fb3']]) { c.box(36, 3, 9, x + dx, .9, z, mat(c, '#1d1b26')); c.box(30, 4, 8, x + dx, 4.4, z, mat(c, col)); c.box(30, 1.6, 8, x + dx, 7.2, z, mat(c, '#f2c14e')); c.box(24, .4, 7, x + dx, 8.2, z, M.white); } c.far(); return {}; };

  // Karnataka, free-standing
  L.hampi = (c, x, z) => { const M = c.M, gr = mat(c, '#b79a72'), bo = mat(c, '#a8835a');
    for (let i = 0; i < 26; i++) { const a = c.rnd() * 6.283, r = 40 + c.rnd() * 60; const g = new c.THREE.IcosahedronGeometry(3 + c.rnd() * 6, 0); g.scale(1, .7 + c.rnd() * .4, 1); g.translate(x + Math.cos(a) * r, 2, z + 30 + Math.sin(a) * r * .6); c.add(g, bo); }
    c.box(36, .8, 24, x, .4, z, gr); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) c.box(1.2, 4, 1.2, x - 15 + i * 6, 2.8, z - 9 + j * 6, gr); c.box(36, .9, 24, x, 5.2, z, gr);
    c.box(6, 2.4, 6, x + 26, 1.2, z, gr); let y = 2.4; for (let i = 0; i < 3; i++) { c.box(5 - i, 1.6, 5 - i, x + 26, y + .8, z, gr); y += 1.6; } c.cone(2, 3, x + 26, y + 1.5, z, gr, 8);
    for (const s of [-1, 1]) { const g = new c.THREE.CylinderGeometry(1.6, 1.6, .7, 14); g.rotateX(Math.PI / 2); g.translate(x + 26, 1.6, z + s * 3.4); c.add(g, gr); }
    gopuram(c, x - 50, 0, z - 30, 18, 12, 40, gr, 8); c.col(x, z, 18, 12); c.col(x + 26, z, 3, 3); c.col(x - 50, z - 30, 9, 6); c.far(); return {}; };
  L.jogFalls = (c, x, z) => { const M = c.M; // Raja, Rani, Rover and Rocket drop into the Sharavathi gorge
    cliff(c, x + 8, z, 64, 54, 36); cliff(c, x - 4, z - 44, 28, 40, 26); cliff(c, x - 4, z + 44, 28, 40, 26); falls(c, x + 8, z, 40, 54, 4);
    c.box(14, .6, 8, x - 30, .3, z + 30, M.stone); for (let i = 0; i < 6; i++) c.box(.15, 1, 8, x - 37 + i * 2.6, .9, z + 26, M.pole); c.sign('JOG FALLS VIEWPOINT', x - 30, 3, z + 34, Math.PI, 9, 1.4, '#ffffff', '#1f6f4a');
    c.col(x + 26, z, 18, 32); c.far(); return {}; };
  L.murudeshwar = (c, x, z) => { const M = c.M, sv = mat(c, '#6f8fa8'), rk = M.rock; c.cyl(18, 22, 8, x, 4, z, rk, 12); c.box(16, 6, 12, x, 11, z, sv); c.cone(9, 20, x, 24, z, sv, 10); c.box(10, 12, 7, x, 30, z, sv);
    for (const s of [-1, 1]) c.box(2.6, 12, 2.6, x + s * 6.2, 28, z - 1, sv); c.cyl(1.8, 2.2, 3, x, 37, z, sv, 8); c.sph(3.4, x, 41, z, sv); c.box(1.6, 5, 1.6, x, 45.6, z, mat(c, '#2a2a3a')); c.box(.3, 12, .3, x + 8, 30, z - 2, M.gold);
    gopuram(c, x + 2, 0, z - 55, 16, 12, 70, mat(c, '#e8d6b0'), 9); c.col(x, z, 16, 16); c.col(x + 2, z - 55, 8, 6); c.far(); return {}; };
  L.omBeach = (c, x, z) => { const r = L.beachShacks(c, x, z); c.sign('OM BEACH', x + 14, 3.2, z, -Math.PI / 2, 9, 1.8, '#ffffff', '#d9483b'); c.box(.3, 2.4, .3, x + 14, 1.2, z - 4, c.M.pole); c.box(.3, 2.4, .3, x + 14, 1.2, z + 4, c.M.pole); return r; };
  L.nandiHills = (c, x, z) => { const M = c.M; c.cone(34, 46, x, 23, z, M.rock, 10); c.box(8, 3, 8, x, 47, z, M.white); kroof(c, 8, 8, x, 49, z, mat(c, TILE)); c.col(x, z, 22, 22); c.far(); return {}; };
  L.kempegowda = (c, x, z) => { const M = c.M, b = M.bronze; c.box(18, 6, 18, x, 3, z, M.stone); c.box(12, 4, 12, x, 8, z, M.stone); c.box(3.2, 14, 3.4, x - 2, 17, z, b); c.box(3.2, 14, 3.4, x + 2, 17, z, b);
    c.box(8, 11, 4.6, x, 29.5, z, b); c.box(2.4, 10, 2.4, x - 5.4, 29, z, b); c.box(2.4, 10, 2.4, x + 5.4, 29, z, b); c.sph(2.6, x, 37.8, z, b); c.cone(2.6, 2.8, x, 41.2, z, b, 8); c.box(.5, 14, .5, x + 6, 30, z - 2, M.steel);
    c.col(x, z, 9, 9); c.far(); return {}; };
  L.chitradurgaFort = (c, x, z) => { const M = c.M, rk = mat(c, '#8d7b62'), st = mat(c, '#a39070');
    for (let i = 0; i < 9; i++) { const g = new c.THREE.IcosahedronGeometry(10 + c.rnd() * 10, 0); g.scale(1, .55, 1); g.translate(x - 30 + c.rnd() * 60, 4, z - 20 + c.rnd() * 40); c.add(g, rk); }
    for (let k = 0; k < 3; k++) { const r = 34 + k * 9; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; c.boxRot(r * .42, 4 + k, 1.6, x + Math.cos(a) * r, 2 + k * .5, z + Math.sin(a) * r * .8, -a + Math.PI / 2, st); } }
    c.col(x, z, 30, 22); c.far(); return {}; };
  L.belurTemple = (c, x, z) => { const M = c.M, st = mat(c, '#6b5e52'); for (let i = 0; i < 8; i++) c.boxRot(18, 2, 18, x, 1, z, i * Math.PI / 16, st); c.box(14, 6, 14, x, 5, z, st); shikhara(c, x, 8, z, 6, 10, st, st);
    c.box(10, 4, 8, x, 4, z - 12, st); c.box(30, .2, 40, x, .1, z, M.plaza, false, true); c.col(x, z, 10, 10); c.far(); return {}; };
  L.gommateshwara = (c, x, z) => { const M = c.M; c.cone(46, 36, x, 18, z, mat(c, '#7d7466'), 10); c.box(14, 1, 14, x, 36.5, z, M.stone); const st = mat(c, '#d8d2c4');
    c.box(2.4, 8, 2.4, x - 1.6, 41, z, st); c.box(2.4, 8, 2.4, x + 1.6, 41, z, st); c.box(6, 7, 3, x, 48.5, z, st); for (const s of [-1, 1]) c.box(1.4, 9, 1.4, x + s * 3.8, 47, z, st); c.sph(1.9, x, 54, z, st);
    for (let i = 0; i < 18; i++) c.box(4, .5, 2.2, x - 44 + i * 2.3, 1 + i * 1.95, z, M.stone); c.col(x, z, 30, 30); c.far(); return {}; };
  L.chamundiHill = (c, x, z) => { const M = c.M; c.cone(56, 62, x + 30, 31, z + 30, M.rock, 10); gopuram(c, x + 30, 62, z + 30, 10, 7, 20, mat(c, '#e8d6b0'), 6);
    c.box(5, 3, 8, x + 8, 22, z + 8, M.blackstone); c.sph(2, x + 8, 25, z + 5, M.blackstone); c.col(x + 30, z + 30, 36, 36); c.far(); return {}; };
  L.krsDam = (c, x, z) => { const M = c.M; c.box(8, 10, 90, x, 5, z, M.concrete); for (let i = 0; i < 10; i++) c.box(8.4, 2, 3, x, 9, z - 40 + i * 9, M.stone);
    for (let k = 0; k < 4; k++) c.box(14, .3 + k * .3, 60, x + 14 + k * 14, .2, z, M.grass, false, true);
    for (let i = 0; i < 6; i++) { const fx = x + 20 + i * 8, fz = z + (i % 2 ? 12 : -12); c.box(5, .3, 5, fx, .4, fz, M.waterBox); c.cyl(.25, .5, 4, fx, 2.4, fz, mat(c, '#dff3ff', { transparent: true, opacity: .7 }), 6); }
    trees(c, x + 40, z, 14, 30); c.col(x, z, 4, 45); c.far(); return {}; };
  L.srirangapatna = (c, x, z) => { const M = c.M, st = mat(c, '#a39070'); wallRing(c, x, z, 40, 30, 5, 2, st, 3); gopuram(c, x, 0, z, 12, 9, 26, mat(c, '#e8d6b0'), 6); c.col(x, z, 6, 5); c.far(); return {}; };
  L.goldenTemple = (c, x, z) => { const M = c.M; c.box(50, .2, 40, x, .1, z, M.plaza, false, true); c.box(26, 12, 18, x, 6, z, mat(c, '#b8342a')); c.box(27, 2, 19, x, 12.5, z, M.white);
    c.roof(30, 5, 22, x, 13.5, z, M.gold); c.box(10, 4, 8, x, 19, z, mat(c, '#b8342a')); c.roof(13, 4, 11, x, 21, z, M.gold); c.cone(.8, 3, x, 26.5, z, M.gold, 6);
    for (let i = 0; i < 8; i++) c.cable(x - 24 + i * 6, 6, z - 18, x - 21 + i * 6, 1, z - 22); c.col(x, z, 13, 9); c.far(); return {}; };
  L.parkGate = (c, x, z, o) => { const M = c.M; c.box(2, 7, 2, x - 9, 3.5, z, M.wood); c.box(2, 7, 2, x + 9, 3.5, z, M.wood); c.box(22, 1.4, 2.4, x, 7.2, z, M.wood); c.sign((o && o.arg) || 'NATIONAL PARK', x, 9.6, z, 0, 20, 2.4, '#ffe9b8', '#3b5d2a'); c.col(x - 9, z, 1, 1); c.col(x + 9, z, 1, 1); return {}; };
  L.lighthouse = (c, x, z) => { lighthouse(c, x, z, 24, c.M.red, c.M.white); c.box(10, 3, 8, x + 7, 1.5, z, c.M.white); c.far(); return {}; };

  // Kerala, free-standing
  L.bekalFort = (c, x, z) => { const M = c.M, lat = mat(c, LAT2); c.cyl(34, 36, .5, x, .1, z, mat(c, '#7a5a3a'), 18);
    for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; c.boxRot(12, 6, 2.4, x + Math.cos(a) * 32, 3, z + Math.sin(a) * 32, -a + Math.PI / 2, lat); if (i % 3 === 0) c.cyl(3.6, 4, 8, x + Math.cos(a) * 33, 4, z + Math.sin(a) * 33, lat, 10); }
    c.cyl(5, 5.6, 12, x, 6, z, lat, 12); c.cyl(5.6, 5.6, .6, x, 12.3, z, lat, 12); c.col(x, z, 6, 6); c.far(); return {}; };
  L.stAngeloFort = (c, x, z) => { const M = c.M, lat = mat(c, LAT2); for (const [a, b] of [[[-20, -16], [20, -16]], [[20, -16], [0, 22]], [[0, 22], [-20, -16]]]) { const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L2 = Math.hypot(b[0] - a[0], b[1] - a[1]); c.boxRot(L2, 6, 2.6, x + mx, 3, z + mz, -Math.atan2(b[1] - a[1], b[0] - a[0]), lat); }
    for (const [dx, dz] of [[-20, -16], [20, -16], [0, 22]]) c.cyl(4, 4.4, 8, x + dx, 4, z + dz, lat, 10); c.col(x, z, 14, 14); c.far(); return {}; };
  L.chineseNets = (c, x, z) => { const M = c.M, wd = mat(c, '#6b4a32'), net = mat(c, '#2a2a2a', { transparent: true, opacity: .55, side: 2 });
    for (let i = 0; i < 4; i++) { const nz = z - 21 + i * 14; c.box(6, .6, 5, x + 2, .3, nz, M.wood); tbox(c, .5, 22, .5, x - 4, 7, nz - 1.4, 0, 0, .9, wd); tbox(c, .5, 22, .5, x - 4, 7, nz + 1.4, 0, 0, .9, wd);
      tbox(c, .4, 12, .4, x + 3, 5, nz, 0, 0, -.5, wd); const g = new c.THREE.PlaneGeometry(9, 9); g.rotateX(-Math.PI / 2); g.translate(x - 13, 1.4, nz); c.add(g, net, false, false); c.cable(x - 12.5, 15, nz, x - 17, 1.6, nz - 4); c.cable(x - 12.5, 15, nz, x - 17, 1.6, nz + 4); c.cable(x - 12.5, 15, nz, x - 9, 1.6, nz + 4); }
    for (let i = 0; i < 3; i++) c.palm(x + 10, z - 16 + i * 16); return { poi: [{ type: 'food', name: 'Fresh catch fry stall', x: x + 9, z: z + 26, rot: 0, extra: 'KL' }] }; };
  function houseboat(c, x, z, ry) { const wd = mat(c, '#5a3a24'), th = mat(c, THATCH); tbox(c, 4.4, 1.2, 22, x, .6, z, 0, ry, 0, wd); for (const s of [-1, 1]) tbox(c, 3, 1, 4, x + Math.sin(ry) * s * 11.5, 1.1, z + Math.cos(ry) * s * 11.5, s * .25, ry, 0, wd);
    const g = new c.THREE.CylinderGeometry(2.2, 2.2, 14, 10, 1, true, 0, Math.PI); g.rotateZ(Math.PI / 2); g.rotateY(Math.PI / 2); g.scale(1, .8, 1); g.rotateY(ry); g.translate(x, 1.2, z); c.add(g, th); }
  L.houseboats = (c, x, z) => { for (let i = 0; i < 3; i++) houseboat(c, x - 12 + i * 12, z - 30 + i * 30, .3 + i * .5); c.far(); return {}; };
  L.athirappilly = (c, x, z) => { const M = c.M; // wide curtain of water over a forest cliff, the 'Niagara of India'
    cliff(c, x + 6, z, 92, 26, 30, '#5a5546'); falls(c, x + 6, z, 74, 26, 7); trees(c, x - 14, z, 18, 44, 1.2); c.col(x + 22, z, 15, 44); c.far(); return {}; };
  L.sabarimala = (c, x, z) => { const M = c.M; c.cone(60, 48, x, 24, z, mat(c, '#4f7a36'), 10); c.box(14, 1, 14, x, 48.5, z, M.stone); c.box(8, 5, 8, x, 51.5, z, M.white); kroof(c, 8, 8, x, 54, z, M.gold);
    for (let i = 0; i < 18; i++) c.box(5, .4, 1, x, 46.5 + i * .12, z - 9 + i * .3, M.gold); c.col(x, z, 38, 38); c.far(); return {}; };
  L.jatayu = (c, x, z) => { const M = c.M, rk = M.rock, st = mat(c, '#cfc8bb'); c.cone(46, 26, x, 13, z, rk, 9);
    const b = new c.THREE.SphereGeometry(8, 12, 8); b.scale(2.4, .9, 1); b.translate(x, 30, z); c.add(b, st); c.sph(4, x + 20, 32, z, st); c.cone(1.6, 5, x + 25, 32, z, st, 6);
    tbox(c, 22, 1.2, 12, x - 4, 34, z - 12, .5, 0, 0, st); tbox(c, 18, 1.2, 10, x - 6, 28, z + 11, -.3, 0, 0, st); c.col(x, z, 28, 28); c.far(); return {}; };
  L.varkalaCliff = (c, x, z) => { const M = c.M, lat = mat(c, '#a6532f'); const ry = Math.atan2(150, 220); for (let i = -4; i <= 4; i++) { const px = x + Math.sin(ry) * i * 22, pz = z + Math.cos(ry) * i * 22; c.boxRot(10, 9 + (i % 2), 23, px - 4, 4.5, pz + 2, ry, lat); }
    for (let i = -3; i <= 3; i += 2) hut(c, x + Math.sin(ry) * i * 22 + 6, z + Math.cos(ry) * i * 22 - 4, ry, '#e9c9a0'); c.far(); return { poi: [{ type: 'food', name: 'Cliff cafe', x: x + 10, z: z - 6, rot: -Math.PI / 2, extra: 'KL' }] }; };
  L.idukkiDam = (c, x, z) => { const M = c.M; const cx = x + 50; for (let i = 0; i < 9; i++) { const a = Math.PI * .78 + i * Math.PI * .055; c.boxRot(12, 34, 5, cx + Math.cos(a) * 50, 17, z + Math.sin(a) * 50, -a + Math.PI / 2, M.concrete); }
    for (const s of [-1, 1]) c.cone(30, 40, cx + Math.cos(Math.PI * (s > 0 ? .7 : 1.3)) * 62, 20, z + Math.sin(Math.PI * (s > 0 ? .7 : 1.3)) * 62, mat(c, '#4f7a36'), 8); c.far(); return {}; };
  L.teaFactory = (c, x, z) => { const M = c.M; c.box(28, 8, 14, x, 4, z, M.cream); pitch(c, 28, 14, x, 8, z, 3, mat(c, '#a8402a')); c.cyl(1, 1.2, 14, x + 16, 7, z - 4, M.station, 8);
    const bush = mat(c, '#2f6b33'); for (let r = 0; r < 6; r++) c.box(40, 1, 1.6, x - 4, .5, z + 12 + r * 3.2, bush); c.col(x, z, 14, 7); return { poi: [{ type: 'food', name: 'Tea museum cafe', x: x - 16, z: z, rot: -Math.PI / 2, extra: 'KL' }] }; };
  L.kanyakumari = (c, x, z) => { const M = c.M; c.box(24, .3, 16, x, .15, z, M.stone, false, true); c.box(8, 4, 6, x, 2, z, M.white); kroof(c, 8, 6, x, 4, z, mat(c, TILE));
    const rx = 6575, rz = 19010; c.box(16, 4, 12, rx, 2, rz, mat(c, '#b8a68a')); c.box(10, 5, 8, rx, 6.5, rz, mat(c, '#c8b69a')); c.dome(4, rx, 9, rz, mat(c, '#c8b69a'));
    const tx = 6618, tz = 19022, st = mat(c, '#9a8f80'); c.box(8, 10, 8, tx, 5, tz, st); c.box(4, 18, 3, tx, 19, tz, st); c.sph(2.2, tx, 30, tz, st); c.box(.5, 10, .5, tx + 2.6, 22, tz, st);
    c.col(x, z, 4, 3); c.far(); return { poi: [{ type: 'food', name: 'Sunrise point stall', x: x + 10, z: z - 10, rot: Math.PI, extra: 'KL' }] }; };

  /* Football stadiums (free-standing, LOD 200), team colours from js/football-data.js.
     Each one registers its site in window.STADIA so the football feature can place crowds around it. */
  const STAD = { goa: { rx: 50, rz: 40, track: false, tiers: 3, roof: [Math.PI * .8, Math.PI * 1.2], seats: ['#ff7a1a', '#1d3f9a', '#f2f2ee'], gate: 'w', canopy: 'curved' },
    blr: { rx: 55, rz: 40, track: true, tiers: 3, roof: [Math.PI * .85, Math.PI * 1.15], seats: ['#8d8a84', '#1f4fbf', '#8d8a84'], gate: 'w', canopy: 'flat' },
    ker: { rx: 60, rz: 48, track: true, tiers: 4, roof: [Math.PI * .75, Math.PI * 1.25], seats: ['#ffd23a', '#ffd23a', '#1d3f9a', '#ffd23a'], gate: 'w', canopy: 'ring' } };
  function pitch(c, x, z, w, d, y) { const M = c.M; c.box(w, .1, d, x, y, z, mat(c, '#3f9a45'), false, true); for (let i = 0; i < 8; i++) c.box(w, .02, d / 8 * .5, x, y + .06, z - d / 2 + d / 16 + i * d / 8, mat(c, '#48a84d'), false, true);
    const ln = M.white, Y2 = y + .08; c.box(w - 1, .02, .22, x, Y2, z - d / 2 + .5, ln, false, true); c.box(w - 1, .02, .22, x, Y2, z + d / 2 - .5, ln, false, true); c.box(.22, .02, d - 1, x - w / 2 + .5, Y2, z, ln, false, true); c.box(.22, .02, d - 1, x + w / 2 - .5, Y2, z, ln, false, true);
    c.box(w - 1, .02, .22, x, Y2, z, ln, false, true); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; c.boxRot(1, .02, .2, x + Math.cos(a) * 4, Y2, z + Math.sin(a) * 4, -a + Math.PI / 2, ln, false, true); }
    for (const s of [-1, 1]) { c.box(w * .42, .02, .22, x, Y2, z + s * (d / 2 - 7), ln, false, true); c.box(.22, .02, 6.5, x - w * .21, Y2, z + s * (d / 2 - 3.75), ln, false, true); c.box(.22, .02, 6.5, x + w * .21, Y2, z + s * (d / 2 - 3.75), ln, false, true);
      c.box(5, 1.8, .12, x, y + .9, z + s * (d / 2 - .2), ln); c.box(5, .12, 1.4, x, y + 1.8, z + s * (d / 2 + .5), ln); } }
  function floodlight(c, x, z, h, face) { const M = c.M; c.cyl(.6, .9, h, x, h / 2, z, M.steel, 8); const g = new c.THREE.BoxGeometry(5.5, 3.2, .6); g.rotateX(-.35); g.rotateY(face); g.translate(x, h + 1.4, z); c.add(g, new c.THREE.MeshBasicMaterial({ color: 0xfff6d8 }), false, false); }
  function registerStadium(team, info) { window.STADIA = window.STADIA || {}; window.STADIA[team] = info; }
  // Oval bowl: Fatorda (Goa), Kanteerava (Bengaluru, with a running track), Jawaharlal Nehru Stadium (Kochi, two tiers and a roof ring).
  L.stadiumOval = (c, x, z, o) => { const M = c.M, F = window.FOOTBALL, id = o && o.arg, t = (F && F.byId(id)) || { col: '#3a6fd8', col2: '#fff', stadium: 'Stadium' }, S = STAD[id] || STAD.goa;
    const conc = mat(c, '#b7b0a4'), roofM = mat(c, '#eeeae2'), N = 40;
    // plaza and outer apron
    const ap = new c.THREE.CircleGeometry(1, 40); ap.rotateX(-Math.PI / 2); ap.scale(S.rx + 14, 1, S.rz + 14); ap.translate(x, .03, z); c.add(ap, M.plaza, false, true);
    const inRx = S.rx * .62, inRz = S.rz * .62;
    if (S.track) { const tr = new c.THREE.CircleGeometry(1, 40); tr.rotateX(-Math.PI / 2); tr.scale(inRx, 1, inRz); tr.translate(x, .08, z); c.add(tr, mat(c, '#b3472f'), false, true); for (const k of [.82, .9]) { const r = new c.THREE.RingGeometry(k - .004, k + .004, 48); r.rotateX(-Math.PI / 2); r.scale(inRx, 1, inRz); r.translate(x, .1, z); c.add(r, M.white, false, true); } pitch(c, x, z, inRz * 1.05, inRx * 1.3, .12); }
    else pitch(c, x, z, inRz * 1.2, inRx * 1.55, .1);
    // stepped stands around the bowl
    for (let k = 0; k < S.tiers; k++) { const f0 = .64 + k * (.34 / S.tiers), f1 = f0 + .34 / S.tiers, h0 = 1 + k * 3.2, m = mat(c, S.seats[k % S.seats.length]);
      for (let i = 0; i < N; i++) { const a0 = i / N * 6.283, a1 = (i + 1) / N * 6.283, am = (a0 + a1) / 2; const px = x + Math.cos(am) * S.rx * (f0 + f1) / 2, pz = z + Math.sin(am) * S.rz * (f0 + f1) / 2;
        const seg = Math.hypot(Math.cos(a1) * S.rx - Math.cos(a0) * S.rx, Math.sin(a1) * S.rz - Math.sin(a0) * S.rz) * (f0 + f1) / 2 + .6, dep = Math.hypot(Math.cos(am) * S.rx, Math.sin(am) * S.rz) * (f1 - f0);
        const ry = -Math.atan2(Math.sin(am) * S.rz, Math.cos(am) * S.rx) + Math.PI / 2;
        if (S.gate === 'w' && k === 0 && Math.abs(Math.cos(am) + 1) < .02) continue;
        c.boxRot(seg, h0 + 1.6, dep, px, (h0 + 1.6) / 2, pz, ry, i % 2 && k % 2 ? conc : m); } }
    // outer wall and roof canopy over the main stand
    const out = 1.0; for (let i = 0; i < N; i++) { const am = (i + .5) / N * 6.283; const px = x + Math.cos(am) * S.rx * out, pz = z + Math.sin(am) * S.rz * out; const ry = -Math.atan2(Math.sin(am) * S.rz, Math.cos(am) * S.rx) + Math.PI / 2;
      const seg = 2 * Math.PI * Math.sqrt((S.rx * S.rx + S.rz * S.rz) / 2) / N + .5; const H = 1 + S.tiers * 3.2 + 2; c.boxRot(seg, H, 1, px, H / 2, pz, ry, conc);
      const inRoof = S.canopy === 'ring' ? Math.sin(am) > -.2 || true : am > S.roof[0] && am < S.roof[1];
      if (inRoof && (S.canopy === 'ring' || (am > S.roof[0] && am < S.roof[1]))) { const rd = S.canopy === 'ring' ? (am > S.roof[0] && am < S.roof[1] ? 18 : 9) : 18, rx2 = x + Math.cos(am) * (S.rx - rd / 2), rz2 = z + Math.sin(am) * (S.rz - rd / 2 * S.rz / S.rx);
        const g = new c.THREE.BoxGeometry(seg + .3, .45, rd); g.rotateX(S.canopy === 'curved' ? -.12 : 0); g.rotateY(ry); g.translate(rx2, H + 1.5, rz2); c.add(g, roofM); if (i % 3 === 0) c.cyl(.35, .35, 3, px, H + .2, pz, M.steel, 6); } }
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) floodlight(c, x + dx * S.rx * .78, z + dz * S.rz * .78, S.tiers * 3.2 + 22, Math.atan2(-dx, -dz));
    // entrance on the west side
    const gx = x - S.rx - 2, gz = z; c.box(4, 7, 14, gx + 2, 3.5, gz, conc); c.box(4.4, 5, 6, gx + 2, 2.5, gz, M.dark);
    c.sign(t.stadium.toUpperCase(), gx - .3, 9, gz, -Math.PI / 2, 22, 2.4, '#ffffff', t.col2 === '#ffffff' ? '#1d3f9a' : t.col2);
    for (const s of [-1, 1]) { c.flag(gx - 2, 6, gz + s * 9, true); }
    c.col(x, z, S.rx * .97, S.rz * .97);
    registerStadium(id, { x, z, rx: S.rx, rz: S.rz, gx: gx - 6, gz, dx: -1, dz: 0 });
    c.far(); return { poi: [{ type: 'stadium', name: t.stadium, x: gx - 4, z: gz, rot: -Math.PI / 2, extra: id }] }; };
  // Mumbai Football Arena (Andheri): a compact rectangular football ground with a roofed main stand.
  L.stadiumMFA = (c, x, z, o) => { const M = c.M, F = window.FOOTBALL, id = (o && o.arg) || 'mum', t = (F && F.byId(id)) || { col: '#6cb4ee', col2: '#0b2a5b', stadium: 'Mumbai Football Arena' };
    const blue = mat(c, '#2f6fc0'), sky = mat(c, t.col), conc = mat(c, '#b7b0a4'), W2 = 70, D2 = 56;
    c.box(W2 + 16, .1, D2 + 16, x, .03, z, M.plaza, false, true); pitch(c, x, z, 30, 44, .1);
    for (let k = 0; k < 3; k++) { const h = 1.6 + k * 1.8, m = k === 1 ? sky : blue;
      for (const s of [-1, 1]) { c.box(4, h, 50, x + s * (19.5 + k * 4), h / 2, z, m); c.box(36 + k * 8, h, 4, x, h / 2, z + s * (26 + k * 2.2) * .98, k === 2 ? conc : m); } }
    c.box(W2 - 2, 10, 1, x, 5, z - D2 / 2 - 1, conc); c.box(W2 - 2, 10, 1, x, 5, z + D2 / 2 + 1, conc); c.box(1, 10, D2, x - W2 / 2 + 1, 5, z, conc); c.box(1, 10, D2, x + W2 / 2 - 1, 5, z, conc);
    // main stand roof on the west side, with a white truss
    c.box(14, .5, 54, x - 27, 13, z, mat(c, '#eeeae2')); for (const dz of [-24, -8, 8, 24]) c.box(.6, 13, .6, x - 33.5, 6.5, z + dz, M.steel);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) floodlight(c, x + dx * 33, z + dz * 27, 24, Math.atan2(-dx, -dz));
    const gx = x - W2 / 2 - 1, gz = z; c.box(3, 6, 12, gx, 3, gz, conc); c.box(3.2, 4.4, 6, gx, 2.2, gz, M.dark); c.sign(t.stadium.toUpperCase(), gx - 1.7, 8, gz, -Math.PI / 2, 20, 2.2, '#ffffff', '#0b2a5b');
    c.col(x, z, W2 / 2, D2 / 2); registerStadium(id, { x, z, rx: W2 / 2 + 3, rz: D2 / 2 + 3, gx: gx - 6, gz, dx: -1, dz: 0 });
    c.far(); return { poi: [{ type: 'stadium', name: t.stadium, x: gx - 4, z: gz, rot: -Math.PI / 2, extra: id }] }; };
  return L;
})();
