// Play it yourself (Beta v1.01.27): kayaking, paragliding and skydiving are no longer rides you only watch.
//  • Kayak: W paddles, A/D turn, S back-paddles. Paddle round the three buoys and back to the jetty.
//  • Paragliding: launch from the hill, A/D to turn, W to speed up (you sink faster), S to brake (you float longer).
//    Land on the target on the ground · water landings are a splash.
//  • Skydiving (Aamby Valley, Mysuru, Deesa): climb in the plane, jump at 3,000 m, steer your free fall with W A S D,
//    Space opens the parachute (it opens by itself at 300 m), then fly it down onto the target.
// Touch: the on-screen pad does the same.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, P = () => bb.P; const mat = c => bb.LMat(c);
  const KEYS = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', Space: 'u', KeyE: 'u' };
  const pad = (up) => `<div class="fhud" id="fhud"></div><div class="fpad l"><span></span><button data-f="f">▲</button><span></span><button data-f="l">◀</button><button data-f="b">▼</button><button data-f="r">▶</button></div>${up ? `<div class="fpad r"><button data-f="u">${up}</button></div>` : ''}`;
  function bindPad(el, k) { el.querySelectorAll('[data-f]').forEach(b => { const m = b.dataset.f; const on = e => { e.preventDefault(); k[m] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) {} }; const off = () => { k[m] = false; b.classList.remove('on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); }); }
  const hud = h => { const el = document.getElementById('fhud'); if (el) el.innerHTML = h; };
  const clockDt = S => { const n = performance.now(); const dt = Math.min(.1, S.lt ? (n - S.lt) / 1000 : .016); S.lt = n; return dt; };
  function bonus(n, why) { bb.earn(n, 'adventure'); bb.toast(`🏅 ${why} · +${bb.inr(n)}`, '#3ddc97'); }

  /* ---------- kayak ---------- */
  function kayak(a, poi, base, keep, H) { const S0 = poi.spot; const wd = H.waterDir(S0.x, S0.z); if (!wd) { bb.earn(bb.cost('adv.' + a.id, a.price), 'refund'); return bb.toast('No open water here today · money refunded', '#ff9f1c'); }
    const g = keep(H.craft('kayak')); const R = g.children.find(c => c.userData && c.userData.legs); const paddle = new T.Group(); const sh = new T.Mesh(new T.CylinderGeometry(.03, .03, 2.2, 5), mat('#2b2b30')); sh.rotation.z = Math.PI / 2; paddle.add(sh); for (const s of [-1, 1]) { const bl = new T.Mesh(new T.BoxGeometry(.04, .32, .16), mat('#ffb000')); bl.position.x = s * 1.1; paddle.add(bl); } paddle.position.set(0, 1.05, .3); g.add(paddle);
    const S = { x: wd.x, z: wd.z, h: wd.a, v: 0, k: {}, ph: 0, got: 0 }; const buoys = []; for (let i = 0; i < 3; i++) { const p = H.waterPath(S.x, S.z, 80 + i * 60, .3); const q = p ? p[p.length - 1] : [S.x + Math.sin(S.h + i) * (40 + i * 30), S.z + Math.cos(S.h + i) * (40 + i * 30)]; const m = keep(new T.Mesh(new T.SphereGeometry(.6, 10, 8), mat(['#ff4d2e', '#ffd23a', '#3ddc97'][i]))); m.position.set(q[0], -.9, q[1]); bb.scene.add(m); buoys.push({ m, x: q[0], z: q[1], done: false }); }
    return bb.CINE.play(Object.assign(base, { kind: 'none', hud: true, dur: 0, title: S0.name, sub: 'W paddle · A/D turn · S back · paddle round the 3 buoys', skipLabel: 'Back to the jetty', extraHtml: pad(null),
      keys: (code, down) => { const m = KEYS[code]; if (!m) return false; S.k[m] = down; return true; }, onStart: el => bindPad(el, S.k),
      cam: (f, dt0, st) => { const dt = clockDt(S); const k = S.k; const thr = k.f ? 1 : k.b ? -.5 : 0; S.v += (thr * 3.2 - S.v) * Math.min(1, dt * (thr ? .9 : .5)); const turn = (k.l ? 1 : 0) - (k.r ? 1 : 0); S.h += turn * (.9 + Math.abs(S.v) * .25) * dt;
        const nx = S.x + Math.sin(S.h) * S.v * dt, nz = S.z + Math.cos(S.h) * S.v * dt; if (bb.isWater(nx, nz) && !bb.isLand(nx, nz)) { S.x = nx; S.z = nz; } else S.v *= -.3;
        if (k.f || k.b) S.ph += dt * 5; paddle.rotation.z = Math.sin(S.ph) * .5; paddle.rotation.y = Math.cos(S.ph) * .25; if (R && R.userData.arms) { R.userData.arms[0].rotation.x = -1 + Math.sin(S.ph) * .4; R.userData.arms[1].rotation.x = -1 - Math.sin(S.ph) * .4; }
        const wy = -1.05 + Math.sin(st.t * 2) * .05; g.position.set(S.x, wy, S.z); g.rotation.set(0, S.h, Math.sin(S.ph) * .05);
        for (const b of buoys) { b.m.position.y = -.95 + Math.sin(st.t * 2 + b.x) * .08; if (!b.done && Math.hypot(b.x - S.x, b.z - S.z) < 4) { b.done = true; S.got++; b.m.material = mat('#ffffff'); bb.toast(`🛶 Buoy ${S.got} of 3!`, '#3ddc97'); if (S.got === 3) { bonus(300, 'All three buoys'); bb.CINE.setSub('All buoys done · paddle back or tap "Back to the jetty"'); } } }
        const nb = buoys.find(b => !b.done); hud(`${Math.round(Math.abs(S.v) * 3.6 * 2.4)} km/h · buoys ${S.got}/3${nb ? ` · next ${Math.round(Math.hypot(nb.x - S.x, nb.z - S.z) * 2.4)} m` : ''}`);
        return { x: S.x - Math.sin(S.h) * 6, y: wy + 3, z: S.z - Math.cos(S.h) * 6, lx: S.x + Math.sin(S.h) * 10, ly: wy + .5, lz: S.z + Math.cos(S.h) * 10, lookK: 5, px: S.x, pz: S.z }; } })); }

  /* ---------- paragliding ---------- */
  function paraglide(a, poi, base, keep, H) { const S0 = poi.spot; const wd = H.waterDir(S0.x, S0.z); const h0 = wd ? wd.a : Math.random() * 6.28; const g = keep(new T.Group()); bb.scene.add(g); const c = H.canopy('#ff4f6a', 5); c.position.y = 7; g.add(c); H.rider(g, 0, 0, 0, false);
    const tgt = { x: S0.x + Math.sin(h0) * 320, z: S0.z + Math.cos(h0) * 320 }; let lz = tgt; for (let r = 320; r > 60; r -= 20) { const x = S0.x + Math.sin(h0) * r, z = S0.z + Math.cos(h0) * r; if (bb.isLand(x, z) && !bb.isWater(x, z)) { lz = { x, z }; break; } }
    const ring = keep(new T.Mesh(new T.RingGeometry(5, 7, 32), new T.MeshBasicMaterial({ color: 0xffd23a, side: T.DoubleSide }))); ring.rotation.x = -Math.PI / 2; ring.position.set(lz.x, .2, lz.z); bb.scene.add(ring);
    const S = { x: S0.x - Math.sin(h0) * 40, z: S0.z - Math.cos(h0) * 40, y: 95, h: h0, bank: 0, k: {}, done: false };
    return bb.CINE.play(Object.assign(base, { kind: 'none', hud: true, dur: 0, title: S0.name, sub: 'A/D turn · W faster (sink more) · S brake (float longer) · land on the yellow ring', skipLabel: 'Land now', extraHtml: pad(null),
      keys: (code, down) => { const m = KEYS[code]; if (!m) return false; S.k[m] = down; return true; }, onStart: el => bindPad(el, S.k),
      cam: (f, dt0, st) => { const dt = clockDt(S); const k = S.k; if (!S.done) { const turn = (k.l ? 1 : 0) - (k.r ? 1 : 0); S.bank += (-turn * .45 - S.bank) * Math.min(1, dt * 2); S.h += -S.bank * .9 * dt; const sp = k.f ? 13 : k.b ? 6 : 9, sink = k.f ? 2.6 : k.b ? .9 : 1.5;
          S.x += Math.sin(S.h) * sp * dt; S.z += Math.cos(S.h) * sp * dt; S.y -= sink * dt * (1 + Math.abs(S.bank)); const ground = bb.isWater(S.x, S.z) ? -1.1 : 0;
          if (S.y <= ground + .2) { S.done = true; S.y = ground + .2; const d = Math.hypot(S.x - lz.x, S.z - lz.z); if (ground < 0) bb.toast('💦 Splash! A water landing · the rescue boat picks you up', '#5fb4ff'); else if (d < 7) bonus(500, 'Bullseye landing'); else if (d < 25) bonus(150, `Landed ${Math.round(d * 2.4)} m from the target`); else bb.toast(`Landed ${Math.round(d * 2.4)} m from the target`, '#ffc93c'); setTimeout(() => bb.CINE.finish(false), 2500); } }
        g.position.set(S.x, S.y, S.z); g.rotation.set(0, S.h, S.bank, 'YXZ'); const d = Math.hypot(S.x - lz.x, S.z - lz.z); hud(`ALT ${Math.max(0, Math.round(S.y * 2.4))} m · target ${Math.round(d * 2.4)} m`);
        return { x: S.x - Math.sin(S.h) * 14, y: S.y + 9, z: S.z - Math.cos(S.h) * 14, lx: S.x + Math.sin(S.h) * 20, ly: S.y - 3, lz: S.z + Math.cos(S.h) * 20, lookK: 4, px: S.x, pz: S.z }; } })); }

  /* ---------- skydiving ---------- */
  function skydive(a, poi, base, keep, H) { const S0 = poi.spot; const h0 = Math.random() * 6.28; const plane = keep(new T.Group()); bb.scene.add(plane); const B = (w, h, d, x, y, z, c) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); plane.add(m); return m; };
    B(1.8, 1.8, 9, 0, 0, 0, '#f4f1ea'); B(14, .2, 1.8, 0, .2, .6, '#f4f1ea'); B(4, .15, 1.1, 0, .5, -4.2, '#f4f1ea'); B(.15, 1.6, 1.2, 0, 1.4, -4.2, '#c8102e'); B(1.9, .5, 9.05, 0, -.3, 0, '#c8102e'); B(.5, 1.4, .05, .92, 0, -1.5, '#1d2731');
    const diver = keep(new T.Group()); bb.scene.add(diver); diver.visible = false; const man = H.rider(diver, 0, 0, 0, false); const chute = H.canopy('#2d6cdf', 4.5); chute.position.y = 6; chute.visible = false; diver.add(chute);
    const ring = keep(new T.Mesh(new T.RingGeometry(6, 9, 32), new T.MeshBasicMaterial({ color: 0xff4d2e, side: T.DoubleSide }))); ring.rotation.x = -Math.PI / 2; ring.position.set(S0.x, .25, S0.z); bb.scene.add(ring);
    const S = { ph: 'climb', t: 0, x: S0.x - Math.sin(h0) * 300, z: S0.z - Math.cos(h0) * 300, y: 30, h: h0, vx: 0, vz: 0, vy: 0, k: {}, open: false, done: false };
    return bb.CINE.play(Object.assign(base, { kind: 'none', hud: true, dur: 0, title: S0.name, sub: 'Climbing to 3,000 m · get ready', skipLabel: 'Skip to the ground', extraHtml: pad('🪂'),
      keys: (code, down) => { const m = KEYS[code]; if (!m) return false; S.k[m] = down; return true; }, onStart: el => bindPad(el, S.k),
      cam: (f, dt0, st) => { const dt = clockDt(S); S.t += dt; const k = S.k;
        if (S.ph === 'climb') { const u = Math.min(1, S.t / 8); S.y = 30 + u * 1220; S.x += Math.sin(S.h) * 40 * dt; S.z += Math.cos(S.h) * 40 * dt; plane.position.set(S.x, S.y, S.z); plane.rotation.set(-.15 * (1 - u), S.h, 0, 'YXZ');
          if (u >= 1) { S.ph = 'door'; S.t = 0; bb.CINE.setSub('Door open · press Space (or 🪂) to jump!'); }
          return { x: S.x + Math.cos(S.h) * 6, y: S.y + 1, z: S.z - Math.sin(S.h) * 6, lx: S.x + Math.sin(S.h) * 30, ly: S.y - 20, lz: S.z + Math.cos(S.h) * 30, lookK: 3 }; }
        if (S.ph === 'door') { S.x += Math.sin(S.h) * 40 * dt; S.z += Math.cos(S.h) * 40 * dt; plane.position.set(S.x, S.y, S.z); if (k.u || S.t > 12) { k.u = false; S.ph = 'fall'; S.t = 0; diver.visible = true; S.vx = Math.sin(S.h) * 30; S.vz = Math.cos(S.h) * 30; S.vy = 0; bb.CINE.setSub('Free fall! W A S D to steer · Space opens the parachute'); }
          return { x: S.x + Math.cos(S.h) * 1.2, y: S.y + .3, z: S.z - Math.sin(S.h) * 1.2, lx: S.x + Math.cos(S.h) * 30, ly: 0, lz: S.z - Math.sin(S.h) * 30, lookK: 3 }; }
        plane.position.x += Math.sin(S.h) * 40 * dt; plane.position.z += Math.cos(S.h) * 40 * dt; if (S.ph === 'fall' && S.t > 20) plane.visible = false;
        if (S.ph === 'fall') { const ax = (k.r ? 1 : 0) - (k.l ? 1 : 0), az = (k.f ? 1 : 0) - (k.b ? 1 : 0); const cs = Math.cos(S.h), sn = Math.sin(S.h); const tx = (sn * az - cs * ax) * 9, tz = (cs * az + sn * ax) * 9;
          S.vx += (tx - S.vx) * Math.min(1, dt * .8); S.vz += (tz - S.vz) * Math.min(1, dt * .8); S.vy += (-23 - S.vy) * Math.min(1, dt * .6); if ((k.u && S.t > 1) || S.y < 125) { S.ph = 'chute'; S.t = 0; chute.visible = true; bb.CINE.setSub('Parachute open · A/D turn, W faster · land on the red ring'); bb.toast('🪂 Canopy open!', '#3ddc97'); }
          man.rotation.x = -1.3; if (man.userData.arms) man.userData.arms.forEach(a2 => a2.rotation.x = -2.3); }
        else if (S.ph === 'chute') { const turn = (k.l ? 1 : 0) - (k.r ? 1 : 0); S.h += turn * .8 * dt; const sp = k.f ? 9 : k.b ? 3 : 6; S.vx += (Math.sin(S.h) * sp - S.vx) * Math.min(1, dt); S.vz += (Math.cos(S.h) * sp - S.vz) * Math.min(1, dt); S.vy += ((k.b ? -2.6 : -4) - S.vy) * Math.min(1, dt * 1.5); man.rotation.x = 0; if (man.userData.arms) man.userData.arms.forEach(a2 => a2.rotation.x = -2.8); }
        if (S.ph === 'fall' || S.ph === 'chute') { S.x += S.vx * dt; S.z += S.vz * dt; S.y += S.vy * dt; const ground = bb.isWater(S.x, S.z) ? -1.1 : 0;
          if (S.y <= ground + .1 && !S.done) { S.done = true; S.y = ground + .1; const d = Math.hypot(S.x - S0.x, S.z - S0.z); if (S.ph === 'fall') { bb.damage(60, 'Hard landing'); bb.toast('Ouch · a hard landing', '#ff5d73'); } else if (ground < 0) bb.toast('💦 Water landing · the boat picks you up', '#5fb4ff'); else if (d < 9) bonus(1500, 'Landed on the target'); else if (d < 40) bonus(400, `Landed ${Math.round(d * 2.4)} m from the target`); else bb.toast(`Landed ${Math.round(d * 2.4)} m from the target`, '#ffc93c'); setTimeout(() => bb.CINE.finish(false), 2500); }
          diver.position.set(S.x, S.y, S.z); diver.rotation.y = Math.atan2(S.vx, S.vz) || S.h; const d = Math.hypot(S.x - S0.x, S.z - S0.z); hud(`ALT ${Math.max(0, Math.round(S.y * 2.4))} m · ${Math.round(Math.hypot(S.vx, S.vy, S.vz) * 3.6 * 2.4)} km/h · target ${Math.round(d * 2.4)} m`);
          const hb = Math.atan2(S.vx, S.vz) || S.h; return S.ph === 'fall' ? { x: S.x - Math.sin(hb) * 7, y: S.y + 6, z: S.z - Math.cos(hb) * 7, lx: S.x, ly: S.y - 8, lz: S.z, lookK: 6, px: S.x, pz: S.z } : { x: S.x - Math.sin(S.h) * 12, y: S.y + 7, z: S.z - Math.cos(S.h) * 12, lx: S.x + Math.sin(S.h) * 15, ly: S.y - 4, lz: S.z + Math.cos(S.h) * 15, lookK: 4, px: S.x, pz: S.z }; } } })); }

  bb.PLAYACT = { kayak, paraglide, skydive };
});
