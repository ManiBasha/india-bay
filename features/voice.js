// Voice chat, walkie-talkie style (Beta v1.01.21: live). Hold 🎙 (or V) and talk: players near you hear you at
// the same time, while you speak, with nothing to tap. Let go to stop. Up to 20 seconds at a time.
// The sound goes through the game server in small pieces (8 kHz, like a phone line) and is never stored.
// Muted players are never heard. Sound → Voice chat and calls switches all voices off for you.
// The admin can switch voice off for everyone (Admin → Online and moderation); the server checks it too.
window.BBFeatures.push(function (bb) {
  const MAX_MS = 20000, RATE = 8000, CHUNK = 1600;   // 0.2 s per piece
  let hear = (() => { try { return localStorage.getItem('ib.voiceIn') !== '0'; } catch (e) { return true; } })();
  const btn = document.createElement('button'); btn.id = 'ptt'; btn.type = 'button'; btn.className = 'pill'; btn.hidden = true; btn.setAttribute('aria-label', 'Hold to talk'); btn.innerHTML = '🎙<small>Hold to talk</small>';
  const lcol = document.querySelector('#top .lcol'); if (lcol) { const chat = document.querySelector('#chat'); if (chat && chat.nextSibling) lcol.insertBefore(btn, chat.nextSibling); else lcol.appendChild(btn); }
  const allowed = () => bb.CFG.voiceChat !== false;
  const speaker = () => !bb.SOUND || bb.SOUND.voice !== false;
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  setInterval(() => { btn.hidden = !(bb.started && supported && allowed() && bb.ONLINE && bb.ONLINE.status === 'on' && !bb.ONLINE.guest); }, 1000);
  const AC = () => { const a = bb.audio; if (a && a.state === 'suspended') a.resume().catch(() => {}); return a; };
  // browsers start sound only after a tap: every tap wakes the sound up again
  addEventListener('pointerdown', () => { const a = bb.audio; if (a && a.state === 'suspended') a.resume().catch(() => {}); }, true);
  /* μ-law: 8 bits per sample, the phone-line format */
  function mulaw(x) { const s = x < 0 ? 0x80 : 0; let v = Math.min(32635, Math.abs(x) * 32767) + 132; let e = 7; for (let m = 0x4000; (v & m) === 0 && e > 0; m >>= 1) e--; return ~(s | (e << 4) | ((v >> (e + 3)) & 0x0f)) & 0xff; }
  const MUT = new Float32Array(256); for (let i = 0; i < 256; i++) { const u = ~i & 0xff; const s = u & 0x80, e = (u >> 4) & 7, m = u & 0x0f; let v = ((m << 3) + 132) << e; v -= 132; MUT[i] = (s ? -v : v) / 32768; }
  const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 4096) s += String.fromCharCode.apply(null, u8.subarray(i, i + 4096)); return btoa(s); };
  const unb64 = a => { const bin = atob(a), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  /* ---------- talking ---------- */
  let stream = null, src = null, proc = null, sink = null, talking = false, held = false, t0 = 0, seq = 0, acc = [], pos = 0, sent = 0, timer = null;
  async function start() { if (talking || !allowed()) { if (!allowed()) bb.toast('Voice chat is switched off right now', '#d6c8e4'); return; } if (!bb.ONLINE || bb.ONLINE.status !== 'on') return bb.toast('Go online to talk to players', '#d6c8e4');
    const ac = AC(); if (!ac) return bb.toast('Sound is not ready yet · tap the screen once', '#d6c8e4');
    try { if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } }); } catch (e) { bb.toast('Microphone not allowed · check your browser settings', '#ff8b8b'); return; }
    if (!held) return;   // let go while the permission prompt was open
    talking = true; t0 = performance.now(); seq = 0; acc = []; pos = 0; sent = 0;
    src = ac.createMediaStreamSource(stream); proc = ac.createScriptProcessor(2048, 1, 1); sink = ac.createGain(); sink.gain.value = 0;
    const step = ac.sampleRate / RATE; let buf = new Uint8Array(CHUNK), n = 0;
    proc.onaudioprocess = ev => { if (!talking) return; const d = ev.inputBuffer.getChannelData(0);
      for (; pos < d.length; pos += step) { const i = Math.floor(pos); let s = 0, k = 0; for (let j = i; j < Math.min(d.length, i + Math.max(1, Math.floor(step))); j++) { s += d[j]; k++; } buf[n++] = mulaw(k ? s / k : 0); if (n === CHUNK) { push(buf); buf = new Uint8Array(CHUNK); n = 0; } }
      pos -= d.length; };
    proc._flush = () => { if (n) push(buf.subarray(0, n)); n = 0; };
    src.connect(proc); proc.connect(sink); sink.connect(ac.destination);
    btn.classList.add('rec'); tick(); timer = setInterval(tick, 200); bb.emit('voiceTalk', true); if (bb.USAGE) bb.USAGE.add('voice_talks'); }
  const range = () => (bb.EVENTS && bb.EVENTS.onStage && bb.EVENTS.onStage()) ? 'area' : (bb.ONLINE.chatR || 'close');   // on an event stage your voice reaches the whole crowd
  function push(u8) { const ok = bb.ONLINE.send({ t: 'vs', k: seq === 0 ? 's' : 'd', s: seq, a: b64(u8), r: range() }); seq++; sent += u8.length; if (!ok) { bb.toast('Not connected', '#ff8b8b'); stop(); } }
  function tick() { const s = (performance.now() - t0) / 1000; btn.innerHTML = `🔴<small>${s.toFixed(1)} s · players hear you live</small>`; if (s * 1000 >= MAX_MS) stop(); }
  function stop() { if (!talking) return; talking = false; if (bb.USAGE) bb.USAGE.add('voice_s', Math.round((performance.now() - t0) / 1000)); clearInterval(timer); btn.classList.remove('rec'); btn.innerHTML = '🎙<small>Hold to talk</small>';
    try { proc && proc._flush && proc._flush(); } catch (e) {} try { src && src.disconnect(); proc && proc.disconnect(); sink && sink.disconnect(); } catch (e) {} src = proc = sink = null;
    if (seq > 0) bb.ONLINE.send({ t: 'vs', k: 'e', s: seq, a: '', r: range() }); if (sent < RATE * .3 && seq <= 2) bb.toast('Hold the button while you talk', '#d6c8e4'); bb.emit('voiceTalk', false); }
  // hold-to-talk: finger or mouse on the button, or the V key
  btn.addEventListener('pointerdown', e => { e.preventDefault(); held = true; try { btn.setPointerCapture(e.pointerId); } catch (_) {} start(); });
  const up = () => { held = false; stop(); }; btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up); btn.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('keydown', e => { if (e.code !== 'KeyV' || e.repeat || (bb.CINE && bb.CINE.on)) return; if (e.target.closest && e.target.closest('input,textarea,select')) return; if (!bb.started || bb.uiLock() || btn.hidden) return; held = true; start(); });
  addEventListener('keyup', e => { if (e.code === 'KeyV' && held) up(); });
  /* ---------- hearing others: each piece plays the moment it arrives ---------- */
  const voices = new Map();   // sender id -> { next, gain, pcs: [], line, name, t }
  const log = () => document.querySelector('#chatlog');
  function toBuffer(ac, u8) { const n = u8.length; let b; try { b = ac.createBuffer(1, n, RATE); b.getChannelData(0).set(Float32Array.from(u8, x => MUT[x])); return b; } catch (e) {}
    const r = ac.sampleRate / RATE, m = Math.floor(n * r); b = ac.createBuffer(1, m, ac.sampleRate); const o = b.getChannelData(0); for (let i = 0; i < m; i++) { const x = i / r, j = Math.floor(x), f = x - j; o[i] = MUT[u8[j]] * (1 - f) + MUT[u8[Math.min(n - 1, j + 1)]] * f; } return b; }
  function volFor(id) { const R = bb.ONLINE.remotes && bb.ONLINE.remotes.get(id); if (!R) return 1; const p = bb.ppos(); const d = Math.hypot(R.x - p.x, R.z - p.z); return Math.max(.25, Math.min(1, 1.15 - d / 260)); }
  function onPiece(d) { if (!allowed() || !hear || !speaker()) return; if (bb.ONLINE.isMuted(d.n)) return; const ac = AC(); if (!ac) return;
    let v = voices.get(d.id); const now = ac.currentTime;
    if (!v || d.k === 's') { if (v && v.line) v.line.classList.add('done'); v = { next: 0, gain: ac.createGain(), pcs: [], name: d.n, t: Date.now() }; v.gain.connect(ac.destination); voices.set(d.id, v);
      const L = log(); if (L) { const line = document.createElement('div'); line.className = 'cl vc'; line.innerHTML = `<b>${bb.esc(d.n)}</b> 🎙 talking…`; L.appendChild(line); while (L.children.length > 4) L.firstChild.remove(); v.line = line; setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 800); }, 25000); } }
    if (d.k === 'e') { if (v.line) { const secs = Math.max(1, Math.round(v.pcs.reduce((a, u) => a + u.length, 0) / RATE)); v.line.innerHTML = `<b>${bb.esc(d.n)}</b> 🎙 ${secs} s ▶`; const pcs = v.pcs.slice(); v.line.onclick = () => replay(pcs); } return; }
    if (!d.a) return; const u8 = unb64(d.a); if (v.pcs.length < 120) v.pcs.push(u8);
    v.gain.gain.value = volFor(d.id); const b = toBuffer(ac, u8); const s = ac.createBufferSource(); s.buffer = b; s.connect(v.gain);
    if (v.next < now + .05 || v.next > now + 1.5) v.next = now + .15;   // a small cushion so pieces play smoothly
    s.start(v.next); v.next += b.duration; v.t = Date.now();
    bb.ONLINE.bubble(d.id, '🎙 Talking…'); }
  function replay(pcs) { const ac = AC(); if (!ac) return; let t = ac.currentTime + .05; for (const u8 of pcs) { const b = toBuffer(ac, u8); const s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(t); t += b.duration; } }
  setInterval(() => { const now = Date.now(); for (const [id, v] of voices) if (now - v.t > 30000) voices.delete(id); }, 10000);
  bb.on('voicestream', onPiece);
  // older games still send recorded clips: play those too (they arrive whole)
  function playClip(d) { const ac = AC(); try { const u8 = unb64(d.a); if (ac && ac.decodeAudioData) { ac.decodeAudioData(u8.buffer.slice(0), b => { const s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(); }, () => { new Audio(URL.createObjectURL(new Blob([u8], { type: (d.mime || 'audio/webm').split(';')[0] }))).play().catch(() => {}); }); return; }
      new Audio(URL.createObjectURL(new Blob([u8], { type: (d.mime || 'audio/webm').split(';')[0] }))).play().catch(() => {}); } catch (e) {} }
  bb.on('voice', d => { if (d.t === 'vcoff') return bb.toast('Voice chat is switched off by the admin', '#d6c8e4'); if (d.t === 'vsoff') return bb.toast('🎙 ' + bb.esc(d.msg || 'You cannot use voice chat right now'), '#ffc93c'); if (!allowed() || d.self) return;
    if (bb.ONLINE.isMuted(d.n) || !hear || !speaker()) return; bb.ONLINE.bubble(d.id, '🎙 Voice message'); playClip(d); });
  bb.VOICE = { get hear() { return hear; }, set hear(v) { hear = !!v; try { localStorage.setItem('ib.voiceIn', hear ? '1' : '0'); } catch (e) {} bb.toast(hear ? 'Voices on' : 'Voices off', '#d6c8e4'); }, set speaker(v) {}, get talking() { return talking; } };
});
