// Bay Location (Beta v1.01.21): ask a friend where they are, so you can reach them using the Map. They choose
// Always (you see them on your map while they play), Once (where they are right now) or No. You can also share
// your own location with a friend or with a whole BayGram group, and stop sharing any time.
// Friends who share show as 📍 on the minimap and the Map; tap them for directions. Needs supabase-update-9.sql.
window.BBFeatures.push(function (bb) {
  const esc = bb.esc, O = () => bb.ONLINE, sb = () => O() && O().client;
  const ok = () => O() && O().signedIn && !O().guest;
  const sqlNote = e => /does not exist|schema cache|function/i.test(e && e.message || '') ? 'Location sharing needs the server update (update 9)' : (e && e.message || String(e));
  const here = () => { const p = bb.ppos(); const z = bb.zoneAt(p.x, p.z, 200); return { x: Math.round(p.x * 10) / 10, z: Math.round(p.z * 10) / 10, place: z ? z.name : (bb.areaName ? bb.areaName() : '') }; };
  let mine = [], theirs = [], live = new Map(), reqs = [];   // mine: who sees me · theirs: whose I see · live: name -> {x,z,place,at}
  async function refresh() { if (!ok()) return; const uid = O().uid;
    const [s, r] = await Promise.all([sb().from('loc_shares').select('owner_id,viewer_id,owner_name,viewer_name,mode,x,z,place,created_at'), sb().from('loc_requests').select('from_id,to_id,from_name,to_name,created_at')]);
    if (s.error) { refresh.err = s.error; return; } refresh.err = null;
    mine = (s.data || []).filter(q => q.owner_id === uid); theirs = (s.data || []).filter(q => q.viewer_id === uid);
    const inc = (r.data || []).filter(q => q.to_id === uid); for (const q of inc) if (!reqs.some(o => o.from_name === q.from_name)) ask(q); reqs = inc;
    const ids = theirs.filter(q => q.mode === 'always').map(q => q.owner_id);
    if (ids.length) { const L = await sb().from('player_locations').select('user_id,username,x,z,place,updated_at').in('user_id', ids); for (const q of (L.data || [])) live.set(q.username, { x: q.x, z: q.z, place: q.place, at: new Date(q.updated_at).getTime(), always: true }); }
    for (const q of theirs) if (q.mode === 'once' && q.x != null) live.set(q.owner_name, { x: q.x, z: q.z, place: q.place, at: new Date(q.created_at).getTime(), once: true });
    for (const n of [...live.keys()]) if (!theirs.some(q => q.owner_name === n)) live.delete(n); }
  // keep your own spot up to date while someone may see you always
  async function push() { if (!ok() || !bb.started || !mine.some(q => q.mode === 'always')) return; const h = here();
    await sb().from('player_locations').upsert({ user_id: O().uid, username: O().username, x: h.x, z: h.z, place: h.place, updated_at: new Date().toISOString() }); }
  bb.onStart(() => setTimeout(refresh, 7000)); setInterval(refresh, 30000); setInterval(push, 20000);
  /* ---------- a friend asked to see where you are ---------- */
  function ask(q) { const show = () => bb.openSheet('📍 Location request', `@${esc(q.from_name)} wants to see where you are`, `<p class="note">They can find you on their Map and get directions to you.</p>` + bb.rowHtml('always', '📍 Always', 'They see you on their map while you play · stop any time', 'Allow') + bb.rowHtml('once', '📌 Just once', 'They get where you are right now', 'Share', 'ghost') + bb.rowHtml('no', '✕ No', 'They are not told where you are', 'No', 'ghost'),
      s => s.onclick = async e => { const m = e.target.dataset.id; if (!m) return; const h = here(); const r = await O().rpc('answer_location', { p_name: q.from_name, p_mode: m, p_x: h.x, p_z: h.z, p_place: h.place }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); bb.closeSheet(); O().send({ t: 'call', k: 'text', to: q.from_name });
        bb.toast(m === 'no' ? 'Not shared' : m === 'always' ? `📍 @${esc(q.from_name)} can see you on their map · Phone → Location to stop` : `📌 Sent your location to @${esc(q.from_name)}`, m === 'no' ? '#d6c8e4' : '#3ddc97'); refresh(); });
    if (bb.notify) bb.notify('📍', `@${q.from_name} asks for your location`, 'Tap to answer: always, once or no', show, 'loc'); else show(); }
  /* ---------- one friend: ask, share, stop, find ---------- */
  async function friend(name) { if (!ok()) return bb.toast('Sign in with Google to share locations', '#ff9f1c'); await refresh();
    const sees = mine.find(q => q.viewer_name === name), see = live.get(name), shares = theirs.find(q => q.owner_name === name);
    bb.openSheet(`📍 @${esc(name)}`, 'Bay Location', (see ? bb.rowHtml('find', `🧭 Go to @${esc(name)}`, `${esc(see.place || 'On the map')} · ${see.once ? 'shared once' : 'live'} · ${ago(see.at)}`, 'Directions') : '') +
      (shares ? '' : bb.rowHtml('ask', '🙋 Ask for their location', 'They choose always, once or no', 'Ask', see ? 'ghost' : '')) +
      bb.rowHtml('once', '📌 Share where I am now', 'Once: they get this spot', 'Share', 'ghost') + bb.rowHtml('always', '📍 Share my location always', 'They see you on their map while you play', 'Share', 'ghost') +
      (sees ? bb.rowHtml('stop', '🚫 Stop sharing with them', sees.mode === 'always' ? 'They can see you now' : 'They have your spot from earlier', 'Stop', 'danger') : ''),
      s => s.onclick = async e => { const k = e.target.dataset.id; if (!k) return;
        if (k === 'find') { bb.closeSheet(); return bb.directions ? bb.directions(see.x, see.z, '@' + name) : null; }
        if (k === 'ask') { const r = await O().rpc('request_location', { p_name: name }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); if (r.data !== 'sent') return bb.toast(esc(r.data), '#ff9f1c'); O().send({ t: 'call', k: 'text', to: name }); bb.toast(`🙋 Asked @${esc(name)} for their location`, '#3ddc97'); return bb.closeSheet(); }
        if (k === 'once' || k === 'always') { const h = here(); const r = await O().rpc('share_location', { p_name: name, p_mode: k, p_x: h.x, p_z: h.z, p_place: h.place }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); if (r.data !== 'ok') return bb.toast(esc(r.data), '#ff9f1c'); O().send({ t: 'call', k: 'text', to: name }); bb.toast(k === 'always' ? `📍 @${esc(name)} can see you on their map` : `📌 Sent your spot to @${esc(name)}`, '#3ddc97'); await refresh(); return friend(name); }
        if (k === 'stop') { await sb().from('loc_shares').delete().eq('owner_id', O().uid).eq('viewer_name', sees.viewer_name); bb.toast(`🚫 Stopped sharing with @${esc(name)}`, '#d6c8e4'); await refresh(); return friend(name); } }); }
  // share with a whole group (from a group's chat)
  function shareGroup(g) { bb.openSheet(`📍 Share with ${esc(g.name)}`, `${(g.members || []).length} people`, bb.rowHtml('once', '📌 Where I am now', 'Once: everyone in the group gets this spot', 'Share') + bb.rowHtml('always', '📍 Always', 'Everyone in the group sees you on their map while you play', 'Share', 'ghost'),
      s => s.onclick = async e => { const k = e.target.dataset.id; if (!k) return; const h = here(); const r = await O().rpc('share_location_group', { p_group: g.id, p_mode: k, p_x: h.x, p_z: h.z, p_place: h.place }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b');
        for (const n of g.members || []) if (String(n).toLowerCase() !== String(O().username).toLowerCase()) O().send({ t: 'call', k: 'text', to: n }); bb.closeSheet(); bb.toast(`📍 Shared with ${r.data} people in ${esc(g.name)}`, '#3ddc97'); refresh(); }); }
  const ago = t => { const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };
  /* ---------- the app: who you see, who sees you ---------- */
  async function app() { if (!ok()) return bb.openSheet('📍 Bay Location', 'Find your friends', '<p class="note">Sign in with Google (👤 Profile) to share locations with friends.</p>'); await refresh();
    if (refresh.err) return bb.openSheet('📍 Bay Location', 'Find your friends', `<p class="note">${esc(sqlNote(refresh.err))}</p>`);
    const fr = await sb().from('contacts').select('friend_name').order('friend_name'); const F = (fr.data || []).map(r => r.friend_name);
    bb.openSheet('📍 Bay Location', 'Find your friends on the map', `<h3 class="sub">Friends you can find</h3>` + ([...live.entries()].map(([n, q]) => bb.rowHtml('go:' + n, `📍 @${esc(n)}`, `${esc(q.place || '')} · ${q.once ? 'shared once' : 'live'} · ${ago(q.at)}`, 'Directions')).join('') || '<p class="note">Nobody is sharing with you yet. Ask a friend below.</p>') +
      `<h3 class="sub">Who can see you</h3>` + (mine.length ? mine.map(q => bb.rowHtml('stop:' + q.viewer_name, `@${esc(q.viewer_name)}`, q.mode === 'always' ? 'Always, while you play' : 'Your spot from ' + ago(new Date(q.created_at).getTime()), 'Stop', 'danger')).join('') : '<p class="note">Nobody. Your location is private.</p>') +
      (F.length ? `<h3 class="sub">Ask or share</h3><div class="chips">${F.map(n => `<button class="chip" data-fr="${esc(n)}">@${esc(n)}</button>`).join('')}</div>` : '<p class="note">Add friends on BayGram to share locations.</p>'),
      s => s.onclick = async e => { const b = e.target.closest('[data-fr]'); if (b) return friend(b.dataset.fr); const id = e.target.dataset.id; if (!id) return;
        if (id.startsWith('go:')) { const n = id.slice(3), q = live.get(n); if (q && bb.directions) { bb.closeSheet(); bb.directions(q.x, q.z, '@' + n); } return; }
        if (id.startsWith('stop:')) { await sb().from('loc_shares').delete().eq('owner_id', O().uid).eq('viewer_name', id.slice(5)); bb.toast('Stopped sharing', '#d6c8e4'); return app(); } }); }
  bb.addApp({ id: 'location', label: 'Bay Location', icon: '📍', fn: app });
  // friends on the minimap and the Map
  bb.addMapMarks(() => [...live.entries()].filter(([, q]) => Date.now() - q.at < (q.once ? 6 * 3600e3 : 10 * 60e3)).map(([n, q]) => ({ x: q.x, z: q.z, col: q.once ? '#ffb3d9' : '#ff5fa2', txt: '📍', name: '@' + n, sub: q.place || 'Friend' })));
  bb.on('call', d => { if (d && d.k === 'text') setTimeout(refresh, 1500); });
  bb.LOCSHARE = { friend, shareGroup, app, refresh, get live() { return live; } };
});
