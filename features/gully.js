// Gully cricket in the street (Beta v1.01.28): the kids really play. The bowler runs in and bowls, the ball bounces,
// the batter swings the bat and hits it (or misses and is bowled, or blocks it), the ball flies and rolls, a fielder
// chases it and throws it back to the keeper, and the batters run between the wickets for every run they can get.
// A chalk scoreboard keeps the runs, wickets and balls. Walk up on foot and you can bat for an over yourself:
// Space (or the Hit button) swings, A/D or ◀ ▶ choose leg side or off side. Timing decides how far it goes.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE; const LM = c => bb.LMat(c), G = c => new T.MeshBasicMaterial({ color: c });
  const BAT = -5.2, BOWL = 5.6, GRAV = 9.8;
  let game = null; // the street game being shown
  function textSprite(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new T.CanvasTexture(c); const s = new T.Sprite(new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.userData.c = c; s.userData.t = t; return s; }
  function drawBoard(S) { const c = S.board.userData.c, x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.fillStyle = 'rgba(28,38,32,.92)'; x.fillRect(0, 0, 256, 96); x.strokeStyle = '#c9a46a'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 90);
    x.fillStyle = '#f4f1ea'; x.font = '700 34px sans-serif'; x.textAlign = 'center'; x.fillText(`${S.runs}/${S.wk}`, 128, 44); x.font = '600 20px sans-serif'; x.fillText(`${Math.floor(S.balls / 6)}.${S.balls % 6} overs${S.you ? ' · YOU BAT' : ''}`, 128, 76); S.board.userData.t.needsUpdate = true; }
  function shout(S, txt, col) { const c = S.call.userData.c, x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.font = '800 54px sans-serif'; x.textAlign = 'center'; x.lineWidth = 8; x.strokeStyle = 'rgba(0,0,0,.6)'; x.strokeText(txt, 160, 64); x.fillStyle = col || '#ffd23a'; x.fillText(txt, 160, 64); S.call.userData.t.needsUpdate = true; S.call.visible = true; S.callT = 1.6; }
  // legs and arms of a running kid
  function runPose(p, sp, dt) { const U = p.userData; p.userData.ph = (U.ph || 0) + sp * dt * 5; const a = Math.sin(U.ph) * Math.min(1, sp / 2); U.legs[0].rotation.x = a * .7; U.legs[1].rotation.x = -a * .7; if (!U.armLock) { U.arms[0].rotation.x = -a * .6; U.arms[1].rotation.x = a * .6; } }
  function stand(p) { const U = p.userData; U.legs[0].rotation.x *= .8; U.legs[1].rotation.x *= .8; if (!U.armLock) { U.arms[0].rotation.x *= .8; U.arms[1].rotation.x *= .8; } }
  function moveTo(p, x, z, sp, dt) { const dx = x - p.position.x, dz = z - p.position.z, d = Math.hypot(dx, dz); if (d < .08) { stand(p); return true; } const s = Math.min(d, sp * dt); p.position.x += dx / d * s; p.position.z += dz / d * s; p.rotation.y = Math.atan2(dx, dz); runPose(p, sp, dt); return false; }
  function batFor(p) { const U = p.userData; const bat = new T.Group(); const blade = new T.Mesh(new T.BoxGeometry(.11, .5, .035), LM('#d9b26f')); blade.position.y = -.42; bat.add(blade); const handle = new T.Mesh(new T.CylinderGeometry(.018, .018, .22, 6), LM('#2b2b30')); handle.position.y = -.08; bat.add(handle); bat.position.set(0, -.34, .03); U.fores[1].add(bat); U.armLock = true; return bat; }

  function build(g, I) {
    const m = (geo, mt, x, y, z) => { const o = new T.Mesh(geo, mt); o.position.set(x, y, z); g.add(o); return o; };
    const X = 3.5; const S = { X, runs: 0, wk: 0, balls: 0, ph: 'wait', t: 0, you: false, g };
    // stumps at the batting end (three sticks and bails), a stone and a brick at the bowler's end, a chalk crease
    S.stumps = []; for (const dx of [-.11, 0, .11]) S.stumps.push(m(new T.BoxGeometry(.035, .7, .035), LM('#d9b26f'), X + dx, .35, BAT - 1.0));
    S.bail = m(new T.BoxGeometry(.26, .03, .03), LM('#d9b26f'), X, .71, BAT - 1.0);
    m(new T.BoxGeometry(.3, .22, .2), LM('#a1442c'), X, .11, BOWL + .8); m(new T.BoxGeometry(1.6, .012, .06), G(0xf4f1ea), X, .01, BAT - .2); m(new T.BoxGeometry(1.6, .012, .06), G(0xf4f1ea), X, .01, BOWL + .3);
    S.ball = m(new T.SphereGeometry(.07, 8, 6), LM('#c0392b'), X, .3, BOWL); S.ball.castShadow = true; S.b = { x: X, y: .3, z: BOWL, vx: 0, vy: 0, vz: 0, held: null };
    const kid = (c, f, x, z) => { const p = bb.buildPerson(LM(c), { female: f, kid: true }); p.scale.setScalar(.72); p.position.set(x, 0, z); g.add(p); return p; };
    S.bat = [kid('#2f7fc1', false, X - .45, BAT), kid('#f4f1ea', false, X + .9, BOWL + .4)]; S.bat.forEach(p => { p.userData.batM = batFor(p); }); S.striker = 0;
    S.bowler = kid('#ffc93c', true, X, BOWL + 6); S.keeper = kid('#e4572e', false, X, BAT - 2.6); S.keeper.rotation.y = 0;
    S.field = [kid('#1f8a4c', false, X - 6, 2), kid('#7b2a5e', true, X + 5.5, -1), kid('#3a6ea5', false, X - 3, 13)]; S.field.forEach(p => { p.userData.home = [p.position.x, p.position.z]; });
    S.board = textSprite(256, 96); S.board.scale.set(1.6, .6, 1); S.board.position.set(X + 3.2, 2.3, BAT - 1.4); g.add(S.board);
    S.call = textSprite(320, 96); S.call.scale.set(2.6, .78, 1); S.call.position.set(X, 3.2, 0); S.call.visible = false; g.add(S.call); drawBoard(S);
    game = S; S.lt = 0; return S; }

  // what happens when the ball reaches the bat: the kids choose by chance, you by your timing
  function outcome(S) { if (S.you) { const sw = S.swing; if (sw == null) return { k: 'miss' }; const err = Math.abs(sw + .12 - S.arrive); const side = S.side || (Math.random() - .5) * .6;
      if (err < .06) return { k: 'hit', pow: 1.25, ang: side * 1.1, lofted: true }; if (err < .12) return { k: 'hit', pow: .85, ang: side * 1.1 + (Math.random() - .5) * .3 }; if (err < .2) return { k: Math.random() < .5 ? 'defend' : 'hit', pow: .45, ang: side + (Math.random() - .5) * .8 }; return { k: 'miss' }; }
    const r = Math.random(); if (r < .22) return { k: 'miss' }; if (r < .4) return { k: 'defend' }; return { k: 'hit', pow: .45 + Math.random() * .75, ang: (Math.random() - .5) * 2.4, lofted: Math.random() < .25 }; }

  function tick(S, dt) { const b = S.b, X = S.X; const st = S.bat[S.striker], ns = S.bat[1 - S.striker]; S.t += dt; if (S.callT > 0 && (S.callT -= dt) <= 0) S.call.visible = false;
    // keep each player at their spot unless something else moves them
    if (S.ph === 'wait') { const ok = [moveTo(st, X - .45, BAT, 3, dt), moveTo(ns, X + .9, BOWL + .4, 3, dt), moveTo(S.bowler, X, BOWL + 6, 3, dt), moveTo(S.keeper, X, BAT - 2.6, 3, dt)].every(Boolean); S.field.forEach(f => moveTo(f, f.userData.home[0], f.userData.home[1], 3, dt));
      st.rotation.y = 0; ns.rotation.y = Math.PI; S.keeper.rotation.y = 0; S.bowler.rotation.y = Math.PI; b.held = S.bowler; poseBat(st, 'stance');
      if (ok && S.t > (S.you ? 1.6 : 2.2)) { S.ph = 'runup'; S.t = 0; S.swing = null; } }
    else if (S.ph === 'runup') { moveTo(S.bowler, X + .1, BOWL + .2, 4.2, dt); S.bowler.rotation.y = Math.PI; if (S.t > .4 && S.t < .9) poseBat(st, 'lift');
      if (S.bowler.position.z <= BOWL + .25) { S.ph = 'deliver'; S.t = 0; } }
    else if (S.ph === 'deliver') { const U = S.bowler.userData; U.armLock = true; U.arms[1].rotation.x = -S.t / .3 * Math.PI * 1.9; stand(S.bowler);
      if (S.t >= .3) { U.armLock = false; S.ph = 'ball'; S.t = 0; b.held = null; const spd = S.you ? 10 + Math.random() * 3 : 9 + Math.random() * 3; b.x = X + .05; b.y = 1.55; b.z = BOWL - .3; S.flight = (b.z - BAT) / spd; S.arrive = performance.now() / 1000 + S.flight; S.bounceZ = BAT + 3 + Math.random() * 2; S.line = (Math.random() - .5) * .25; } }
    else if (S.ph === 'ball') { // to the bat: one bounce, arriving at about knee height
      const u = Math.min(1, S.t / S.flight); const z = BOWL - .3 + (BAT - (BOWL - .3)) * u; const ub = (BOWL - .3 - S.bounceZ) / (BOWL - .3 - BAT); b.z = z; b.x = X + .05 + S.line * u;
      b.y = u < ub ? 1.55 * (1 - u / ub) * (1 - u / ub) + .07 : .07 + Math.sin((u - ub) / (1 - ub) * Math.PI * .5) * .5; if (!S.you && !S.ai && u > .55) { S.ai = 1; poseBat(st, 'swing'); }
      if (u >= 1) { S.ai = 0; const o = outcome(S); S.balls++; S.o = o; S.t = 0;
        if (o.k === 'miss') { if (Math.abs(S.line) < .1 && Math.random() < (S.you ? .45 : .5)) { S.wk++; S.ph = 'bowled'; shout(S, 'BOWLED!', '#ff5d73'); S.stumps.forEach((s, i) => { s.rotation.x = -.5 - i * .2; s.rotation.z = (i - 1) * .3; }); S.bail.position.y = .3; } else { S.ph = 'keeper'; b.vx = 0; b.vz = -6; b.vy = 1.2; } }
        else if (o.k === 'defend') { S.ph = 'live'; b.vx = (Math.random() - .5) * 2; b.vz = 3 + Math.random() * 2; b.vy = .3; S.runsNow = 0; S.chaser = S.bowler; shout(S, 'Blocked', '#d6c8e4'); }
        else { S.ph = 'live'; const sp = 14 * o.pow + 4; b.vx = Math.sin(o.ang) * sp; b.vz = Math.cos(o.ang) * sp; b.vy = o.lofted ? 6 + o.pow * 4 : 1.5; S.runsNow = 0; S.chaser = nearestFielder(S, b.x + b.vx * .8, b.z + b.vz * .8); S.carry = 0; S.landed = false; S.run = { t: 0, leg: 0 }; } drawBoard(S); } }
    else if (S.ph === 'keeper') { flyBall(b, dt); if (b.z < BAT - 2.4) { b.held = S.keeper; S.ph = 'back'; S.t = 0; } }
    else if (S.ph === 'bowled') { if (S.t > 2.2) { S.stumps.forEach(s => s.rotation.set(0, 0, 0)); S.bail.position.y = .71; if (S.you) S.youOut = true; else S.striker = 1 - S.striker; endBall(S); } }
    else if (S.ph === 'live') { // the ball is out there: fielder chases, batters run
      if (!b.held) { flyBall(b, dt); if (!S.landed && b.y <= .08) { S.landed = true; const d = Math.hypot(b.x - X, b.z - BAT); if (S.o.lofted && d > 22) { S.runsNow = 6; S.six = true; shout(S, 'SIX!', '#3ddc97'); } else if (d > 26) { S.four = true; } } }
      const f = S.chaser; if (!b.held) { const sp = Math.hypot(b.vx, b.vz); const tx = b.x + b.vx * .25, tz = b.z + b.vz * .25; moveTo(f, tx, tz, 4.6, dt); if (Math.hypot(f.position.x - b.x, f.position.z - b.z) < .7 && b.y < 1.6 && (sp < 7 || b.y > .4)) { if (b.y > .5 && !S.landed && S.o.lofted) { S.wk++; shout(S, 'CAUGHT!', '#ff5d73'); S.caught = true; } b.held = f; S.t = 0; } }
      else { b.x = f.position.x; b.y = .7; b.z = f.position.z; stand(f); if (S.t > .45 && !S.thrown) { S.thrown = true; const ex = X, ez = BAT - 1.6; const dx = ex - b.x, dz = ez - b.z, d = Math.hypot(dx, dz); const tt = Math.max(.4, d / 16); b.held = null; b.vx = dx / tt; b.vz = dz / tt; b.vy = GRAV * tt / 2; b.y = 1.2; S.throwT = tt; S.thr = 0; f.userData.armLock = true; f.userData.arms[1].rotation.x = -2.6; } }
      if (S.thrown && !b.held) { S.thr += dt; b.x += b.vx * dt; b.z += b.vz * dt; b.vy -= GRAV * dt; b.y = Math.max(.07, b.y + b.vy * dt); if (S.thr >= S.throwT) { b.held = S.keeper; S.chaser.userData.armLock = false; S.ph = 'back'; S.t = 0; } }
      // running between the wickets until the ball comes back (no running after a six or a catch)
      if (!S.six && !S.caught && S.o.k === 'hit' && !S.run.stop) { const R = S.run; const a = S.bat[S.striker], c = S.bat[1 - S.striker];
        const da = moveTo(a, X - .45, R.leg % 2 ? BAT : BOWL + .4, 4.4, dt), dc = moveTo(c, X + .9, R.leg % 2 ? BOWL + .4 : BAT, 4.4, dt);
        if (da && dc) { R.leg++; S.runsNow++; const ballFar = !S.thrown && Math.hypot(b.x - X, b.z - BAT) > 9; if (!ballFar || R.leg >= 3) R.stop = true; } }
      else if (S.o.k === 'defend') { stand(st); } }
    else if (S.ph === 'back') { b.x = S.keeper.position.x + .2; b.y = .8; b.z = S.keeper.position.z + .3; const R = S.run;
      // batters finish the run they are on, then the ball goes back to the bowler
      if (R && !R.stop && !S.six && !S.caught && S.o && S.o.k === 'hit') { const a = S.bat[S.striker], c = S.bat[1 - S.striker]; const da = moveTo(a, X - .45, R.leg % 2 ? BAT : BOWL + .4, 4.4, dt), dc = moveTo(c, X + .9, R.leg % 2 ? BOWL + .4 : BAT, 4.4, dt); if (da && dc) { R.leg++; S.runsNow++; R.stop = true; } else if (S.t < 4) { S.ball.position.set(b.x, b.y, b.z); return; } }
      if (S.t > .6) { let r = S.six ? 6 : S.caught ? 0 : S.four ? Math.max(4, S.runsNow || 0) : S.runsNow || 0; S.runs += r; if (r && !S.six) shout(S, r === 4 ? 'FOUR!' : r + (r === 1 ? ' run' : ' runs'), '#ffd23a'); if (S.you) S.yr = (S.yr || 0) + r;
        if (S.you) { if (S.caught) S.youOut = true; } else { if (S.run && S.run.leg % 2) S.striker = 1 - S.striker; if (S.caught) S.striker = 1 - S.striker; } endBall(S); } }
    if (b.held && S.ph !== 'back' && S.ph !== 'live') { const h = b.held; b.x = h.position.x; b.z = h.position.z + (h === S.bowler ? -.25 : .25); b.y = .75; }
    S.ball.position.set(b.x, b.y, b.z); }
  function endBall(S) { S.ph = 'wait'; S.t = 0; S.six = S.four = S.caught = S.thrown = false; S.run = null; S.runsNow = 0; S.o = null; S.chaser && (S.chaser.userData.armLock = false); S.field.forEach(f => f.userData.armLock = false);
    if (S.wk >= 5 || S.balls >= 30) { shout(S, S.runs + ' all out · new game', '#d6c8e4'); S.runs = 0; S.wk = 0; S.balls = 0; } drawBoard(S); if (S.you) { S.yb = (S.yb || 0) + 1; if (S.onBall) S.onBall(); } }
  function flyBall(b, dt) { b.x += b.vx * dt; b.z += b.vz * dt; b.vy -= GRAV * dt; b.y += b.vy * dt; if (b.y < .07) { b.y = .07; if (b.vy < -1.2) { b.vy = -b.vy * .45; b.vx *= .75; b.vz *= .75; } else { b.vy = 0; const f = Math.max(0, 1 - dt * 1.2); b.vx *= f; b.vz *= f; } } const d = Math.hypot(b.x - 3.5, b.z); if (d > 34) { b.vx *= .5; b.vz *= .5; } }
  function nearestFielder(S, x, z) { let best = S.field[0], bd = 1e9; for (const f of S.field.concat([S.bowler])) { const d = Math.hypot(f.position.x - x, f.position.z - z); if (d < bd) { bd = d; best = f; } } return best; }
  function poseBat(p, k) { const U = p.userData; const A = U.arms; if (k === 'stance') { A[0].rotation.x = A[1].rotation.x = -.35; A[0].rotation.z = .25; A[1].rotation.z = -.25; U.swingT = null; }
    else if (k === 'lift') { A[0].rotation.x = A[1].rotation.x = .9; } else if (k === 'swing') U.swingT = performance.now(); }
  // the swing plays out over about a third of a second
  function animSwing(p) { const U = p.userData; if (U.swingT == null) return; const s = (performance.now() - U.swingT) / 1000; const A = U.arms; if (s < .32) { const v = s / .32; A[0].rotation.x = A[1].rotation.x = .9 - v * 3.0; } else if (s > 1.4) U.swingT = null; }

  // the world.js street incident hands us the group to fill
  bb.GULLY = { build: (g, I) => { const S = build(g, I); return t => { const n = performance.now(); const dt = Math.min(.1, S.lt ? (n - S.lt) / 1000 : .016); S.lt = n; if (!S.g.parent || !S.g.visible) return; tick(S, dt); S.bat.forEach(animSwing); }; }, get game() { return game; } };

  /* ---------- you bat ---------- */
  bb.addPrompt(() => { const S = game; if (!S || S.you || !S.g.parent || !S.g.visible || bb.player.mode !== 'foot' || bb.inside) return null; const v = new T.Vector3(S.X, 0, BAT); S.g.localToWorld(v); const pp = bb.ppos(); if (Math.hypot(v.x - pp.x, v.z - pp.z) > 9) return null;
    return { text: 'Bat with the kids 🏏', fn: () => youBat(S) }; });
  function youBat(S) { S.you = true; S.yr = 0; S.yb = 0; S.youOut = false; S.side = 0; // the ball in play is called off: you face a fresh delivery
    S.ph = 'wait'; S.t = 0; S.o = null; S.run = null; S.six = S.four = S.caught = S.thrown = false; S.call.visible = false; S.stumps.forEach(st => st.rotation.set(0, 0, 0)); S.bail.position.y = .71; S.b.held = S.bowler; const keep = S.bat[S.striker]; const me = bb.buildPerson(LM('#e8573e'), { female: false }); me.position.copy(keep.position); S.g.add(me); me.userData.batM = batFor(me); const kidBack = keep; kidBack.visible = false; S.bat[S.striker] = me; drawBoard(S); let done = false;
    const hit = () => { if (S.ph === 'ball' || S.ph === 'runup') { if (S.swing == null) { S.swing = performance.now() / 1000; poseBat(me, 'swing'); } } };
    const finish = () => { if (done) return; done = true; const i = S.bat.indexOf(me); if (i >= 0) S.bat[i] = kidBack; kidBack.visible = true; kidBack.position.copy(me.position); S.g.remove(me); S.you = false; S.onBall = null; drawBoard(S); const r = S.yr || 0; if (r > 0) { const pay = r * 10; bb.earn(pay, 'cricket'); bb.toast(`🏏 You scored ${r} in your over · the kids cheer · +${bb.inr(pay)}`, '#3ddc97'); } else bb.toast('🏏 No runs this time · the kids say come back tomorrow', '#d6c8e4'); };
    S.onBall = () => { if (S.youOut || S.yb >= 6) setTimeout(() => bb.CINE.finish(true), 1500); };
    bb.CINE.play({ kind: 'none', hud: true, dur: 0, title: 'Gully cricket', sub: 'Space or Hit to swing as the ball arrives · A/D or ◀ ▶ for leg side or off side · one over', skipLabel: 'Stop batting',
      extraHtml: `<div class="fhud" id="fhud"></div><div class="fpad l"><button data-f="l">◀</button><button data-f="r">▶</button></div><div class="fpad r"><button data-f="u">🏏 Hit</button></div>`,
      keys: (code, down) => { if (code === 'Space' || code === 'KeyE') { if (down) hit(); return true; } if (code === 'KeyA' || code === 'ArrowLeft') { S.side = down ? -1 : 0; return true; } if (code === 'KeyD' || code === 'ArrowRight') { S.side = down ? 1 : 0; return true; } return false; },
      onStart: el => { el.querySelectorAll('[data-f]').forEach(b => { const f = b.dataset.f; b.addEventListener('pointerdown', e => { e.preventDefault(); if (f === 'u') hit(); else S.side = f === 'l' ? -1 : 1; }); b.addEventListener('pointerup', () => { if (f !== 'u') S.side = 0; }); }); },
      cam: () => { const h = document.getElementById('fhud'); if (h) h.innerHTML = `Your over · ball ${Math.min(6, S.yb + 1)} of 6 · ${S.yr || 0} runs${S.youOut ? ' · OUT' : ''}${S.side ? S.side < 0 ? ' · leg side' : ' · off side' : ''}`;
        const c = new T.Vector3(S.X - 1.15, 2.5, BAT - 4.4), l = new T.Vector3(S.X, .5, BOWL); S.g.localToWorld(c); S.g.localToWorld(l); return { x: c.x, y: c.y, z: c.z, lx: l.x, ly: l.y, lz: l.z, lookK: 6, px: c.x, pz: c.z }; },
      onStop: finish, onDone: finish });
  }
});
