// Phone → 📞 Phone and 💬 Messages: call and text other players by their username (Google accounts only).
// Contacts are saved in your account. A call rings the other player wherever they are on the map; once they answer,
// it is a live two-way call (Beta v1.01.16); hold 🎙 is the fallback when the live line cannot connect. Texts are kept until you delete them.
// You can decline, block and choose who may call you. Needs online/supabase-update-6.sql and the new worker.
window.BBFeatures.push(function (bb) {
  const esc = bb.esc, O = () => bb.ONLINE, sb = () => O() && O().client;
  const ok = () => O() && O().signedIn && !O().guest;
  const need = () => { if (!O() || !O().signedIn) { bb.toast('Sign in (👤 Profile) to call and text friends', '#ff9f1c'); return false; } if (O().guest) { bb.toast('Calls and texts need a Google account · 👤 Profile → Sign in with Google', '#ff9f1c'); return false; } return true; };
  const pref = () => { try { return localStorage.getItem('ib.callsFrom') || 'contacts'; } catch (e) { return 'contacts'; } };
  let contacts = [], blocked = new Set(), unread = 0, threads = [];
  async function loadContacts() { if (!ok()) return []; const r = await sb().from('contacts').select('friend_name,created_at').order('friend_name'); contacts = (r.data || []).map(c => c.friend_name); return contacts; }
  const ago = s => { const m = Math.max(0, Math.round((Date.now() - new Date(s).getTime()) / 60000)); return m < 1 ? 'now' : m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' d'; };
  /* ---------- contacts and calls ---------- */
  async function callsApp() { if (!need()) return; await loadContacts();
    bb.openSheet('📞 Phone', `You are @${esc(O().username)} · friends call you by your username`, `<form class="form" id="addc"><label>Add a friend by username<input id="ac_n" maxlength="10" placeholder="Raju2026" autocomplete="off"></label><div class="btnrow"><button class="go" type="submit">Add</button></div></form>` +
      (contacts.length ? contacts.map(n => `<div class="row"><div class="nm"><span class="cav">${esc(n[0]).toUpperCase()}</span><b>@${esc(n)}</b></div><div class="btnrow" style="gap:6px;flex-wrap:nowrap"><button class="go" data-call="${esc(n)}">📞</button><button class="buy ghost" data-text="${esc(n)}">💬</button><button class="buy ghost" data-del="${esc(n)}">✕</button></div></div>`).join('') : '<p class="note">No friends yet. Send a friend request by username, or from a player\'s BayGram profile.</p>') +
      `<h3 class="sub">Who can call you</h3><div class="chips">${[['contacts', 'My friends'], ['everyone', 'Everyone'], ['nobody', 'Nobody']].map(([k, n]) => `<button class="chip${pref() === k ? ' on' : ''}" data-pref="${k}">${n}</button>`).join('')}</div><p class="note">Calls reach friends who are online now. Calls are live: both of you talk at the same time. Calls are not recorded.</p>`,
      s => { s.querySelector('#addc').onsubmit = async e => { e.preventDefault(); const n = s.querySelector('#ac_n').value.trim().toLowerCase(); if (!/^[A-Za-z0-9_.]{1,15}$/.test(n)) return bb.toast('Usernames are small letters, numbers, _ and . (up to 15)', '#ff9f1c'); const r = await O().rpc('add_contact', { p_name: n }); if (r.error) return bb.toast(niceSql(r.error), '#ff8b8b'); if (r.data !== 'ok') return bb.toast(r.data, '#ff9f1c'); bb.toast(`Friend request sent to @${n} · you can call once they accept`, '#3ddc97'); callsApp(); };
        s.onclick = async e => { const d = e.target.dataset; if (d.call) return dial(d.call); if (d.text) return thread(d.text); if (d.pref) { try { localStorage.setItem('ib.callsFrom', d.pref); } catch (er) {} return callsApp(); }
          if (d.del) { const r = await sb().from('contacts').delete().eq('friend_name', d.del); if (!r.error) callsApp(); } }; }); }
  const niceSql = e => /does not exist|schema cache|function/i.test(e.message || '') ? 'Calls and texts are not set up on the server yet (update 6)' : (e.message || String(e));
  /* the call screen */
  const ui = document.createElement('div'); ui.id = 'callUI'; ui.hidden = true; document.body.appendChild(ui);
  let call = null; // {who, state: 'out'|'in'|'on', t0}
  const tone = (f, ms) => { try { const ac = new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .06; o.connect(g); g.connect(ac.destination); o.start(); setTimeout(() => { o.stop(); ac.close(); }, ms); } catch (e) {} };
  let ringIv = null; const ring = on => { clearInterval(ringIv); if (on) { tone(440, 400); ringIv = setInterval(() => { tone(440, 400); setTimeout(() => tone(480, 400), 450); }, 2200); } };
  function render() { if (!call) { ui.hidden = true; ring(false); return; } ui.hidden = false; const c = call; const secs = c.state === 'on' ? Math.floor((Date.now() - c.t0) / 1000) : 0;
    ui.innerHTML = `<div class="ccard"><div class="cav big">${esc(c.who[0]).toUpperCase()}</div><b>@${esc(c.who)}</b><small>${c.state === 'out' ? 'Calling…' : c.state === 'in' ? (contacts.includes(c.who) ? 'Incoming call' : 'Incoming call · not in your contacts') : `${c.live ? '🟢 Live' : 'Connecting the line…'} · ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}</small>
      <div class="cbtns2">${c.state === 'in' ? '<button class="cb ok" data-k="accept">📞<span>Answer</span></button><button class="cb no" data-k="decline">✕<span>Decline</span></button><button class="cb" data-k="block">⛔<span>Block</span></button>' : ''}
      ${c.state === 'on' ? `<button class="cb${c.mute ? ' on' : ''}" data-k="mute">${c.mute ? '🔇' : '🎤'}<span>${c.mute ? 'Unmute' : 'Mute'}</span></button>${c.needTap ? '<button class="cb ok" data-k="spk">🔊<span>Tap to hear</span></button>' : ''}${c.fallback ? '<button class="cb talk" data-k="talk">🎙<span>Hold to talk</span></button>' : ''}` : ''}${c.state !== 'in' ? '<button class="cb no" data-k="end">✕<span>End</span></button>' : ''}${c.state !== 'out' ? '<button class="cb" data-k="rep">⚑<span>Report</span></button>' : ''}</div>${c.heard ? `<p class="note">${esc(c.heard)}</p>` : ''}</div>`; }
  setInterval(() => { if (remoteAu) remoteAu.muted = !!(bb.SOUND && bb.SOUND.voice === false); if (call && call.state === 'on') { if (pc) { const live = pc.connectionState === 'connected' || ['connected', 'completed'].includes(pc.iceConnectionState); if (live && !call.live) { call.heard = ''; call.fallback = false; } call.live = live; } render(); } }, 1000);
  const tx = (k, extra) => O() && O().send(Object.assign({ t: 'call', k, to: call ? call.who : '' }, extra || {}));
  function dial(who) { if (!need()) return; if (O().silencedUntil) return bb.toast(O().silenceNote(O().silencedUntil), '#ff8b8b'); if (bb.CFG.callsOn === false) return bb.toast('📞 ' + esc(bb.CFG.chatNote || 'Calls are paused by the admin right now'), '#ffc93c'); if (call) return bb.toast('Already on a call', '#ffc93c'); bb.closeSheet(); call = { who, state: 'out' }; render(); ring(true); if (!tx('ring')) { bb.toast('You are offline · connect from Phone → Online', '#ff9f1c'); call = null; render(); return; } setTimeout(() => { if (call && call.who === who && call.state === 'out') { tx('end'); call = null; render(); bb.toast(`@${who} did not answer`, '#d6c8e4'); } }, 30000); }
  ui.addEventListener('click', async e => { const b = e.target.closest('[data-k]'); if (!b || !call) return; const k = b.dataset.k;
    if (k === 'accept') { tx('accept'); call.state = 'on'; call.t0 = Date.now(); ring(false); render(); if (bb.USAGE) bb.USAGE.add('calls'); }
    if (k === 'mute') { call.mute = !call.mute; if (mic) mic.getTracks().forEach(t => t.enabled = !call.mute); render(); }
    if (k === 'spk') { call.needTap = false; if (remoteAu) remoteAu.play().catch(() => {}); render(); }
    if (k === 'decline') { tx('decline'); call = null; hangup(); render(); }
    if (k === 'block') { const who = call.who; tx('decline'); call = null; render(); blocked.add(who.toLowerCase()); if (sb()) await O().rpc('block_player', { p_name: who }); bb.toast(`@${who} is blocked`, '#d6c8e4'); }
    if (k === 'end') { tx('end'); call = null; hangup(); render(); bb.toast('Call ended', '#d6c8e4'); }
    if (k === 'rep') { const who = call.who; tx(call.state === 'in' ? 'decline' : 'end'); call = null; hangup(); render(); if (O().report) O().report(who, 'call', 'Phone call'); } });
  /* live calls (Beta v1.01.16): both sides talk at the same time, like a normal phone call (WebRTC, peer to peer;
     the game server only passes the set-up messages). If the live line cannot connect, hold 🎙 still works. */
  let pc = null, mic = null, remoteAu = null, iceQ = [];
  const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }] };
  function hangup() { try { if (pc) pc.close(); } catch (e) {} pc = null; iceQ = []; if (mic) mic.getTracks().forEach(t => t.stop()); mic = null; if (remoteAu) { remoteAu.srcObject = null; } }
  async function flushIce() { if (!pc || !pc.remoteDescription) return; const q = iceQ; iceQ = []; for (const c of q) { try { await pc.addIceCandidate(c); } catch (e) {} } }
  const LOG = window.__rtcLog = []; const lg = m => { LOG.push(m); if (LOG.length > 30) LOG.shift(); };
  async function rtc(caller, offer) { lg('rtc ' + (caller ? 'caller' : 'callee')); const who = call && call.who; if (!who || !window.RTCPeerConnection) { if (call) { call.fallback = true; render(); } return; }
    try { mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); } catch (e) { if (call) { call.heard = 'Allow the microphone to talk'; call.fallback = true; render(); } return; }
    lg('mic ok'); if (!call || call.who !== who) { hangup(); return; }
    pc = new RTCPeerConnection(ICE); mic.getTracks().forEach(t => pc.addTrack(t, mic));
    pc.onicecandidate = e => { if (e.candidate) tx('ice', { s: JSON.stringify(e.candidate) }); };
    pc.ontrack = e => { if (!remoteAu) { remoteAu = new Audio(); remoteAu.autoplay = true; } remoteAu.srcObject = e.streams[0]; remoteAu.muted = !!(bb.SOUND && bb.SOUND.voice === false); remoteAu.play().catch(() => { if (call) { call.needTap = true; render(); } }); };
    pc.onconnectionstatechange = () => { if (!call || !pc) return; const st = pc.connectionState; call.live = st === 'connected'; if (st === 'failed') { call.fallback = true; call.heard = 'The live line could not connect · hold 🎙 to send voice'; } render(); };
    try { if (caller) { const o = await pc.createOffer(); await pc.setLocalDescription(o); tx('sdp', { s: JSON.stringify(pc.localDescription) }); }
      else { await pc.setRemoteDescription(offer); lg('remote set'); await flushIce(); lg('ice flushed ' + pc.signalingState); const a = await pc.createAnswer(); lg('answer made'); await pc.setLocalDescription(a); lg('local set'); tx('sdp', { s: JSON.stringify(pc.localDescription) }); } } catch (e) { lg('err ' + e.message); if (call) { call.fallback = true; render(); } }
    lg('sent ' + (caller ? 'offer' : 'answer')); setTimeout(() => { if (call && call.who === who && !call.live) { call.fallback = true; if (!call.heard) call.heard = 'Live voice is taking long · you can hold 🎙 to send voice'; render(); } }, 15000); }
  /* push-to-talk during a call (only when the live line cannot connect) */
  let rec = null, chunks = [];
  ui.addEventListener('pointerdown', async e => { const b = e.target.closest('[data-k="talk"]'); if (!b || !call || call.state !== 'on' || rec) return; e.preventDefault();
    try { const st = await navigator.mediaDevices.getUserMedia({ audio: true }); const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
      rec = new MediaRecorder(st, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : {}); chunks = []; const t0 = Date.now(); rec.ondataavailable = ev => chunks.push(ev.data);
      rec.onstop = async () => { st.getTracks().forEach(t => t.stop()); const blob = new Blob(chunks, { type: (rec.mimeType || 'audio/webm').split(';')[0] }); const ms = Date.now() - t0; rec = null; b.classList.remove('on'); if (ms < 300 || !call) return;
        const a = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); }); if (a.length > 46000) return bb.toast('Too long · keep it under 8 seconds', '#ff9f1c'); tx('vc', { a, ms, mime: blob.type }); };
      rec.start(); b.classList.add('on'); setTimeout(() => { if (rec && rec.state === 'recording') rec.stop(); }, 8000); } catch (er) { bb.toast('Allow the microphone to talk', '#ff9f1c'); } });
  addEventListener('pointerup', () => { if (rec && rec.state === 'recording') rec.stop(); });
  bb.on('call', d => { const k = d.k;
    if (k === 'noguest') return bb.toast('Calls need a Google account', '#ff9f1c');
    if (k === 'off') { if (call) { call = null; hangup(); render(); } return bb.toast('📞 ' + esc(d.msg || 'Calls are paused by the admin right now'), '#ffc93c'); }
    if (k === 'offline') { if (call) { call = null; render(); } return bb.toast(`@${d.n} is not online right now · send a text instead`, '#d6c8e4'); }
    if (k === 'text') { pollTexts(true); return; }
    if (k === 'ring') { const who = d.n; const p = pref(); if (blocked.has(who.toLowerCase()) || p === 'nobody' || (p === 'contacts' && !contacts.includes(who))) { O().send({ t: 'call', k: 'decline', to: who }); return; }
      if (call) { O().send({ t: 'call', k: 'busy', to: who }); return; } call = { who, state: 'in' }; ring(true); render(); setTimeout(() => { if (call && call.who === who && call.state === 'in') { call = null; render(); bb.toast(`Missed call from @${who}`, '#ffc93c'); } }, 30000); return; }
    if (!call || call.who.toLowerCase() !== String(d.n).toLowerCase()) return;
    if (k === 'accept') { call.state = 'on'; call.t0 = Date.now(); ring(false); render(); rtc(true); }
    if (k === 'sdp') lg('got sdp ' + call.state);
    if (k === 'sdp' && call.state === 'on') { let desc; try { desc = JSON.parse(d.s); } catch (e) { return; } if (desc.type === 'offer') rtc(false, desc); else if (pc && desc.type === 'answer') pc.setRemoteDescription(desc).then(flushIce).catch(() => {}); }
    if (k === 'ice' && call.state === 'on') { let c; try { c = JSON.parse(d.s); } catch (e) { return; } if (pc && pc.remoteDescription) pc.addIceCandidate(c).catch(() => {}); else iceQ.push(c); }
    if (k === 'decline' || k === 'busy') { bb.toast(k === 'busy' ? `@${call.who} is on another call` : `@${call.who} declined`, '#d6c8e4'); call = null; hangup(); render(); }
    if (k === 'end') { bb.toast(`@${call.who} hung up`, '#d6c8e4'); call = null; hangup(); render(); }
    if (k === 'vc' && call.state === 'on') { try { const bin = atob(d.a), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const au = new Audio(URL.createObjectURL(new Blob([u], { type: d.mime || 'audio/webm' }))); au.play().catch(() => {}); call.heard = `🔊 @${call.who} is talking…`; render(); setTimeout(() => { if (call) { call.heard = ''; render(); } }, d.ms || 3000); } catch (e) {} } });
  /* ---------- texts ---------- */
  async function loadThreads() { if (!ok()) return []; const me = O().uid; const r = await sb().from('texts').select('id,from_id,from_name,to_name,body,created_at,read_at').order('created_at', { ascending: false }).limit(200);
    const by = new Map(); unread = 0; for (const m of (r.data || [])) { const other = m.from_id === me ? m.to_name : m.from_name; if (!by.has(other)) by.set(other, { who: other, last: m, n: 0 }); if (m.from_id !== me && !m.read_at) { by.get(other).n++; unread++; } }
    threads = [...by.values()]; badge(); return threads; }
  async function textsApp() { if (!need()) return; await loadThreads(); await loadContacts();
    bb.openSheet('💬 Messages', 'Texts with your friends', (threads.length ? threads.map(t => `<button class="trow" data-open="${esc(t.who)}"><span class="cav">${esc(t.who[0]).toUpperCase()}</span><span class="tm"><b>@${esc(t.who)}</b><small>${esc(t.last.body).slice(0, 60)}</small></span><span class="tt">${ago(t.last.created_at)}${t.n ? `<i>${t.n}</i>` : ''}</span></button>`).join('') : '<p class="note">No messages yet.</p>') +
      (contacts.length ? `<h3 class="sub">New message</h3><div class="chips">${contacts.map(n => `<button class="chip" data-open="${esc(n)}">@${esc(n)}</button>`).join('')}</div>` : '<p class="note">Add friends on BayGram to text them.</p>'),
      s => s.onclick = e => { const b = e.target.closest('[data-open]'); if (b) thread(b.dataset.open); }); }
  async function thread(who) { if (!need()) return; const me = O().uid; const r = await sb().from('texts').select('from_id,body,created_at').or(`and(from_name.eq.${who},to_id.eq.${me}),and(to_name.eq.${who},from_id.eq.${me})`).order('created_at', { ascending: true }).limit(80);
    O().rpc('read_texts', { p_from: who }).then(() => loadThreads());
    const list = (r.data || []).map(m => `<div class="bub${m.from_id === me ? ' me' : ''}">${esc(m.body)}<small>${ago(m.created_at)}</small></div>`).join('');
    bb.openSheet(`💬 @${esc(who)}`, 'Be kind · texts can be reported to the admin', `<div class="chat2" id="ch2">${list || '<p class="note">Say hello!</p>'}</div><form class="form" id="sendf"><div class="btnrow" style="flex-wrap:nowrap"><input id="tx_b" maxlength="300" placeholder="Message" autocomplete="off" style="flex:1"><button class="go" type="submit">Send</button></div></form>
      <div class="btnrow"><button class="buy ghost" data-call="${esc(who)}">📞 Call</button><button class="buy ghost" data-rep="${esc(who)}">⚑ Report</button><button class="buy danger" data-blk="${esc(who)}">⛔ Block</button></div>`,
      s => { const box = s.querySelector('#ch2'); box.scrollTop = box.scrollHeight; const f = s.querySelector('#sendf'); f.onsubmit = async e => { e.preventDefault(); const b = s.querySelector('#tx_b').value.trim(); if (!b) return; const res = await O().rpc('send_text', { p_to: who, p_body: b }); if (bb.USAGE && !res.error) bb.USAGE.add('texts'); if (res.error) return bb.toast(niceSql(res.error), '#ff8b8b'); if (res.data !== 'ok') return bb.toast(res.data, '#ff9f1c'); O().send({ t: 'call', k: 'text', to: who }); thread(who); };
        s.onclick = async e => { const d = e.target.dataset; if (d.call) return dial(d.call); if (d.blk) { await O().rpc('block_player', { p_name: d.blk }); blocked.add(d.blk.toLowerCase()); bb.toast(`@${d.blk} is blocked`, '#d6c8e4'); return textsApp(); }
          if (d.rep) { if (O().report) return O().report(d.rep, 'text', (r.data || []).filter(m => m.from_id !== me).slice(-3).map(m => m.body).join(' | ').slice(0, 300)); } }; }); }
  // unread texts: a badge on the phone button, checked every minute and when a friend pings
  const phoneBtn = document.querySelector('#phoneBtn');
  function badge() { if (!phoneBtn) return; let b = phoneBtn.querySelector('.nb'); if (!unread) { if (b) b.remove(); return; } if (!b) { b = document.createElement('i'); b.className = 'nb'; phoneBtn.appendChild(b); } b.textContent = unread > 9 ? '9+' : unread; }
  let lastUnread = 0; async function pollTexts(now) { if (!ok()) return; const before = unread; await loadThreads(); if (unread > before && unread !== lastUnread) { const t = threads.find(q => q.n); if (t) bb.toast(`💬 @${t.who}: ${esc(t.last.body).slice(0, 50)}`, '#5fb4ff'); } lastUnread = unread; }
  setInterval(() => pollTexts(), 60000); bb.onStart(() => setTimeout(() => { loadContacts(); pollTexts(); }, 6000));
  bb.addApp({ id: 'calls', label: 'Phone', icon: '📞', smart: true, fn: callsApp });
  bb.addApp({ id: 'messages', label: 'Messages', icon: '💬', smart: true, fn: textsApp });
  bb.PHONE = { dial, thread };
  // BayGram uses these for messages and calls on player profiles (Beta v1.01.17)
  bb.PHONE = { dial, thread, textsApp, callsApp, loadThreads, loadContacts, get contacts() { return contacts; }, get threads() { return threads; }, get unread() { return unread; }, block: async n => { await O().rpc('block_player', { p_name: n }); blocked.add(n.toLowerCase()); } };
  // the admin pausing or restarting chat and calls: tell players once
  let lastFlags = null; setInterval(() => { const f = (bb.CFG.chatOn !== false) + ',' + (bb.CFG.callsOn !== false); if (lastFlags != null && f !== lastFlags && bb.started) { const [c, k] = f.split(','); bb.toast(c === 'false' || k === 'false' ? '📣 ' + esc(bb.CFG.chatNote || ((c === 'false' ? 'Chat' : 'Calls') + ' paused by the admin')) : '📣 Chat and calls are back on', '#ffc93c'); } lastFlags = f; }, 5000);
});
