// Film mode (Beta v1.01.10): cinematic cameras and video recording for promo videos.
// Only for admins and testers (Settings → Film mode, or press F9). Records a 16:9 or 9:16 video with
// optional cinema bars, the place name and an indiabaygame.com watermark burned into the video.
window.BBFeatures.push(function (bb) {
  // every player (Beta v1.01.11) unless the admin switches it off; admins and testers always
  const allowed = () => !!(bb.CFG.filmOn !== false || bb.adminOK || bb.testMode || (bb.ONLINE && (bb.ONLINE.isAdmin || bb.ONLINE.isTester)));
  const MODES = [['tour', '🎬 Landmark tour', 'Glides round the famous places, like the start screen'], ['orbit', '🔄 Orbit me', 'Circles slowly around you or your vehicle'],
    ['drone', '🚁 Drone follow', 'High and behind, follows as you drive or walk'], ['fly', '✈ Flyby', 'Low and fast past you, then swings round'], ['street', '🎥 Street level', 'Fixed camera by the road as you pass']];
  const st = { on: false, mode: 'drone', bars: true, mark: true, cap: true, fmt: '16:9', t: 0, tourI: 0, fix: null };
  let bar = null, rec = null, comp = null, cctx = null;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function caption() { if (st.mode === 'tour') { const T = bb.tourSpots[st.tourI]; return T ? T.name : ''; } const p = bb.ppos(); const z = bb.zoneAt(p.x, p.z, 60); return z ? z.name : ''; }
  function cam(dt) {
    st.t += dt; const C = bb.camera, p = bb.ppos(), v = bb.player.veh, h = v ? v.h : bb.player.h;
    if (st.mode === 'tour') { const L = bb.tourSpots; if (!L.length) return; const T = L[st.tourI % L.length]; if (st.t > 12) { st.t = 0; st.tourI = (st.tourI + 1) % L.length; }
      const a = st.t * .09 + st.tourI * 1.7, r = T.r * (1.05 - ease(Math.min(1, st.t / 12)) * .25); C.position.set(T.cx + Math.cos(a) * r, T.h + Math.sin(st.t * .3) * 5, T.cz + Math.sin(a) * r); C.lookAt(T.cx, T.ly, T.cz); return; }
    if (st.mode === 'orbit') { const a = st.t * .25, d = v ? 13 : 7; C.position.set(p.x + Math.sin(a) * d, (v ? 4.5 : 2.6) + Math.sin(st.t * .4), p.z + Math.cos(a) * d); C.lookAt(p.x, 1.2, p.z); return; }
    if (st.mode === 'drone') { const d = v ? 26 : 16, k = 1 - Math.exp(-dt * 1.6); const tx = p.x - Math.sin(h) * d, tz = p.z - Math.cos(h) * d; C.position.x += (tx - C.position.x) * k; C.position.z += (tz - C.position.z) * k; C.position.y += ((v ? 18 : 16) - C.position.y) * k; C.lookAt(p.x + Math.sin(h) * 6, 1, p.z + Math.cos(h) * 6); return; }
    if (st.mode === 'fly') { const u = (st.t % 9) / 9, s = -30 + u * 60, side = 7; C.position.set(p.x + Math.sin(h) * s + Math.cos(h) * side, 1.6 + Math.sin(u * Math.PI) * 3, p.z + Math.cos(h) * s - Math.sin(h) * side); C.lookAt(p.x, 1.1, p.z); return; }
    if (st.mode === 'street') { if (!st.fix || Math.hypot(st.fix.x - p.x, st.fix.z - p.z) > 45) st.fix = { x: p.x + Math.sin(h) * 30 + Math.cos(h) * 6, z: p.z + Math.cos(h) * 30 - Math.sin(h) * 6 }; C.position.set(st.fix.x, 1.7, st.fix.z); C.lookAt(p.x, 1.2, p.z); }
  }
  // the recorded picture: the game view cropped to the format, with bars, caption and watermark burned in
  function compose() { if (!rec) return; const src = bb.renderer.domElement, W = comp.width, H = comp.height; const sa = src.width / src.height, da = W / H; let sw = src.width, sh = src.height; if (sa > da) sw = sh * da; else sh = sw / da;
    cctx.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, W, H); const bh = st.bars ? Math.round(H * (st.fmt === '16:9' ? .1 : .07)) : 0; cctx.fillStyle = '#000'; if (bh) { cctx.fillRect(0, 0, W, bh); cctx.fillRect(0, H - bh, W, bh); }
    const u = Math.min(W, H) / 720; cctx.textBaseline = 'alphabetic';
    if (st.cap) { const c = caption(); if (c) { cctx.font = `800 ${Math.round(34 * u)}px system-ui, sans-serif`; cctx.fillStyle = 'rgba(0,0,0,.45)'; cctx.fillText(c, 42 * u + 2, H - bh - 40 * u + 2); cctx.fillStyle = '#fff'; cctx.fillText(c, 42 * u, H - bh - 40 * u); } }
    if (st.mark) { cctx.font = `800 ${Math.round(22 * u)}px system-ui, sans-serif`; const t = 'INDIA BAY · indiabaygame.com'; const w = cctx.measureText(t).width; cctx.fillStyle = 'rgba(0,0,0,.4)'; cctx.fillText(t, W - w - 30 * u + 2, bh + 44 * u + 2); cctx.fillStyle = '#ffc93c'; cctx.fillText(t, W - w - 30 * u, bh + 44 * u); } }
  bb.onAfterRender(compose);
  function start() { if (!allowed()) return bb.toast('Film mode is switched off right now', '#ff9f1c'); if (!bb.started) return; if (st.on) return; if (bb.photo) return bb.toast('Close photo mode first', '#d6c8e4');
    st.on = true; st.t = 0; st.fix = null; document.body.classList.add('film'); cam.live = true; bb.photo = cam; bb.viewAt = () => { if (st.mode === 'tour') { const T = bb.tourSpots[st.tourI]; if (T) return { x: T.cx, z: T.cz }; } return bb.ppos(); }; ui(); }
  function stop() { if (rec) stopRec(); st.on = false; document.body.classList.remove('film', 'filmbars'); bb.photo = null; bb.viewAt = null; if (bar) bar.remove(); bar = null; }
  function ui() { if (bar) bar.remove(); bar = document.createElement('div'); bar.id = 'filmBar'; document.body.classList.toggle('filmbars', st.bars);
    bar.innerHTML = `<div class="frow">${MODES.map(m => `<button class="chip${m[0] === st.mode ? ' on' : ''}" data-m="${m[0]}" title="${m[2]}">${m[1]}</button>`).join('')}</div>
      <div class="frow"><button class="chip${st.fmt === '16:9' ? ' on' : ''}" data-f="16:9">▭ 16:9 YouTube</button><button class="chip${st.fmt === '9:16' ? ' on' : ''}" data-f="9:16">▯ 9:16 Reels</button><button class="chip${st.bars ? ' on' : ''}" data-o="bars">Cinema bars</button><button class="chip${st.cap ? ' on' : ''}" data-o="cap">Place name</button><button class="chip${st.mark ? ' on' : ''}" data-o="mark">Watermark</button></div>
      <div class="frow">${rec ? `<button class="go" data-a="stop">■ Stop and save · ${Math.floor((Date.now() - rec.t0) / 1000)} s</button>` : '<button class="go" data-a="rec">● Record</button>'}<button class="buy ghost" data-a="hide">Hide panel (H)</button><button class="buy ghost" data-a="exit">Exit film mode</button></div>`;
    document.body.appendChild(bar);
    bar.onclick = e => { const b = e.target.closest('button'); if (!b) return; const d = b.dataset; if (d.m) { st.mode = d.m; st.t = 0; st.fix = null; } if (d.f && !rec) st.fmt = d.f; if (d.o) st[d.o] = !st[d.o]; if (d.a === 'rec') startRec(); if (d.a === 'stop') stopRec(); if (d.a === 'exit') return stop(); if (d.a === 'hide') { bar.hidden = true; bb.toast('Film panel hidden · press H to show it', '#d6c8e4'); return; } ui(); }; }
  function startRec() { const mime = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m));
    comp = document.createElement('canvas'); [comp.width, comp.height] = st.fmt === '16:9' ? [1920, 1080] : [1080, 1920]; cctx = comp.getContext('2d'); if (!comp.captureStream || !window.MediaRecorder) return bb.toast('This browser cannot record video · try Chrome or Edge', '#ff9f1c');
    let mr; try { mr = new MediaRecorder(comp.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 12e6 } : {}); } catch (e) { return bb.toast('Recording failed to start', '#ff9f1c'); }
    const chunks = []; mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = () => { const type = (mr.mimeType || mime || 'video/webm').split(';')[0]; const blob = new Blob(chunks, { type }); const name = `india-bay-film-${st.fmt === '16:9' ? 'wide' : 'reel'}-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.${type.includes('mp4') ? 'mp4' : 'webm'}`;
      save(name, blob); };
    rec = { mr, t0: Date.now(), iv: setInterval(() => { if (bar && !bar.hidden) ui(); }, 1000) }; mr.start(1000); ui(); bb.toast('Recording · press R to stop', '#ff5d73'); }
  let dl = null; (async () => { try { if (window.claude && claude.use) dl = await claude.use('downloads'); } catch (e) { dl = null; } })();
  async function save(name, blob) { if (dl) { try { await dl.save({ filename: name, data: blob }); bb.toast('Video saved', '#3ddc97'); } catch (e) { bb.toast(e && e.code === 'declined' ? 'Not saved' : 'Saving is not available here', '#ff9f1c'); } return; }
    const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 8000); bb.toast('Video saved to your downloads', '#3ddc97'); }
  function stopRec() { if (!rec) return; clearInterval(rec.iv); if (rec.mr.state !== 'inactive') rec.mr.stop(); rec = null; if (st.on) ui(); }
  addEventListener('keydown', e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.code === 'F9') { e.preventDefault(); return st.on ? stop() : start(); }
    if (!st.on) return; if (e.code === 'KeyH' && bar) bar.hidden = !bar.hidden; if (e.code === 'KeyR') rec ? stopRec() : startRec(); if (e.code === 'Escape') stop();
    const n = { Digit1: 'tour', Digit2: 'orbit', Digit3: 'drone', Digit4: 'fly', Digit5: 'street' }[e.code]; if (n) { st.mode = n; st.t = 0; st.fix = null; ui(); } });
  bb.addApp({ id: 'film', label: 'Film mode', icon: '🎬', show: allowed, fn: () => { if (!allowed()) return bb.toast('Film mode is switched off right now', '#ff9f1c'); bb.closeSheet(); setTimeout(start, 120); } });
  bb.FILM = { start, stop, get on() { return st.on; }, allowed };
});
