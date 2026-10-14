// Life on the beaches (Beta v1.01.12): by day people stroll along the water, rest on benches and under umbrellas,
// with coconut and bhel carts and kids playing; at night there is an open beach party with string lights, a DJ
// booth, a bonfire and a dancing crowd (with a beat you can hear when you are close and the sound is on).
// The crowd for each beach comes from the shared clock and the beach name, so players together see the same scene.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD; const LM = c => bb.LMat(c), G = c => new T.MeshBasicMaterial({ color: c });
  const BEACHES = (W.places || []).filter(p => /beach/i.test(p[0])).map(p => ({ name: p[0], x: p[1], z: p[2] }));
  function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
  // sand: dry land near the water, off the roads
  const nearWater = (x, z) => { for (let a = 0; a < 6.28; a += .79) if (bb.isWater(x + Math.cos(a) * 30, z + Math.sin(a) * 30)) return true; return false; };
  const sandOk = (x, z) => bb.isLand(x, z) && !bb.isWater(x, z) && !bb.roadAt(x, z, 2) && nearWater(x, z) && !bb.isWater(x + 3, z) && !bb.isWater(x - 3, z) && !bb.isWater(x, z + 3) && !bb.isWater(x, z - 3);
  function sandSpots(b) { if (b.spots) return b.spots; const out = []; for (let r = 4; r <= 80; r += 6) for (let a = 0; a < 6.28; a += 6 / r) { const x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r; if (sandOk(x, z)) out.push([x, z]); } b.spots = out; return out; }
  const night = () => { const h = bb.clock; return h >= 19.5 || h < 2; }, day = () => { const h = bb.clock; return h >= 5 && h < 19.5; };
  let cur = null;   // { b, mode, g, people:[...], party }
  const COLS = ['#d9483b', '#2f7fc1', '#f4f1ea', '#1f8a4c', '#ffc93c', '#7b2a5e', '#e58f2a', '#38bdf8', '#ff4fa3'];
  function person(r, female) { const p = bb.buildPerson(LM(COLS[Math.floor(r() * COLS.length)]), { female }); return p; }
  function build(b, mode) { const g = new T.Group(); const S = sandSpots(b); if (S.length < 8) return null; const slot = Math.floor(bb.now() / (30 * 60 * 1000)); const r = rng(hash(b.name + mode + slot));
    const pick = () => S[Math.floor(r() * S.length)]; const people = []; const st = { b, mode, g, people, party: null };
    if (mode === 'day') {
      for (let i = 0; i < 16; i++) { const a = pick(), c = pick(); const p = person(r, r() < .45); p.position.set(a[0], 0, a[1]); g.add(p); people.push({ p, kind: 'walk', a, c, u: r(), sp: .03 + r() * .03 }); }
      for (let i = 0; i < 5; i++) { const [x, z] = pick(); const rot = r() * 6.28; const bench = new T.Group(); bench.position.set(x, 0, z); bench.rotation.y = rot; g.add(bench);
        const m = (geo, mt, px, py, pz) => { const o = new T.Mesh(geo, mt); o.position.set(px, py, pz); bench.add(o); return o; };
        m(new T.BoxGeometry(2, .1, .5), LM('#8a5a2b'), 0, .5, 0); m(new T.BoxGeometry(2, .5, .08), LM('#8a5a2b'), 0, .8, -.25); for (const s of [-1, 1]) m(new T.BoxGeometry(.08, .5, .5), LM('#4a4a4f'), s * .9, .25, 0);
        const n = 1 + Math.floor(r() * 2); for (let k = 0; k < n; k++) { const p = person(r, r() < .5); p.position.set(n === 1 ? 0 : (k ? .45 : -.45), -.42, .08); bench.add(p); people.push({ p, kind: 'sit' }); } }
      for (let i = 0; i < 4; i++) { const [x, z] = pick(); const u = new T.Group(); u.position.set(x, 0, z); g.add(u); const pole = new T.Mesh(new T.CylinderGeometry(.04, .04, 2.4, 5), LM('#eee')); pole.position.y = 1.2; u.add(pole);
        const top = new T.Mesh(new T.ConeGeometry(1.4, .6, 8), LM(COLS[i % COLS.length])); top.position.y = 2.5; u.add(top); const lounger = new T.Mesh(new T.BoxGeometry(.7, .12, 1.8), LM('#f4f1ea')); lounger.position.set(.9, .3, 0); u.add(lounger);
        const p = person(r, r() < .5); p.rotation.x = -Math.PI / 2; p.position.set(.9, .45, .85); u.add(p); people.push({ p, kind: 'lie' }); }
      for (let i = 0; i < 2; i++) { const [x, z] = pick(); const cart = new T.Group(); cart.position.set(x, 0, z); cart.rotation.y = r() * 6; g.add(cart); const box = new T.Mesh(new T.BoxGeometry(1.6, .8, .9), LM(i ? '#2f7fc1' : '#1f8a4c')); box.position.y = .9; cart.add(box);
        const roof = new T.Mesh(new T.BoxGeometry(1.9, .08, 1.2), LM(i ? '#ffc93c' : '#e4572e')); roof.position.y = 2; cart.add(roof); if (!i) for (let k = 0; k < 5; k++) { const c = new T.Mesh(new T.SphereGeometry(.16, 6, 5), LM('#4d7c0f')); c.position.set(-.5 + k * .25, 1.38, 0); cart.add(c); }
        const v = person(r, false); v.position.set(0, 0, -.9); cart.add(v); }
      const ball = new T.Mesh(new T.SphereGeometry(.15, 8, 6), LM('#ffffff')); const [bx, bz] = pick(); ball.position.set(bx, .15, bz); g.add(ball); for (let k = 0; k < 3; k++) { const p = person(r, r() < .5); p.scale.setScalar(.7); p.position.set(bx + Math.cos(k * 2.1) * 3, 0, bz + Math.sin(k * 2.1) * 3); g.add(p); people.push({ p, kind: 'play', ball, c: [bx, bz], k }); }
    } else {
      // the party: a DJ booth, speakers, string lights on poles, a bonfire and a crowd
      const [px, pz] = S.slice().sort((a, c) => Math.hypot(a[0] - b.x, a[1] - b.z) - Math.hypot(c[0] - b.x, c[1] - b.z))[Math.floor(S.length * .3)] || S[0];
      const P0 = new T.Group(); P0.position.set(px, 0, pz); g.add(P0); const m = (geo, mt, x, y, z) => { const o = new T.Mesh(geo, mt); o.position.set(x, y, z); P0.add(o); return o; };
      m(new T.BoxGeometry(3, 1.1, 1.2), LM('#1d1d22'), 0, .55, -6); const led = m(new T.BoxGeometry(3, .2, .05), G(0xff4fa3), 0, .9, -5.37); for (const s of [-1, 1]) { m(new T.BoxGeometry(.8, 1.8, .8), LM('#111'), s * 2.4, .9, -6); m(new T.CircleGeometry(.28, 12), G(0x333333), s * 2.4, 1.2, -5.59); }
      const dj = person(r, false); dj.position.set(0, 0, -6.9); P0.add(dj); people.push({ p: dj, kind: 'dj' });
      const bulbs = []; const bulbGeo = new T.SphereGeometry(.12, 5, 4); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const x = Math.cos(a) * 9, z = Math.sin(a) * 9; m(new T.CylinderGeometry(.05, .05, 3.6, 5), LM('#444'), x, 1.8, z);
        const a2 = (i + 1) / 6 * 6.28, x2 = Math.cos(a2) * 9, z2 = Math.sin(a2) * 9; for (let k = 1; k < 8; k++) { const t = k / 8; const bl = m(bulbGeo, G([0xffd36a, 0xff6a3d, 0x7fd8ff, 0xff4fa3][k % 4]), x + (x2 - x) * t, 3.5 - Math.sin(t * Math.PI) * .5, z + (z2 - z) * t); bulbs.push(bl); } }
      const fire = m(new T.ConeGeometry(.7, 1.4, 7), G(0xff8a1f), 5, .7, 4); const fire2 = m(new T.ConeGeometry(.4, 1, 6), G(0xffd36a), 5, .6, 4); for (let k = 0; k < 4; k++) { const l = m(new T.CylinderGeometry(.08, .08, 1.4, 5), LM('#5a3a24'), 5, .1, 4); l.rotation.z = Math.PI / 2; l.rotation.y = k * .8; }
      for (let i = 0; i < 34; i++) { const a = r() * 6.28, rr = 1.5 + r() * 6; const p = person(r, r() < .5); p.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr - 1); P0.add(p); people.push({ p, kind: 'dance', ph: r() * 6, sp: 5 + r() * 3, y0: 0 }); }
      st.party = { x: px, z: pz, led, bulbs, fire, fire2 }; }
    bb.scene.add(g); return st; }
  function clear() { if (cur) bb.scene.remove(cur.g); cur = null; stopBeat(); }
  let chk = 0;
  bb.onUpdate(dt => { if (!bb.started) return; chk -= dt; const pp = bb.ppos();
    if (chk <= 0) { chk = 1.5; const mode = night() ? 'night' : day() ? 'day' : null; const b = mode && !bb.inside ? BEACHES.find(q => Math.hypot(q.x - pp.x, q.z - pp.z) < 260) : null;
      if (!b || !mode) { if (cur) clear(); } else if (!cur || cur.b !== b || cur.mode !== mode) { clear(); cur = build(b, mode); if (cur && mode === 'night' && !shown[b.name]) { shown[b.name] = 1; bb.toast(`🎶 Beach party tonight at ${bb.esc(b.name)}`, '#ff4fa3'); } } }
    if (!cur) return; const t = performance.now() / 1000;
    for (const q of cur.people) { const p = q.p;
      if (q.kind === 'walk') { q.u += dt * q.sp; const f = (Math.sin(q.u) + 1) / 2; const x = q.a[0] + (q.c[0] - q.a[0]) * f, z = q.a[1] + (q.c[1] - q.a[1]) * f; const dir = Math.cos(q.u) >= 0 ? 1 : -1; p.rotation.y = Math.atan2((q.c[0] - q.a[0]) * dir, (q.c[1] - q.a[1]) * dir); p.position.set(x, Math.abs(Math.sin(t * 6 + q.sp * 50)) * .04, z); }
      else if (q.kind === 'dance') { p.position.y = Math.abs(Math.sin(t * q.sp * .5 + q.ph)) * .25; p.rotation.y = q.ph + Math.sin(t * 1.2 + q.ph) * .8; }
      else if (q.kind === 'dj') p.position.y = Math.abs(Math.sin(t * 4)) * .08;
      else if (q.kind === 'play') { const a = t * 1.4; if (q.k === 0) q.ball.position.set(q.c[0] + Math.cos(a) * 2.6, .15 + Math.abs(Math.sin(a * 2)) * 1.2, q.c[1] + Math.sin(a) * 2.6); p.lookAt(q.ball.position.x, 0, q.ball.position.z); } }
    const pt = cur.party; if (pt) { pt.led.material.color.setHSL((t * .2) % 1, .9, .55); pt.fire.scale.y = 1 + Math.sin(t * 13) * .15; pt.fire2.scale.y = 1 + Math.sin(t * 17 + 1) * .2; pt.bulbs.forEach((b, i) => b.visible = Math.sin(t * 3 + i) > -.6);
      const d = Math.hypot(pt.x - pp.x, pt.z - pp.z); beat(d < 70 && !bb.muted && !bb.inside ? Math.max(0, 1 - d / 70) : 0); } });
  const shown = {};
  /* ---------- a simple party beat ---------- */
  let ac = null, gain = null, beatT = null;
  function beat(v) { if (v <= 0) { if (gain) gain.gain.value = 0; return; } try { ac = ac || bb.audio || new (window.AudioContext || window.webkitAudioContext)(); if (!gain) { gain = ac.createGain(); gain.connect(ac.destination); }
      gain.gain.value = v * .35; if (!beatT) { let n = 0; beatT = setInterval(() => { if (!gain || gain.gain.value <= 0) return; const t0 = ac.currentTime; const o = ac.createOscillator(), g2 = ac.createGain(); o.connect(g2); g2.connect(gain);
        if (n % 2 === 0) { o.frequency.setValueAtTime(120, t0); o.frequency.exponentialRampToValueAtTime(40, t0 + .18); g2.gain.setValueAtTime(1, t0); g2.gain.exponentialRampToValueAtTime(.001, t0 + .22); }
        else { o.type = 'square'; o.frequency.setValueAtTime(n % 4 === 1 ? 330 : 392, t0); g2.gain.setValueAtTime(.12, t0); g2.gain.exponentialRampToValueAtTime(.001, t0 + .12); }
        o.start(t0); o.stop(t0 + .25); n++; }, 250); } } catch (e) {} }
  function stopBeat() { if (gain) gain.gain.value = 0; }
  bb.BEACH = { list: BEACHES, get scene() { return cur; }, force: (name, mode) => { clear(); cur = build(BEACHES.find(q => q.name === name), mode); return !!cur; }, debug: () => { const pp = bb.ppos(); const b = BEACHES.find(q => Math.hypot(q.x - pp.x, q.z - pp.z) < 260); return { pp: [pp.x, pp.z], b: b && b.name, day: day(), night: night(), spots: b ? sandSpots(b).length : -1, started: bb.started, inside: bb.inside }; } };
});
