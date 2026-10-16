// BayEvents (Beta v1.01.21): host an event on a stage. Pick an open spot (a beach, a park, a wide walkway or open
// ground, never on a road or inside a building); one event per place at a time. A stage appears there for every
// player. People ask to perform and the host lets them on stage (jump up, or take the steps); performers' voices
// reach the whole crowd. Everyone near the stage can send reactions and tip the host in game money.
// Needs online/supabase-update-9.sql and the new game server.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, esc = bb.esc, O = () => bb.ONLINE, sb = () => O() && O().client;
  const ok = () => O() && O().signedIn && !O().guest;
  const sqlNote = e => /does not exist|schema cache|function/i.test(e && e.message || '') ? 'Events need the server update (update 9)' : (e && e.message || String(e)).replace(/^.*?ERROR:\s*/, '');
  const SW = 9, SD = 5.4, SH = 1.0;   // stage width, depth and height (m)
  const REACTS = ['👏', '❤️', '🔥', '😂', '🎉', '💃', '🙏', '⭐'];
  let events = [], perf = new Map(), built = new Map(), loadedAt = 0;   // perf: event id -> [{username,status}]
  const meName = () => (O() && O().username) || '';
  const live = () => events.filter(e => new Date(e.ends_at).getTime() > Date.now());
  async function load() { if (!sb()) return; const r = await sb().from('events').select('id,host_name,title,place,x,z,rot,ends_at,created_at').gt('ends_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(60);
    if (r.error) { load.err = r.error; return; } load.err = null; events = r.data || []; loadedAt = Date.now();
    if (events.length) { const p = await sb().from('event_performers').select('event_id,username,status').in('event_id', events.map(e => e.id)); perf = new Map(); for (const q of (p.data || [])) { if (!perf.has(q.event_id)) perf.set(q.event_id, []); perf.get(q.event_id).push(q); } }
    sync(); }
  const mayPerform = e => { const n = meName().toLowerCase(); return !!n && (String(e.host_name).toLowerCase() === n || (perf.get(e.id) || []).some(q => String(q.username).toLowerCase() === n && q.status === 'ok')); };
  /* ---------- the stage ---------- */
  const M = c => bb.LMat(c); const glow = c => new T.MeshBasicMaterial({ color: c });
  function banner(text) { const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 1024, 0); g.addColorStop(0, '#ff9933'); g.addColorStop(.5, '#e3256b'); g.addColorStop(1, '#6a2bd9'); x.fillStyle = g; x.fillRect(0, 0, 1024, 160);
    x.fillStyle = '#fff'; x.font = '800 76px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text.slice(0, 26), 512, 84); return new T.CanvasTexture(c); }
  function build(e) { const g = new T.Group(); const add = (geo, m, x, y, z) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
    add(new T.BoxGeometry(SW, SH, SD), M('#3b2a4a'), 0, SH / 2, 0); add(new T.BoxGeometry(SW + .2, .08, SD + .2), M('#1a1430'), 0, SH, 0);
    for (let i = 0; i < 2; i++) add(new T.BoxGeometry(2.2, (i + 1) * SH / 3, .7), M('#5a4a6a'), 0, (i + 1) * SH / 6, SD / 2 + .35 + (1 - i) * .7);   // steps at the front
    for (const s of [-1, 1]) { add(new T.CylinderGeometry(.12, .12, 5.2, 8), M('#2b2b30'), s * (SW / 2 - .2), SH + 2.6, -SD / 2 + .2); add(new T.BoxGeometry(1, 1.6, .9), M('#1c1c22'), s * (SW / 2 + .8), .8, SD / 2 - .6); add(new T.BoxGeometry(.6, .6, .05), M('#3a3a44'), s * (SW / 2 + .8), 1.1, SD / 2 - .14); }
    add(new T.BoxGeometry(SW, .3, .3), M('#2b2b30'), 0, SH + 5.2, -SD / 2 + .2); const b = add(new T.PlaneGeometry(SW - .6, 1.4), new T.MeshBasicMaterial({ map: banner(e.title) }), 0, SH + 4.3, -SD / 2 + .25); if (bb.twoSided) bb.twoSided(b);
    const lights = []; for (let i = 0; i < 5; i++) { const l = add(new T.SphereGeometry(.18, 8, 6), glow(['#ffd04a', '#ff5fa2', '#5fb4ff', '#3ddc97', '#ff9933'][i]), -SW / 2 + 1.2 + i * (SW - 2.4) / 4, SH + 5, -SD / 2 + .45); lights.push(l); }
    add(new T.BoxGeometry(SW - .8, 3.6, .1), M('#24183a'), 0, SH + 1.8, -SD / 2 + .1);   // backdrop
    g.position.set(e.x, 0, e.z); g.rotation.y = e.rot || 0; bb.scene.add(g);
    // you stand on the stage only if the host let you; anyone can stand on the steps
    const plat = bb.addPlatform({ x: e.x, z: e.z, hw: SW / 2, hd: SD / 2, y: SH, rot: e.rot || 0, ok: () => mayPerform(e), msg: 'Only performers can go on stage · ask the host to perform (Phone → BayEvents)' });
    const st = []; for (let i = 0; i < 2; i++) { const zl = SD / 2 + .35 + (1 - i) * .7; const c = Math.cos(e.rot || 0), s = Math.sin(e.rot || 0); st.push(bb.addPlatform({ x: e.x + zl * s, z: e.z + zl * c, hw: 1.1, hd: .35, y: (i + 1) * SH / 3, rot: e.rot || 0 })); }
    return { g, plat, st, lights, banner: b }; }
  function free(b) { bb.scene.remove(b.g); bb.removePlatform(b.plat); for (const p of b.st) bb.removePlatform(p); b.g.traverse(o => { if (o.material && o.material.map) o.material.map.dispose(); }); }
  function sync() { const ids = new Set(live().map(e => e.id)); for (const [id, b] of built) if (!ids.has(id)) { free(b); built.delete(id); } const pp = bb.ppos(); for (const e of live()) if (!built.has(e.id) && Math.hypot(e.x - pp.x, e.z - pp.z) < 900) built.set(e.id, build(e)); }
  bb.onUpdate((dt, now) => { for (const b of built.values()) b.lights.forEach((l, i) => l.material.color.setHSL(((now * .12 + i * .2) % 1), .9, .6)); floats(dt); });
  bb.onStart(() => setTimeout(load, 5000)); setInterval(() => { if (bb.started && sb()) load(); }, 30000);
  /* ---------- where an event may be: open ground, no road, no building, no water ---------- */
  function spotCheck(x, z, rot) { if (bb.inside) return 'Go outside first'; const c = Math.cos(rot), s = Math.sin(rot); const pts = []; for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) pts.push([x + (a * (SW / 2 + .8)) * c + (b * (SD / 2 + 2)) * s, z - (a * (SW / 2 + .8)) * s + (b * (SD / 2 + 2)) * c]);
    for (const [px, pz] of pts) { if (bb.isWater(px, pz)) return 'Too close to the water · move inland a little'; if (bb.roadAt(px, pz, 1.5)) return 'Not on the road · stand on a walkway, a beach, a park or open ground, away from traffic'; const v = new T.Vector3(px, 0, pz); if (bb.collideTest && bb.collideTest(v)) return 'Something is in the way here (a building or wall) · find open ground'; }
    for (const e of live()) if (Math.abs(e.x - x) < 60 && Math.abs(e.z - z) < 60) return `"${e.title}" is on here right now · pick another spot`;
    return ''; }
  /* ---------- host an event ---------- */
  function hostSheet() { if (!ok()) return bb.toast('Sign in with Google to host events', '#ff9f1c'); if (bb.player.mode !== 'foot') return bb.toast('Get out of the vehicle and stand where the stage should go', '#ff9f1c');
    const p = bb.ppos(), h = bb.player.h; const x = p.x + Math.sin(h) * 6, z = p.z + Math.cos(h) * 6, rot = h + Math.PI; const why = spotCheck(x, z, rot); const zz = bb.zoneAt(x, z, 100);
    bb.openSheet('🎤 Host an event', why ? 'This spot does not work' : `The stage goes right in front of you${zz ? ' · ' + esc(zz.name) : ''}`, why ? `<p class="note bad">${esc(why)}</p><p class="note">Events go on open places: beaches, parks, wide walkways, squares and open ground. Never on roads or inside buildings.</p>` :
      `<form class="form" id="hf"><label>Event name<input id="hf_t" maxlength="60" placeholder="Juhu beach music night" autocomplete="off"></label><label>How long<select id="hf_m"><option value="30">30 minutes</option><option value="60" selected>1 hour</option><option value="120">2 hours</option><option value="180">3 hours</option></select></label><div class="btnrow"><button class="go" type="submit">Put up the stage</button></div><p class="note">You are the host: you let people on stage. Others can react and tip you. One event per place at a time.</p></form>`,
      s => { const f = s.querySelector('#hf'); if (!f) return; f.onsubmit = async e => { e.preventDefault(); const t = s.querySelector('#hf_t').value.trim(); if (t.length < 3) return bb.toast('Give your event a name', '#ff9f1c'); const again = spotCheck(x, z, rot); if (again) return bb.toast(esc(again), '#ff9f1c');
        const r = await O().rpc('host_event', { p_title: t, p_place: zz ? zz.name : '', p_x: x, p_z: z, p_rot: rot, p_minutes: +s.querySelector('#hf_m').value }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b');
        bb.closeSheet(); O().send({ t: 'ev', k: 'news', e: +r.data }); bb.toast(`🎤 "${esc(t)}" is on · jump on stage and start!`, '#3ddc97'); bb.emit('eventHost', t); if (bb.USAGE) bb.USAGE.add('events'); await load(); }; }); }
  /* ---------- an event: details, perform, approve, react, tip ---------- */
  async function eventSheet(e) { await load(); e = live().find(q => q.id === e.id); if (!e) return bb.toast('That event has ended', '#d6c8e4'); const me = meName(), host = e.host_name === me; const P = perf.get(e.id) || []; const left = Math.max(1, Math.round((new Date(e.ends_at) - Date.now()) / 60000)); const pp = bb.ppos(); const d = Math.hypot(e.x - pp.x, e.z - pp.z);
    const mine = P.find(q => q.username === me);
    bb.openSheet(`🎤 ${esc(e.title)}`, `Hosted by @${esc(e.host_name)} · ${esc(e.place || '')} · ${left} min left`, (d > 80 ? bb.rowHtml('dir', '🧭 Go there', `${(d * 2.4 / 1000).toFixed(1)} km away`, 'Directions') : '') +
      `<h3 class="sub">On stage</h3><div class="chips">${P.filter(q => q.status === 'ok').map(q => `<span class="chip on">🎤 @${esc(q.username)}</span>`).join('') || '<span class="note">Nobody yet</span>'}</div>` +
      (host ? (P.filter(q => q.status === 'asked').length ? `<h3 class="sub">Want to perform</h3>` + P.filter(q => q.status === 'asked').map(q => `<div class="row"><div class="nm">@${esc(q.username)}</div><div class="btnrow" style="gap:6px;flex-wrap:nowrap"><button class="go" data-ok="${esc(q.username)}">Let on stage</button><button class="buy ghost" data-no="${esc(q.username)}">No</button></div></div>`).join('') : '<p class="note">When people ask to perform, they show up here.</p>') + bb.rowHtml('end', '⏹ End the event', 'The stage comes down for everyone', 'End', 'danger')
        : (mine && mine.status === 'ok' ? '<p class="note">🎤 You can go on stage: walk up the steps or jump. Your voice reaches the whole crowd.</p>' : mine && mine.status === 'asked' ? '<p class="note">You asked to perform · waiting for the host.</p>' : bb.rowHtml('ask', '🎤 Ask to perform', 'The host decides who goes on stage', 'Ask')) +
          `<h3 class="sub">Tip the host</h3><div class="chips">${[50, 100, 500, 1000, 5000].map(a => `<button class="chip" data-tip="${a}">💸 ${bb.inr(bb.price(a))}</button>`).join('')}</div>`) +
      `<h3 class="sub">React</h3><div class="chips evreact">${REACTS.map(r => `<button class="chip" data-r="${r}">${r}</button>`).join('')}</div>` + (host ? '' : `<div class="btnrow"><button class="buy ghost" data-rep>⚑ Report this event</button></div>`),
      s => s.onclick = async ev => { const b = ev.target.closest('button'); if (!b) return; const D = b.dataset;
        if (D.id === 'dir') { bb.closeSheet(); return bb.directions && bb.directions(e.x, e.z, e.title); }
        if (D.id === 'ask') { const r = await O().rpc('ask_to_perform', { p_event: e.id }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); O().send({ t: 'ev', k: 'ask', e: e.id, to: e.host_name }); bb.toast('🎤 Asked the host · you will hear back here', '#3ddc97'); return eventSheet(e); }
        if (D.ok || D.no) { const n = D.ok || D.no; const r = await O().rpc('answer_performer', { p_event: e.id, p_name: n, p_ok: !!D.ok }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); if (D.ok) O().send({ t: 'ev', k: 'ok', e: e.id, to: n }); return eventSheet(e); }
        if (D.id === 'end') { if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again'; return; } await O().rpc('end_event', { p_event: e.id }); O().send({ t: 'ev', k: 'news', e: e.id }); bb.closeSheet(); bb.toast('Event over · thank you!', '#d6c8e4'); claim(); return load(); }
        if (D.tip) { const a = bb.price(+D.tip); if (!bb.spend(a, true)) return; const r = await O().rpc('event_tip', { p_event: e.id, p_amount: a }); if (r.error || r.data !== 'ok') { bb.P.cash += a; bb.setDirty(); return bb.toast(r.error ? sqlNote(r.error) : esc(r.data), '#ff8b8b'); } O().send({ t: 'ev', k: 'tip', e: e.id, to: e.host_name, amt: a }); bb.toast(`💸 You tipped @${esc(e.host_name)} ${bb.inr(a)}`, '#3ddc97'); return; }
        if (D.r) return react(e, D.r);
        if (D.rep != null) return O().report && O().report(e.host_name, 'event', `Event: ${e.title}`); }); }
  function react(e, r) { if (!O().send({ t: 'ev', k: 'react', e: e.id, r })) return bb.toast('Go online first', '#ff9f1c'); }
  /* ---------- reactions float up over the stage ---------- */
  const fl = [];
  function floatAt(e, r, who) { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.font = '72px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(r, 48, 52);
    const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthTest: false })); s.scale.set(1.3, 1.3, 1); s.renderOrder = 998;
    s.position.set(e.x + (Math.random() - .5) * SW * .8, SH + 2 + Math.random(), e.z + (Math.random() - .5) * 2); bb.scene.add(s); fl.push({ s, t: 0 }); }
  function floats(dt) { for (let i = fl.length - 1; i >= 0; i--) { const f = fl[i]; f.t += dt; f.s.position.y += dt * 1.4; f.s.material.opacity = Math.max(0, 1 - f.t / 2.5); if (f.t > 2.5) { bb.scene.remove(f.s); f.s.material.map.dispose(); f.s.material.dispose(); fl.splice(i, 1); } } }
  bb.on('ev', d => { const e = live().find(q => q.id === d.e);
    if (d.k === 'react' && e) { floatAt(e, d.r, d.n); if (fl.length > 40) { const f = fl.shift(); bb.scene.remove(f.s); } }
    if (d.k === 'news') setTimeout(load, 800);
    if (d.k === 'ask' && e) bb.notify ? bb.notify('🎤', `@${d.n} wants to perform`, `At ${e.title} · tap to let them on stage`, () => eventSheet(e), 'ev') : bb.toast(`🎤 @${esc(d.n)} wants to perform`, '#5fb4ff');
    if (d.k === 'ok') { load().then(() => bb.toast(`🎤 The host let you on stage${e ? ' at ' + esc(e.title) : ''} · walk up the steps or jump!`, '#3ddc97')); }
    if (d.k === 'tip') { bb.toast(`💸 @${esc(d.n)} tipped you ${bb.inr(d.amt || 0)}`, '#3ddc97'); setTimeout(claim, 1500); } });
  // the host collects tips (game money) every minute
  async function claim() { if (!ok()) return; const r = await O().rpc('claim_tips'); if (r.error) return; const row = Array.isArray(r.data) ? r.data[0] : r.data; const t = row ? +row.total : 0; if (t > 0) { bb.earn(t, 'tips'); bb.save(); bb.toast(`💸 Tips from ${esc(row.names || 'the crowd')}: +${bb.inr(t)}`, '#3ddc97'); } }
  bb.onStart(() => setTimeout(claim, 12000)); setInterval(() => { if (bb.started && ok()) claim(); }, 60000);
  /* ---------- near a stage: a quick bar to react and tip ---------- */
  const barEl = document.createElement('div'); barEl.id = 'evbar'; barEl.className = 'hud'; barEl.hidden = true; document.body.appendChild(barEl); let barFor = null;
  setInterval(() => { if (!bb.started || bb.uiLock()) { barEl.hidden = true; return; } const pp = bb.ppos(); const e = live().filter(q => Math.hypot(q.x - pp.x, q.z - pp.z) < 70).sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z))[0];
    if (!e) { barEl.hidden = true; barFor = null; return; } if (barFor !== e.id) { barFor = e.id; barEl.innerHTML = `<button class="evt" data-open>🎤 ${esc(e.title)}</button>${REACTS.slice(0, 5).map(r => `<button data-r="${r}">${r}</button>`).join('')}<button data-open>💸</button>`; } barEl.hidden = false; }, 700);
  barEl.onclick = ev => { const b = ev.target.closest('button'); if (!b) return; const e = live().find(q => q.id === barFor); if (!e) return; if (b.dataset.r) return react(e, b.dataset.r); if (b.dataset.open != null) eventSheet(e); };
  // performers on stage talk to the whole crowd
  bb.EVENTS_ON_STAGE = () => { const pp = bb.ppos(); if ((pp.y || 0) < SH - .2) return false; return live().some(e => mayPerform(e) && Math.hypot(e.x - pp.x, e.z - pp.z) < SW); };
  /* ---------- the app ---------- */
  async function app() { if (!sb()) return bb.openSheet('🎤 BayEvents', 'Events on stages', '<p class="note">Sign in (👤 Profile) to see and host events.</p>'); await load();
    if (load.err) return bb.openSheet('🎤 BayEvents', 'Events on stages', `<p class="note">${esc(sqlNote(load.err))}</p>`);
    const pp = bb.ppos(); const L = live().slice().sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z)); const mine = L.find(e => e.host_name === meName());
    bb.openSheet('🎤 BayEvents', `${L.length} live event${L.length === 1 ? '' : 's'}`, (mine ? bb.rowHtml('ev:' + mine.id, `⭐ Your event: ${esc(mine.title)}`, 'Let people on stage, see tips, end it', 'Open') : bb.rowHtml('host', '🎤 Host an event here', 'A stage appears in front of you · beaches, parks, walkways and open ground', 'Host')) +
      (L.length ? L.map(e => bb.rowHtml('ev:' + e.id, esc(e.title), `@${esc(e.host_name)} · ${esc(e.place || '')} · ${(Math.hypot(e.x - pp.x, e.z - pp.z) * 2.4 / 1000).toFixed(1)} km`, 'Open', 'ghost')).join('') : '<p class="note">No events right now. Host the first one!</p>'),
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; if (id === 'host') return hostSheet(); if (id.startsWith('ev:')) { const ev = live().find(q => q.id === +id.slice(3)); if (ev) eventSheet(ev); } }); }
  bb.addApp({ id: 'events', label: 'BayEvents', icon: '🎤', fn: app });
  bb.addMapMarks(() => live().map(e => ({ x: e.x, z: e.z, col: '#c38bff', txt: '🎤', name: e.title, sub: `Event by @${e.host_name}` })));
  bb.EVENTS = { app, load, get live() { return live(); }, onStage: () => bb.EVENTS_ON_STAGE() };
});
