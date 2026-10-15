// BayGram groups (Beta v1.01.21): make a group with your friends, chat together and start a group call.
// Anyone can leave a group at any time; members can add their own friends (up to 20 people). Group calls are
// live (everyone talks at once, peer to peer); up to 8 people in a call. Needs online/supabase-update-9.sql.
window.BBFeatures.push(function (bb) {
  const esc = bb.esc, O = () => bb.ONLINE, sb = () => O() && O().client;
  const ok = () => O() && O().signedIn && !O().guest;
  const me = () => (O() && O().username) || '';
  const same = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
  const sqlNote = e => /does not exist|schema cache|function/i.test(e && e.message || '') ? 'Groups need the server update (update 9)' : (e && e.message || String(e));
  const ago = s => { const m = Math.max(0, Math.round((Date.now() - new Date(s).getTime()) / 60000)); return m < 1 ? 'now' : m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' d'; };
  const hue = n => { let h = 0; for (const ch of String(n)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const gav = g => `<span class="bgav grp" style="--h:${hue(g.name)}"><i>👥</i></span>`;
  let groups = [], seen = (() => { try { return JSON.parse(localStorage.getItem('ib.grpSeen') || '{}'); } catch (e) { return {}; } })();
  const saveSeen = () => { try { localStorage.setItem('ib.grpSeen', JSON.stringify(seen)); } catch (e) {} };
  async function load() { if (!ok()) return []; const r = await O().rpc('my_groups'); if (r.error) { groups = []; load.err = r.error; return []; } load.err = null; groups = r.data || []; return groups; }
  const unread = g => g.last_at && g.last_from && !same(g.last_from, me()) && (!seen[g.id] || new Date(g.last_at).getTime() > seen[g.id]);
  /* ---------- the list (BayGram → Chats) ---------- */
  async function section() { if (!ok()) return ''; await load();
    if (load.err) return `<p class="note">${esc(sqlNote(load.err))}</p>`;
    return `<div class="grphead"><h3 class="sub">Groups</h3><button class="buy ghost" data-newgrp>＋ New group</button></div>` + (groups.length ? groups.map(g => `<div class="bgthr"><button data-grp="${g.id}">${gav(g)}<span><b>${esc(g.name)}</b><small>${g.last_body ? `${esc(g.last_from)}: ${esc(String(g.last_body).slice(0, 50))}` : esc((g.members || []).join(', '))}</small></span>${unread(g) ? '<i>•</i>' : ''}</button><button class="bgcall" data-gcall="${g.id}" aria-label="Group call">📞</button></div>`).join('') : '<p class="note">No groups yet. Make one with your friends to chat and call together.</p>'); }
  /* ---------- new group ---------- */
  async function create(pre) { if (!ok()) return bb.toast('Sign in with Google to make groups', '#ff9f1c'); const fr = await sb().from('contacts').select('friend_name').order('friend_name'); const F = (fr.data || []).map(r => r.friend_name);
    if (!F.length) return bb.toast('Add friends first · tap a name on any BayGram post', '#ff9f1c');
    bb.openSheet('👥 New group', 'Pick friends to chat and call together', `<form class="form" id="ngf"><label>Group name<input id="ng_n" maxlength="40" placeholder="Goa trip" autocomplete="off"></label><div class="grppick">${F.map(n => `<label class="ck"><input type="checkbox" value="${esc(n)}"${pre && pre.includes(n) ? ' checked' : ''}> @${esc(n)}</label>`).join('')}</div><div class="btnrow"><button class="go" type="submit">Make group</button></div><p class="note">Up to 20 people. Anyone can leave at any time.</p></form>`,
      s => { s.querySelector('#ngf').onsubmit = async e => { e.preventDefault(); const name = s.querySelector('#ng_n').value.trim() || 'My group'; const L = [...s.querySelectorAll('.grppick input:checked')].map(i => i.value); if (!L.length) return bb.toast('Pick at least one friend', '#ff9f1c');
        const r = await O().rpc('create_group', { p_name: name, p_members: L }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); for (const n of L) O().send({ t: 'call', k: 'text', to: n }); bb.toast(`👥 ${esc(name)} is ready`, '#3ddc97'); bb.emit('group', 'new'); open(+r.data); }; }); }
  /* ---------- a group's chat ---------- */
  async function open(id) { if (!ok()) return; await load(); const g = groups.find(q => +q.id === +id); if (!g) return bb.toast('You are not in that group any more', '#d6c8e4');
    const r = await sb().from('group_texts').select('from_name,body,created_at').eq('group_id', id).order('created_at', { ascending: false }).limit(80); const L = (r.data || []).reverse();
    seen[g.id] = Date.now(); saveSeen(); const mine = me().toLowerCase();
    const list = L.map(m => `<div class="bub${same(m.from_name, mine) ? ' me' : ''}">${same(m.from_name, mine) ? '' : `<b class="gfrom" data-gwho="${esc(m.from_name)}">${esc(m.from_name)}</b>`}${esc(m.body)}<small>${ago(m.created_at)}</small></div>`).join('');
    bb.openSheet(`👥 ${esc(g.name)}`, `${(g.members || []).length} people · ${esc((g.members || []).join(', '))}`, `<div class="btnrow grpbtns"><button class="go" data-gc="${g.id}">📞 Group call</button><button class="buy ghost" data-gloc="${g.id}">📍 Share location</button><button class="buy ghost" data-gmem="${g.id}">👥 People</button></div>
      <div class="chat2" id="gch">${list || '<p class="note">Say hello to the group!</p>'}</div><form class="form" id="gsend"><div class="btnrow" style="flex-wrap:nowrap"><input id="gs_b" maxlength="300" placeholder="Message the group" autocomplete="off" style="flex:1"><button class="go" type="submit">Send</button></div></form>`,
      s => { const box = s.querySelector('#gch'); box.scrollTop = box.scrollHeight; setTimeout(() => s.querySelector('#gs_b').focus({ preventScroll: true }), 80);
        s.querySelector('#gsend').onsubmit = async e => { e.preventDefault(); const b = s.querySelector('#gs_b').value.trim(); if (!b) return; if (O().silencedUntil) return bb.toast(O().silenceNote(O().silencedUntil), '#ff8b8b');
          const x = await O().rpc('send_group_text', { p_group: g.id, p_body: b }); if (x.error) return bb.toast(sqlNote(x.error), '#ff8b8b'); if (x.data !== 'ok') return bb.toast(esc(x.data), '#ff9f1c');
          if (bb.USAGE) bb.USAGE.add('group_texts'); for (const n of g.members || []) if (!same(n, mine)) O().send({ t: 'call', k: 'text', to: n }); open(g.id); };
        s.onclick = e => { const b = e.target.closest('[data-gc],[data-gloc],[data-gmem],[data-gwho]'); if (!b) return; const d = b.dataset;
          if (d.gc) return startCall(g); if (d.gloc) return bb.LOCSHARE ? bb.LOCSHARE.shareGroup(g) : bb.toast('Location sharing is not loaded', '#ff9f1c'); if (d.gmem) return people(g);
          if (d.gwho) { const n = d.gwho; const t = L.filter(m => m.from_name === n).slice(-3).map(m => m.body).join(' | '); return bb.openSheet(`@${esc(n)}`, `In ${esc(g.name)}`, bb.rowHtml('prof', '👤 See their profile', 'BayGram posts, add friend', 'Open', 'ghost') + bb.rowHtml('rep', '⚑ Report a message', 'The admin sees their last messages here', 'Report', 'ghost'),
            s2 => s2.onclick = ev => { const k = ev.target.dataset.id; if (k === 'prof' && bb.BAYGRAM) bb.BAYGRAM.profile(n); if (k === 'rep') O().report(n, 'group', `Group ${g.name}: ${t}`.slice(0, 300)); }); } }; }); }
  async function people(g) { const fr = await sb().from('contacts').select('friend_name').order('friend_name'); const F = (fr.data || []).map(r => r.friend_name).filter(n => !(g.members || []).includes(n));
    bb.openSheet(`👥 ${esc(g.name)} · people`, `${(g.members || []).length} of 20`, (g.members || []).map(n => `<div class="row"><div class="nm"><b data-prof2="${esc(n)}">@${esc(n)}</b>${same(n, me()) ? '<small>you</small>' : ''}</div></div>`).join('') +
      (F.length ? `<h3 class="sub">Add a friend</h3><div class="chips">${F.map(n => `<button class="chip" data-addg="${esc(n)}">＋ @${esc(n)}</button>`).join('')}</div>` : '') +
      `<form class="form" id="rnf"><div class="btnrow" style="flex-wrap:nowrap"><input id="rn_n" maxlength="40" value="${esc(g.name)}" style="flex:1"><button class="buy ghost" type="submit">Rename</button></div></form><div class="btnrow"><button class="buy danger" data-leave>🚪 Leave the group</button></div>`,
      s => { s.querySelector('#rnf').onsubmit = async e => { e.preventDefault(); const n = s.querySelector('#rn_n').value.trim(); if (!n) return; await O().rpc('rename_group', { p_group: g.id, p_name: n }); open(g.id); };
        s.onclick = async e => { const d = e.target.dataset; if (d.prof2 && bb.BAYGRAM) return bb.BAYGRAM.profile(d.prof2);
          if (d.addg) { const r = await O().rpc('add_to_group', { p_group: g.id, p_name: d.addg }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); if (r.data !== 'ok') return bb.toast(esc(r.data), '#ff9f1c'); O().send({ t: 'call', k: 'text', to: d.addg }); bb.toast(`@${esc(d.addg)} added`, '#3ddc97'); await load(); return people(groups.find(q => q.id === g.id) || g); }
          if (d.leave != null) { const b = e.target; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to leave'; return; } await O().rpc('leave_group', { p_group: g.id }); if (call && call.g === g.id) leaveCall(); bb.toast(`You left ${esc(g.name)}`, '#d6c8e4'); return bb.BAYGRAM ? bb.BAYGRAM.sheet('chats') : bb.closeSheet(); } }; }); }
  // new group messages: a toast and a dot (checked every 45 s, and when a friend pings)
  async function poll(quiet) { if (!ok() || !bb.started) return; const before = groups.map(g => g.id + '|' + g.last_at).join(); await load(); if (quiet) return;
    for (const g of groups) if (unread(g) && !before.includes(g.id + '|' + g.last_at)) { bb.toast(`👥 ${esc(g.name)} · @${esc(g.last_from)}: ${esc(String(g.last_body).slice(0, 40))}`, '#5fb4ff'); break; } }
  bb.onStart(() => setTimeout(() => poll(true), 9000)); setInterval(() => poll(), 45000); bb.on('call', d => { if (d && d.k === 'text') setTimeout(() => poll(), 1200); });
  /* ---------- group calls: everyone talks at once (WebRTC mesh) ---------- */
  const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }] };
  let call = null;   // { g, name, members, peers: Map(name -> {pc, au, iceQ}), mic, mute, t0, ring }
  let ring = null;   // an incoming group call: { g, gn, from }
  const ui = document.createElement('div'); ui.id = 'gcallUI'; ui.hidden = true; document.body.appendChild(ui);
  const gsend = (k, to, extra) => O() && O().send(Object.assign({ t: 'gc', k, to, g: call ? call.g : (ring ? ring.g : 0), gn: call ? call.name : '' }, extra || {}));
  function render() { if (!call && !ring) { ui.hidden = true; return; } ui.hidden = false;
    if (ring && !call) { ui.innerHTML = `<div class="ccard"><div class="cav big">👥</div><b>${esc(ring.gn || 'Group call')}</b><small>@${esc(ring.from)} started a group call</small><div class="cbtns2"><button class="cb ok" data-k="join">📞<span>Join</span></button><button class="cb no" data-k="nope">✕<span>Not now</span></button></div></div>`; return; }
    const secs = Math.floor((Date.now() - call.t0) / 1000); const P = [...call.peers.entries()];
    ui.innerHTML = `<div class="ccard gc"><b>👥 ${esc(call.name)}</b><small>${P.length ? `${P.length + 1} in the call · ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : 'Waiting for others to join…'}</small><div class="gcp"><span class="me">🎤 You${call.mute ? ' (muted)' : ''}</span>${P.map(([n, q]) => `<span class="${q.live ? 'live' : ''}">${q.live ? '🟢' : '⏳'} @${esc(n)}</span>`).join('')}</div>
      <div class="cbtns2"><button class="cb${call.mute ? ' on' : ''}" data-k="mute">${call.mute ? '🔇' : '🎤'}<span>${call.mute ? 'Unmute' : 'Mute'}</span></button>${call.needTap ? '<button class="cb ok" data-k="spk">🔊<span>Tap to hear</span></button>' : ''}<button class="cb no" data-k="leave">✕<span>Leave</span></button></div></div>`; }
  setInterval(() => { if (call) { for (const q of call.peers.values()) q.live = q.pc && (q.pc.connectionState === 'connected' || ['connected', 'completed'].includes(q.pc.iceConnectionState)); render(); } }, 1000);
  ui.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
    if (k === 'join' && ring) { const r = ring; ring = null; joinCall(r.g, r.gn); }
    if (k === 'nope') { ring = null; render(); }
    if (k === 'mute' && call) { call.mute = !call.mute; if (call.mic) call.mic.getTracks().forEach(t => t.enabled = !call.mute); render(); }
    if (k === 'spk' && call) { call.needTap = false; for (const q of call.peers.values()) if (q.au) q.au.play().catch(() => {}); render(); }
    if (k === 'leave') leaveCall(); });
  const canCall = () => { if (bb.CFG.callsOn === false) { bb.toast('📞 ' + esc(bb.CFG.chatNote || 'Calls are paused by the admin right now'), '#ffc93c'); return false; } if (O().silencedUntil) { bb.toast(O().silenceNote(O().silencedUntil), '#ff8b8b'); return false; } if (O().status !== 'on') { bb.toast('Go online first (Phone → Online)', '#ff9f1c'); return false; } return true; };
  async function mic() { try { return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); } catch (e) { bb.toast('Allow the microphone to talk in the call', '#ff9f1c'); return null; } }
  async function startCall(g) { if (!canCall()) return; if (call) return bb.toast('You are already in a group call', '#ffc93c'); const m = await mic(); if (!m) return; bb.closeSheet();
    call = { g: +g.id, name: g.name, members: (g.members || []).filter(n => !same(n, me())), peers: new Map(), mic: m, mute: false, t0: Date.now() };
    for (const n of call.members) gsend('ring', n); render(); bb.toast(`📞 Calling ${esc(g.name)} · people who are online can join`, '#3ddc97'); if (bb.USAGE) bb.USAGE.add('group_calls'); }
  async function joinCall(gid, gn) { if (!canCall()) return; await load(); const g = groups.find(q => +q.id === +gid); if (!g) return bb.toast('You are not in that group', '#d6c8e4'); const m = await mic(); if (!m) return;
    call = { g: +g.id, name: g.name || gn, members: (g.members || []).filter(n => !same(n, me())), peers: new Map(), mic: m, mute: false, t0: Date.now() };
    for (const n of call.members) gsend('join', n); render(); }
  function leaveCall() { if (!call) return; for (const n of call.members) gsend('leave', n); for (const q of call.peers.values()) drop(q); call.mic && call.mic.getTracks().forEach(t => t.stop()); call = null; render(); bb.toast('You left the group call', '#d6c8e4'); }
  function drop(q) { try { q.pc && q.pc.close(); } catch (e) {} if (q.au) q.au.srcObject = null; }
  function peer(n) { let q = call.peers.get(n); if (q) return q; const pc = new RTCPeerConnection(ICE); q = { pc, au: null, iceQ: [] }; call.peers.set(n, q);
    call.mic.getTracks().forEach(t => pc.addTrack(t, call.mic));
    pc.onicecandidate = e => { if (e.candidate) gsend('ice', n, { s: JSON.stringify(e.candidate) }); };
    pc.ontrack = e => { if (!q.au) { q.au = new Audio(); q.au.autoplay = true; } q.au.srcObject = e.streams[0]; q.au.muted = !!(bb.SOUND && bb.SOUND.voice === false); q.au.play().catch(() => { if (call) { call.needTap = true; render(); } }); };
    return q; }
  async function offerTo(n) { const q = peer(n); try { const o = await q.pc.createOffer(); await q.pc.setLocalDescription(o); gsend('sdp', n, { s: JSON.stringify(q.pc.localDescription) }); } catch (e) {} }
  async function flush(q) { const L = q.iceQ; q.iceQ = []; for (const c of L) { try { await q.pc.addIceCandidate(c); } catch (e) {} } }
  bb.on('gc', async d => { const n = d.n; const g = +d.g; if (same(n, me())) return;
    if (d.k === 'ring') { if (call) { if (call.g !== g) gsend('busy', n); return; } ring = { g, gn: d.gn, from: n }; render(); setTimeout(() => { if (ring && ring.g === g) { ring = null; render(); bb.toast(`Missed group call in ${esc(d.gn || 'a group')}`, '#ffc93c'); } }, 40000); return; }
    if (d.k === 'offline') return;
    if (!call || call.g !== g) return;
    if (d.k === 'join') { if (call.peers.size >= 7) return gsend('busy', n); if (!call.members.some(m => same(m, n))) call.members.push(n); offerTo(n); bb.toast(`@${esc(n)} joined the call`, '#3ddc97'); render(); }
    if (d.k === 'busy') bb.toast(`@${esc(n)} is busy`, '#d6c8e4');
    if (d.k === 'leave' || d.k === 'end') { const q = call.peers.get(n); if (q) { drop(q); call.peers.delete(n); bb.toast(`@${esc(n)} left the call`, '#d6c8e4'); render(); } }
    if (d.k === 'sdp') { let desc; try { desc = JSON.parse(d.s); } catch (e) { return; } const q = peer(n);
      try { if (desc.type === 'offer') { await q.pc.setRemoteDescription(desc); await flush(q); const a = await q.pc.createAnswer(); await q.pc.setLocalDescription(a); gsend('sdp', n, { s: JSON.stringify(q.pc.localDescription) }); } else { await q.pc.setRemoteDescription(desc); await flush(q); } } catch (e) {} }
    if (d.k === 'ice') { let c; try { c = JSON.parse(d.s); } catch (e) { return; } const q = peer(n); if (q.pc.remoteDescription) q.pc.addIceCandidate(c).catch(() => {}); else q.iceQ.push(c); } });
  bb.on('call', d => { if (d && d.k === 'off' && call) leaveCall(); });
  bb.GROUPS = { section, create, open, load, get list() { return groups; }, startCall: g => startCall(g), get inCall() { return !!call; } };
});
