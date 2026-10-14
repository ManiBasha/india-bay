// Ride views: while you travel by train, metro, bus, flight, helicopter or ferry you look out of the window
// and watch the real map go past. Also used by adventure activities and festival moments.
// bb.CINE.play({ kind, title, sub, label, lines, dur, cam(f, dt, st) -> {x,y,z,lx,ly,lz,fade}, onDone, onCancel, cancel, buttons, venue })
window.BBFeatures.push(function (bb) {
  const T = bb.THREE; let cur = null;
  const el = document.createElement('div'); el.id = 'cine'; el.hidden = true; document.body.appendChild(el);
  const esc = bb.esc;

  /* polyline helper: pts [[x,z],...] -> { len, at(s) -> {x,z,h} } */
  function poly(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const len = L[L.length - 1] || 1;
    function at(s) { s = Math.max(0, Math.min(len, s)); let i = 1; while (i < L.length - 1 && L[i] < s) i++; const a = pts[i - 1], b = pts[i] || a, sl = (L[i] - L[i - 1]) || 1, u = (s - L[i - 1]) / sl;
      return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, h: Math.atan2(b[0] - a[0], b[1] - a[1]) }; }
    return { len, at, pts }; }
  // Long trips are shown as three scenes (leaving, half-way, arriving) with a fade between them,
  // so the view moves at a believable speed. f = 0..1 of the ride time -> { s: distance along the path, fade, seg }
  function scenes(len, speed, dur) { const show = speed * dur; if (len <= show * 1.2) return f => ({ s: f * len, fade: 0, seg: 0, k: 1 });
    const sl = show / 3, starts = [0, len / 2 - sl / 2, len - sl];
    return f => { const k = Math.min(2, Math.floor(f * 3)), u = f * 3 - k; const fade = k > 0 && u < .07 ? 1 - u / .07 : k < 2 && u > .93 ? (u - .93) / .07 : 0; return { s: starts[k] + u * sl, fade, seg: k, k: 3 }; }; }
  function smooth(p, i, w) { let x = 0, z = 0, n = 0; for (let k = -w; k <= w; k++) { const q = p[Math.max(0, Math.min(p.length - 1, i + k))]; x += q[0]; z += q[1]; n++; } return [x / n, z / n]; }
  // resample a route to even 6 m steps and round off the corners
  function evenPts(pts, step = 6) { const P = poly(pts); const out = []; for (let s = 0; s <= P.len; s += step) { const a = P.at(s); out.push([a.x, a.z]); } if (out.length < 2) return pts; return out.map((_, i) => smooth(out, i, 3)); }

  /* clouds for flights */
  let clouds = null; const ctex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  function addClouds(y) { clouds = new T.Group(); const m = new T.SpriteMaterial({ map: ctex, transparent: true, depthWrite: false, opacity: .8 }); for (let i = 0; i < 40; i++) { const s = new T.Sprite(m); s.scale.setScalar(60 + Math.random() * 90); s.userData.dy = (Math.random() - .5) * 90; clouds.add(s); } clouds.userData.y = y; bb.scene.add(clouds); }
  function updClouds(cx, cz, cy) { if (!clouds) return; for (const s of clouds.children) { const dx = s.position.x - cx, dz = s.position.z - cz; if (!s.userData.set || Math.hypot(dx, dz) > 700) { const a = Math.random() * 6.28, r = 120 + Math.random() * 560; s.position.set(cx + Math.cos(a) * r, clouds.userData.y + s.userData.dy, cz + Math.sin(a) * r); s.userData.set = 1; } s.visible = cy > clouds.userData.y - 160; } }
  function dropClouds() { if (clouds) { bb.scene.remove(clouds); clouds = null; } }

  /* key handling while a ride view is on: everything except our own keys is held back from the game */
  const keys = {};
  addEventListener('keydown', e => { if (!cur) return; if (e.target.closest && e.target.closest('input,textarea,select')) return; keys[e.code] = true;
    if (cur.o.keys) { if (cur.o.keys(e.code, true) === true) { e.stopImmediatePropagation(); e.preventDefault(); return; } }
    if (e.code === 'Escape') { finish(true); } else if (e.code === 'KeyV' && cur.o.lookToggle !== false) toggleLook(); e.stopImmediatePropagation(); }, true);
  addEventListener('keyup', e => { keys[e.code] = false; if (cur && cur.o.keys) cur.o.keys(e.code, false); }, true);
  function toggleLook() { if (!cur) return; cur.look = cur.look === 'side' ? 'fwd' : 'side'; el.classList.toggle('lookfwd', cur.look === 'fwd'); const b = el.querySelector('[data-c="look"]'); if (b) b.textContent = cur.look === 'side' ? '👀 Look ahead' : '🪟 Window view'; }

  function play(o) { if (cur) stop(); if (bb.player.mode === 'drive') bb.exitVehicle(true); for (const k in keys) keys[k] = false;
    const pp = bb.ppos(); cur = { o, t: o.elapsed || 0, t0: Date.now() - (o.elapsed || 0) * 1000, li: -1, look: o.look || 'side', start: { x: pp.x, z: pp.z, h: bb.player.h }, cp: new T.Vector3(), cl: new T.Vector3(), snap: true, seg: 0 };
    if (o.venue) bb.enterVenue(o.venue);
    if (o.clouds) addClouds(o.clouds);
    document.body.classList.add('cine'); el.hidden = false; el.className = 'k-' + (o.kind || 'none') + (o.hud ? ' hudless' : '') + ((o.look || 'side') === 'fwd' ? ' lookfwd' : '');
    const btn = (o.buttons || []).map(b => `<button class="buy ghost" data-c="b:${b.id}">${esc(b.label)}</button>`).join('');
    el.innerHTML = `<div class="cwin"><div class="hole"><i></i></div><div class="cab"><b class="c1"></b><b class="c2"></b><b class="c3"></b><b class="c4"></b></div></div><div class="cfade"></div>${o.top ? `<div class="ctop" id="ctop"></div>` : ''}
      <div class="ccap"><div class="ck">${esc(o.label || '')}</div><b>${esc(o.title || '')}</b><span id="csub">${esc(o.sub || '')}</span>${o.dur ? '<div class="cbar"><i id="cfill"></i></div>' : ''}<small id="ctime"></small></div>
      <div class="cbtns">${btn}${o.lookToggle === false ? '' : '<button class="buy ghost" data-c="look">👀 Look ahead</button>'}<button class="go" data-c="skip">${esc(o.skipLabel || 'Skip ⏭')}</button>${o.cancel ? `<button class="buy danger" data-c="cancel">${esc(o.cancel)}</button>` : ''}</div>${o.extraHtml || ''}`;
    el.onclick = e => { const c = e.target.closest('[data-c]'); if (!c) return; const k = c.dataset.c; if (k === 'skip') return finish(true); if (k === 'look') return toggleLook(); if (k === 'cancel') return cancel();
      if (k.startsWith('b:')) { const b = (o.buttons || []).find(q => q.id === k.slice(2)); if (b) b.fn(c); } };
    if (o.onStart) o.onStart(el, cur);
    bb.photo = dt => tick(dt); bb.avatar.visible = !!o.showAvatar; }
  function tick(dt) { if (!cur) return; const o = cur.o; cur.t = (Date.now() - cur.t0) / 1000; const f = o.dur ? Math.min(1, cur.t / o.dur) : 0; const st = cur;
    const c = o.cam(f, dt, st, keys); if (!c) return;
    const p = new T.Vector3(c.x, c.y, c.z), l = new T.Vector3(c.lx, c.ly, c.lz); if (cur.snap || c.snap) { cur.cp.copy(p); cur.cl.copy(l); cur.snap = false; }
    cur.cp.lerp(p, c.hard ? 1 : 1 - Math.exp(-dt * 8)); cur.cl.lerp(l, 1 - Math.exp(-dt * (c.lookK || 2.5))); bb.camera.position.copy(cur.cp); bb.camera.lookAt(cur.cl);
    if (!bb.inside && c.px != null) { bb.player.pos.set(c.px, 0, c.pz); } else if (!bb.inside) bb.player.pos.set(c.x, 0, c.z);
    if (bb.inside && o.venue && st.hold) bb.player.pos.set(st.hold.x, 0, st.hold.z);
    bb.avatar.visible = !!o.showAvatar;
    updClouds(c.x, c.z, c.y);
    const fd = el.querySelector('.cfade'); if (fd) fd.style.opacity = c.fade || 0;
    const fill = el.querySelector('#cfill'); if (fill) fill.style.width = (f * 100) + '%';
    const tm = el.querySelector('#ctime'); if (tm) tm.textContent = o.timeText ? o.timeText(f, st) : o.dur ? `${Math.max(0, Math.ceil(o.dur - cur.t))} s · Bay ${bb.bayTime()}` : `Bay ${bb.bayTime()}`;
    if (o.lines && o.lines.length) { const i = Math.floor(cur.t / 6) % o.lines.length; if (i !== cur.li) { cur.li = i; const s = el.querySelector('#csub'); if (s) s.textContent = o.lines[i]; } }
    if (o.onTick) o.onTick(dt, f, st, el);
    if (o.dur && f >= 1) finish(false); }
  function stop() { if (!cur) return; const o = cur.o; cur = null; document.body.classList.remove('cine'); el.hidden = true; el.innerHTML = ''; bb.photo = null; dropClouds(); bb.avatar.visible = true;
    if (o.venue && bb.insideVenue === o.venue) bb.leaveVenue(); if (o.onStop) try { o.onStop(); } catch (e) {} }
  function finish(skipped) { if (!cur) return; const o = cur.o, st = cur; stop(); if (o.onDone) o.onDone(skipped, st); }
  function cancel() { if (!cur) return; const o = cur.o, st = cur; stop(); if (o.onCancel) o.onCancel(st); else bb.teleport(st.start.x, st.start.z, st.start.h); }
  function setSub(t) { const s = el.querySelector('#csub'); if (s) s.textContent = t; }
  function setTop(h) { const s = el.querySelector('#ctop'); if (s) s.innerHTML = h; }

  /* A ride along a path on the ground or in the air.
     r = { kind, pts:[[x,z]...], y: number | f(frac along the whole path), speed, dur, side: lateral offset, lookDown } */
  function ride(r, o) { const P = poly(r.pts.length > 2 ? evenPts(r.pts) : r.pts); const sc = scenes(P.len, r.speed || 20, r.dur); let lastSeg = 0;
    const yAt = typeof r.y === 'function' ? r.y : () => r.y || 3;
    return Object.assign({ dur: r.dur, kind: r.kind, cam: (f, dt, st) => { const q = sc(f); const a = P.at(q.s), b = P.at(q.s + 30); const h = Math.atan2(b.x - a.x, b.z - a.z) || a.h; const fr = q.s / P.len; const y = yAt(fr, q.s, P.len);
        if (q.seg !== lastSeg) { lastSeg = q.seg; st.snap = true; if (o.onScene) o.onScene(q.seg); }
        const rx = -Math.cos(h), rz = Math.sin(h), fx = Math.sin(h), fz = Math.cos(h); const side = r.side || 0; const x = a.x + rx * side, z = a.z + rz * side;
        const look = st.look === 'side' ? { lx: x + rx * 80 + fx * 30, ly: y * (r.lookDown != null ? r.lookDown : .5), lz: z + rz * 80 + fz * 30 } : { lx: x + fx * 80, ly: y * .75, lz: z + fz * 80 };
        return Object.assign({ x, y, z, fade: q.fade }, look); } }, o); }
  bb.CINE = { play, stop, finish, cancel, ride, poly, setSub, setTop, get on() { return !!cur; }, get state() { return cur; } };
});
