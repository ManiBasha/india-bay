// Photo mode, photos and 30 or 60 second gameplay clips to share on Instagram, YouTube or WhatsApp.
window.BBFeatures.push(function (bb) {
  let dl = null; (async () => { try { if (window.claude && claude.use) dl = await claude.use('downloads'); } catch (e) { dl = null; } })();
  async function saveFile(name, blob) { if (dl) { try { await dl.save({ filename: name, data: blob }); bb.toast('Saved · share it on Instagram, YouTube or WhatsApp', '#3ddc97'); bb.emit('media', name); } catch (e) { if (e && e.code === 'declined') bb.toast('Not saved', '#d6c8e4'); else bb.toast('Saving is not available here', '#ff9f1c'); } return; }
    try { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); bb.toast('Saved to your downloads', '#3ddc97'); bb.emit('media', name); } catch (e) { bb.toast('Saving is not available here', '#ff9f1c'); } }
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  let snapReq = false;
  bb.onAfterRender(() => { if (!snapReq) return; snapReq = false; const src = bb.renderer.domElement; const k = Math.min(1, 1600 / src.width); const c = document.createElement('canvas'); c.width = Math.round(src.width * k); c.height = Math.round(src.height * k); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    c.toBlob(b => { if (b) bb.BAYGRAM.keep('photo', b); }, 'image/jpeg', .88); });
  /* photo mode with a free orbit camera */
  let bar = null, orbit = { a: 0, e: .35, d: 9 }, drag = null;
  function enter() { if (bb.photo) return exit(); if (bb.uiLock()) return; if (bb.inside) { bb.toast('Photo mode works outside', '#d6c8e4'); return; } document.body.classList.add('photo'); const p = bb.ppos(); orbit.a = (bb.player.veh ? bb.player.veh.h : bb.player.h) + Math.PI; orbit.e = .35; orbit.d = bb.player.veh ? 10 : 6;
    bar = document.createElement('div'); bar.id = 'photoBar'; bar.innerHTML = '<button class="go" data-p="snap">Take photo</button><button class="buy ghost" data-p="r15">Record 15 s</button><button class="buy ghost" data-p="r30">Record 30 s</button><button class="buy ghost" data-p="r60">Record 60 s</button><button class="buy ghost" data-p="exit">Exit</button>'; document.body.appendChild(bar);
    bar.onclick = e => { const k = e.target.dataset.p; if (k === 'snap') snapReq = true; if (k === 'r15') record(15); if (k === 'r30') record(30); if (k === 'r60') record(60); if (k === 'exit') exit(); };
    bb.photo = dt => { const p = bb.ppos(); const k = 1.6 * dt; if (keys.left) orbit.a += k; if (keys.right) orbit.a -= k; if (keys.up) orbit.e = Math.min(1.35, orbit.e + k * .6); if (keys.down) orbit.e = Math.max(.05, orbit.e - k * .6);
      bb.camera.position.set(p.x + Math.sin(orbit.a) * Math.cos(orbit.e) * orbit.d, 1.2 + Math.sin(orbit.e) * orbit.d, p.z + Math.cos(orbit.a) * Math.cos(orbit.e) * orbit.d); bb.camera.lookAt(p.x, 1.4, p.z); }; bb.toast('Photo mode · drag or use arrows to orbit, scroll to zoom', '#ffc93c'); }
  function exit() { document.body.classList.remove('photo'); if (bar) bar.remove(); bar = null; bb.photo = null; }
  const keys = {}; addEventListener('keydown', e => { if (!bb.photo) return; const m = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down' }[e.code]; if (m) keys[m] = true; if (e.code === 'Escape') exit(); });
  addEventListener('keyup', e => { const m = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down' }[e.code]; if (m) keys[m] = false; });
  const cv = bb.renderer.domElement;
  cv.addEventListener('pointerdown', e => { if (bb.photo) drag = { x: e.clientX, y: e.clientY }; }); addEventListener('pointerup', () => drag = null);
  addEventListener('pointermove', e => { if (!bb.photo || !drag) return; orbit.a -= (e.clientX - drag.x) * .008; orbit.e = Math.max(.05, Math.min(1.35, orbit.e + (e.clientY - drag.y) * .006)); drag = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener('wheel', e => { if (!bb.photo) return; orbit.d = Math.max(3, Math.min(60, orbit.d * (e.deltaY > 0 ? 1.1 : .9))); }, { passive: true });
  /* clips */
  let rec = null;
  function record(secs) { if (rec) { bb.toast('Already recording', '#d6c8e4'); return; } if (!cv.captureStream || !window.MediaRecorder) { bb.toast('This browser cannot record clips', '#ff9f1c'); return; }
    let mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || ''; const stream = cv.captureStream(30); let mr; try { mr = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2.4e6 } : {}); } catch (e) { bb.toast('Recording failed to start', '#ff9f1c'); return; }
    const chunks = []; mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); }; mr.onstop = () => { badge.remove(); rec = null; const ext = (mr.mimeType || mime).includes('mp4') ? 'mp4' : 'webm'; bb.BAYGRAM.keep('video', new Blob(chunks, { type: (mr.mimeType || mime || 'video/webm').split(';')[0] }), ext); };
    const badge = document.createElement('div'); badge.id = 'rec'; document.body.appendChild(badge); let left = secs; badge.textContent = `● REC ${left}s`; const iv = setInterval(() => { left--; badge.textContent = `● REC ${left}s`; if (left <= 0) { clearInterval(iv); if (mr.state !== 'inactive') mr.stop(); } }, 1000);
    rec = { mr, iv }; mr.start(1000); exit(); bb.toast(`Recording ${secs} s · keep playing`, '#ff5d73'); }
  bb.onKey('KeyP', enter);
  bb.addApp({ id: 'camera', label: 'Camera', icon: '📷', smart: true, fn: () => { bb.closeSheet(); setTimeout(enter, 50); } });
  bb.MEDIA = { saveFile, stamp, enter };
});
