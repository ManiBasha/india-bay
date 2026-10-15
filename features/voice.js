// Voice messages, walkie-talkie style: hold 🎙 (or V) to record up to 8 seconds, let go to send it to players
// within chat range. Clips play when they arrive; tap a 🎙 line in the chat to replay it. Muted players are
// never heard. The admin can switch voice off for everyone (Admin → Online and moderation); the server checks it too.
window.BBFeatures.push(function (bb) {
  const MAX_MS = 8000, MIN_MS = 400;
  let hear = (() => { try { return localStorage.getItem('ib.voiceIn') !== '0'; } catch (e) { return true; } })();
  const btn = document.createElement('button'); btn.id = 'ptt'; btn.type = 'button'; btn.className = 'pill'; btn.hidden = true; btn.setAttribute('aria-label', 'Hold to talk'); btn.innerHTML = '🎙<small>Hold to talk</small>';
  const lcol = document.querySelector('#top .lcol'); if (lcol) { const chat = document.querySelector('#chat'); if (chat && chat.nextSibling) lcol.insertBefore(btn, chat.nextSibling); else lcol.appendChild(btn); }
  const allowed = () => bb.CFG.voiceChat !== false;
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  setInterval(() => { btn.hidden = !(bb.started && supported && allowed() && bb.ONLINE && bb.ONLINE.status === 'on' && !bb.ONLINE.guest); }, 1000);
  let stream = null, rec = null, chunks = [], t0 = 0, timer = null, mime = '';
  function pickMime() { for (const m of ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm']) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) return m; return ''; }
  async function start() { if (rec || !allowed()) { if (!allowed()) bb.toast('Voice messages are switched off right now', '#d6c8e4'); return; } if (!bb.ONLINE || bb.ONLINE.status !== 'on') return bb.toast('Go online to send voice messages', '#d6c8e4');
    try { if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } }); } catch (e) { bb.toast('Microphone not allowed · check your browser settings', '#ff8b8b'); return; }
    if (!held) return; // let go while the permission prompt was open
    mime = pickMime(); try { rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : { audioBitsPerSecond: 24000 }); } catch (e) { rec = new MediaRecorder(stream); }
    chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); }; rec.onstop = send; rec.start(); t0 = performance.now(); btn.classList.add('rec'); tick(); timer = setInterval(tick, 200); }
  function tick() { const s = (performance.now() - t0) / 1000; btn.innerHTML = `🔴<small>${s.toFixed(1)} s · let go to send</small>`; if (s * 1000 >= MAX_MS) stop(); }
  function stop() { if (!rec) return; clearInterval(timer); btn.classList.remove('rec'); btn.innerHTML = '🎙<small>Hold to talk</small>'; const r = rec; rec = null; r.ms = performance.now() - t0; try { r.stop(); } catch (e) {} }
  function send() { const ms = Math.round(performance.now() - t0); const blob = new Blob(chunks, { type: (mime || 'audio/webm').split(';')[0] }); chunks = [];
    if (ms < MIN_MS || blob.size < 200) return bb.toast('Too short · hold the button while you talk', '#d6c8e4');
    const fr = new FileReader(); fr.onload = () => { const a = String(fr.result).split(',')[1] || ''; if (a.length > 46000) return bb.toast('Too long · keep it under 8 seconds', '#ff9f1c');
      if (!bb.ONLINE.send({ t: 'vc', a, ms: Math.min(MAX_MS, ms), mime: mime || 'audio/webm', r: bb.ONLINE.chatR || 'close' })) bb.toast('Not connected', '#ff8b8b'); }; fr.readAsDataURL(blob); }
  // hold-to-talk: finger or mouse on the button, or the V key
  let held = false;
  btn.addEventListener('pointerdown', e => { e.preventDefault(); held = true; try { btn.setPointerCapture(e.pointerId); } catch (_) {} start(); });
  const up = () => { held = false; stop(); }; btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up); btn.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('keydown', e => { if (e.code !== 'KeyV' || e.repeat || (bb.CINE && bb.CINE.on)) return; if (e.target.closest && e.target.closest('input,textarea,select')) return; if (!bb.started || bb.uiLock() || btn.hidden) return; held = true; start(); });
  addEventListener('keyup', e => { if (e.code === 'KeyV' && held) up(); });
  /* receiving */
  const log = () => document.querySelector('#chatlog');
  // a button to hear it when the browser blocks sound that starts by itself (Beta v1.01.16)
  function tapToHear(d, url) { const lc = document.querySelector('#top .lcol'); if (!lc) return; let b = document.querySelector('#vcPlay'); if (!b) { b = document.createElement('button'); b.id = 'vcPlay'; b.type = 'button'; b.className = 'pill'; lc.appendChild(b); }
    b.innerHTML = `🔊 <b>Hear ${bb.esc(d.n)}</b> <small>${Math.max(1, Math.round(d.ms / 1000))} s</small>`; b.hidden = false; b.onclick = () => { const au = new Audio(url); au.play().catch(() => bb.toast('Turn up your volume and tap again', '#d6c8e4')); b.hidden = true; }; clearTimeout(b._t); b._t = setTimeout(() => { b.hidden = true; }, 30000); }
  function play(d) { try { const bin = atob(d.a); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); const url = URL.createObjectURL(new Blob([u8], { type: d.mime.split(';')[0] }));
      const au = new Audio(url); au.volume = 1; au.play().catch(() => { tapToHear(d, url); bb.toast(`🎙 ${bb.esc(d.n)} sent a voice message · tap 🔊 Hear to listen`, '#ffc93c'); }); au.onended = () => setTimeout(() => URL.revokeObjectURL(url), 60000); } catch (e) {} }
  bb.on('voice', d => { if (d.t === 'vcoff') return bb.toast('Voice messages are switched off by the admin', '#d6c8e4'); if (!allowed()) return;
    if (!d.self && bb.ONLINE.isMuted(d.n)) return; const secs = Math.max(1, Math.round(d.ms / 1000));
    const L = log(); if (L) { const line = document.createElement('div'); line.className = 'cl vc'; line.innerHTML = `<b>${bb.esc(d.n)}</b> 🎙 ${secs} s ${d.self ? '· sent' : '▶'}`; if (!d.self) line.onclick = () => play(d); L.appendChild(line); while (L.children.length > 4) L.firstChild.remove();
      setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 800); }, 20000); }
    bb.ONLINE.bubble(d.id, `🎙 ${d.self ? 'Voice sent' : 'Talking…'}`); if (!d.self && hear) play(d); });
  bb.VOICE = { get hear() { return hear; }, set hear(v) { hear = !!v; try { localStorage.setItem('ib.voiceIn', hear ? '1' : '0'); } catch (e) {} bb.toast(hear ? 'Voice messages on' : 'Voice messages off', '#d6c8e4'); } };
});
