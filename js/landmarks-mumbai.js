// Old Mumbai (Beta v1.01.12): Kamathipura and Falkland Road as an ordinary old-city neighbourhood near Grant Road:
// old chawls with balconies and laundry lines, ground-floor workshops, street food, a market lane, an old
// single-screen cinema, an Irani café and heritage boards. LOD 200.
(function () {
  const L = window.LANDMARKS; if (!L) return;
  const MC = {}; const mat = (c, hex) => MC[hex] || (MC[hex] = new c.THREE.MeshLambertMaterial({ color: hex }));
  const Y = 0.3;
  // a chawl: a long 3–4 storey block with a gallery on every floor, railings, doors, a tiled roof and washing out to dry
  function chawl(c, x, z, w, d, floors, col, rot) { const h = 3.2, H = floors * h; const along = rot ? 'z' : 'x';
    const B = (bw, bh, bd, dx, by, dz, m) => rot ? c.box(bd, bh, bw, x + dz, by, z + dx, m) : c.box(bw, bh, bd, x + dx, by, z + dz, m);
    B(w, H, d, 0, Y + H / 2, 0, mat(c, col));
    B(w + .6, .5, d + 1.4, 0, Y + H + .25, 0, mat(c, '#8a3b22')); B(w + .2, 1.2, d * .6, 0, Y + H + 1, 0, mat(c, '#9a4528'));
    for (let f = 0; f < floors; f++) { const fy = Y + f * h; B(w, .18, 1.3, 0, fy + h, d / 2 + .6, mat(c, '#cfc6b4'));            // gallery slab
      if (f) B(w, .7, .08, 0, fy + .35 + .2, d / 2 + 1.22, mat(c, '#2f3a40'));                                                   // railing
      const n = Math.floor(w / 2.6); for (let k = 0; k < n; k++) { const dx = -w / 2 + 1.3 + k * (w / n); B(.9, 2, .06, dx, fy + 1.1, d / 2 + .03, mat(c, k % 3 ? '#5a3a24' : '#2e5a7a')); B(.7, .7, .06, dx + .9, fy + 1.8, d / 2 + .03, mat(c, '#1d2a34')); }
      if (f && f < floors) for (let k = 0; k < 4; k++) { const dx = -w / 2 + 2 + k * (w / 4); B(2.2, .02, .02, dx, fy + 2.3, d / 2 + 1.1, mat(c, '#444')); for (let q = 0; q < 3; q++) B(.5, .7, .03, dx - .7 + q * .7, fy + 1.95, d / 2 + 1.1, mat(c, ['#e4572e', '#2f7fc1', '#f4f1ea', '#ffc93c', '#1f8a4c'][(k + q + f) % 5])); } }
    // ground floor: rolling shutters of small workshops and shops
    const n = Math.floor(w / 3.4); for (let k = 0; k < n; k++) B(2.6, 2.4, .1, -w / 2 + 1.7 + k * (w / n), Y + 1.2, d / 2 + 1.25, mat(c, k % 2 ? '#7d8a91' : '#5f6c73'));
    c.col(x, z, rot ? d + 2 : w, rot ? w : d + 2); }
  function stall(c, x, z, col, rot) { c.box(2.4, 1, 1.2, x, Y + .5, z, mat(c, '#a07850')); c.box(2.8, .1, 1.8, x, Y + 2.3, z, mat(c, col)); for (const s of [-1, 1]) c.box(.08, 2.3, .08, x + s * 1.3, Y + 1.15, z + .7, mat(c, '#555'));
    c.box(1.6, .3, .8, x, Y + 1.15, z, mat(c, ['#ffc93c', '#e4572e', '#1f8a4c'][Math.floor(c.rnd() * 3)])); }
  function board(c, x, z, rot) { c.box(.1, 1.6, .1, x - .6, Y + .8, z, mat(c, '#333')); c.box(.1, 1.6, .1, x + .6, Y + .8, z, mat(c, '#333')); c.box(1.6, 1, .08, x, Y + 1.9, z, mat(c, '#1f4f8a')); }
  L.kamathipura = (c, x, z) => { c.box(64, .1, 64, x, Y + .02, z, mat(c, '#8c8478'), false, true);
    const cols = ['#e8c872', '#9cc7d8', '#e9a7a0', '#b9d39a', '#d8b48a', '#c9b6e0'];
    chawl(c, x - 12, z - 22, 30, 8, 4, cols[0]); chawl(c, x + 16, z - 22, 22, 8, 3, cols[1]);
    chawl(c, x - 12, z + 22, 30, 8, 4, cols[2]); chawl(c, x + 16, z + 22, 22, 8, 3, cols[3]);
    chawl(c, x - 26, z, 22, 7, 3, cols[4], true);
    // the lane in the middle: food carts, a tea stall and a water tank on stilts
    stall(c, x - 6, z - 6, '#e4572e'); stall(c, x + 2, z - 6, '#ffc93c'); stall(c, x + 10, z - 6, '#2f7fc1'); stall(c, x - 2, z + 6, '#1f8a4c'); stall(c, x + 8, z + 6, '#7b2a5e');
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) c.box(.25, 6, .25, x + 22 + dx * 1.5, Y + 3, z + dz * 1.5, mat(c, '#666')); c.cyl(2.2, 2.2, 2.6, x + 22, Y + 7.3, z, mat(c, '#2d2d33'), 12);
    board(c, x + 14, z + 1);
    return { poi: [{ type: 'food', name: 'Kamathipura kheema pav cart', x: x - 6, z: z - 3.8, rot: 0, extra: 'MH' }, { type: 'food', name: 'Lane tea stall · cutting chai', x: x + 2, z: z - 3.8, rot: 0, extra: 'MH' },
      { type: 'food', name: 'Bhurji pav and omelette cart', x: x + 8, z: z + 3.8, rot: Math.PI, extra: 'MH' }, { type: 'heritage', name: 'Kamathipura heritage board', x: x + 14, z: z + 2.2, rot: 0, extra: 'kamathipura' }] }; };
  L.falkland = (c, x, z) => { c.box(64, .1, 64, x, Y + .02, z, mat(c, '#8a8276'), false, true);
    const cols = ['#d9c08a', '#a9c1c9', '#e2b29a', '#c7d3a2'];
    // a row of old three-storey buildings with arched shopfronts
    for (let i = 0; i < 4; i++) { const bx = x - 24 + i * 12, bz = z - 20; c.box(11, 10, 9, bx, Y + 5, bz, mat(c, cols[i])); c.box(11.4, .5, 9.6, bx, Y + 10.2, bz, mat(c, '#8a3b22'));
      for (let k = 0; k < 3; k++) { c.box(2.4, 2.6, .1, bx - 3.4 + k * 3.4, Y + 1.3, bz + 4.55, mat(c, '#3b2a20')); c.cyl(1.2, 1.2, .1, bx - 3.4 + k * 3.4, Y + 2.6, bz + 4.55, mat(c, '#3b2a20'), 10); c.box(1, 1.3, .1, bx - 3.4 + k * 3.4, Y + 6.2, bz + 4.55, mat(c, '#2a3a44')); c.box(1.6, .1, .7, bx - 3.4 + k * 3.4, Y + 5.3, bz + 4.9, mat(c, '#5a4a3a')); } }
    c.col(x - 6, z - 20, 48, 9);
    // the old single-screen cinema with its marquee
    const cx = x + 18, cz = z + 14; c.box(20, 12, 14, cx, Y + 6, cz, mat(c, '#c9b07a')); c.box(21, 1.4, 15, cx, Y + 12.7, cz, mat(c, '#e8dcc0'));
    c.box(14, 2.2, .6, cx, Y + 6.5, cz - 7.4, mat(c, '#b8202a')); c.box(13, 1.4, .2, cx, Y + 6.5, cz - 7.75, mat(c, '#ffd36a')); c.box(16, .3, 3, cx, Y + 4.4, cz - 8.4, mat(c, '#2d2d33'));
    for (let k = 0; k < 3; k++) c.box(3, 3.6, .1, cx - 5 + k * 5, Y + 1.8, cz - 7.05, mat(c, '#3b2a20')); c.col(cx, cz, 20, 14);
    // the Irani café on the corner: bentwood chairs, marble tables, a glass counter
    const ix = x - 18, iz = z + 14; c.box(16, 7, 12, ix, Y + 3.5, iz, mat(c, '#e9e1cf')); c.box(16.4, .8, 12.4, ix, Y + 7.4, iz, mat(c, '#3b6b4a')); c.box(12, 1, .3, ix, Y + 5.6, iz - 6.15, mat(c, '#1f4f3a'));
    for (let k = 0; k < 4; k++) c.box(2.4, 3.2, .1, ix - 5.4 + k * 3.6, Y + 1.6, iz - 6.05, mat(c, '#20333a')); c.col(ix, iz, 16, 12);
    for (let k = 0; k < 3; k++) { c.cyl(.5, .5, .08, ix - 4 + k * 4, Y + .8, iz - 8.2, mat(c, '#f2efe8'), 10); c.cyl(.06, .06, .8, ix - 4 + k * 4, Y + .4, iz - 8.2, mat(c, '#333'), 5); }
    // market lane: fruit, bangles, tailors and a paan shop
    stall(c, x - 6, z + 2, '#e4572e'); stall(c, x + 0, z + 2, '#ff4fa3'); stall(c, x + 6, z + 2, '#ffc93c'); stall(c, x - 3, z - 8, '#2f7fc1');
    board(c, x - 10, z - 10);
    return { poi: [{ type: 'food', name: 'Café Noor · Irani café (bun maska, chai)', x: ix, z: iz - 9.4, rot: 0, extra: 'MH' }, { type: 'food', name: 'Falkland Road kebab corner', x: x + 6, z: z + 4.2, rot: Math.PI, extra: 'MH' },
      { type: 'heritage', name: 'Falkland Road heritage board', x: x - 10, z: z - 8.8, rot: Math.PI, extra: 'falkland' }] }; };
})();
